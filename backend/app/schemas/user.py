from typing import Optional, List
from datetime import datetime
import uuid
from pydantic import BaseModel, EmailStr, Field, ConfigDict, model_validator

from app.models.user import UserRole, AccountStatus


class UserBase(BaseModel):
    email: EmailStr
    full_name: str = Field(..., min_length=2, max_length=255)
    phone: Optional[str] = Field(None, max_length=20)
    role: UserRole = UserRole.SALES


class UserCreate(UserBase):
    password: str = Field(..., min_length=8, max_length=128, description="Minimum 8 characters password")


class UserRegisterRequest(BaseModel):
    full_name: str = Field(..., min_length=2, max_length=255, description="Full name of the user")
    email: EmailStr
    password: str = Field(..., min_length=8, max_length=128, description="Minimum 8 characters")
    confirm_password: str

    @model_validator(mode="after")
    def check_passwords_match(self):
        if self.password != self.confirm_password:
            raise ValueError("Passwords do not match")
        return self


class GoogleAuthRequest(BaseModel):
    credential: Optional[str] = Field(None, description="Google OAuth ID token or access token")
    email: Optional[EmailStr] = None
    full_name: Optional[str] = None
    google_id: Optional[str] = None


class UserApprovalRequest(BaseModel):
    role: UserRole = Field(..., description="Assigned role: ADMIN, SALES, WAREHOUSE, TECHNICIAN")
    permissions: Optional[List[str]] = Field(None, description="Optional custom permissions list")


class UserRejectionRequest(BaseModel):
    reason: Optional[str] = Field("Application rejected by administrator", max_length=500)


class UserSuspensionRequest(BaseModel):
    reason: Optional[str] = Field("Account suspended by administrator", max_length=500)


class UserUpdate(BaseModel):
    full_name: Optional[str] = Field(None, min_length=2, max_length=255)
    phone: Optional[str] = Field(None, max_length=20)
    role: Optional[UserRole] = None
    account_status: Optional[AccountStatus] = None


class UserProfileUpdate(BaseModel):
    full_name: Optional[str] = Field(None, min_length=2, max_length=255)
    phone: Optional[str] = Field(None, max_length=20)


class UserStatusUpdate(BaseModel):
    is_active: bool


class UserResponse(BaseModel):
    id: uuid.UUID
    email: EmailStr
    phone: Optional[str] = None
    full_name: str
    role: UserRole
    account_status: AccountStatus = AccountStatus.PENDING
    auth_provider: str = "LOCAL"
    is_active: bool = True
    is_superuser: bool = False
    approved_at: Optional[datetime] = None
    approved_by_id: Optional[uuid.UUID] = None
    rejection_reason: Optional[str] = None
    suspended_at: Optional[datetime] = None
    permissions: List[str] = Field(default_factory=list)
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class TokenResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    account_status: AccountStatus = AccountStatus.APPROVED
    user: UserResponse


class RefreshTokenRequest(BaseModel):
    refresh_token: str


class ChangePasswordRequest(BaseModel):
    current_password: str
    new_password: str = Field(..., min_length=8, max_length=128)


class ForgotPasswordRequest(BaseModel):
    email: EmailStr


class ForgotPasswordResponse(BaseModel):
    message: str
    dev_otp: Optional[str] = None


class ResetPasswordRequest(BaseModel):
    email: EmailStr
    otp_code: str = Field(..., min_length=6, max_length=6)
    new_password: str = Field(..., min_length=8, max_length=128)
