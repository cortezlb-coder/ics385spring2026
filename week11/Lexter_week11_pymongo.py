'''
Name: Lexter Cortez
Assignment: Week 11 PyMongo CRUD
Description: Create, clean, insert, update, query, and drop Customer collection in MongoDB using PyMongo
Filename: Lexter_week11_pymongo.py
Date: 04/02/2026
'''

from pymongo import MongoClient, ASCENDING

# Connect to local MongoDB
client = MongoClient("mongodb://localhost:27017/")

# Create / connect to database
db = client["Week11DB"]

# 1. Create Collection Customer
# Drop it first if it already exists so the script always runs clean
if "Customer" in db.list_collection_names():
    db["Customer"].drop()

customer_collection = db["Customer"]
print("Customer collection created.")

# Create unique index on email so it matches assignment requirement
customer_collection.create_index([("email", ASCENDING)], unique=True)
print("Unique index created for email.")

# 2. Delete all records in the Customer collection to clean up the database
customer_collection.delete_many({})
print("All records deleted from Customer collection.")

# 3. Insert many to insert 3 separate customer records
customers = [
    {
        "firstName": "Tracer",
        "lastName": "Oxton",
        "email": "tracer.oxton@email.com",
        "phone": "808-111-1111"
    },
    {
        "firstName": "Reaper",
        "lastName": "Reyes",
        "email": "reaper.reyes@email.com",
        "phone": "808-222-2222"
    },
    {
        "firstName": "Mercy",
        "lastName": "Ziegler",
        "email": "mercy.ziegler@email.com",
        "phone": "808-333-3333"
    }
]

customer_collection.insert_many(customers)
print("3 customer records inserted.")

# 4. Update one customer's email
customer_collection.update_one(
    {"lastName": "Oxton"},
    {"$set": {"email": "tracer.updated@email.com"}}
)
print("Tracer's email updated.")

# Update another customer's phone number
customer_collection.update_one(
    {"firstName": "Mercy"},
    {"$set": {"phone": "808-999-9999"}}
)
print("Mercy's phone updated.")

# 5. Query one customer based on last name
customer_by_lastname = customer_collection.find_one({"lastName": "Reyes"})
print("\nCustomer found by last name:")
print(customer_by_lastname)

# Query another customer based on first name
customer_by_firstname = customer_collection.find_one({"firstName": "Mercy"})
print("\nCustomer found by first name:")
print(customer_by_firstname)

# 6. Drop Collection Customer
customer_collection.drop()
print("\nCustomer collection dropped.")

# Close connection
client.close()
print("MongoDB connection closed.")
