import pytest
from httpx import AsyncClient


@pytest.mark.asyncio
async def test_root_endpoint(async_client: AsyncClient):
    """Test the root index endpoint."""
    response = await async_client.get("/")
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    assert "version" in data
    assert data["version"] == "1.0.0"


@pytest.mark.asyncio
async def test_health_check_endpoint(async_client: AsyncClient):
    """Test the /api/v1/health endpoint verifying DB connectivity and status."""
    response = await async_client.get("/api/v1/health")
    assert response.status_code == 200
    payload = response.json()

    assert payload["success"] is True
    assert payload["message"] == "Backend service and database are fully operational"
    assert "data" in payload

    health_data = payload["data"]
    assert health_data["status"] == "operational"
    assert health_data["database"] == "connected"
    assert "app_name" in health_data
    assert "environment" in health_data
    assert "timestamp" in health_data

