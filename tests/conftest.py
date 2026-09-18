import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.database import Base, get_db
from app.main import app
from app.seed import seed_database
from app.models.user import User
from app.services.auth_service import create_access_token

SQLALCHEMY_DATABASE_URL = "sqlite:///./test_accesslens.db"

engine = create_engine(
    SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False}
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

@pytest.fixture(scope="session", autouse=True)
def setup_test_db():
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)
    db = TestingSessionLocal()
    seed_database(db)
    db.close()
    yield
    Base.metadata.drop_all(bind=engine)

@pytest.fixture
def db():
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()

@pytest.fixture
def client(db):
    def override_get_db():
        try:
            yield db
        finally:
            pass
    app.dependency_overrides[get_db] = override_get_db
    with TestClient(app) as test_client:
        yield test_client
    app.dependency_overrides.clear()

@pytest.fixture
def token_finance(db):
    user = db.query(User).filter(User.employee_id == "U102").first()
    return create_access_token(data={"sub": user.employee_id})

@pytest.fixture
def token_marketing(db):
    user = db.query(User).filter(User.employee_id == "U205").first()
    return create_access_token(data={"sub": user.employee_id})

@pytest.fixture
def token_version_finance(db):
    user = db.query(User).filter(User.employee_id == "U301").first()
    return create_access_token(data={"sub": user.employee_id})

@pytest.fixture
def token_executive(db):
    user = db.query(User).filter(User.employee_id == "U401").first()
    return create_access_token(data={"sub": user.employee_id})

@pytest.fixture
def token_admin(db):
    user = db.query(User).filter(User.employee_id == "U901").first()
    return create_access_token(data={"sub": user.employee_id})
