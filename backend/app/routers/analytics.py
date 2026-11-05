import calendar
from datetime import date
from decimal import Decimal

from fastapi import APIRouter, Depends, Query
from sqlalchemy import case, func, select
from sqlalchemy.orm import Session

from app.database import get_db
from app.dependencies import get_current_user
from app.models import Category, Transaction, TransactionType, User
from app.schemas import CategoryTotal, MonthlySummary


router = APIRouter(prefix="/api/analytics", tags=["Analytics"])


@router.get("/monthly", response_model=MonthlySummary)
def monthly_summary(
    year: int = Query(ge=2000, le=2100),
    month: int = Query(ge=1, le=12),
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    first_day = date(year, month, 1)
    last_day = date(
        year,
        month,
        calendar.monthrange(year, month)[1],
    )

    income, expenses = db.execute(
        select(
            func.coalesce(
                func.sum(
                    case(
                        (
                            Transaction.transaction_type
                            == TransactionType.income,
                            Transaction.amount,
                        ),
                        else_=0,
                    )
                ),
                0,
            ),
            func.coalesce(
                func.sum(
                    case(
                        (
                            Transaction.transaction_type
                            == TransactionType.expense,
                            Transaction.amount,
                        ),
                        else_=0,
                    )
                ),
                0,
            ),
        ).where(
            Transaction.user_id == user.id,
            Transaction.transaction_date.between(
                first_day,
                last_day,
            ),
        )
    ).one()

    category_rows = db.execute(
        select(
            Category.name,
            func.sum(Transaction.amount),
        )
        .join(Transaction, Transaction.category_id == Category.id)
        .where(
            Transaction.user_id == user.id,
            Transaction.transaction_type == TransactionType.expense,
            Transaction.transaction_date.between(
                first_day,
                last_day,
            ),
        )
        .group_by(Category.name)
        .order_by(func.sum(Transaction.amount).desc())
    ).all()

    income = Decimal(income)
    expenses = Decimal(expenses)

    return MonthlySummary(
        month=f"{year}-{month:02d}",
        income=income,
        expenses=expenses,
        balance=income - expenses,
        category_totals=[
            CategoryTotal(category=name, total=Decimal(total))
            for name, total in category_rows
        ],
    )
