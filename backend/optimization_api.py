"""
HiGHS Optimization API for Fine Dining Application

This module provides REST API endpoints for meal optimization using the HiGHS solver.
It integrates with the existing highs_model.py to provide real-time optimization
capabilities for the web-based playground and meal planning components.

Features:
- Cost minimization optimization
- Multi-objective optimization (cost + preferences)
- Temporal meal planning (24-hour optimization)
- Constraint validation and feasibility checking
- Real-time optimization progress tracking
"""

import os
import logging
import sys
from datetime import datetime
from typing import Dict, List, Optional

from fastapi import Depends, FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import uvicorn

try:
    from .auth import get_current_user
    from .config import get_settings
except ImportError:
    from auth import get_current_user
    from config import get_settings

logger = logging.getLogger(__name__)
settings = get_settings()

# Add the bindings path to import the HiGHS model
sys.path.append(os.path.join(os.path.dirname(__file__), '..', 'bindings', 'python'))

try:
    from highs_model import HighsModel
    HIGHS_AVAILABLE = True
except ImportError:
    logger.warning("HiGHS model not available. Optimization endpoints will fail shut.")
    HIGHS_AVAILABLE = False

app = FastAPI(title="HiGHS Optimization API", version="1.0.0")

# Enable CORS for frontend integration
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.allowed_origins,
    allow_credentials=True,
    allow_methods=["GET", "POST", "OPTIONS"],
    allow_headers=["Content-Type", "Authorization"],
)

# Default meal database - can be extended with real data from the database
DEFAULT_MEALS_DATABASE = {
    'Oatmeal': {'calories': 300, 'protein': 10, 'carbs': 54, 'fat': 6, 'fiber': 8, 'cost': 2.50},
    'Greek Yogurt': {'calories': 150, 'protein': 15, 'carbs': 8, 'fat': 0, 'fiber': 0, 'cost': 3.00},
    'Chicken Salad': {'calories': 400, 'protein': 35, 'carbs': 20, 'fat': 18, 'fiber': 6, 'cost': 8.50},
    'Salmon Fillet': {'calories': 350, 'protein': 40, 'carbs': 0, 'fat': 20, 'fiber': 0, 'cost': 12.00},
    'Quinoa Bowl': {'calories': 320, 'protein': 12, 'carbs': 58, 'fat': 5, 'fiber': 10, 'cost': 6.00},
    'Banana': {'calories': 100, 'protein': 1, 'carbs': 27, 'fat': 0, 'fiber': 3, 'cost': 0.50},
    'Almonds (1oz)': {'calories': 160, 'protein': 6, 'carbs': 6, 'fat': 14, 'fiber': 3, 'cost': 1.00},
    'Spinach Smoothie': {'calories': 180, 'protein': 8, 'carbs': 25, 'fat': 2, 'fiber': 5, 'cost': 4.00},
}

# Pydantic models for API requests/responses
class NutritionalRequirements(BaseModel):
    min_calories: int = 1800
    max_calories: int = 2200
    min_protein: int = 50
    min_fiber: int = 25
    max_fat: int = 78

class OptimizationRequest(BaseModel):
    requirements: NutritionalRequirements
    restrictions: List[str] = []
    meals_database: Optional[Dict[str, Dict[str, float]]] = None
    objective: str = "minimize_cost"  # "minimize_cost", "maximize_preference", "multi_objective"
    preferences: Optional[Dict[str, float]] = None

class MealSolution(BaseModel):
    meal: str
    servings: float
    cost: float
    calories: float
    protein: float

class OptimizationResult(BaseModel):
    status: str
    objective_value: float
    meals: List[MealSolution]
    total_nutrition: Dict[str, float]
    feasible: bool
    solve_time: float
    message: Optional[str] = None

class TemporalOptimizationRequest(BaseModel):
    requirements: NutritionalRequirements
    time_slots: Dict[int, str]  # hour -> meal_type mapping
    meal_categories: Dict[str, List[str]]  # meal_type -> available_meals
    restrictions: List[str] = []


# ---------------------------------------------------------------------------
# Cookbook-based LP models (new)
# ---------------------------------------------------------------------------

class CookbookRecipe(BaseModel):
    name: str
    calories: float = 0
    protein: float = 0
    carbs: float = 0
    fat: float = 0
    fiber: float = 0
    sodium: float = 0
    cost: float = 0
    servings: float = 1
    mealTypes: List[str] = []

