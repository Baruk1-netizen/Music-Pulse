from config import app
from flask_sqlalchemy import SQLAlchemy

try: 
    app.config['SECRET_KEY'] = '5791628bb0b13ce0c676dfde280ba245'
    app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///touristDB.db'
    db = SQLAlchemy(app)
    with app.app_context():
        db.create_all() 

# with app.app_context():
#     from tours.models import Admin
#     from tours import db
#     existing_admin = Admin.query.filter_by(email='admin@gmail.com').first()
#     if existing_admin is None:
#         new_admin = Admin(username='admin1', email='admin@gmail.com', password='admin123')
#         db.session.add(new_admin)
#         db.session.commit()
#     else:
#         print("Email already exists in the admin table. Please choose a different email.")
    print("Database connected successfully")
except Exception as e:
    print(f"Error connecting to the database: {e}")
    db = None
