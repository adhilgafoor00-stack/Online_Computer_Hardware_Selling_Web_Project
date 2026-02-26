from flask import Flask, request, jsonify, send_from_directory
import sqlite3
import json
from pathlib import Path

# serve the existing static html/js/css by pointing Flask at the parent directory
app = Flask(__name__, static_folder='../', static_url_path='')

DB_PATH = Path(__file__).parent / 'database.db'


def get_db():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn


def init_db():
    conn = get_db()
    cur = conn.cursor()
    cur.execute('''
        CREATE TABLE IF NOT EXISTS products (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            cat TEXT,
            price REAL NOT NULL,
            img TEXT
        )
    ''')
    cur.execute('''
        CREATE TABLE IF NOT EXISTS orders (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            items TEXT,
            total REAL
        )
    ''')
    cur.execute('''
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT UNIQUE NOT NULL,
            password TEXT NOT NULL,
            role TEXT NOT NULL
        )
    ''')
    # ensure there is an admin user
    cur.execute('SELECT COUNT(*) FROM users WHERE username = ?', ('admin',))
    if cur.fetchone()[0] == 0:
        # password is hard‑coded for demo; in production hash it!
        cur.execute(
            'INSERT INTO users (username, password, role) VALUES (?, ?, ?)',
            ('admin', 'admin@123', 'admin'),
        )
    # seed some default products if the table is empty
    cur.execute('SELECT COUNT(*) FROM products')
    if cur.fetchone()[0] == 0:
        sample = [
            ('Intel i5 CPU', 'CPU', 12000, 'images/icpu.png'),
            ('AMD Ryzen 5', 'CPU', 14000, 'images/rcpu.png'),
            ('8GB DDR4 RAM', 'RAM', 2500, 'images/ram8.png'),
            ('16GB DDR4 RAM', 'RAM', 4800, 'images/ram16.png'),
            ('512GB SSD', 'Storage', 4500, 'images/ssd.png'),
            ('1TB HDD', 'Storage', 3500, 'images/hdd.png'),
            ('NVIDIA GTX GPU', 'GPU', 22000, 'images/gpu.png'),
            ('450W SMPS', 'Power Supply', 2800, 'images/psu.png')
        ]
        cur.executemany(
            'INSERT INTO products (name, cat, price, img) VALUES (?, ?, ?, ?)',
            sample
        )
    conn.commit()
    conn.close()


@app.route('/')
def index():
    # send index.html from parent directory
    return send_from_directory(app.static_folder, 'index.html')

@app.route('/api/products', methods=['GET'])
def get_products():
    conn = get_db()
    cur = conn.cursor()
    cur.execute('SELECT * FROM products')
    rows = cur.fetchall()
    products = [dict(row) for row in rows]
    conn.close()
    return jsonify(products)


@app.route('/api/products', methods=['POST'])
def add_product():
    data = request.get_json() or {}
    name = data.get('name')
    cat = data.get('cat')
    price = data.get('price')
    img = data.get('img')
    if not name or price is None:
        return jsonify({'error': 'name and price required'}), 400
    conn = get_db()
    cur = conn.cursor()
    cur.execute(
        'INSERT INTO products (name, cat, price, img) VALUES (?, ?, ?, ?)',
        (name, cat, price, img),
    )
    conn.commit()
    product_id = cur.lastrowid
    conn.close()
    return jsonify({'id': product_id}), 201


@app.route('/api/signup', methods=['POST'])
def signup_api():
    data = request.get_json() or {}
    username = data.get('username','').strip()
    password = data.get('password','').strip()
    if not username or not password:
        return jsonify({'error': 'username and password required'}), 400
    conn = get_db()
    cur = conn.cursor()
    try:
        cur.execute(
            'INSERT INTO users (username, password, role) VALUES (?, ?, ?)',
            (username, password, 'user'),
        )
        conn.commit()
        user_id = cur.lastrowid
    except sqlite3.IntegrityError:
        conn.close()
        return jsonify({'error': 'username already exists'}), 409
    conn.close()
    return jsonify({'id': user_id}), 201


@app.route('/api/users', methods=['POST'])
def create_user():
    # admin-only creation
    if request.headers.get('X-Role') != 'admin':
        return jsonify({'error': 'forbidden'}), 403
    data = request.get_json() or {}
    username = data.get('username', '').strip()
    password = data.get('password', '').strip()
    role = data.get('role', 'user').strip()
    if not username or not password:
        return jsonify({'error': 'username and password required'}), 400
    if role not in ('admin', 'user'):
        role = 'user'
    conn = get_db()
    cur = conn.cursor()
    try:
        cur.execute(
            'INSERT INTO users (username, password, role) VALUES (?, ?, ?)',
            (username, password, role),
        )
        conn.commit()
        user_id = cur.lastrowid
    except sqlite3.IntegrityError:
        conn.close()
        return jsonify({'error': 'username already exists'}), 409
    conn.close()
    return jsonify({'id': user_id}), 201


@app.route('/api/users', methods=['GET'])
def list_users():
    if request.headers.get('X-Role') != 'admin':
        return jsonify({'error': 'forbidden'}), 403
    conn = get_db()
    cur = conn.cursor()
    cur.execute('SELECT id, username, role FROM users')
    rows = cur.fetchall()
    conn.close()
    return jsonify([dict(r) for r in rows])


@app.route('/api/users/<int:user_id>', methods=['DELETE'])
def delete_user(user_id):
    if request.headers.get('X-Role') != 'admin':
        return jsonify({'error': 'forbidden'}), 403
    conn = get_db()
    cur = conn.cursor()
    cur.execute('DELETE FROM users WHERE id = ?', (user_id,))
    conn.commit()
    conn.close()
    return jsonify({'status': 'ok'})


@app.route('/api/login', methods=['POST'])
def login_api():
    data = request.get_json() or {}
    username = data.get('username', '').strip()
    password = data.get('password', '').strip()
    if not username or not password:
        return jsonify({'error': 'username and password required'}), 400
    conn = get_db()
    cur = conn.cursor()
    cur.execute('SELECT role FROM users WHERE username = ? AND password = ?', (username, password))
    row = cur.fetchone()
    conn.close()
    if row:
        return jsonify({'role': row['role']})
    else:
        return jsonify({'error': 'invalid credentials'}), 401


@app.route('/api/orders', methods=['POST'])
def place_order():
    data = request.get_json() or {}
    items = data.get('items', [])
    total = data.get('total', 0)
    conn = get_db()
    cur = conn.cursor()
    cur.execute(
        'INSERT INTO orders (items, total) VALUES (?, ?)',
        (json.dumps(items), total),
    )
    conn.commit()
    order_id = cur.lastrowid
    conn.close()
    return jsonify({'id': order_id}), 201


if __name__ == '__main__':
    init_db()
    app.run(debug=True)