class CookbookRequirements(BaseModel):
    min_calories: float = 1800
    max_calories: float = 2500
    min_protein: float = 50
    max_protein: Optional[float] = None
    min_carbs: float = 0
    max_carbs: Optional[float] = None
    min_fat: float = 0
    max_fat: float = 78
    min_fiber: float = 25
    max_sodium: Optional[float] = None
    daily_budget: Optional[float] = None

class FrequencyConstraint(BaseModel):
    min: int = 0
    max: Optional[int] = None

class CookbookOptimizationRequest(BaseModel):
    recipes: Dict[str, CookbookRecipe]
    preferences: Dict[str, float] = {}
    frequency_constraints: Dict[str, FrequencyConstraint] = {}
    requirements: CookbookRequirements = CookbookRequirements()
    days: int = 7
    meals_per_day: int = 3
    headcount: int = 1
    objective: str = "minimize_cost"  # "minimize_cost", "maximize_preference", "balanced"


# Global variable to track optimization progress (in production, use Redis or similar)
optimization_progress = {}
OPTIMIZATION_FAILURE_MESSAGE = "Optimization failed. Please try again."

def create_basic_optimization_model(
    requirements: NutritionalRequirements,
    restrictions: List[str],
    meals_database: Dict[str, Dict[str, float]],
    preferences: Optional[Dict[str, float]] = None,
    objective: str = "minimize_cost"
) -> tuple:
    """Create a HiGHS optimization model for meal planning."""
    
    if not HIGHS_AVAILABLE:
        raise HTTPException(status_code=500, detail="HiGHS solver not available")
    
    model = HighsModel()
    available_meals = {k: v for k, v in meals_database.items() if k not in restrictions}
    
    if not available_meals:
        raise HTTPException(status_code=400, detail="No meals available after applying restrictions")
    
    meal_names = list(available_meals.keys())
    meal_vars = {}
    
    # Create decision variables
    for meal in meal_names:
        if objective == "minimize_cost":
            cost = available_meals[meal]['cost']
        elif objective == "maximize_preference" and preferences:
            cost = -preferences.get(meal, 0)  # Negative for maximization
        elif objective == "multi_objective" and preferences:
            # Weighted combination: cost + penalty for low preference
            cost_weight = 1.0
            pref_weight = 0.5
            cost = (cost_weight * available_meals[meal]['cost'] - 
                   pref_weight * preferences.get(meal, 5))  # Default preference = 5
        else:
            cost = available_meals[meal]['cost']
            
        # Each meal can be consumed 0-3 times per day
        var_idx = model.add_variable(lower=0, upper=3, cost=cost, name=meal)
        meal_vars[meal] = var_idx
    
    # Add nutritional constraints
    
    # Calorie constraints
    calorie_coeffs = {meal_vars[meal]: available_meals[meal]['calories'] for meal in meal_names}
    model.add_constraint(calorie_coeffs, lower=requirements.min_calories, name='min_calories')
    model.add_constraint(calorie_coeffs, upper=requirements.max_calories, name='max_calories')
    
    # Protein constraint
    protein_coeffs = {meal_vars[meal]: available_meals[meal]['protein'] for meal in meal_names}
    model.add_constraint(protein_coeffs, lower=requirements.min_protein, name='min_protein')
    
    # Fiber constraint
    fiber_coeffs = {meal_vars[meal]: available_meals[meal]['fiber'] for meal in meal_names}
    model.add_constraint(fiber_coeffs, lower=requirements.min_fiber, name='min_fiber')
    
    # Fat constraint
    fat_coeffs = {meal_vars[meal]: available_meals[meal]['fat'] for meal in meal_names}
    model.add_constraint(fat_coeffs, upper=requirements.max_fat, name='max_fat')
    
    return model, meal_vars, available_meals

