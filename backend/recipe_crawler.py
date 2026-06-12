"""
Recipe Web Crawler for Fine Dining Application

A slow, steady server-side crawler that:
  1. Fetches recipe pages from popular recipe sites
  2. Extracts raw text/HTML content
  3. Sends content to a local LLM (Ollama / Gemma 4) for structured extraction
  4. Stores parsed recipes in MongoDB matching the Recipe schema

Designed to run continuously in the background at a gentle pace so it
doesn't hammer any single site.  Controlled via REST endpoints exposed
by crawler_api.py.
"""

import os
import re
import json
import random
import logging
import threading
from math import isfinite
from datetime import datetime, timezone
from typing import Dict, List, Optional
from urllib.parse import urljoin, urlparse

import requests
from bs4 import BeautifulSoup
from pymongo import MongoClient, ASCENDING
from pymongo.errors import DuplicateKeyError
from dotenv import load_dotenv

# ---------------------------------------------------------------------------
# Configuration
# ---------------------------------------------------------------------------

ROOT_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
load_dotenv(dotenv_path=os.path.join(ROOT_DIR, '.env.local'))
load_dotenv(dotenv_path=os.path.join(ROOT_DIR, 'frontend', '.env.local'), override=False)

MONGODB_URI = os.getenv('MONGODB_URI', 'mongodb://localhost:27017/fine-dining')
OLLAMA_BASE_URL = os.getenv('OLLAMA_BASE_URL', 'http://localhost:11434')
OLLAMA_MODEL = os.getenv('OLLAMA_MODEL', 'gemma4:e4b')

# Crawl pacing
MIN_DELAY_SECONDS = 3
MAX_DELAY_SECONDS = 8
REQUEST_TIMEOUT = 30
MAX_PAGE_SIZE = 2_000_000  # 2MB max page size (modern recipe sites are heavy)

USER_AGENT = (
    'Mozilla/5.0 (compatible; FineDiningBot/1.0; '
    '+https://github.com/fine-dining-app)'
)

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s [%(levelname)s] %(name)s: %(message)s',
)
logger = logging.getLogger('recipe_crawler')

NUTRITION_KEYS = (
    'calories', 'protein', 'carbohydrates', 'fat', 'fiber', 'sugar',
    'sodium', 'cholesterol', 'saturatedFat', 'transFat', 'vitaminA',
    'vitaminC', 'vitaminD', 'vitaminE', 'vitaminK', 'vitaminB6',
    'vitaminB12', 'thiamin', 'riboflavin', 'niacin', 'folate',
    'calcium', 'iron', 'magnesium', 'phosphorus', 'potassium',
    'zinc', 'selenium', 'copper', 'manganese', 'omega3', 'omega6',
)
MIN_FULL_MEAL_INGREDIENTS = 6

# ---------------------------------------------------------------------------
# Seed URLs – popular recipe listing / search pages
# ---------------------------------------------------------------------------

DEFAULT_SEED_URLS: List[str] = [
    'https://www.allrecipes.com/recipes/',
    'https://www.simplyrecipes.com/recipes-702203750/',
    'https://www.budgetbytes.com/category/recipes/',
    'https://www.eatingwell.com/recipes-702204980/',
    'https://www.skinnytaste.com/recipes/',
    'https://minimalistbaker.com/recipes/',
    'https://cookieandkate.com/recipes/',
    'https://www.loveandlemons.com/recipes/',
]

# Search queries the crawler rotates through to discover new recipes
SEARCH_QUERIES: List[str] = [
    'easy dinner recipes', 'healthy meal prep recipes', 'budget friendly meals',
    'quick weeknight dinners', 'vegetarian recipes', 'vegan meal ideas',
    'keto recipes', 'gluten free recipes', 'meal prep for the week',
    'cheap healthy recipes', 'one pot meals', 'sheet pan dinners',
    'slow cooker recipes', 'instant pot recipes', 'air fryer recipes',
    'high protein meals', 'low carb dinner ideas', 'mediterranean diet recipes',
    'asian recipes easy', 'mexican food recipes', 'italian pasta recipes',
    'indian curry recipes', 'thai recipes', 'japanese recipes easy',
    'breakfast ideas healthy', 'lunch ideas for work', 'healthy snack recipes',
    'dessert recipes easy', 'smoothie recipes', 'soup recipes',
    'salad recipes filling', 'chicken breast recipes', 'ground beef recipes',
    'salmon recipes easy', 'tofu recipes', 'lentil recipes',
    'rice bowl recipes', 'sandwich recipes', 'wrap recipes healthy',
    'casserole recipes', 'stir fry recipes', 'grilled recipes',
    'baked chicken recipes', 'pasta recipes easy', 'pizza recipes homemade',
    'taco recipes', 'burger recipes', 'fish recipes easy',
    'shrimp recipes', 'egg recipes', 'bean recipes',
    'quinoa recipes', 'sweet potato recipes', 'broccoli recipes',
    'cauliflower recipes', 'zucchini recipes', 'mushroom recipes',
    'family dinner ideas', 'romantic dinner recipes', 'party food ideas',
    'potluck recipes', 'camping meal ideas', 'picnic recipes',
]

