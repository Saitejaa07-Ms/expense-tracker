from datetime import date, datetime
from decimal import Decimal

from pydantic import BaseModel, ConfigDict, EmailStr, Field

from app.models import TransactionType


class UserCreate(BaseModel):
    email: EmailStr
    password: str = Field(min_length=8, max_length=128)


class UserRead(BaseModel):
    id: int
    email: EmailStr
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class CategoryCreate(BaseModel):
    name: str = Field(min_length=1, max_length=80)


class CategoryRead(CategoryCreate):
    id: int

    model_config = ConfigDict(from_attributes=True)


class TransactionBase(BaseModel):
    description: str = Field(min_length=1, max_length=255)
    amount: Decimal = Field(gt=0, max_digits=12, decimal_places=2)
    transaction_type: TransactionType
    transaction_date: date
    category_id: int


class TransactionCreate(TransactionBase):
    pass


class TransactionUpdate(BaseModel):
    description: str | None = Field(None, min_length=1, max_length=255)
    amount: Decimal | None = Field(
        None,
        gt=0,
        max_digits=12,
        decimal_places=2,
    )
    transaction_type: TransactionType | None = None
    transaction_date: date | None = None
    category_id: int | None = None


class TransactionRead(TransactionBase):
    id: int
    category: CategoryRead
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class CategoryTotal(BaseModel):
    category: str
    total: Decimal


class MonthlySummary(BaseModel):
    month: str
    income: Decimal
    expenses: Decimal
    balance: Decimal
    category_totals: list[CategoryTotal]
