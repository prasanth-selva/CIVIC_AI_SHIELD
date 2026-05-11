from __future__ import annotations

import logging
from datetime import datetime, timedelta, timezone
from typing import Dict, Optional, Literal

from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt
from pydantic import BaseModel

Role = Literal["COMMANDER", "STRATEGIC_OPS", "FIELD_CONTROL", "ANALYST", "OBSERVER"]

SECRET_KEY = "civic-ai-shield-dev-secret"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60


def _now() -> datetime:
    return datetime.now(timezone.utc)


class Token(BaseModel):
    access_token: str
    token_type: str


class UserPublic(BaseModel):
    id: str
    email: str
    full_name: str
    role: Role
    disabled: bool = False


class UserInDB(UserPublic):
    hashed_password: str


# Precomputed password hashes to avoid runtime bcrypt issues
MOCK_USERS: Dict[str, UserInDB] = {
    "admin@civic.ai": UserInDB(
        id="user-001",
        email="admin@civic.ai",
        full_name="Avery Quinn",
        role="COMMANDER",
        hashed_password="$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/Ll5PEcUBqTPdGOdZ6",  # Admin123
        disabled=False,
    ),
    "operator@civic.ai": UserInDB(
        id="user-002",
        email="operator@civic.ai",
        full_name="Jordan Hayes",
        role="STRATEGIC_OPS",
        hashed_password="$2b$12$VQq8xEsZe8qAqEbBZgKLkOuNZ5.RQJqFLBcLnX7sQEzVYMJ9YW/zq",  # Operator123
        disabled=False,
    ),
    "viewer@civic.ai": UserInDB(
        id="user-003",
        email="viewer@civic.ai",
        full_name="Riley Morgan",
        role="OBSERVER",
        hashed_password="$2b$12$kBz5Z8z7YqK5KpZ8F5Z5ZeZ5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Zu",  # Viewer123
        disabled=False,
    ),
}

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login")


def verify_password(plain_password: str, hashed_password: str) -> bool:
    import logging
    logger = logging.getLogger("civic-ai-shield")
    # Simple mock verification for demo purposes
    try:
        from passlib.context import CryptContext
        pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
        return pwd_context.verify(plain_password, hashed_password)
    except Exception:
        # Fallback to simple comparison for demo
        password_map = {
            "Admin123": "$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/Ll5PEcUBqTPdGOdZ6",
            "Operator123": "$2b$12$VQq8xEsZe8qAqEbBZgKLkOuNZ5.RQJqFLBcLnX7sQEzVYMJ9YW/zq",
            "Viewer123": "$2b$12$kBz5Z8z7YqK5KpZ8F5Z5ZeZ5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Zu",
        }
        match = password_map.get(plain_password) == hashed_password
        logger.info(f"Fallback password check for '{plain_password}': {'SUCCESS' if match else 'FAILED'}")
        return match

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login")


def authenticate_user(email: str, password: str) -> Optional[UserInDB]:
    logger = logging.getLogger("civic-ai-shield")
    logger.info(f"Authenticating user: {email}")
    user = MOCK_USERS.get(email.lower())
    if not user:
        logger.warning(f"User not found: {email}")
        return None
    if not verify_password(password, user.hashed_password):
        logger.warning(f"Invalid password for: {email}")
        return None
    if user.disabled:
        logger.warning(f"User disabled: {email}")
        return None
    logger.info(f"User authenticated successfully: {email}")
    return user


def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    to_encode = data.copy()
    expire = _now() + (expires_delta or timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES))
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)


def get_current_user(token: str = Depends(oauth2_scheme)) -> UserPublic:
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email: str | None = payload.get("sub")
        role: Role | None = payload.get("role")
        if email is None or role is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception

    user = MOCK_USERS.get(email)
    if not user:
        raise credentials_exception
    return UserPublic(**user.model_dump())


def require_roles(*roles: Role):
    def _role_guard(current_user: UserPublic = Depends(get_current_user)) -> UserPublic:
        if current_user.role not in roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Insufficient permissions",
            )
        return current_user

    return _role_guard
