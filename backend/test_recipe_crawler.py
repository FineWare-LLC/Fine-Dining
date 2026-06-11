import asyncio
import sys
import unittest
from pathlib import Path
from unittest import mock

from fastapi import HTTPException
from pymongo.errors import DuplicateKeyError

sys.path.insert(0, str(Path(__file__).resolve().parent))

from crawler_api import crawler_start  # noqa: E402
from recipe_crawler import CrawlQueueWriteError, RecipeCrawler, RecipeStore  # noqa: E402


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


class DummyThread:
    def __init__(self, target=None, daemon=None):
        self.target = target
        self.daemon = daemon
        self.started = False

    def start(self):
        self.started = True


class RecipeCrawlerQueueFailureTests(unittest.TestCase):
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
