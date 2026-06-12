import asyncio
import sys
import unittest
from pathlib import Path
from unittest import mock

from fastapi import HTTPException
from pymongo.errors import DuplicateKeyError

sys.path.insert(0, str(Path(__file__).resolve().parent))

from crawler_api import crawler_start  # noqa: E402
from recipe_crawler import (  # noqa: E402
    CrawlQueueWriteError,
    RecipeCrawler,
    RecipePayloadValidationError,
    RecipeStore,
)


class FailingQueue:
    def __init__(self, failing_url):
        self.failing_url = failing_url
        self.inserted_urls = []
        self.deleted_queries = []

    def insert_one(self, doc):
        url = doc['url']
        if url == self.failing_url:
            raise RuntimeError('Mongo unavailable')
        self.inserted_urls.append(url)

    def delete_many(self, query):
        self.deleted_queries.append(query)
        doomed = set(query['url']['$in'])
        self.inserted_urls = [url for url in self.inserted_urls if url not in doomed]


class DuplicateAwareQueue:
    def __init__(self):
        self.calls = []

    def insert_one(self, doc):
        self.calls.append(doc['url'])
        raise DuplicateKeyError('duplicate key error collection: crawl_queue')


class AggregatedStatsQueue:
    def __init__(self):
        self.aggregate_calls = []
        self.count_documents_calls = []

    def aggregate(self, pipeline):
        self.aggregate_calls.append(pipeline)
        return iter(
            [
                {'_id': 'done', 'count': 50000},
                {'_id': 'pending', 'count': 1250},
                {'_id': 'failed', 'count': 7},
                {'_id': 'processing', 'count': 12},
                {'_id': 'archived', 'count': 99},
            ],
        )

    def count_documents(self, query):
        self.count_documents_calls.append(query)
        raise AssertionError('RecipeStore.stats should aggregate queue counts in one pass')


VALID_SOURCE_DETAILS = {
    'siteName': 'Example Recipe Blog',
    'authorName': 'Jane Reviewer',
    'extractionMethod': 'json_ld',
    'copyrightReviewStatus': 'FACTS_ONLY_PARAPHRASE',
    'transformationNotes': 'Rewritten from structured recipe card facts.',
    'nutritionSource': 'USDA FoodData Central',
    'pricingSource': 'retailer search',
}

VALID_INSTRUCTIONS = '\n'.join([
    'Warm the skillet over medium heat.',
    'Cook the rice until heated through.',
    'Fold in the vegetables and protein.',
    'Season lightly and serve while hot.',
])


class DummyThread:
    def __init__(self, target=None, daemon=None):
        self.target = target
        self.daemon = daemon
        self.started = False

    def start(self):
        self.started = True


