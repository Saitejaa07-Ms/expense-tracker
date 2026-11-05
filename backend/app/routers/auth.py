from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.database import get_db
from app.dependencies import get_current_user
from app.models import Category, User
from app.schemas import LoginRequest, Token, UserCreate, UserRead
from app.security import create_access_token, hash_password, verify_password


router = APIRouter(prefix="/api/auth", tags=["Authentication"])

DEFAULT_CATEGORIES = [
    "Food",
    "Travel",
    "Bills",
    "Entertainment",
    "Groceries",
    "Other",
]


@router.post(
    "/register",
    response_model=UserRead,
    status_code=status.HTTP_201_CREATED,
)
def register(data: UserCreate, db: Session = Depends(get_db)):
    existing = db.scalar(
        select(User).where(User.email == data.email.lower())
    )

    if existing:
        raise HTTPException(
            status_code=409,
            detail="Email is already registered",
        )

    user = User(
        email=data.email.lower(),
        password_hash=hash_password(data.password),
    )
    db.add(user)
    db.flush()

    db.add_all(
        [
            Category(name=name, user_id=user.id)
            for name in DEFAULT_CATEGORIES
        ]
    )

    db.commit()
    db.refresh(user)
    return user


@router.post("/login", response_model=Token)
def login(data: LoginRequest, db: Session = Depends(get_db)):
    user = db.scalar(
        select(User).where(User.email == data.email.lower())
    )

    if user is None or not verify_password(
        data.password,
        user.password_hash,
    ):
        raise HTTPException(
            status_code=401,
            detail="Invalid email or password",
        )

    return Token(access_token=create_access_token(user.id))


@router.get("/me", response_model=UserRead)
def current_user(user: User = Depends(get_current_user)):
    return user
