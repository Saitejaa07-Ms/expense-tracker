from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.database import get_db
from app.dependencies import get_current_user
from app.models import Category, User
from app.schemas import CategoryCreate, CategoryRead


router = APIRouter(prefix="/api/categories", tags=["Categories"])


@router.get("", response_model=list[CategoryRead])
def list_categories(
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return list(
        db.scalars(
            select(Category)
            .where(Category.user_id == user.id)
            .order_by(Category.name)
        ).all()
    )


@router.post(
    "",
    response_model=CategoryRead,
    status_code=status.HTTP_201_CREATED,
)
def create_category(
    data: CategoryCreate,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    category = Category(
        name=data.name.strip(),
        user_id=user.id,
    )
    db.add(category)

    try:
        db.commit()
    except IntegrityError:
        db.rollback()
        raise HTTPException(
            status_code=409,
            detail="Category already exists",
        )

    db.refresh(category)
    return category
