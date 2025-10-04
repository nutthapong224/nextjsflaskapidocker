from db import SessionLocal, engine
from models import Base, Item

def run_seed():
    # create tables
    Base.metadata.create_all(engine)
    with SessionLocal() as s:
        count = s.query(Item).count()
        if count == 0:
            s.add_all([Item(name='Sample A'), Item(name='Sample B')])
            s.commit()
            print('Seeded initial items')
        else:
            print('DB already has data, skipping seed')

if __name__ == '__main__':
    run_seed()
