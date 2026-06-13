import asyncio
import unittest
from unittest import mock

from optimization_api import (
    NutritionalRequirements,
    OptimizationRequest,
    TemporalOptimizationRequest,
    create_temporal_optimization_model,
    optimize_meals,
    optimize_temporal_meals,
)


class OptimizationApiFailureTests(unittest.TestCase):
    def test_optimize_meals_returns_a_canonical_failure_message_for_dependency_errors(self):
        request = OptimizationRequest(
            requirements=NutritionalRequirements(),
            restrictions=[],
            meals_database=None,
            objective='minimize_cost',
            preferences=None,
        )

        async def run_failure(error_message):
            with mock.patch(
                'optimization_api.create_basic_optimization_model',
                side_effect=RuntimeError(error_message),
            ), mock.patch('optimization_api.logger.exception'):
                return await optimize_meals(request, user={})

        first = asyncio.run(run_failure('temporary connection failure'))
        second = asyncio.run(run_failure('different connection failure'))

        for result in (first, second):
            self.assertEqual(result.status, 'error')
            self.assertEqual(result.message, 'Optimization failed. Please try again.')
            self.assertEqual(result.objective_value, 0)
            self.assertEqual(result.meals, [])
            self.assertEqual(result.total_nutrition, {})
            self.assertFalse(result.feasible)
            self.assertGreaterEqual(result.solve_time, 0)

        self.assertEqual(first.message, second.message)

    def test_optimize_temporal_meals_returns_a_canonical_failure_message_for_dependency_errors(self):
        request = TemporalOptimizationRequest(
            requirements=NutritionalRequirements(),
            time_slots={0: 'breakfast'},
            meal_categories={'breakfast': ['Oatmeal']},
            restrictions=[],
        )

        async def run_failure(error_message):
            with mock.patch(
                'optimization_api.create_temporal_optimization_model',
                side_effect=RuntimeError(error_message),
            ), mock.patch('optimization_api.logger.exception'):
                return await optimize_temporal_meals(request, user={})

        first = asyncio.run(run_failure('temporary temporal failure'))
        second = asyncio.run(run_failure('different temporal failure'))

        for result in (first, second):
            self.assertEqual(result['status'], 'error')
            self.assertEqual(result['message'], 'Optimization failed. Please try again.')
            self.assertIn('solve_time', result)
            self.assertGreaterEqual(result['solve_time'], 0)

        self.assertEqual(first['message'], second['message'])


if __name__ == '__main__':
    unittest.main()