def create_temporal_optimization_model(
    requirements: NutritionalRequirements,
    time_slots: Dict[int, str],
    meal_categories: Dict[str, List[str]],
    restrictions: List[str]
) -> tuple:
    """Create a 24-hour temporal meal optimization model."""
    
    if not HIGHS_AVAILABLE:
        raise HTTPException(status_code=500, detail="HiGHS solver not available")
    
    model = HighsModel()
    meal_schedule_vars = {}  # (hour, meal) -> variable_index
    
    # Create variables for each time slot and available meal
    for hour, meal_type in time_slots.items():
        if meal_type not in meal_categories:
            continue
            
        available_meals = [meal for meal in meal_categories[meal_type] 
                          if meal not in restrictions and meal in DEFAULT_MEALS_DATABASE]
        
        for meal in available_meals:
            var_idx = model.add_variable(
                lower=0, upper=1,  # At most 1 serving per time slot
                cost=DEFAULT_MEALS_DATABASE[meal]['cost'],
                name=f"{meal}_at_{hour}"
            )
            meal_schedule_vars[(hour, meal)] = var_idx
    
    # Constraint: exactly one meal per time slot
    for hour in time_slots.keys():
        hour_coeffs = {}
        meal_type = time_slots[hour]
        if meal_type in meal_categories:
            for meal in meal_categories[meal_type]:
                if (hour, meal) in meal_schedule_vars:
                    hour_coeffs[meal_schedule_vars[(hour, meal)]] = 1
        
        if hour_coeffs:  # Only add constraint if there are available meals
            model.add_constraint(hour_coeffs, lower=1, upper=1, name=f"meal_at_{hour}")
    
    # Daily nutritional constraints (sum across all time slots)
    daily_calorie_coeffs = {}
    daily_protein_coeffs = {}
    daily_fiber_coeffs = {}
    daily_fat_coeffs = {}
    
    for (hour, meal), var_idx in meal_schedule_vars.items():
        daily_calorie_coeffs[var_idx] = DEFAULT_MEALS_DATABASE[meal]['calories']
        daily_protein_coeffs[var_idx] = DEFAULT_MEALS_DATABASE[meal]['protein']
        daily_fiber_coeffs[var_idx] = DEFAULT_MEALS_DATABASE[meal]['fiber']
        daily_fat_coeffs[var_idx] = DEFAULT_MEALS_DATABASE[meal]['fat']
    
    if daily_calorie_coeffs:  # Only add constraints if there are variables
        model.add_constraint(daily_calorie_coeffs, lower=requirements.min_calories)
        model.add_constraint(daily_calorie_coeffs, upper=requirements.max_calories)
        model.add_constraint(daily_protein_coeffs, lower=requirements.min_protein)
        model.add_constraint(daily_fiber_coeffs, lower=requirements.min_fiber)
        model.add_constraint(daily_fat_coeffs, upper=requirements.max_fat)
    
    return model, meal_schedule_vars

@app.post("/optimize/basic", response_model=OptimizationResult)
async def optimize_meals(request: OptimizationRequest, user: dict = Depends(get_current_user)):
    """
    Perform basic meal optimization.
    
    This endpoint optimizes meal selection based on nutritional requirements
    and cost/preference objectives.
    """
    start_time = datetime.now()
    
    try:
        # Use provided meals database or default
        meals_database = request.meals_database or DEFAULT_MEALS_DATABASE
        
        # Create and solve the optimization model
        model, meal_vars, available_meals = create_basic_optimization_model(
            request.requirements,
            request.restrictions,
            meals_database,
            request.preferences,
            request.objective
        )
        
        # Solve the model
        solution = model.solve()
        solve_time = (datetime.now() - start_time).total_seconds()
        
        # Process results
        meals_result = []
        total_nutrition = {'calories': 0, 'protein': 0, 'fat': 0, 'fiber': 0, 'cost': 0}
        
        for meal, var_idx in meal_vars.items():
            servings = solution.col_value[var_idx]
            if servings > 0.01:  # Only include meals that are actually selected
                meal_cost = servings * available_meals[meal]['cost']
                meal_calories = servings * available_meals[meal]['calories']
                meal_protein = servings * available_meals[meal]['protein']
                
                meals_result.append(MealSolution(
                    meal=meal,
                    servings=round(servings, 3),
                    cost=round(meal_cost, 2),
                    calories=round(meal_calories, 1),
                    protein=round(meal_protein, 1)
                ))
                
                # Update totals
                total_nutrition['calories'] += meal_calories
                total_nutrition['protein'] += servings * available_meals[meal]['protein']
                total_nutrition['fat'] += servings * available_meals[meal]['fat']
                total_nutrition['fiber'] += servings * available_meals[meal]['fiber']
                total_nutrition['cost'] += meal_cost
        
        # Check feasibility
        feasible = (
            total_nutrition['calories'] >= request.requirements.min_calories and
            total_nutrition['calories'] <= request.requirements.max_calories and
            total_nutrition['protein'] >= request.requirements.min_protein and
            total_nutrition['fiber'] >= request.requirements.min_fiber and
            total_nutrition['fat'] <= request.requirements.max_fat
        )
        
        return OptimizationResult(
            status="optimal",
            objective_value=round(solution.objective_value, 2),
            meals=meals_result,
            total_nutrition={k: round(v, 2) for k, v in total_nutrition.items()},
            feasible=feasible,
            solve_time=solve_time,
            message="Optimization completed successfully"
        )
        
    except Exception as e:
        logger.exception("Basic optimization failed")
        return OptimizationResult(
            status="error",
            objective_value=0,
            meals=[],
            total_nutrition={},
            feasible=False,
            solve_time=(datetime.now() - start_time).total_seconds(),
            message=OPTIMIZATION_FAILURE_MESSAGE,
        )

