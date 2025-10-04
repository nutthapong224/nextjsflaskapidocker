import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

DATABASE_URL = os.environ.get('DATABASE_URL', 'postgresql://postgres:postgres@db:5432/appdb')

def make_engine():
    return create_engine(DATABASE_URL, echo=False, future=True)


engine = None
for i in range(20):
    try:
        engine = make_engine()
        # quick smoke test
        with engine.connect() as conn:
            conn.execute("SELECT 1")
        break
    except Exception:
        import time
        time.sleep(1)

if engine is None:
    raise RuntimeError('Could not connect to the database')

SessionLocal = sessionmaker(bind=engine, expire_on_commit=False, future=True)
