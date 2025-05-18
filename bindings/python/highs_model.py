"""HighsModel - a simple interface for building LP models.

This wrapper provides intuitive methods to add variables and
constraints. It converts the internal representation to a
``highspy.HighsModel`` if the package is available.
"""
from __future__ import annotations

from dataclasses import dataclass, field
from typing import Dict, List, Optional, Tuple

import math


@dataclass
class Variable:
    """Linear programming variable."""

    lower: float = 0.0
    upper: float = math.inf
    cost: float = 0.0
    name: Optional[str] = None


@dataclass
class Constraint:
    """Linear constraint represented by a sparse row."""

    coeffs: Dict[int, float]
    lower: float = -math.inf
    upper: float = math.inf
    name: Optional[str] = None


@dataclass
class HighsModel:
    """Problem container for LP creation."""

    sense: str = "min"
    variables: List[Variable] = field(default_factory=list)
    constraints: List[Constraint] = field(default_factory=list)

    def add_variable(
        self,
        lower: float = 0.0,
        upper: float = math.inf,
        cost: float = 0.0,
        name: Optional[str] = None,
    ) -> int:
        """Add a variable to the model.

        Returns the index of the new variable.
        """
        var = Variable(lower=lower, upper=upper, cost=cost, name=name)
        self.variables.append(var)
        return len(self.variables) - 1

    def add_constraint(
        self,
        coeffs: Dict[int, float],
        lower: float = -math.inf,
        upper: float = math.inf,
        name: Optional[str] = None,
    ) -> int:
        """Add a linear constraint.

        ``coeffs`` maps variable indices to coefficients.
        """
        con = Constraint(coeffs=dict(coeffs), lower=lower, upper=upper, name=name)
        self.constraints.append(con)
        return len(self.constraints) - 1

    # ------------------------------------------------------------------
    # Export helpers
    # ------------------------------------------------------------------
    def to_highspy(self):
        """Return a ``highspy.HighsModel`` instance if highspy is available."""
        try:
            from highspy import HighsModel as HSModel
        except Exception as exc:  # pragma: no cover - optional dependency
            raise ImportError(
                "highspy package is required to create a HighsModel"
            ) from exc

        model = HSModel()
        model.num_col = len(self.variables)
        model.num_row = len(self.constraints)
        model.col_cost = [v.cost for v in self.variables]
        model.col_lower = [v.lower for v in self.variables]
        model.col_upper = [v.upper for v in self.variables]
        model.row_lower = [c.lower for c in self.constraints]
        model.row_upper = [c.upper for c in self.constraints]

        # build sparse matrix
        starts: List[int] = [0]
        indices: List[int] = []
        values: List[float] = []
        for con in self.constraints:
            row_dict = con.coeffs
            for idx, coef in row_dict.items():
                indices.append(idx)
                values.append(coef)
            starts.append(len(indices))

        model.a_matrix = {
            "start": starts,
            "index": indices,
            "value": values,
        }
        model.sense = 1 if self.sense == "max" else 0
        return model

    def solve(self):
        """Solve the model using ``highspy``.

        Returns the raw solution dictionary from ``Highs``.
        """
        try:
            from highspy import Highs
        except Exception as exc:  # pragma: no cover - optional dependency
            raise ImportError(
                "highspy package is required to solve the model"
            ) from exc

        highs = Highs()
        highs.passModel(self.to_highspy())
        status = highs.run()
        if status:
            raise RuntimeError(f"HiGHS solver returned status {status}")
        return highs.getSolution()

    def __repr__(self) -> str:  # pragma: no cover - formatting
        return f"HighsModel(vars={len(self.variables)}, cons={len(self.constraints)})"