@app.post("/optimize/temporal")
async def optimize_temporal_meals(request: TemporalOptimizationRequest, user: dict = Depends(get_current_user)):
    """
    Perform temporal meal optimization across 24 hours.
    
    This endpoint optimizes meal selection for specific time slots
    while meeting daily nutritional requirements.
    """
    start_time = datetime.now()
    
    try:
        model, meal_schedule_vars = create_temporal_optimization_model(
            request.requirements,
            request.time_slots,
            request.meal_categories,
            request.restrictions
        )
        
        solution = model.solve()
        solve_time = (datetime.now() - start_time).total_seconds()
        
        # Process temporal results
        schedule = {}
        total_nutrition = {'calories': 0, 'protein': 0, 'fat': 0, 'fiber': 0, 'cost': 0}
        
        for (hour, meal), var_idx in meal_schedule_vars.items():
            servings = solution.col_value[var_idx]
            if servings > 0.5:  # Meal is selected for this hour
                if hour not in schedule:
                    schedule[hour] = []
                
                meal_data = DEFAULT_MEALS_DATABASE[meal]
                schedule[hour].append({
                    'meal': meal,
                    'servings': round(servings, 3),
                    'cost': round(servings * meal_data['cost'], 2),
                    'calories': round(servings * meal_data['calories'], 1),
                    'protein': round(servings * meal_data['protein'], 1)
                })
                
                # Update totals
                total_nutrition['calories'] += servings * meal_data['calories']
                total_nutrition['protein'] += servings * meal_data['protein']
                total_nutrition['fat'] += servings * meal_data['fat']
                total_nutrition['fiber'] += servings * meal_data['fiber']
                total_nutrition['cost'] += servings * meal_data['cost']
        
        return {
            "status": "optimal",
            "objective_value": round(solution.objective_value, 2),
            "schedule": schedule,
            "total_nutrition": {k: round(v, 2) for k, v in total_nutrition.items()},
            "solve_time": solve_time
        }
        
    except Exception as e:
        logger.exception("Temporal optimization failed")
        return {
            "status": "error",
            "message": OPTIMIZATION_FAILURE_MESSAGE,
            "solve_time": (datetime.now() - start_time).total_seconds()
        }