# ---------------------------------------------------------------------------
# LLM prompt for structured extraction
# ---------------------------------------------------------------------------

EXTRACTION_PROMPT = """You are a recipe data extractor. Given the raw text of a web page that contains a recipe, extract the recipe into the following JSON structure. Return ONLY valid JSON, no explanation.

If the page does not contain a recipe, return: {"error": "no_recipe_found"}

JSON schema:
{
  "recipeName": "string (max 200 chars)",
  "ingredients": [
    {
      "name": "string",
      "quantity": number,
      "unit": "string (g, oz, cup, tbsp, tsp, ml, piece, etc.)",
      "gramWeight": number,
      "canonicalName": "normalized grocery name, e.g. boneless skinless chicken breast",
      "affiliateSearchTerm": "shopper-facing product search query",
      "fdcId": "USDA FoodData Central id when verified, otherwise empty string",
      "category": "string (Protein, Vegetable, Fruit, Grain, Dairy, Spice, Oil, Other)",
      "optional": boolean,
      "purchaseOptions": [
        {
          "retailer": "Instacart | Walmart | Amazon | Kroger | Other",
          "productName": "product/search title",
          "url": "non-affiliate product/search/cart url",
          "affiliateUrl": "official partner-generated affiliate url, or empty string",
          "affiliateProvider": "network/provider name or empty string",
          "linkType": "SEARCH | PRODUCT | CART | LANDING",
          "monetizationStatus": "READY | PENDING_PARTNER | NOT_MONETIZED",
          "packageSize": "string",
          "estimatedPrice": number,
          "currency": "USD",
          "unitPrice": number,
          "disclosure": "short affiliate disclosure"
        }
      ]
    }
  ],
  "instructions": "string (full instructions as a single block of text)",
  "servings": number,
  "servingSize": "string, e.g. '1 bowl (350g)'",
  "nutritionPerServing": {
    "calories": number, "protein": number, "carbohydrates": number, "fat": number,
    "fiber": number, "sugar": number, "sodium": number, "cholesterol": number,
    "saturatedFat": number, "transFat": number,
    "vitaminA": number, "vitaminC": number, "vitaminD": number, "vitaminE": number,
    "vitaminK": number, "vitaminB6": number, "vitaminB12": number,
    "thiamin": number, "riboflavin": number, "niacin": number, "folate": number,
    "calcium": number, "iron": number, "magnesium": number, "phosphorus": number,
    "potassium": number, "zinc": number, "selenium": number, "copper": number,
    "manganese": number, "omega3": number, "omega6": number
  },
  "prepTime": number (minutes),
  "cookTime": number (minutes),
  "difficulty": "EASY | INTERMEDIATE | HARD",
  "mealTypes": ["BREAKFAST", "LUNCH", "DINNER", "SNACK", "DESSERT", "SIDE"],
  "cuisine": "string",
  "dietaryTags": ["VEGAN", "VEGETARIAN", "KETO", "PALEO", "GLUTEN_FREE", "DAIRY_FREE", etc.],
  "allergens": ["GLUTEN", "DAIRY", "NUTS", "EGGS", "SOY", "SHELLFISH", "FISH", "SESAME"],
  "tags": ["string"],
  "estimatedCost": number (USD total for all servings),
  "images": ["url strings"],
  "sourceDetails": {
    "originalUrl": "source page URL",
    "canonicalUrl": "canonical source URL",
    "siteName": "source site name",
    "authorName": "source author when visible",
    "extractionMethod": "json_ld | html_text | manual_review",
    "copyrightReviewStatus": "ORIGINAL | FACTS_ONLY_PARAPHRASE | PERMISSIONED | PUBLIC_DOMAIN | REJECTED | UNKNOWN",
    "transformationNotes": "one sentence explaining how instructions were rewritten",
    "nutritionSource": "USDA FoodData Central | source label | estimate",
    "pricingSource": "retailer search | affiliate API | estimate"
  }
}

Set unknown numeric nutrition values to 0. Estimate values when the page provides partial info.
Only include allergens that are actually present in the ingredients.
Pick mealTypes that best fit the recipe (can be multiple).
Do not copy a source page's headnote, story, photos, or distinctive instruction prose. Extract facts, rewrite instructions into original concise operational steps, and keep the source URL for attribution/review.
Do not invent affiliate links. Use an empty affiliateUrl and monetizationStatus "PENDING_PARTNER" unless a configured partner API generated the URL.

Raw page text:
---
{page_text}
---

Return ONLY the JSON object:"""

# ---------------------------------------------------------------------------
# MongoDB helpers
# ---------------------------------------------------------------------------


class CrawlQueueWriteError(RuntimeError):
    """Raised when crawl queue writes fail and must be reported safely."""


