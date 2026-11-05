from datetime import date

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import select
from sqlalchemy.orm import Session, joinedload

from app.database import get_db
from app.dependencies import get_current_user
from app.models import Category, Transaction, TransactionType, User
from app.schemas import (
    TransactionCreate,
    TransactionRead,
    TransactionUpdate,
)


router = APIRouter(prefix="/api/transactions", tags=["Transactions"])


def get_user_category(
    category_id: int,
    user_id: int,
    db: Session,
) -> Category:
    category = db.scalar(
        select(Category).where(
            Category.id == category_id,
            Category.user_id == user_id,
        )
    )

    if category is None:
        raise HTTPException(status_code=404, detail="Category not found")

    return category


@router.get("", response_model=list[TransactionRead])
def list_transactions(
    category_id: int | None = None,
    transaction_type: TransactionType | None = None,
    start_date: date | None = None,
    end_date: date | None = None,
    limit: int = Query(100, ge=1, le=500),
    offset: int = Query(0, ge=0),
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    query = (
        select(Transaction)
        .options(joinedload(Transaction.category))
        .where(Transaction.user_id == user.id)
    )

    if category_id is not None:
        query = query.where(Transaction.category_id == category_id)

    if transaction_type is not None:
        query = query.where(
            Transaction.transaction_type == transaction_type
        )

    if start_date is not None:
        query = query.where(
            Transaction.transaction_date >= start_date
        )

    if end_date is not None:
        query = query.where(
            Transaction.transaction_date <= end_date
        )

    query = (
        query.order_by(
            Transaction.transaction_date.desc(),
            Transaction.id.desc(),
        )
        .offset(offset)
        .limit(limit)
    )

    return list(db.scalars(query).all())


@router.post(
    "",
    response_model=TransactionRead,
    status_code=status.HTTP_201_CREATED,
)
def create_transaction(
    data: TransactionCreate,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    get_user_category(data.category_id, user.id, db)

    transaction = Transaction(
        **data.model_dump(),
        user_id=user.id,
    )

    db.add(transaction)
    db.commit()

    return db.scalar(
        select(Transaction)
        .options(joinedload(Transaction.category))
        .where(Transaction.id == transaction.id)
    )


@router.put("/{transaction_id}", response_model=TransactionRead)
def update_transaction(
    transaction_id: int,
    data: TransactionUpdate,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    transaction = db.scalar(
        select(Transaction).where(
            Transaction.id == transaction_id,
            Transaction.user_id == user.id,
        )
    )

    if transaction is None:
        raise HTTPException(
            status_code=404,
            detail="Transaction not found",
        )

    changes = data.model_dump(exclude_unset=True)

    if "category_id" in changes:
        get_user_category(changes["category_id"], user.id, db)

    for field, value in changes.items():
        setattr(transaction, field, value)

    db.commit()

    return db.scalar(
        select(Transaction)
        .options(joinedload(Transaction.category))
        .where(Transaction.id == transaction.id)
    )


@router.delete(
    "/{transaction_id}",
    status_code=status.HTTP_204_NO_CONTENT,
)
def delete_transaction(
    transaction_id: int,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    transaction = db.scalar(
        select(Transaction).where(
            Transaction.id == transaction_id,
            Transaction.user_id == user.id,
        )
    )

    if transaction is None:
        raise HTTPException(
            status_code=404,
            detail="Transaction not found",
        )

    db.delete(transaction)
    db.commit()
