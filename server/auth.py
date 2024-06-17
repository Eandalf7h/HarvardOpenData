import firebase_admin
from firebase_admin import credentials
from firebase_admin import firestore
from google.oauth2 import id_token
from google.auth.transport import requests
import server.constants as constants

import hashlib
import datetime

# returns the MD5 hash of the user's email.
# used for the ID of the responses doc
def email_hash(email):
    return hashlib.md5(email.encode()).hexdigest()

# checks if the current user exists in DB and has the correct userId
def is_authenticated(userEmail, userId, db):
    if userEmail is None or userId is None:
        return False
    emails_ref = db.collection("emails")
    userDoc = emails_ref.document(userEmail)
    if userDoc is None:
        return False
    userDict = userDoc.to_dict() 
    
    if userDict["id"] == userId:
        return True
    else:
        raise Exception("Email and stored ID do not match")

# if not currently authenticated, try to authenticate with google backend
# and create the new user if authentication works
# If just want to authenticate, db should be null and will return None on success
def authenticate_new(token, db):
    idinfo = id_token.verify_oauth2_token(token, requests.Request(), constants.GOOGLE_CLIENT_ID)
    userId = idinfo["sub"]
    userEmail = idinfo["email"]
    hd = idinfo["hd"]
    if hd is None or hd not in ["college.harvard.edu"]:
        raise Exception("Not a @college.harvard.edu email!")
    if db is not None:
        return create_user(userEmail, userId, db)
    else:
        return None

# gets a user by their email and corresponding ID
# if user does not exist, create in DB and return new doc ref
# assumes email and id already authenticated with google backend
# throws exceptions if email or ID is None, or if they do not match
def create_user(userEmail, userId, db):
    emails_ref = db.collection("emails")
    if userEmail is None:
        raise Exception("User email not defined")
    if userId is None:
        raise Exception("User ID not defined")
    if is_authenticated(userEmail, userId, db):
        return emails_ref.document(userEmail)
    else: 
        emails_ref.document(userEmail).set({
            "id" : userId,
            "has_demographics" : False,
            "last_contact" : datetime.datetime.now,
            "monthly_responses" : [],
            "total_responses" : 0,
        })
        db.collection("responses").document(email_hash(userEmail)).set({
            "demographics" : {}
        })
        return emails_ref.document(userEmail)