class RecipePayloadValidationError(ValueError):
    """Raised when an extracted recipe payload is malformed or incomplete."""


ALLOWED_COPYRIGHT_REVIEW_STATUSES = {
    'ORIGINAL',
    'FACTS_ONLY_PARAPHRASE',
    'PERMISSIONED',
    'PUBLIC_DOMAIN',
    'REJECTED',
    'UNKNOWN',
}

INSTRUCTION_NUMBERED_PREFIX_PATTERN = re.compile(
    r'^\s*(?:step\s+\d+\s*[\.\):\-]?|\d+[\.\):\-])\s*',
    re.IGNORECASE,
)
INSTRUCTION_BULLET_PREFIX_PATTERN = re.compile(r'^\s*[\-\*•]\s*')


def _normalize_instruction_step(step: str) -> str:
    stripped_step = INSTRUCTION_BULLET_PREFIX_PATTERN.sub('', step)
    stripped_step = INSTRUCTION_NUMBERED_PREFIX_PATTERN.sub('', stripped_step)
    return re.sub(r'\s+', ' ', stripped_step).strip()


def _normalize_instruction_steps(instructions: Optional[str]) -> List[str]:
    if not isinstance(instructions, str):
        return []

    return [
        _normalize_instruction_step(step)
        for step in instructions.splitlines()
        if step.strip()
    ]


