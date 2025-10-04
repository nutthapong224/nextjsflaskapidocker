from typing import List, Optional
from models import Item
from db import SessionLocal

def list_items() -> List[Item]:
    with SessionLocal() as s:
        return s.query(Item).all()

def get_item(item_id: int) -> Optional[Item]:
    with SessionLocal() as s:
        return s.get(Item, item_id)

def create_item(name: str) -> Item:
    with SessionLocal() as s:
        it = Item(name=name)
        s.add(it)
        s.commit()
        s.refresh(it)
        return it

def update_item(item_id: int, name: str) -> Optional[Item]:
    with SessionLocal() as s:
        it = s.get(Item, item_id)
        if not it:
            return None
        it.name = name
        s.add(it)
        s.commit()
        s.refresh(it)
        return it

def delete_item(item_id: int) -> bool:
    with SessionLocal() as s:
        it = s.get(Item, item_id)
        if not it:
            return False
        s.delete(it)
        s.commit()
        return True
