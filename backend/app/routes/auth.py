from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.dependencies.auth import get_current_user
from app.models.user import User
from app.schemas.common import APIResponse
from app.schemas.user import (
    LoginRequest,
    TokenResponse,
    RefreshTokenRequest,
    UserResponse,
    UserProfileUpdate,
    ChangePasswordRequest,
    ForgotPasswordRequest,
    ForgotPasswordResponse,
    ResetPasswordRequest,
)
from app.services.auth_service import AuthService
from app.repositories.user_repository import UserRepository

router = APIRouter(prefix="/auth", tags=["Authentication"])


@router.post(
    "/login",
    response_model=APIResponse[TokenResponse],
    summary="User Login",
    description="Authenticates credentials and returns JWT access and refresh tokens.",
)
async def login(
    login_in: LoginRequest,
    db: AsyncSession = Depends(get_db),
):
    tokens = await AuthService.authenticate_user(db, login_in)
    return APIResponse(
        success=True,
        message="Login successful",
        data=tokens,
    )


@router.post(
    "/refresh",
    response_model=APIResponse[TokenResponse],
    summary="Refresh Access Token",
    description="Issues a fresh access token using a valid refresh token.",
)
async def refresh_token(
    refresh_in: RefreshTokenRequest,
    db: AsyncSession = Depends(get_db),
):
    tokens = await AuthService.refresh_tokens(db, refresh_in.refresh_token)
    return APIResponse(
        success=True,
        message="Tokens refreshed successfully",
        data=tokens,
    )


@router.get(
    "/me",
    response_model=APIResponse[UserResponse],
    summary="Get Current User Profile",
    description="Returns the authenticated user's profile details.",
)
async def get_my_profile(
    current_user: User = Depends(get_current_user),
):
    return APIResponse(
        success=True,
        message="User profile retrieved successfully",
        data=UserResponse.model_validate(current_user),
    )


@router.put(
    "/me",
    response_model=APIResponse[UserResponse],
    summary="Update Current User Profile",
    description="Updates the profile (name, phone) of the currently authenticated user.",
)
async def update_my_profile(
    profile_in: UserProfileUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    if profile_in.full_name is not None:
        current_user.full_name = profile_in.full_name.strip()
    if profile_in.phone is not None:
        current_user.phone = profile_in.phone.strip() if profile_in.phone else None

    updated_user = await UserRepository.update(db, current_user)
    return APIResponse(
        success=True,
        message="Profile updated successfully",
        data=UserResponse.model_validate(updated_user),
    )


@router.post(
    "/change-password",
    response_model=APIResponse[None],
    summary="Change Password",
    description="Changes password for the authenticated user by verifying current password.",
)
async def change_password(
    change_in: ChangePasswordRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    await AuthService.change_password(db, current_user, change_in)
    return APIResponse(
        success=True,
        message="Password changed successfully",
        data=None,
    )


@router.post(
    "/forgot-password",
    response_model=APIResponse[ForgotPasswordResponse],
    summary="Request Password Reset OTP",
    description="Generates and dispatches a 6-digit verification OTP for password reset.",
)
async def forgot_password(
    forgot_in: ForgotPasswordRequest,
    db: AsyncSession = Depends(get_db),
):
    response = await AuthService.request_password_reset_otp(db, forgot_in.email)
    return APIResponse(
        success=True,
        message=response.message,
        data=response,
    )


@router.post(
    "/reset-password",
    response_model=APIResponse[None],
    summary="Reset Password with OTP",
    description="Verifies the OTP and resets the user's password securely.",
)
async def reset_password(
    reset_in: ResetPasswordRequest,
    db: AsyncSession = Depends(get_db),
):
    await AuthService.reset_password_with_otp(db, reset_in)
    return APIResponse(
        success=True,
        message="Password has been reset successfully. You can now login with your new password.",
        data=None,
    )