class RecipeStore:
    """Thin wrapper around the recipes collection in MongoDB."""

    def __init__(self, uri: str = MONGODB_URI):
        self.client = MongoClient(uri)
        db_name = urlparse(uri).path.lstrip('/') or 'fine-dining'
        self.db = self.client[db_name]
        self.recipes = self.db['recipes']
        self.crawl_queue = self.db['crawl_queue']
        self.crawl_log = self.db['crawl_log']
        self._ensure_indexes()

    def _ensure_indexes(self):
        self.recipes.create_index([('recipeName', ASCENDING), ('source', ASCENDING)], unique=True)
        self.crawl_queue.create_index('url', unique=True)
        self.crawl_queue.create_index('status')
        self.crawl_log.create_index('url', unique=True)

    # --- Queue management ---------------------------------------------------

    def enqueue_urls(self, urls: List[str]):
        """Add URLs to the crawl queue (skip duplicates)."""
        added = 0
        inserted_urls = []
        for url in urls:
            try:
                self.crawl_queue.insert_one({
                    'url': url,
                    'status': 'pending',
                    'added_at': datetime.now(timezone.utc),
                    'attempts': 0,
                })
                added += 1
                inserted_urls.append(url)
            except DuplicateKeyError:
                pass  # duplicate
            except Exception as error:
                if inserted_urls:
                    try:
                        self.crawl_queue.delete_many({'url': {'$in': inserted_urls}})
                    except Exception as rollback_error:
                        logger.warning(
                            'Failed to roll back partial crawl queue insert: %s',
                            rollback_error,
                        )
                raise CrawlQueueWriteError('Unable to update crawl queue right now.') from error
        return added

    def next_pending(self) -> Optional[Dict]:
        """Atomically grab the next pending URL."""
        return self.crawl_queue.find_one_and_update(
            {'status': 'pending'},
            {'$set': {'status': 'processing', 'started_at': datetime.now(timezone.utc)},
             '$inc': {'attempts': 1}},
        )

    def mark_done(self, url: str, status: str = 'done', error: str = ''):
        self.crawl_queue.update_one(
            {'url': url},
            {'$set': {'status': status, 'finished_at': datetime.now(timezone.utc), 'error': error}},
        )

    def log_crawl(self, url: str, success: bool, recipe_name: str = '', error: str = ''):
        self.crawl_log.update_one(
            {'url': url},
            {'$set': {
                'success': success,
                'recipe_name': recipe_name,
                'error': error,
                'crawled_at': datetime.now(timezone.utc),
            }},
            upsert=True,
        )

    # --- Recipe storage -----------------------------------------------------

    def save_recipe(self, data: Dict, source_url: str) -> bool:
        """Insert a recipe document. Returns True if inserted, False if duplicate."""
        self._validate_recipe_payload(data, source_url)
        doc = self._to_mongo_doc(data, source_url)
        try:
            self.recipes.insert_one(doc)
            return True
        except Exception as e:
            if 'duplicate' in str(e).lower() or 'E11000' in str(e):
                logger.debug('Duplicate recipe skipped: %s', data.get('recipeName'))
                return False
            raise

    def _validate_recipe_payload(self, data: Dict, source_url: str):
        """Fail fast on malformed extracted recipes before Mongo persistence."""
        if not isinstance(data, dict):
            raise RecipePayloadValidationError('Invalid recipe payload: expected a JSON object.')

        issues = []

        if not isinstance(source_url, str) or not source_url.strip():
            issues.append('source')

        self._validate_source_details(data.get('sourceDetails'), issues)

        name = data.get('recipeName')
        if not isinstance(name, str) or not name.strip():
            issues.append('recipeName')

        ingredients = data.get('ingredients')
        if not isinstance(ingredients, list) or not ingredients:
            issues.append('ingredients')
        else:
            if len(ingredients) < MIN_FULL_MEAL_INGREDIENTS:
                raise RecipePayloadValidationError(
                    f'Invalid recipe payload: expected at least {MIN_FULL_MEAL_INGREDIENTS} ingredients for a full meal.',
                )

            for index, ingredient in enumerate(ingredients):
                if not isinstance(ingredient, dict):
                    issues.append(f'ingredients[{index}]')
                    break

                ingredient_name = ingredient.get('name')
                if not isinstance(ingredient_name, str) or not ingredient_name.strip():
                    issues.append(f'ingredients[{index}].name')
                    break

                ingredient_unit = ingredient.get('unit')
                if not isinstance(ingredient_unit, str) or not ingredient_unit.strip():
                    issues.append(f'ingredients[{index}].unit')
                    break

                quantity = ingredient.get('quantity')
                if isinstance(quantity, bool) or not isinstance(quantity, (int, float)) or not isfinite(quantity) or quantity < 0:
                    issues.append(f'ingredients[{index}].quantity')
                    break

                gram_weight = ingredient.get('gramWeight')
                if isinstance(gram_weight, bool) or not isinstance(gram_weight, (int, float)) or not isfinite(gram_weight) or gram_weight < 0:
                    issues.append(f'ingredients[{index}].gramWeight')
                    break

                self._validate_nutrition_profile(
                    ingredient.get('nutrition'),
                    issues,
                    f'ingredients[{index}].nutrition',
                )

        instructions = data.get('instructions')
        if not isinstance(instructions, str) or not instructions.strip():
            issues.append('instructions')
        else:
            instruction_steps = _normalize_instruction_steps(instructions)
            normalized_steps = [step.lower() for step in instruction_steps]
            if (
                len(instruction_steps) < 4
                or len(instruction_steps) > 8
                or len(set(normalized_steps)) != len(normalized_steps)
            ):
                issues.append('instructions.paraphraseQuality')

        servings = data.get('servings')
        if not isinstance(servings, (int, float)) or int(servings) < 1:
            issues.append('servings')

        self._validate_nutrition_profile(data.get('nutritionPerServing'), issues, 'nutritionPerServing')

        prep_time = data.get('prepTime')
        if not isinstance(prep_time, (int, float)) or int(prep_time) < 0:
            issues.append('prepTime')

        if issues:
            raise RecipePayloadValidationError(f"Invalid recipe payload: {', '.join(issues)}.")

    def _validate_source_details(self, source_details: Dict, issues: List[str]):
        """Validate provenance fields that must survive recipe transforms."""
        if not isinstance(source_details, dict):
            issues.append('sourceDetails')
            return

        required_fields = (
            'siteName',
            'extractionMethod',
            'copyrightReviewStatus',
            'transformationNotes',
            'nutritionSource',
            'pricingSource',
        )
        for field in required_fields:
            value = source_details.get(field)
            if not isinstance(value, str) or not value.strip():
                issues.append(f'sourceDetails.{field}')

        copyright_status = str(source_details.get('copyrightReviewStatus', '')).strip()
        if copyright_status and copyright_status not in ALLOWED_COPYRIGHT_REVIEW_STATUSES:
            issues.append('sourceDetails.copyrightReviewStatus')

    def _validate_nutrition_profile(self, nutrition: Dict, issues: List[str], field_path: str):
        """Require a complete nutrition object for every recipe and ingredient."""
        if not isinstance(nutrition, dict):
            issues.append(field_path)
            return

        for key in NUTRITION_KEYS:
            value = nutrition.get(key)
            if isinstance(value, bool):
                issues.append(f'{field_path}.{key}')
                continue
            try:
                numeric_value = float(value)
            except (TypeError, ValueError):
                issues.append(f'{field_path}.{key}')
                continue
            if not isfinite(numeric_value):
                issues.append(f'{field_path}.{key}')

    def _to_mongo_doc(self, data: Dict, source_url: str) -> Dict:
        """Map LLM-extracted dict → Mongo document matching recipe.schema.js."""
        now = datetime.now(timezone.utc)
        nut = data.get('nutritionPerServing', {})

        def normalize_nutrition(values: Dict) -> Dict:
            return {key: float(values.get(key, 0) or 0) for key in NUTRITION_KEYS}

        def normalize_text(value, fallback=''):
            if isinstance(value, str):
                cleaned = value.strip()
                if cleaned:
                    return cleaned
            return fallback

        ingredients = []
        for ing in data.get('ingredients', []):
            purchase_options = []
            for option in ing.get('purchaseOptions', []):
                purchase_options.append({
                    'retailer': str(option.get('retailer', '')).strip(),
                    'productName': str(option.get('productName', '')).strip(),
                    'url': str(option.get('url', '')).strip(),
                    'affiliateUrl': str(option.get('affiliateUrl', '')).strip(),
                    'affiliateProvider': str(option.get('affiliateProvider', '')).strip(),
                    'linkType': str(option.get('linkType', 'SEARCH')).strip() or 'SEARCH',
                    'monetizationStatus': str(option.get('monetizationStatus', 'PENDING_PARTNER')).strip() or 'PENDING_PARTNER',
                    'packageSize': str(option.get('packageSize', '')).strip(),
                    'estimatedPrice': float(option.get('estimatedPrice', 0) or 0),
                    'currency': str(option.get('currency', 'USD')).strip() or 'USD',
                    'unitPrice': float(option.get('unitPrice', 0) or 0),
                    'lastCheckedAt': None,
                    'disclosure': str(option.get('disclosure', '')).strip(),
                })

            ingredients.append({
                'name': str(ing.get('name', '')).strip(),
                'quantity': float(ing.get('quantity', 0)),
                'unit': str(ing.get('unit', 'piece')).strip(),
                'gramWeight': float(ing.get('gramWeight', 0) or 0),
                'canonicalName': str(ing.get('canonicalName', '')).strip(),
                'affiliateSearchTerm': str(ing.get('affiliateSearchTerm', '')).strip(),
                'fdcId': str(ing.get('fdcId', '')).strip(),
                'category': str(ing.get('category', '')).strip(),
                'optional': bool(ing.get('optional', False)),
                'nutrition': normalize_nutrition(ing.get('nutrition', {})),
                'purchaseOptions': [opt for opt in purchase_options if opt['retailer'] and opt['productName'] and opt['url']],
            })

        servings = max(int(data.get('servings', 1)), 1)
        estimated_cost = float(data.get('estimatedCost', 0))
        cost_per_serving = round(estimated_cost / servings, 2) if servings > 0 and estimated_cost > 0 else 0
        source_details = data.get('sourceDetails', {})

        return {
            'recipeName': str(data.get('recipeName', 'Untitled'))[:200],
            'ingredients': ingredients,
            'instructions': '\n'.join(_normalize_instruction_steps(data.get('instructions', ''))),
            'servings': servings,
            'servingSize': str(data.get('servingSize', '')),
            'nutritionPerServing': normalize_nutrition(nut),
            'prepTime': int(data.get('prepTime', 0)),
            'cookTime': int(data.get('cookTime', 0)),
            'totalTime': int(data.get('prepTime', 0)) + int(data.get('cookTime', 0)),
            'difficulty': data.get('difficulty', 'EASY') if data.get('difficulty') in ('EASY', 'INTERMEDIATE', 'HARD') else 'EASY',
            'mealTypes': [t for t in data.get('mealTypes', []) if t in ('BREAKFAST', 'LUNCH', 'DINNER', 'SNACK', 'DESSERT', 'SIDE')],
            'cuisine': str(data.get('cuisine', '')).strip(),
            'dietaryTags': [str(t).strip() for t in data.get('dietaryTags', [])],
            'allergens': [str(a).strip() for a in data.get('allergens', [])],
            'tags': [str(t).strip() for t in data.get('tags', [])],
            'images': [str(u) for u in data.get('images', []) if u],
            'videoUrl': '',
            'estimatedCost': estimated_cost,
            'costPerServing': cost_per_serving,
            'author': None,
            'source': source_url,
            'sourceDetails': {
                'originalUrl': normalize_text(source_details.get('originalUrl'), source_url),
                'canonicalUrl': normalize_text(source_details.get('canonicalUrl'), source_url),
                'siteName': normalize_text(source_details.get('siteName')),
                'authorName': normalize_text(source_details.get('authorName')),
                'capturedAt': now,
                'extractionMethod': normalize_text(source_details.get('extractionMethod')),
                'copyrightReviewStatus': normalize_text(source_details.get('copyrightReviewStatus'), 'UNKNOWN'),
                'transformationNotes': normalize_text(source_details.get('transformationNotes')),
                'nutritionSource': normalize_text(source_details.get('nutritionSource')),
                'pricingSource': normalize_text(source_details.get('pricingSource')),
            },
            'verified': False,
            'averageRating': 0,
            'ratingCount': 0,
            'createdAt': now,
            'updatedAt': now,
        }

    # --- Stats --------------------------------------------------------------

    def stats(self) -> Dict:
        total_recipes = self.recipes.count_documents({})
        queue_counts = {
            'pending': 0,
            'processing': 0,
            'done': 0,
            'failed': 0,
        }
        for row in self.crawl_queue.aggregate([
            {'$group': {'_id': '$status', 'count': {'$sum': 1}}},
        ]):
            status = row.get('_id')
            if status in queue_counts:
                queue_counts[status] = int(row.get('count', 0) or 0)
        return {
            'total_recipes': total_recipes,
            'queue_pending': queue_counts['pending'],
            'queue_processing': queue_counts['processing'],
            'queue_done': queue_counts['done'],
            'queue_failed': queue_counts['failed'],
        }


