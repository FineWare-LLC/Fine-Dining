import { describe, it } from 'node:test';
import assert from 'node:assert';
import { SolverErrorCodes, interpretStatus, createSolverError } from '../../io/solverOutput.js';

describe('solverOutput', () => {
    describe('SolverErrorCodes', () => {
        it('should export correct error code constants', () => {
            assert.strictEqual(SolverErrorCodes.INFEASIBLE, 'E_SOLVER_INFEASIBLE');
            assert.strictEqual(SolverErrorCodes.NUMERICAL, 'E_SOLVER_NUMERICAL');
            assert.strictEqual(SolverErrorCodes.UNKNOWN, 'E_SOLVER_UNKNOWN');
        });

        it('should have all expected error codes', () => {
            const expectedCodes = ['INFEASIBLE', 'NUMERICAL', 'UNKNOWN'];
            const actualCodes = Object.keys(SolverErrorCodes);
            
            expectedCodes.forEach(code => {
                assert.ok(actualCodes.includes(code), `Missing error code: ${code}`);
            });
        });

        it('should export an object with string values', () => {
            assert.strictEqual(typeof SolverErrorCodes, 'object');
            Object.values(SolverErrorCodes).forEach(value => {
                assert.strictEqual(typeof value, 'string');
            });
        });
    });

    describe('interpretStatus', () => {
        it('should interpret status 8 as INFEASIBLE', () => {
            const result = interpretStatus(8);
            
            assert.strictEqual(result.code, SolverErrorCodes.INFEASIBLE);
            assert.strictEqual(result.message, 'No feasible solution found. Try relaxing constraints or check input data.');
        });

        it('should interpret status 13 as NUMERICAL', () => {
            const result = interpretStatus(13);
            
            assert.strictEqual(result.code, SolverErrorCodes.NUMERICAL);
            assert.strictEqual(result.message, 'Solver encountered numerical instability. Check data for extreme or inconsistent values.');
        });

        it('should interpret unknown status codes as UNKNOWN', () => {
            const testCodes = [0, 1, 5, 7, 9, 10, 12, 14, 15, 99, -1];
            
            testCodes.forEach(status => {
                const result = interpretStatus(status);
                assert.strictEqual(result.code, SolverErrorCodes.UNKNOWN);
                assert.strictEqual(result.message, `Solver terminated with status code ${status}.`);
            });
        });

        it('should handle status code 0', () => {
            const result = interpretStatus(0);
            
            assert.strictEqual(result.code, SolverErrorCodes.UNKNOWN);
            assert.strictEqual(result.message, 'Solver terminated with status code 0.');
        });

        it('should handle negative status codes', () => {
            const result = interpretStatus(-5);
            
            assert.strictEqual(result.code, SolverErrorCodes.UNKNOWN);
            assert.strictEqual(result.message, 'Solver terminated with status code -5.');
        });

        it('should handle large status codes', () => {
            const result = interpretStatus(1000);
            
            assert.strictEqual(result.code, SolverErrorCodes.UNKNOWN);
            assert.strictEqual(result.message, 'Solver terminated with status code 1000.');
        });

        it('should handle string status codes as unknown', () => {
            const result = interpretStatus('invalid');
            
            assert.strictEqual(result.code, SolverErrorCodes.UNKNOWN);
            assert.strictEqual(result.message, 'Solver terminated with status code invalid.');
        });

        it('should handle null status code', () => {
            const result = interpretStatus(null);
            
            assert.strictEqual(result.code, SolverErrorCodes.UNKNOWN);
            assert.strictEqual(result.message, 'Solver terminated with status code null.');
        });

        it('should handle undefined status code', () => {
            const result = interpretStatus(undefined);
            
            assert.strictEqual(result.code, SolverErrorCodes.UNKNOWN);
            assert.strictEqual(result.message, 'Solver terminated with status code undefined.');
        });

        it('should return object with code and message properties', () => {
            const result = interpretStatus(8);
            
            assert.ok(typeof result === 'object');
            assert.ok(result.hasOwnProperty('code'));
            assert.ok(result.hasOwnProperty('message'));
            assert.strictEqual(Object.keys(result).length, 2);
        });
    });

    describe('createSolverError', () => {
        it('should create Error object for INFEASIBLE status', () => {
            const error = createSolverError(8);
            
            assert.ok(error instanceof Error);
            assert.strictEqual(error.code, SolverErrorCodes.INFEASIBLE);
            assert.strictEqual(error.message, 'No feasible solution found. Try relaxing constraints or check input data.');
        });

        it('should create Error object for NUMERICAL status', () => {
            const error = createSolverError(13);
            
            assert.ok(error instanceof Error);
            assert.strictEqual(error.code, SolverErrorCodes.NUMERICAL);
            assert.strictEqual(error.message, 'Solver encountered numerical instability. Check data for extreme or inconsistent values.');
        });

        it('should create Error object for unknown status', () => {
            const error = createSolverError(99);
            
            assert.ok(error instanceof Error);
            assert.strictEqual(error.code, SolverErrorCodes.UNKNOWN);
            assert.strictEqual(error.message, 'Solver terminated with status code 99.');
        });

        it('should create throwable error', () => {
            const error = createSolverError(8);
            
            assert.throws(() => {
                throw error;
            }, error);
        });

        it('should preserve error properties when thrown', () => {
            const error = createSolverError(13);
            
            try {
                throw error;
            } catch (caught) {
                assert.strictEqual(caught.code, SolverErrorCodes.NUMERICAL);
                assert.ok(caught.message.includes('numerical instability'));
            }
        });

        it('should create different error instances', () => {
            const error1 = createSolverError(8);
            const error2 = createSolverError(8);
            
            assert.notStrictEqual(error1, error2);
            assert.strictEqual(error1.code, error2.code);
            assert.strictEqual(error1.message, error2.message);
        });

        it('should handle edge case status codes', () => {
            const testCases = [
                { status: 0, expectedCode: SolverErrorCodes.UNKNOWN },
                { status: -1, expectedCode: SolverErrorCodes.UNKNOWN },
                { status: 1.5, expectedCode: SolverErrorCodes.UNKNOWN },
                { status: '8', expectedCode: SolverErrorCodes.UNKNOWN }
            ];

            testCases.forEach(({ status, expectedCode }) => {
                const error = createSolverError(status);
                assert.ok(error instanceof Error);
                assert.strictEqual(error.code, expectedCode);
            });
        });

        it('should use interpretStatus function internally', () => {
            // Test that createSolverError uses the same interpretation logic
            const status = 8;
            const interpreted = interpretStatus(status);
            const error = createSolverError(status);
            
            assert.strictEqual(error.code, interpreted.code);
            assert.strictEqual(error.message, interpreted.message);
        });

        it('should have correct Error properties', () => {
            const error = createSolverError(8);
            
            assert.ok(error.name); // Should have name property from Error
            assert.ok(error.stack); // Should have stack trace
            assert.strictEqual(typeof error.toString, 'function');
        });
    });

    describe('integration tests', () => {
        it('should work together for complete error handling flow', () => {
            const testStatuses = [8, 13, 99];
            
            testStatuses.forEach(status => {
                // Interpret status
                const interpretation = interpretStatus(status);
                
                // Create error
                const error = createSolverError(status);
                
                // Verify consistency
                assert.strictEqual(error.code, interpretation.code);
                assert.strictEqual(error.message, interpretation.message);
                
                // Verify error is throwable with correct properties
                try {
                    throw error;
                } catch (caught) {
                    assert.strictEqual(caught.code, interpretation.code);
                    assert.strictEqual(caught.message, interpretation.message);
                }
            });
        });

        it('should handle all defined error codes consistently', () => {
            const statusToCode = {
                8: SolverErrorCodes.INFEASIBLE,
                13: SolverErrorCodes.NUMERICAL
            };

            Object.entries(statusToCode).forEach(([status, expectedCode]) => {
                const numericStatus = parseInt(status);
                const interpretation = interpretStatus(numericStatus);
                const error = createSolverError(numericStatus);

                assert.strictEqual(interpretation.code, expectedCode);
                assert.strictEqual(error.code, expectedCode);
            });
        });
    });
});