from .db import db


class Admin(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(20), nullable=False)
    email = db.Column(db.String(120), nullable=False)
    password = db.Column(db.String(60), nullable=False)

    def __repr__(self):
        return f"Admin('{self.username}', '{self.email}')"

class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(20), unique=True, nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password = db.Column(db.String(60), nullable=False)

    def __repr__(self):
        return f"User('{self.username}', '{self.email}')"


 
    
    
    
    
    
    

    def __repr__(self):
        return f"Accommodation('{self.name}', '{self.email}', '{self.checkinDate}', '{self.checkoutDate}', '{self.guests}', '{self.pkgType}')"


class Contact (db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(120), nullable=False)
    message = db.Column(db.String(1000), nullable=False)

    def __repr__(self):
        return f"Contact('{self.name}', '{self.email}', '{self.message}')"
