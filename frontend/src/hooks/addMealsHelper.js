export async function addMeals(createMeal, meals, mealPlanId, mealType = 'DINNER') {
    const addPromises = meals.map(meal =>
        createMeal({
            variables: {
                mealPlanId,
                date: new Date().toISOString(),
                mealType,
                mealName: meal.mealName,
                price: meal.price,
                nutrition: meal.nutrition,
                allergens: meal.allergens,
            },
        }),
    );
    await Promise.all(addPromises);
}

export function createAddMealsHandler(createMeal, defaultMealPlanId) {
    return async (meals, mealType = 'DINNER', mealPlanId = defaultMealPlanId) => {
        await addMeals(createMeal, meals, mealPlanId, mealType);
        return { success: true };
    };
}
