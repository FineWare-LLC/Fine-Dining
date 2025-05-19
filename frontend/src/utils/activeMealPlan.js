export function getPlanIdFromQuery(query = {}) {
  return query.mealPlanId || query.planId || null;
}