@app.post("/optimize/cookbook")
async def optimize_cookbook(request: CookbookOptimizationRequest, user: dict = Depends(get_current_user)):
    """
    Cookbook-based multi-day meal plan optimization.

    Builds an LP model where:
      - Decision variables: x[recipe_id, day, meal_slot] = servings assigned
      - Objective: minimize cost, maximize preference, or balanced
      - Constraints:
        * Daily nutrition bounds (calories, protein, carbs, fat, fiber, sodium)
        * Exactly one recipe per meal slot per day
        * Per-recipe weekly frequency bounds (min/max times per week)
        * Optional daily budget constraint
    """
    start_time = datetime.now()

    try:
        recipes = request.recipes
        if not recipes:
            raise HTTPException(status_code=400, detail="No recipes provided")

        days = max(1, request.days)
        meals_per_day = max(1, request.meals_per_day)
        reqs = request.requirements

        # Define meal slot types for each slot index within a day
        slot_types = []
        default_slots = ['BREAKFAST', 'LUNCH', 'DINNER', 'SNACK', 'DESSERT', 'SIDE']
        for i in range(meals_per_day):
            if i < len(default_slots):
                slot_types.append(default_slots[i])
            else:
                slot_types.append('SNACK')

        if not HIGHS_AVAILABLE:
            raise HTTPException(status_code=500, detail="HiGHS solver not available")

        model = HighsModel()
        recipe_ids = list(recipes.keys())

        # Decision variables: x[recipe_id][day][slot] = servings
        vars_map = {}  # (recipe_id, day, slot) -> var_index
        total_variables = 0

        for rid in recipe_ids:
            r = recipes[rid]
            for d in range(1, days + 1):
                for s in range(meals_per_day):
                    slot_type = slot_types[s]

                    # If recipe has mealType restrictions, skip incompatible slots
                    if r.mealTypes and slot_type not in r.mealTypes:
                        continue

                    # Objective coefficient
                    if request.objective == "minimize_cost":
                        obj_coeff = r.cost * r.servings
                    elif request.objective == "maximize_preference":
                        pref = request.preferences.get(rid, 5)
                        obj_coeff = -pref  # negate for maximization
                    else:  # balanced
                        pref = request.preferences.get(rid, 5)
                        obj_coeff = r.cost * r.servings - 0.5 * pref

                    # Binary: 0 or 1 (recipe is selected for this slot or not)
                    var_idx = model.add_variable(
                        lower=0, upper=1,
                        cost=obj_coeff,
                        name=f"{rid}_d{d}_s{s}"
                    )
                    vars_map[(rid, d, s)] = var_idx
                    total_variables += 1

        if total_variables == 0:
            raise HTTPException(status_code=400, detail="No valid recipe-slot assignments possible")

        total_constraints = 0

        # Constraint: exactly one recipe per slot per day
        for d in range(1, days + 1):
            for s in range(meals_per_day):
                slot_coeffs = {}
                for rid in recipe_ids:
                    key = (rid, d, s)
                    if key in vars_map:
                        slot_coeffs[vars_map[key]] = 1
                if slot_coeffs:
                    model.add_constraint(slot_coeffs, lower=1, upper=1,
                                         name=f"one_recipe_d{d}_s{s}")
                    total_constraints += 1

        # Daily nutrition constraints
        for d in range(1, days + 1):
            day_cal = {}
            day_prot = {}
            day_carb = {}
            day_fat = {}
            day_fiber = {}
            day_sodium = {}
            day_cost = {}

            for rid in recipe_ids:
                r = recipes[rid]
                for s in range(meals_per_day):
                    key = (rid, d, s)
                    if key not in vars_map:
                        continue
                    vi = vars_map[key]
                    sv = r.servings  # serving multiplier
                    day_cal[vi] = r.calories * sv
                    day_prot[vi] = r.protein * sv
                    day_carb[vi] = r.carbs * sv
                    day_fat[vi] = r.fat * sv
                    day_fiber[vi] = r.fiber * sv
                    day_sodium[vi] = r.sodium * sv
                    day_cost[vi] = r.cost * sv

            if day_cal:
                model.add_constraint(day_cal, lower=reqs.min_calories, name=f"min_cal_d{d}")
                model.add_constraint(day_cal, upper=reqs.max_calories, name=f"max_cal_d{d}")
                total_constraints += 2

                model.add_constraint(day_prot, lower=reqs.min_protein, name=f"min_prot_d{d}")
                total_constraints += 1
                if reqs.max_protein is not None:
                    model.add_constraint(day_prot, upper=reqs.max_protein, name=f"max_prot_d{d}")
                    total_constraints += 1

                if reqs.min_carbs > 0:
                    model.add_constraint(day_carb, lower=reqs.min_carbs, name=f"min_carb_d{d}")
                    total_constraints += 1
                if reqs.max_carbs is not None:
                    model.add_constraint(day_carb, upper=reqs.max_carbs, name=f"max_carb_d{d}")
                    total_constraints += 1

                model.add_constraint(day_fat, upper=reqs.max_fat, name=f"max_fat_d{d}")
                total_constraints += 1

                model.add_constraint(day_fiber, lower=reqs.min_fiber, name=f"min_fiber_d{d}")
                total_constraints += 1

                if reqs.max_sodium is not None:
                    model.add_constraint(day_sodium, upper=reqs.max_sodium, name=f"max_sodium_d{d}")
                    total_constraints += 1

                if reqs.daily_budget is not None:
                    model.add_constraint(day_cost, upper=reqs.daily_budget, name=f"budget_d{d}")
                    total_constraints += 1

        # Weekly frequency constraints per recipe
        for rid, fc in request.frequency_constraints.items():
            week_coeffs = {}
            for d in range(1, days + 1):
                for s in range(meals_per_day):
                    key = (rid, d, s)
                    if key in vars_map:
                        week_coeffs[vars_map[key]] = 1
            if week_coeffs:
                # Scale by weeks in plan
                weeks = max(1, days / 7)
                if fc.min > 0:
                    model.add_constraint(week_coeffs, lower=fc.min * weeks,
                                         name=f"min_freq_{rid}")
                    total_constraints += 1
                if fc.max is not None:
                    model.add_constraint(week_coeffs, upper=fc.max * weeks,
                                         name=f"max_freq_{rid}")
                    total_constraints += 1

        # Solve
        solution = model.solve()
        solve_time = (datetime.now() - start_time).total_seconds()

        # Build schedule from solution
        schedule = []
        total_nutrition = {'calories': 0, 'protein': 0, 'carbs': 0, 'fat': 0, 'fiber': 0, 'sodium': 0}
        total_cost = 0

        for (rid, d, s), vi in vars_map.items():
            val = solution.col_value[vi]
            if val > 0.5:  # binary threshold
                r = recipes[rid]
                sv = r.servings
                cal = r.calories * sv
                prot = r.protein * sv
                carbs = r.carbs * sv
                fat = r.fat * sv
                fib = r.fiber * sv
                sod = r.sodium * sv
                cst = r.cost * sv

                schedule.append({
                    'recipe_id': rid,
                    'recipe_name': r.name,
                    'day': d,
                    'slot': s,
                    'meal_type': slot_types[s] if s < len(slot_types) else 'SNACK',
                    'servings': round(sv, 3),
                    'calories': round(cal, 1),
                    'protein': round(prot, 1),
                    'carbs': round(carbs, 1),
                    'fat': round(fat, 1),
                    'fiber': round(fib, 1),
                    'sodium': round(sod, 1),
                    'cost': round(cst, 2),
                })

                total_nutrition['calories'] += cal
                total_nutrition['protein'] += prot
                total_nutrition['carbs'] += carbs
                total_nutrition['fat'] += fat
                total_nutrition['fiber'] += fib
                total_nutrition['sodium'] += sod
                total_cost += cst

        schedule.sort(key=lambda x: (x['day'], x['slot']))

        return {
            "status": "optimal",
            "objective_value": round(solution.objective_value, 4),
            "schedule": schedule,
            "total_nutrition": {k: round(v, 2) for k, v in total_nutrition.items()},
            "total_cost": round(total_cost, 2),
            "total_variables": total_variables,
            "total_constraints": total_constraints,
            "feasible": True,
            "solve_time": solve_time,
            "days": days,
            "meals_per_day": meals_per_day,
            "headcount": request.headcount,
        }

    except HTTPException:
        raise
    except Exception as e:
        logger.exception("Cookbook optimization failed")
        return {
            "status": "error",
            "message": OPTIMIZATION_FAILURE_MESSAGE,
            "solve_time": (datetime.now() - start_time).total_seconds(),
            "schedule": [],
            "total_nutrition": {},
            "total_cost": 0,
            "feasible": False,
            "total_variables": 0,
            "total_constraints": 0,
        }