# ---------------------------------------------------------------------------
# LLM client (Ollama)
# ---------------------------------------------------------------------------

class OllamaClient:
    """Interact with a local Ollama instance for recipe extraction."""

    def __init__(self, base_url: str = OLLAMA_BASE_URL, model: str = OLLAMA_MODEL):
        self.base_url = base_url.rstrip('/')
        self.model = model
        self.timeout = 120  # LLM can be slow

    def is_available(self) -> bool:
        try:
            r = requests.get(f'{self.base_url}/api/tags', timeout=5)
            if r.status_code != 200:
                return False
            models = [m['name'] for m in r.json().get('models', [])]
            if self.model not in models:
                # Try to find a matching model (e.g. 'gemma4:e4b' matches 'gemma4:e4b')
                for m in models:
                    if m.startswith(self.model.split(':')[0]):
                        logger.info('Configured model %s not found, using %s', self.model, m)
                        self.model = m
                        return True
                logger.warning('Model %s not found in Ollama. Available: %s', self.model, models)
                return False
            return True
        except Exception:
            return False

    def extract_recipe(self, page_text: str) -> Optional[Dict]:
        """Send page text to the LLM and parse structured recipe JSON back."""
        # Truncate very long pages to avoid overwhelming the model
        max_chars = 12_000
        if len(page_text) > max_chars:
            page_text = page_text[:max_chars] + '\n...[truncated]'

        prompt = EXTRACTION_PROMPT.replace('{page_text}', page_text)

        try:
            resp = requests.post(
                f'{self.base_url}/api/generate',
                json={
                    'model': self.model,
                    'prompt': prompt,
                    'stream': False,
                    'options': {
                        'temperature': 0.1,
                        'num_predict': 4096,
                    },
                },
                timeout=self.timeout,
            )
            resp.raise_for_status()
            raw = resp.json().get('response', '')
            return self._parse_json(raw)
        except Exception as e:
            logger.error('LLM extraction failed: %s', e)
            return None

    @staticmethod
    def _parse_json(text: str) -> Optional[Dict]:
        """Robustly extract JSON from LLM output."""
        # Try direct parse first
        text = text.strip()
        if text.startswith('```'):
            text = re.sub(r'^```(?:json)?\s*', '', text)
            text = re.sub(r'\s*```$', '', text)

        try:
            return json.loads(text)
        except json.JSONDecodeError:
            pass

        # Try to find JSON object in the text
        match = re.search(r'\{[\s\S]*\}', text)
        if match:
            try:
                return json.loads(match.group())
            except json.JSONDecodeError:
                pass

        return None


