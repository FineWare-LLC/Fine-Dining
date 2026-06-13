// @ts-nocheck
import assert from 'node:assert/strict';
import test, { mock } from 'node:test';
import { AuthProfileValidationError } from '../../context/authUtils';
import { updateUser } from '../../graphql/resolvers/mutations/userMutations';
import User from '../../models/User/index';

test('updateUser rejects nested medical notes before profile persistence', async () => {
    const findByIdMock = mock.method(User, 'findById', async () => {
        throw new Error('should not load the profile when nested notes are present');
    });
    const findByIdAndUpdateMock = mock.method(User, 'findByIdAndUpdate', async () => {
        throw new Error('should not persist nested notes');
    });

    try {
        await assert.rejects(
            () =>
                updateUser(
                    null,
                    {
                        id: 'user-medical-1',
                        input: {
                            dietaryProfile: {
                                diets: ['VEGAN'],
                                allergens: ['DAIRY'],
                                excludedIngredients: ['gelatin'],
                                preferredCuisines: ['Mediterranean'],
                                mealsPerDay: 3,
                                snacksPerDay: 1,
                                dailyBudget: 45,
                                maxPrepTimePerMeal: 30,
                                maxDifficulty: 'EASY',
                                adminNotes: 'Needs low-sodium meal planning.',
                            },
                        },
                    },
                    {
                        user: {
                            userId: 'user-medical-1',
                            role: 'USER',
                        },
                    },
                ),
            (error) => {
                assert.ok(error instanceof AuthProfileValidationError);
                assert.equal(error.code, 'invalidPayload');
                assert.equal(error.message, 'Please review the profile details and try again.');
                return true;
            },
        );

        assert.equal(findByIdMock.mock.callCount(), 0);
        assert.equal(findByIdAndUpdateMock.mock.callCount(), 0);
    } finally {
        findByIdMock.mock.restore();
        findByIdAndUpdateMock.mock.restore();
    }
});