@app.get("/health")
async def health_check():
    """Health check endpoint."""
    return {
        "status": "healthy",
        "highs_available": HIGHS_AVAILABLE,
        "timestamp": datetime.now().isoformat(),
        "dependencies": {
            "highs": HIGHS_AVAILABLE,
        },
    }

@app.get("/meals/database")
async def get_meals_database():
    """Get the default meals database."""
    return DEFAULT_MEALS_DATABASE

@app.post("/meals/validate")
async def validate_requirements(requirements: NutritionalRequirements):
    """Validate if nutritional requirements are feasible with available meals."""
    # Simple feasibility check - in practice, this could run a quick optimization
    total_available_nutrition = {
        'calories': sum(meal['calories'] * 3 for meal in DEFAULT_MEALS_DATABASE.values()),
        'protein': sum(meal['protein'] * 3 for meal in DEFAULT_MEALS_DATABASE.values()),
        'fiber': sum(meal['fiber'] * 3 for meal in DEFAULT_MEALS_DATABASE.values()),
        'fat': sum(meal['fat'] * 3 for meal in DEFAULT_MEALS_DATABASE.values())
    }
    
    feasible = (
        total_available_nutrition['calories'] >= requirements.min_calories and
        total_available_nutrition['protein'] >= requirements.min_protein and
        total_available_nutrition['fiber'] >= requirements.min_fiber
        # Fat is an upper bound, so it's usually feasible
    )
    
    return {
        "feasible": feasible,
        "max_available": total_available_nutrition,
        "requirements": requirements.dict()
    }

if __name__ == "__main__":
    logger.info("Starting HiGHS Optimization API Server.")
    logger.info("HiGHS Solver Available: %s", HIGHS_AVAILABLE)
    
    uvicorn.run(
        app,
        host="0.0.0.0",
        port=8000,
        reload=False,
        log_level="info"
    )
