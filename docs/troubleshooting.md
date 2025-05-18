# Troubleshooting Solver Errors

This document lists common issues encountered when running the HiGHS solver and how to resolve them.

## Error Codes

| Code | Meaning |
|------|---------|
| `E_SOLVER_INFEASIBLE` | No feasible solution exists for the provided constraints. Consider loosening nutritional targets or ensuring the meal data is complete. |
| `E_SOLVER_NUMERICAL` | The solver failed due to numerical instability. Check your input data for extreme or inconsistent values. |
| `E_SOLVER_UNKNOWN` | The solver ended with an unexpected status. Review logs for additional details. |

## Typical Fixes

- **Infeasible models**: Try widening the calorie or macro ranges in your request. Ensure there are enough meals with valid nutrition data.
- **Numerical issues**: Inspect the meal dataset for very large or very small numbers. Removing outliers often resolves this problem.
- **Unknown status**: Ensure you are using a compatible version of the HiGHS addon and that all inputs are valid.
