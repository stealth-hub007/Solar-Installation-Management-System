import asyncio
from datetime import datetime, timezone
from sqlalchemy import select
from app.core.database import AsyncSessionLocal
from app.models.user import User, UserRole, AccountStatus, ROLE_DEFAULT_PERMISSIONS
from app.core.security import get_password_hash

DEMO_USERS = [
    {
        "email": "admin@sunpower.com",
        "full_name": "Chief Solar Officer (Admin)",
        "phone": "9998887776",
        "password": "Admin@12345Password",
        "role": UserRole.ADMIN,
        "account_status": AccountStatus.APPROVED,
        "permissions": ROLE_DEFAULT_PERMISSIONS[UserRole.ADMIN],
        "is_superuser": True,
    },
    {
        "email": "sales@sunpower.com",
        "full_name": "Rohan Verma (Sales Lead)",
        "phone": "9829011222",
        "password": "Sales@12345Pass",
        "role": UserRole.SALES,
        "account_status": AccountStatus.APPROVED,
        "permissions": ROLE_DEFAULT_PERMISSIONS[UserRole.SALES],
        "is_superuser": False,
    },
    {
        "email": "warehouse@sunpower.com",
        "full_name": "Anil Sharma (Warehouse Manager)",
        "phone": "9829033444",
        "password": "Warehouse@12345Pass",
        "role": UserRole.WAREHOUSE,
        "account_status": AccountStatus.APPROVED,
        "permissions": ROLE_DEFAULT_PERMISSIONS[UserRole.WAREHOUSE],
        "is_superuser": False,
    },
    {
        "email": "vikram.tech@sunpower.com",
        "full_name": "Vikram Singh (Senior Field Technician)",
        "phone": "9829011111",
        "password": "Tech@12345Pass",
        "role": UserRole.TECHNICIAN,
        "account_status": AccountStatus.APPROVED,
        "permissions": ROLE_DEFAULT_PERMISSIONS[UserRole.TECHNICIAN],
        "is_superuser": False,
    },
    {
        "email": "manish.pending@sunpower.com",
        "full_name": "Manish Pareek (New Solar Apprentice)",
        "phone": "9829055667",
        "password": "Pending@12345Pass",
        "role": UserRole.TECHNICIAN,
        "account_status": AccountStatus.PENDING,
        "permissions": [],
        "is_superuser": False,
    },
    {
        "email": "sanjay.rejected@sunpower.com",
        "full_name": "Sanjay Solanki",
        "phone": "9829088776",
        "password": "Rejected@12345Pass",
        "role": UserRole.SALES,
        "account_status": AccountStatus.REJECTED,
        "rejection_reason": "Incomplete government electrical license verification.",
        "permissions": [],
        "is_superuser": False,
    },
    {
        "email": "sunil.suspended@sunpower.com",
        "full_name": "Sunil Joshi",
        "phone": "9829099887",
        "password": "Suspended@12345Pass",
        "role": UserRole.WAREHOUSE,
        "account_status": AccountStatus.SUSPENDED,
        "permissions": [],
        "is_superuser": False,
    },
]

async def seed_users():
    async with AsyncSessionLocal() as session:
        for udata in DEMO_USERS:
            user = (await session.execute(select(User).where(User.email == udata["email"]))).scalar_one_or_none()
            if not user:
                user = User(
                    email=udata["email"],
                    full_name=udata["full_name"],
                    phone=udata.get("phone"),
                    hashed_password=get_password_hash(udata["password"]),
                    role=udata["role"],
                    account_status=udata["account_status"],
                    permissions=udata["permissions"],
                    rejection_reason=udata.get("rejection_reason"),
                    is_active=True if udata["account_status"] == AccountStatus.APPROVED else False,
                    is_superuser=udata.get("is_superuser", False),
                    approved_at=datetime.now(timezone.utc) if udata["account_status"] == AccountStatus.APPROVED else None,
                )
                session.add(user)
                print(f"Created demo user: {udata['email']} ({udata['role'].value} - {udata['account_status'].value})")
            else:
                user.full_name = udata["full_name"]
                user.role = udata["role"]
                user.account_status = udata["account_status"]
                user.permissions = udata["permissions"]
                user.hashed_password = get_password_hash(udata["password"])
                if udata.get("rejection_reason"):
                    user.rejection_reason = udata["rejection_reason"]
                print(f"Updated demo user: {udata['email']} ({udata['role'].value} - {udata['account_status'].value})")
        await session.commit()
        print("Demo staff users successfully seeded and verified!")

if __name__ == "__main__":
    asyncio.run(seed_users())
