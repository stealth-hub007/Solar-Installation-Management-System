import pytest
from httpx import AsyncClient, ASGITransport
from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker, AsyncSession
from sqlalchemy.pool import NullPool

from app.main import app
from app.core.config import settings
from app.core.database import get_db
from app.core.init_db import seed_initial_admin, seed_initial_catalog

# Test engine with NullPool to prevent event loop mismatch between test functions
test_engine = create_async_engine(settings.DATABASE_URL, poolclass=NullPool)
TestSessionLocal = async_sessionmaker(
    bind=test_engine,
    class_=AsyncSession,
    expire_on_commit=False,
    autoflush=False,
)


async def override_get_db():
    async with TestSessionLocal() as session:
        try:
            yield session
        except Exception:
            await session.rollback()
            raise
        finally:
            await session.close()


app.dependency_overrides[get_db] = override_get_db


@pytest.fixture(autouse=True)
async def setup_db():
    """Seeds the initial administrator before tests execute."""
    async with TestSessionLocal() as session:
        await seed_initial_admin(session)
        await seed_initial_catalog(session)
    yield


@pytest.fixture
async def async_client():
    """Provides an asynchronous HTTP test client for FastAPI."""
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        yield client
