# Recipe Ingestion Agent Instructions

Fine Dining recipes are MongoDB `Recipe` documents used by recipe browsing, cookbooks, and meal-plan generation. Agents must create complete full-meal recipes with structured ingredients, per-serving nutrition, allergens, costs, provenance, and ingredient purchase links.

## Current Project Targets

- Mongoose model: `frontend/src/models/Recipe/recipe.schema.ts`
- GraphQL contract: `frontend/src/graphql/typeDefs.ts`
- Crawler sidecar: `backend/recipe_crawler.py`
- Seed pack: `frontend/data/recipe_seed/full_meal_recipes_100.json`
- Seed tools:
  - `npm run recipes:generate`
  - `npm run recipes:validate`
  - `npm run recipes:seed`

## Source And Copyright Rules

Agents may extract factual recipe data, but must not copy expressive source content.

- Keep source URLs and provenance in `source` and `sourceDetails`.
- `sourceDetails.copyrightReviewStatus` may be `ORIGINAL` for recipes authored from verified ingredient and nutrition data, or one of `FACTS_ONLY_PARAPHRASE`, `PERMISSIONED`, `PUBLIC_DOMAIN`, `REJECTED`, or `UNKNOWN` for imported content.
- `sourceDetails` must carry the provenance fields the crawler validates: `siteName`, `extractionMethod`, `copyrightReviewStatus`, `transformationNotes`, `nutritionSource`, and `pricingSource`. Include `authorName` when visible, and carry `originalUrl` / `canonicalUrl` through when known.
- `npm run recipes:validate` enforces the same provenance fields across the full 100-recipe seed pack before import.
- Prefer pages with visible recipe metadata and permissive access. Respect robots, terms, rate limits, and paywalls.
- Do not copy headnotes, stories, author commentary, photos, or distinctive instruction prose.
- Ingredient lists and basic cooking facts may be normalized, but instructions must be rewritten into 4-8 concise original operational steps with no duplicated steps.
- Common list prefixes such as numbered steps or bullets are normalized away before duplicate-step checks, so numbering is not a substitute for genuinely distinct instructions.
- If the source page blocks crawling, requires a login, or has restrictive terms, mark the candidate rejected and do not ingest it.
- Licensed/generated images only. Leave `images` empty when rights are unclear.

## Preferred Extraction Sources

Use this order:

1. Recipe JSON-LD or microdata using `schema.org/Recipe`.
2. Source-visible structured recipe card data.
3. Human-reviewed extraction from page text.
4. Original Fine Dining recipe creation from verified ingredient/nutrition data.

For source pages with `recipeIngredient`, `recipeInstructions`, `prepTime`, `cookTime`, `recipeYield`, and `nutrition`, extract facts first, then normalize them into the Fine Dining schema.

## Agent Roles

Use separate agents or separate passes for these responsibilities:

- `source_scout`: finds candidate pages, checks accessibility, stores canonical URL, site name, author, and crawl permission notes.
- `recipe_extractor`: extracts factual ingredients, yield, timing, cuisine, meal type, and source nutrition if present.
- `instruction_rewriter`: writes original concise instructions from the extracted facts.
- `nutrition_enricher`: maps each ingredient to a verified nutrition source, calculates ingredient nutrition for the stated quantity, and aggregates `nutritionPerServing`.
- `grocery_linker`: creates purchase options for every ingredient and marks monetization status.
- `qa_importer`: validates schema, nutrition totals, allergens, affiliate disclosure, and duplicate source risk before upserting by `source`.

## Required Recipe Shape

Every recipe must include:

- `recipeName`: clear full-meal name, max 200 chars.
- `ingredients`: at least 6 structured ingredient rows for full meals.
- `instructions`: one string, 4-8 concise original steps separated by newlines, with no duplicated steps.
- `servings`, `servingSize`, `prepTime`, `cookTime`, `totalTime`.
- `nutritionPerServing`: all fields from `FullNutrition`.
- `mealTypes`: one or more of `BREAKFAST`, `LUNCH`, `DINNER`, `SNACK`, `DESSERT`, `SIDE`.
- `cuisine`, `dietaryTags`, `allergens`, `tags`.
- `estimatedCost` and `costPerServing`.
- `source` plus `sourceDetails`.
- Every ingredient must have `purchaseOptions`.

Ingredient rows should include:

```json
{
  "name": "Boneless skinless chicken breast",
  "quantity": 560,
  "unit": "g",
  "gramWeight": 560,
  "canonicalName": "boneless skinless chicken breast",
  "affiliateSearchTerm": "Boneless skinless chicken breast",
  "fdcId": "",
  "category": "Protein",
  "optional": false,
  "nutrition": {
    "calories": 924,
    "protein": 173.6,
    "carbohydrates": 0,
    "fat": 20.16,
    "fiber": 0,
    "sugar": 0,
    "sodium": 414,
    "cholesterol": 476,
    "saturatedFat": 0,
    "transFat": 0,
    "vitaminA": 0,
    "vitaminC": 0,
    "vitaminD": 0,
    "vitaminE": 0,
    "vitaminK": 0,
    "vitaminB6": 3.36,
    "vitaminB12": 0,
    "thiamin": 0,
    "riboflavin": 0,
    "niacin": 76.72,
    "folate": 0,
    "calcium": 0,
    "iron": 0,
    "magnesium": 0,
    "phosphorus": 1276.8,
    "potassium": 1433.6,
    "zinc": 0,
    "selenium": 154.56,
    "copper": 0,
    "manganese": 0,
    "omega3": 0,
    "omega6": 0
  },
  "purchaseOptions": [
    {
      "retailer": "Instacart",
      "productName": "Boneless skinless chicken breast",
      "url": "https://www.instacart.com/store/s?k=Boneless%20skinless%20chicken%20breast",
      "affiliateUrl": "",
      "affiliateProvider": "Instacart Developer Platform",
      "linkType": "SEARCH",
      "monetizationStatus": "PENDING_PARTNER",
      "packageSize": "1 lb",
      "estimatedPrice": 0,
      "currency": "USD",
      "unitPrice": 0.0088,
      "disclosure": "Fine Dining may earn a commission when official affiliate links are configured."
    }
  ]
}
```

