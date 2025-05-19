export const SolverErrorCodes = {
  INFEASIBLE: 'E_SOLVER_INFEASIBLE',
  NUMERICAL: 'E_SOLVER_NUMERICAL',
  UNKNOWN: 'E_SOLVER_UNKNOWN'
};

export function interpretStatus(status) {
  switch (status) {
    case 8:
      return {
        code: SolverErrorCodes.INFEASIBLE,
        message: 'No feasible solution found. Try relaxing constraints or check input data.'
      };
    case 13:
      return {
        code: SolverErrorCodes.NUMERICAL,
        message: 'Solver encountered numerical instability. Check data for extreme or inconsistent values.'
      };
    default:
      return {
        code: SolverErrorCodes.UNKNOWN,
        message: `Solver terminated with status code ${status}.`
      };
  }
}

export function createSolverError(status) {
  const { code, message } = interpretStatus(status);
  const err = new Error(message);
  err.code = code;
  return err;
}
