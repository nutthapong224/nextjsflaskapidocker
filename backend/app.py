import os
from flask import Flask, jsonify, request

from db import SessionLocal, engine
from models import Base, Item
from crud import list_items, get_item, create_item, update_item, delete_item
from seed import run_seed

app = Flask(__name__)

# Ensure tables exist and run seed
Base.metadata.create_all(engine)
try:
    run_seed()
except Exception:
    # non-fatal
    pass


def item_to_dict(it: Item):
    return {'id': it.id, 'name': it.name}


@app.route('/')
def index():
    return jsonify({'message': 'Hello from Flask backend'})


@app.route('/api')
def api_index():
    return jsonify({'message': 'API root'})


@app.route('/health')
def health():
    return jsonify({'status': 'ok'})


@app.route('/items', methods=['GET'])
def http_list_items():
    items = list_items()
    return jsonify({'items': [item_to_dict(i) for i in items]})


@app.route('/items', methods=['POST'])
def http_create_item():
    data = request.get_json() or {}
    name = data.get('name')
    if not name:
        return jsonify({'error': 'name is required'}), 400
    it = create_item(name)
    return jsonify(item_to_dict(it)), 201


@app.route('/items/<int:item_id>', methods=['GET'])
def http_get_item(item_id: int):
    it = get_item(item_id)
    if not it:
        return jsonify({'error': 'not found'}), 404
    return jsonify(item_to_dict(it))


@app.route('/items/<int:item_id>', methods=['PUT'])
def http_update_item(item_id: int):
    data = request.get_json() or {}
    name = data.get('name')
    if not name:
        return jsonify({'error': 'name is required'}), 400
    it = update_item(item_id, name)
    if not it:
        return jsonify({'error': 'not found'}), 404
    return jsonify(item_to_dict(it))


@app.route('/items/<int:item_id>', methods=['DELETE'])
def http_delete_item(item_id: int):
    ok = delete_item(item_id)
    if not ok:
        return jsonify({'error': 'not found'}), 404
    return jsonify({'deleted': True})


# --- API-prefixed aliases (support callers that include /api/ prefix) ---
@app.route('/api/items', methods=['GET'])
def api_list_items():
    return http_list_items()


@app.route('/api/items', methods=['POST'])
def api_create_item():
    return http_create_item()


@app.route('/api/items/<int:item_id>', methods=['GET'])
def api_get_item(item_id: int):
    return http_get_item(item_id)


@app.route('/api/items/<int:item_id>', methods=['PUT'])
def api_update_item(item_id: int):
    return http_update_item(item_id)


@app.route('/api/items/<int:item_id>', methods=['DELETE'])
def api_delete_item(item_id: int):
    return http_delete_item(item_id)


if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)