## Nutrition Rules

- Use `FDC_API_KEY` with USDA FoodData Central for production enrichment.
- Store verified FoodData Central IDs in `ingredient.fdcId`.
- Convert all ingredient quantities to `gramWeight`.
- `ingredient.nutrition` is for the full ingredient amount used by the recipe.
- `nutritionPerServing` must equal the sum of ingredient nutrition divided by `servings`.
- If a source provides nutrition, cross-check it against ingredient-derived nutrition. Prefer ingredient-derived values when the source value is incomplete or implausible.
- Mark uncertain values in `sourceDetails.nutritionSource`; do not set `verified: true` until nutrition and source review pass.

## Grocery Link And Revenue Rules

Every ingredient must have at least one purchase option. Prefer two or more options when available.

- Use official partner APIs or approved affiliate network links for `affiliateUrl`.
- Do not fabricate affiliate IDs or pretend a search URL is monetized.
- If no official partner link exists, set `affiliateUrl: ""` and `monetizationStatus: "PENDING_PARTNER"`.
- Keep a normal `url` search/product/cart link so the user can still shop the ingredient.
- Put the disclosure in every monetized option and show a page-level disclosure wherever ingredient links are displayed.
- Use retailer landing/cart links when possible because basket-level conversion is better than single-product search.

Supported environment variables for the included seed importer:

```sh
MONGODB_URI=mongodb://localhost:27017/fineDiningApp
FDC_API_KEY=...
INSTACART_AFFILIATE_URL_TEMPLATE='https://partner.example/instacart?query={{encodedQuery}}&dest={{url}}'
WALMART_AFFILIATE_URL_TEMPLATE='https://partner.example/walmart?query={{encodedQuery}}&dest={{url}}'
FINE_DINING_AFFILIATE_DISCLOSURE='Fine Dining may earn a commission from qualifying grocery purchases.'
```

Template placeholders:

- `{{query}}`: raw ingredient search term.
- `{{encodedQuery}}`: URL-encoded ingredient search term.
- `{{url}}`: URL-encoded non-affiliate destination URL.

## QA Gates Before Import

Reject or hold any recipe that fails one of these checks:

- Missing source URL for fetched recipes, or missing `source`/`sourceDetails` for any recipe.
- Instructions look copied from a source page.
- Fewer than 6 ingredients for a full meal.
- Any ingredient lacks a purchase link.
- Any monetized ingredient link lacks disclosure.
- Nutrition totals do not match ingredient totals.
- Allergens are missing for dairy, eggs, fish, shellfish, soy, sesame, gluten, or nuts.
- Estimated cost is zero.
- Recipe is a duplicate of an existing `recipeName` + `source`, or reuses a `source` already present in the seed payload.

Run:

```sh
npm run recipes:validate
```

Then import or update:

```sh
npm run recipes:seed
```

Use dry-run mode when checking affiliate templates:

```sh
INSTACART_AFFILIATE_URL_TEMPLATE='https://partner.example/instacart?query={{encodedQuery}}&dest={{url}}' npm --prefix frontend run recipes:seed -- --dry-run
```

## Production Agent Prompt

Use this as the core instruction for extraction/rewrite agents:

```text
Extract only factual recipe data from the source. Do not copy headnotes, commentary,
photos, or distinctive instruction wording. Normalize ingredients into quantity,
unit, gramWeight, canonicalName, category, allergens, and purchase search terms.
Rewrite the method as original concise operational steps. Calculate ingredient
nutrition from verified ingredient matches where possible, then aggregate per
serving. Add purchaseOptions for every ingredient. Use official partner-generated
affiliateUrl values only; otherwise leave affiliateUrl empty and mark
monetizationStatus PENDING_PARTNER. Return only a JSON object matching the
Fine Dining Recipe schema.
```

## Reference Links

- USDA FoodData Central API: https://fdc.nal.usda.gov/api-spec/fdc_api.html
- USDA FoodData Central FAQ: https://fdc.nal.usda.gov/faq/
- Schema.org Recipe: https://schema.org/Recipe
- U.S. Copyright Office recipe FAQ: https://www.copyright.gov/help/faq/faq-protect.html
- FTC endorsement and affiliate disclosure guidance: https://www.ftc.gov/business-guidance/resources/ftcs-endorsement-guides-what-people-are-asking
- Instacart Developer Platform: https://company.instacart.com/business/developers
