# Online Computer Hardware Selling Web Project

## Overview
A modern, responsive web application for selling computer hardware online. The platform provides a sleek, premium user experience with a dark‑mode‑first design, glassmorphism UI elements, and smooth micro‑animations. It includes a robust backend powered by Flask, a clean frontend built with vanilla HTML, CSS, and JavaScript, and essential e‑commerce features such as product browsing, cart management, order processing, and admin dashboards.

## Features
- **Premium UI**: Dark theme, glassmorphism, and subtle animations for an engaging experience.
- **Product Catalog**: Browse, search, and filter hardware items.
- **Shopping Cart**: Add, update, and remove items with real‑time totals.
- **User Authentication**: Secure login with password hashing and role‑based access control.
- **Admin Dashboard**: Manage products, orders, and users.
- **Responsive Design**: Works across desktop, tablet, and mobile devices.
- **RESTful API**: Backend endpoints for all core operations.

## Tech Stack
- **Frontend**: HTML5, CSS3 (custom design system), JavaScript (ES6+)
- **Backend**: Python 3.11, Flask, Flask‑RESTful, SQLAlchemy
- **Database**: SQLite (development) / PostgreSQL (production)
- **Styling**: Custom CSS with HSL color palette, glassmorphism, and CSS transitions.

## Getting Started
### Prerequisites
- Python 3.11+ 
- `pip` package manager
- Git (optional)

### Installation
```bash
# Clone the repository
git clone https://github.com/yourusername/Online_Computer_Hardware_Selling_Web_Project.git
cd Online_Computer_Hardware_Selling_Web_Project

# Create a virtual environment
python -m venv venv
source venv/bin/activate  # On Windows use `venv\Scripts\activate`

# Install dependencies
pip install -r requirements.txt
```

### Running the Application
```bash
# Set environment variables (adjust as needed)
export FLASK_APP=backend/app.py
export FLASK_ENV=development

# Initialise the database (first run only)
flask db init
flask db migrate
flask db upgrade

# Start the development server
flask run
```
Open your browser and navigate to `http://127.0.0.1:5000`.

## API Endpoints
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/products` | Retrieve list of products |
| GET | `/api/products/<id>` | Retrieve a single product |
| POST | `/api/cart` | Add item to cart |
| PUT | `/api/cart/<item_id>` | Update cart item quantity |
| DELETE | `/api/cart/<item_id>` | Remove item from cart |
| POST | `/api/orders` | Create a new order |
| GET | `/api/admin/users` | Admin: list users |
| POST | `/api/auth/login` | User login |
| POST | `/api/auth/register` | User registration |

## Contributing
1. Fork the repository.
2. Create a feature branch (`git checkout -b feature/your-feature`).
3. Commit your changes with clear messages.
4. Push to your fork and open a Pull Request.

Please follow the existing code style and include tests for new functionality.

## License
This project is licensed under the MIT License – see the [LICENSE](LICENSE) file for details.

---
*Generated on 2026‑03‑12*