# ---------------------------------------------------------------------------
# Web fetcher & link extractor
# ---------------------------------------------------------------------------

class WebFetcher:
    """Rate-limited, polite web fetcher."""

    def __init__(self):
        self.session = requests.Session()
        self.session.headers.update({
            'User-Agent': USER_AGENT,
            'Accept': 'text/html,application/xhtml+xml',
            'Accept-Language': 'en-US,en;q=0.9',
        })

    def fetch(self, url: str) -> Optional[str]:
        """Fetch a URL and return HTML string, or None on failure."""
        try:
            resp = self.session.get(url, timeout=REQUEST_TIMEOUT, allow_redirects=True)
            if resp.status_code != 200:
                logger.warning('HTTP %d for %s', resp.status_code, url)
                return None
            if len(resp.content) > MAX_PAGE_SIZE:
                logger.warning('Page too large (%d bytes): %s', len(resp.content), url)
                return None
            return resp.text
        except Exception as e:
            logger.warning('Fetch error for %s: %s', url, e)
            return None

    @staticmethod
    def extract_text(html: str) -> str:
        """Extract readable text from HTML for LLM consumption."""
        soup = BeautifulSoup(html, 'html.parser')

        # Remove scripts, styles, nav, footer, ads
        for tag in soup(['script', 'style', 'nav', 'footer', 'header',
                         'aside', 'iframe', 'noscript']):
            tag.decompose()

        text = soup.get_text(separator='\n', strip=True)
        # Collapse multiple blank lines
        text = re.sub(r'\n{3,}', '\n\n', text)
        return text

    @staticmethod
    def extract_links(html: str, base_url: str) -> List[str]:
        """Extract recipe-like links from an HTML page."""
        soup = BeautifulSoup(html, 'html.parser')
        links = set()
        base_domain = urlparse(base_url).netloc

        for a in soup.find_all('a', href=True):
            href = a['href']
            full = urljoin(base_url, href)
            parsed = urlparse(full)

            # Stay on same domain
            if parsed.netloc != base_domain:
                continue
            # Skip non-http
            if parsed.scheme not in ('http', 'https'):
                continue
            # Skip anchors, query-heavy, non-recipe paths
            clean = parsed._replace(fragment='', query='').geturl()
            # Heuristic: recipe pages often have /recipe/ in path
            path_lower = parsed.path.lower()
            if any(kw in path_lower for kw in ['/recipe/', '/recipes/', '/meal/', '/dish/']):
                links.add(clean)

        return list(links)

    @staticmethod
    def looks_like_recipe_page(html: str) -> bool:
        """Quick heuristic check if a page likely contains a single recipe."""
        soup = BeautifulSoup(html, 'html.parser')
        # Check for common recipe schema markup
        if soup.find(attrs={'itemtype': re.compile(r'schema\.org/Recipe', re.I)}):
            return True
        # Check for JSON-LD recipe data
        for script in soup.find_all('script', type='application/ld+json'):
            try:
                data = json.loads(script.string or '')
                if isinstance(data, dict) and data.get('@type') == 'Recipe':
                    return True
                if isinstance(data, list):
                    for item in data:
                        if isinstance(item, dict) and item.get('@type') == 'Recipe':
                            return True
            except Exception:
                pass
        # Keyword heuristic
        text_lower = (soup.get_text() or '').lower()
        recipe_keywords = ['ingredients', 'instructions', 'prep time', 'cook time', 'servings']
        matches = sum(1 for kw in recipe_keywords if kw in text_lower)
        return matches >= 3