class RecipeCrawlerQueueFailureTests(unittest.TestCase):
    def test_save_recipe_accepts_valid_payload_and_builds_recipe_document(self):
        store = RecipeStore.__new__(RecipeStore)
        store.recipes = mock.Mock()
        store.recipes.insert_one.return_value = object()

        payload = {
            'recipeName': 'Valid Bowl',
            'ingredients': [
                {
                    'name': 'Rice',
                    'quantity': 2,
                    'unit': 'cup',
                },
            ],
            'instructions': VALID_INSTRUCTIONS,
            'servings': 2,
            'prepTime': 10,
            'sourceDetails': VALID_SOURCE_DETAILS,
        }

        inserted = RecipeStore.save_recipe(
            store,
            payload,
            'https://example.test/valid-bowl',
        )

        self.assertTrue(inserted)
        store.recipes.insert_one.assert_called_once()
        doc = store.recipes.insert_one.call_args.args[0]
        self.assertEqual(doc['recipeName'], 'Valid Bowl')
        self.assertEqual(doc['source'], 'https://example.test/valid-bowl')
        self.assertEqual(doc['sourceDetails']['siteName'], 'Example Recipe Blog')
        self.assertEqual(doc['sourceDetails']['originalUrl'], 'https://example.test/valid-bowl')
        self.assertEqual(doc['sourceDetails']['canonicalUrl'], 'https://example.test/valid-bowl')
        self.assertEqual(doc['sourceDetails']['copyrightReviewStatus'], 'FACTS_ONLY_PARAPHRASE')
        self.assertEqual(doc['totalTime'], 10)
        self.assertEqual(doc['ingredients'][0]['name'], 'Rice')
        self.assertEqual(doc['ingredients'][0]['quantity'], 2)

    def test_save_recipe_accepts_original_source_provenance_for_seeded_recipes(self):
        store = RecipeStore.__new__(RecipeStore)
        store.recipes = mock.Mock()
        store.recipes.insert_one.return_value = object()

        payload = {
            'recipeName': 'Original Bowl',
            'ingredients': [
                {
                    'name': 'Rice',
                    'quantity': 2,
                    'unit': 'cup',
                },
            ],
            'instructions': VALID_INSTRUCTIONS,
            'servings': 2,
            'prepTime': 10,
            'sourceDetails': {
                **VALID_SOURCE_DETAILS,
                'copyrightReviewStatus': 'ORIGINAL',
                'transformationNotes': 'Original recipe concept generated from verified ingredient data.',
            },
        }

        inserted = RecipeStore.save_recipe(
            store,
            payload,
            'https://example.test/original-bowl',
        )

        self.assertTrue(inserted)
        store.recipes.insert_one.assert_called_once()
        doc = store.recipes.insert_one.call_args.args[0]
        self.assertEqual(doc['sourceDetails']['copyrightReviewStatus'], 'ORIGINAL')
        self.assertEqual(doc['sourceDetails']['originalUrl'], 'https://example.test/original-bowl')
        self.assertEqual(doc['sourceDetails']['canonicalUrl'], 'https://example.test/original-bowl')

    def test_save_recipe_backfills_blank_source_provenance_urls_from_source_url(self):
        store = RecipeStore.__new__(RecipeStore)
        store.recipes = mock.Mock()

        payload = {
            'recipeName': 'Canonical Bowl',
            'ingredients': [
                {
                    'name': 'Rice',
                    'quantity': 2,
                    'unit': 'cup',
                },
            ],
            'instructions': VALID_INSTRUCTIONS,
            'servings': 2,
            'prepTime': 10,
            'sourceDetails': {
                **VALID_SOURCE_DETAILS,
                'originalUrl': '   ',
                'canonicalUrl': None,
            },
        }

        inserted = RecipeStore.save_recipe(
            store,
            payload,
            'https://example.test/canonical-bowl',
        )

        self.assertTrue(inserted)
        doc = store.recipes.insert_one.call_args.args[0]
        self.assertEqual(doc['sourceDetails']['originalUrl'], 'https://example.test/canonical-bowl')
        self.assertEqual(doc['sourceDetails']['canonicalUrl'], 'https://example.test/canonical-bowl')

    def test_save_recipe_treats_duplicate_recipe_inserts_as_idempotent(self):
        store = RecipeStore.__new__(RecipeStore)
        store.recipes = mock.Mock()
        store.recipes.insert_one.side_effect = DuplicateKeyError(
            'duplicate key error collection: recipes',
        )

        inserted = RecipeStore.save_recipe(
            store,
                {
                    'recipeName': 'Valid Bowl',
                    'ingredients': [
                        {
                            'name': 'Rice',
                            'quantity': 2,
                            'unit': 'cup',
                        },
                    ],
                    'instructions': VALID_INSTRUCTIONS,
                    'servings': 2,
                    'prepTime': 10,
                    'sourceDetails': VALID_SOURCE_DETAILS,
                },
                'https://example.test/valid-bowl',
            )

        self.assertFalse(inserted)
        store.recipes.insert_one.assert_called_once()

    def test_save_recipe_rejects_payload_missing_source_provenance_fields(self):
        store = RecipeStore.__new__(RecipeStore)
        store.recipes = mock.Mock()

        with self.assertRaises(RecipePayloadValidationError) as exc_info:
            RecipeStore.save_recipe(
                store,
                {
                    'recipeName': 'Provenance Bowl',
                    'ingredients': [
                        {
                            'name': 'Rice',
                            'quantity': 2,
                            'unit': 'cup',
                        },
                    ],
                    'instructions': VALID_INSTRUCTIONS,
                    'servings': 2,
                    'prepTime': 10,
                    'sourceDetails': {
                        key: value
                        for key, value in VALID_SOURCE_DETAILS.items()
                        if key != 'siteName'
                    },
                },
                'https://example.test/provenance-bowl',
            )

        self.assertEqual(
            str(exc_info.exception),
            'Invalid recipe payload: sourceDetails.siteName.',
        )
        store.recipes.insert_one.assert_not_called()

    def test_save_recipe_rejects_unknown_copyright_review_status(self):
        store = RecipeStore.__new__(RecipeStore)
        store.recipes = mock.Mock()

        with self.assertRaises(RecipePayloadValidationError) as exc_info:
            RecipeStore.save_recipe(
                store,
                {
                    'recipeName': 'Invalid Bowl',
                    'ingredients': [
                        {
                            'name': 'Rice',
                            'quantity': 2,
                            'unit': 'cup',
                        },
                    ],
                    'instructions': VALID_INSTRUCTIONS,
                    'servings': 2,
                    'prepTime': 10,
                    'sourceDetails': {
                        **VALID_SOURCE_DETAILS,
                        'copyrightReviewStatus': 'IMPROVISED',
                    },
                },
                'https://example.test/invalid-bowl',
            )

        self.assertEqual(
            str(exc_info.exception),
            'Invalid recipe payload: sourceDetails.copyrightReviewStatus.',
        )
        store.recipes.insert_one.assert_not_called()

    def test_save_recipe_rejects_thin_instruction_paraphrases_with_user_safe_error(self):
        store = RecipeStore.__new__(RecipeStore)
        store.recipes = mock.Mock()

        with self.assertRaises(RecipePayloadValidationError) as exc_info:
            RecipeStore.save_recipe(
                store,
                {
                    'recipeName': 'Thin Bowl',
                    'ingredients': [
                        {
                            'name': 'Rice',
                            'quantity': 2,
                            'unit': 'cup',
                        },
                    ],
                    'instructions': 'Cook and serve.',
                    'servings': 2,
                    'prepTime': 10,
                    'sourceDetails': VALID_SOURCE_DETAILS,
                },
                'https://example.test/thin-bowl',
            )

        self.assertEqual(
            str(exc_info.exception),
            'Invalid recipe payload: instructions.paraphraseQuality.',
        )
        store.recipes.insert_one.assert_not_called()

    def test_save_recipe_rejects_incomplete_payload_with_typed_error(self):
        store = RecipeStore.__new__(RecipeStore)
        store.recipes = mock.Mock()

        with self.assertRaises(RecipePayloadValidationError) as exc_info:
            RecipeStore.save_recipe(
                store,
                {
                    'recipeName': 'Broken Bowl',
                    'ingredients': [],
                    'instructions': VALID_INSTRUCTIONS,
                    'servings': 2,
                    'sourceDetails': VALID_SOURCE_DETAILS,
                },
                'https://example.test/broken-bowl',
            )

        self.assertEqual(
            str(exc_info.exception),
            'Invalid recipe payload: ingredients, prepTime.',
        )
        store.recipes.insert_one.assert_not_called()

    def test_enqueue_urls_rolls_back_partial_writes_on_dependency_failure(self):
        queue = FailingQueue('https://example.test/fail')
        store = RecipeStore.__new__(RecipeStore)
        store.crawl_queue = queue

        with self.assertRaises(CrawlQueueWriteError):
            RecipeStore.enqueue_urls(
                store,
                ['https://example.test/one', 'https://example.test/fail'],
            )

        self.assertEqual(queue.inserted_urls, [])
        self.assertEqual(
            queue.deleted_queries,
            [{'url': {'$in': ['https://example.test/one']}}],
        )

    def test_enqueue_urls_ignores_duplicate_key_errors(self):
        queue = DuplicateAwareQueue()
        store = RecipeStore.__new__(RecipeStore)
        store.crawl_queue = queue

        added = RecipeStore.enqueue_urls(store, ['https://example.test/dup'])

        self.assertEqual(added, 0)
        self.assertEqual(queue.calls, ['https://example.test/dup'])

    def test_stats_aggregates_queue_counts_in_one_pass_for_a_large_queue(self):
        store = RecipeStore.__new__(RecipeStore)
        store.recipes = mock.Mock()
        store.recipes.count_documents.return_value = 9801
        queue = AggregatedStatsQueue()
        store.crawl_queue = queue

        stats = RecipeStore.stats(store)

        self.assertEqual(
            stats,
            {
                'total_recipes': 9801,
                'queue_pending': 1250,
                'queue_processing': 12,
                'queue_done': 50000,
                'queue_failed': 7,
            },
        )
        self.assertEqual(queue.aggregate_calls, [[{'$group': {'_id': '$status', 'count': {'$sum': 1}}}]])
        self.assertEqual(queue.count_documents_calls, [])

    def test_crawler_start_returns_user_safe_error_when_queue_is_unavailable(self):
        fake_crawler = mock.Mock()
        fake_crawler._running = False
        fake_crawler.start.side_effect = CrawlQueueWriteError(
            'Unable to update crawl queue right now.',
        )
        fake_crawler.status.return_value = {
            'running': False,
            'current_url': '',
            'pages_crawled': 0,
            'recipes_found': 0,
            'searches_done': 0,
            'errors': 0,
            'started_at': None,
            'llm_available': False,
            'llm_model': 'gemma4:e4b',
            'total_recipes': 0,
            'queue_pending': 0,
            'queue_processing': 0,
            'queue_done': 0,
            'queue_failed': 0,
        }

        with mock.patch('crawler_api.get_crawler', return_value=fake_crawler):
            with self.assertRaises(HTTPException) as exc_info:
                asyncio.run(crawler_start(_admin=object()))

        self.assertEqual(exc_info.exception.status_code, 503)
        self.assertEqual(
            exc_info.exception.detail,
            'Crawl queue is temporarily unavailable. Please try again.',
        )
        fake_crawler.start.assert_called_once()

    def test_start_resets_runtime_counters_for_a_fresh_run(self):
        crawler = RecipeCrawler.__new__(RecipeCrawler)
        crawler.store = mock.Mock()
        crawler.store.crawl_queue = mock.Mock()
        crawler.store.enqueue_urls.return_value = 1
        crawler.store.stats.return_value = {
            'total_recipes': 0,
            'queue_pending': 1,
            'queue_processing': 0,
            'queue_done': 0,
            'queue_failed': 0,
        }
        crawler.llm = mock.Mock()
        crawler.llm.is_available.return_value = False
        crawler.llm.model = 'gemma4:e4b'
        crawler.fetcher = mock.Mock()
        crawler.search = mock.Mock()
        crawler._running = False
        crawler._thread = None
        crawler._stop_event = mock.Mock()
        crawler._current_url = 'https://example.test/stale'
        crawler._recipes_found = 9
        crawler._pages_crawled = 12
        crawler._searches_done = 3
        crawler._errors = 2
        crawler._started_at = None

        dummy_thread = DummyThread()
        with mock.patch('recipe_crawler.threading.Thread', return_value=dummy_thread):
            RecipeCrawler.start(crawler, ['https://example.test/one'])

        status = crawler.status()

        self.assertEqual(crawler._current_url, '')
        self.assertEqual(crawler._recipes_found, 0)
        self.assertEqual(crawler._pages_crawled, 0)
        self.assertEqual(crawler._searches_done, 0)
        self.assertEqual(crawler._errors, 0)
        self.assertTrue(crawler._running)
        self.assertIsNotNone(crawler._started_at)
        self.assertTrue(dummy_thread.started)
        self.assertEqual(status['current_url'], '')
        self.assertEqual(status['pages_crawled'], 0)
        self.assertEqual(status['recipes_found'], 0)
        self.assertEqual(status['searches_done'], 0)
        self.assertEqual(status['errors'], 0)
        self.assertEqual(status['queue_pending'], 1)
        crawler.store.crawl_queue.update_many.assert_called_once_with(
            {'status': 'processing'},
            {'$set': {'status': 'pending'}},
        )
        crawler.store.enqueue_urls.assert_called_once_with(['https://example.test/one'])
        crawler._stop_event.clear.assert_called_once()


if __name__ == '__main__':
    unittest.main()
