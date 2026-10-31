from typing import Generic, TypeVar, Optional, List, Any
from pydantic import BaseModel, Field

T = TypeVar("T")


class APIResponse(BaseModel, Generic[T]):
    """Standardized successful API response format."""
    success: bool = True
    message: str = "Operation completed successfully"
    data: Optional[T] = None


class APIErrorResponse(BaseModel):
    """Standardized error API response format."""
    success: bool = False
    message: str
    error_code: str
    details: Optional[Any] = None


class PaginationParams(BaseModel):
    """Pagination query parameters."""
    page: int = Field(default=1, ge=1, description="Page number starting from 1")
    size: int = Field(default=20, ge=1, le=100, description="Number of items per page")

    @property
    def offset(self) -> int:
        return (self.page - 1) * self.size


class PaginatedData(BaseModel, Generic[T]):
    """Paginated data container."""
    items: List[T]
    total: int
    page: int
    size: int
    total_pages: int


class PaginatedResponse(BaseModel, Generic[T]):
    """Standardized paginated API response format."""
    success: bool = True
    message: str = "Records retrieved successfully"
    data: PaginatedData[T]