# ---------------------------------------------------------------------------
# Search-based recipe discovery (DuckDuckGo — no API key needed)
# ---------------------------------------------------------------------------

class SearchDiscovery:
    """Use DuckDuckGo HTML search to find new recipe URLs."""

    SEARCH_URL = 'https://html.duckduckgo.com/html/'

    def __init__(self):
        self.session = requests.Session()
        self.session.headers.update({
            'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
        })
        self._query_index = random.randint(0, len(SEARCH_QUERIES) - 1)

    def next_query(self) -> str:
        """Rotate through search queries."""
        q = SEARCH_QUERIES[self._query_index % len(SEARCH_QUERIES)]
        self._query_index += 1
        return q

    def search_recipes(self, query: str = '') -> List[str]:
        """Search DuckDuckGo for recipe URLs. Returns a list of URLs."""
        if not query:
            query = self.next_query()

        logger.info('🔍 Searching: "%s"', query)
        try:
            resp = self.session.post(
                self.SEARCH_URL,
                data={'q': query, 'b': ''},
                timeout=15,
            )
            if resp.status_code != 200:
                logger.warning('Search returned HTTP %d', resp.status_code)
                return []

            soup = BeautifulSoup(resp.text, 'html.parser')
            urls = []
            for link in soup.find_all('a', class_='result__a', href=True):
                href = link['href']
                # DuckDuckGo wraps URLs in redirects; extract the actual URL
                if 'uddg=' in href:
                    from urllib.parse import parse_qs, unquote
                    params = parse_qs(urlparse(href).query)
                    if 'uddg' in params:
                        href = unquote(params['uddg'][0])
                parsed = urlparse(href)
                if parsed.scheme in ('http', 'https'):
                    urls.append(href)

            logger.info('🔍 Found %d URLs for "%s"', len(urls), query)
            return urls
        except Exception as e:
            logger.warning('Search failed for "%s": %s', query, e)
            return []


# ---------------------------------------------------------------------------
# Crawler engine
# ---------------------------------------------------------------------------

