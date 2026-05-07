from fastapi import APIRouter, HTTPException, status, Depends
from pydantic import BaseModel, EmailStr

from ..auth import Token, UserPublic, authenticate_user, create_access_token, get_current_user

router = APIRouter()


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


@router.post("/login", response_model=Token)
def login(payload: LoginRequest) -> Token:
    user = authenticate_user(payload.email, payload.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
        )

    access_token = create_access_token({"sub": user.email, "role": user.role})
    return Token(access_token=access_token, token_type="bearer")


@router.get("/me", response_model=UserPublic)
def me(current_user: UserPublic = Depends(get_current_user)) -> UserPublic:
    return current_user