class RecipeCrawler:
    """
    The main crawler orchestrator.  Runs in a background thread.
    Fetches pages → checks if recipe → extracts via LLM → stores in Mongo.
    Also discovers new recipe links and adds them to the queue.
    """

    def __init__(self):
        self.store = RecipeStore()
        self.llm = OllamaClient()
        self.fetcher = WebFetcher()
        self.search = SearchDiscovery()
        self._running = False
        self._thread: Optional[threading.Thread] = None
        self._stop_event = threading.Event()
        self._current_url = ''
        self._recipes_found = 0
        self._pages_crawled = 0
        self._searches_done = 0
        self._errors = 0
        self._last_error = ''
        self._started_at: Optional[datetime] = None

    # --- Control ------------------------------------------------------------

    def start(self, seed_urls: Optional[List[str]] = None):
        """Start the crawler in a background thread."""
        if self._running:
            logger.info('Crawler already running')
            return

        # Reset any stale 'processing' items from previous crashed runs
        self.store.crawl_queue.update_many(
            {'status': 'processing'},
            {'$set': {'status': 'pending'}},
        )

        urls = seed_urls or DEFAULT_SEED_URLS
        added = self.store.enqueue_urls(urls)
        logger.info('Enqueued %d seed URLs (%d new)', len(urls), added)

        # Reset in-memory run state only after the queue update succeeds so a
        # failed start leaves the last known status intact.
        self._current_url = ''
        self._recipes_found = 0
        self._pages_crawled = 0
        self._searches_done = 0
        self._errors = 0
        self._last_error = ''

        self._stop_event.clear()
        self._running = True
        self._started_at = datetime.now(timezone.utc)
        self._thread = threading.Thread(target=self._crawl_loop, daemon=True)
        self._thread.start()
        logger.info('Crawler started')

    def stop(self):
        """Signal the crawler to stop gracefully."""
        if not self._running:
            return
        logger.info('Stopping crawler...')
        self._stop_event.set()
        self._running = False

    def status(self) -> Dict:
        db_stats = self.store.stats()
        return {
            'running': self._running,
            'current_url': self._current_url,
            'pages_crawled': self._pages_crawled,
            'recipes_found': self._recipes_found,
            'searches_done': self._searches_done,
            'errors': self._errors,
            'last_error': getattr(self, '_last_error', ''),
            'started_at': self._started_at.isoformat() if self._started_at else None,
            'llm_available': self.llm.is_available(),
            'llm_model': self.llm.model,
            **db_stats,
        }

    # --- Main loop ----------------------------------------------------------

    def _crawl_loop(self):
        logger.info('Crawl loop started')
        while not self._stop_event.is_set():
            item = self.store.next_pending()
            if not item:
                # Queue empty — search for more recipes
                logger.info('Queue empty, searching for more recipes...')
                try:
                    urls = self.search.search_recipes()
                    if urls:
                        added = self.store.enqueue_urls(urls)
                        self._searches_done += 1
                        logger.info('Search added %d new URLs to queue', added)
                    else:
                        logger.info('Search returned no URLs, sleeping 30s...')
                        self._stop_event.wait(30)
                except Exception as e:
                    logger.error('Search error: %s', e)
                    self._stop_event.wait(30)
                # Polite delay after search
                self._stop_event.wait(random.uniform(5, 10))
                continue

            url = item['url']
            self._current_url = url
            logger.info('Crawling: %s', url)

            try:
                self._process_url(url)
                self._pages_crawled += 1
            except Exception as e:
                logger.error('Error processing %s: %s', url, e)
                self._last_error = str(e)
                self.store.mark_done(url, status='failed', error=str(e))
                self.store.log_crawl(url, success=False, error=str(e))
                self._errors += 1

            # Polite delay
            delay = random.uniform(MIN_DELAY_SECONDS, MAX_DELAY_SECONDS)
            self._stop_event.wait(delay)

        self._current_url = ''
        logger.info('Crawl loop stopped')

    def _process_url(self, url: str):
        html = self.fetcher.fetch(url)
        if not html:
            self._last_error = 'fetch_failed'
            self.store.mark_done(url, status='failed', error='fetch_failed')
            self.store.log_crawl(url, success=False, error='fetch_failed')
            return

        # Always discover new links from any page
        new_links = self.fetcher.extract_links(html, url)
        if new_links:
            added = self.store.enqueue_urls(new_links)
            if added:
                logger.info('Discovered %d new recipe links from %s', added, url)

        # Check if this page has a recipe
        if not self.fetcher.looks_like_recipe_page(html):
            self.store.mark_done(url, status='done')
            self.store.log_crawl(url, success=True, recipe_name='[listing page]')
            return

        # Extract text for LLM
        page_text = self.fetcher.extract_text(html)
        if len(page_text) < 100:
            self.store.mark_done(url, status='done', error='page_too_short')
            self.store.log_crawl(url, success=False, error='page_too_short')
            return

        # Send to LLM
        recipe_data = self.llm.extract_recipe(page_text)
        if not recipe_data or recipe_data.get('error'):
            err = recipe_data.get('error', 'llm_extraction_failed') if recipe_data else 'llm_returned_none'
            self._last_error = err
            self.store.mark_done(url, status='failed', error=err)
            self.store.log_crawl(url, success=False, error=err)
            return

        # Validate minimum fields
        name = recipe_data.get('recipeName', '').strip()
        ingredients = recipe_data.get('ingredients', [])
        instructions = recipe_data.get('instructions', '').strip()

        if not name or not ingredients or not instructions:
            self._last_error = 'incomplete_extraction'
            self.store.mark_done(url, status='failed', error='incomplete_extraction')
            self.store.log_crawl(url, success=False, error='incomplete_extraction')
            return

        # Store
        try:
            inserted = self.store.save_recipe(recipe_data, source_url=url)
        except RecipePayloadValidationError as error:
            self._last_error = str(error)
            self.store.mark_done(url, status='failed', error=str(error))
            self.store.log_crawl(url, success=False, error=str(error))
            return

        if inserted:
            self._recipes_found += 1
            logger.info('✅ Saved recipe: %s (from %s)', name, url)
        else:
            logger.info('⏭️  Duplicate recipe skipped: %s', name)

        self.store.mark_done(url, status='done')
        self.store.log_crawl(url, success=True, recipe_name=name)


# ---------------------------------------------------------------------------
# Singleton instance used by the API
# ---------------------------------------------------------------------------

_crawler_instance: Optional[RecipeCrawler] = None


def get_crawler() -> RecipeCrawler:
    global _crawler_instance
    if _crawler_instance is None:
        _crawler_instance = RecipeCrawler()
    return _crawler_instance
