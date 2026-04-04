# Week 11 - Mongoose Schema and MongoDB CRUD

This project extends the starter Mongoose customer example with two additional models:
- Hotel
- Amenities

It performs CRUD-style operations against:
- Local MongoDB
- MongoDB Atlas (when environment variable is provided)

## Files

- index.js: Main script for connection, inserts, queries, and disconnect
- customerModel.js: Customer schema/model
- hotelModel.js: Hotel schema/model
- amenitiesModel.js: Amenities schema/model

## Schema Fields

### Hotel
- name (String, required, unique)
- rating (Number, required, 1-5)
- location (String, required)
- description (String, required)

### Amenities
- pool (Boolean, required)
- lawn (Boolean, required)
- BBQ (Boolean, required)
- laundry (Boolean, required)

## Data Inserted

The script inserts 3 documents into each collection:
- Customers
- Hotels
- Amenities

It clears existing data in these collections before inserting.

## Queries

The script runs:
- Customer query by lastName = "Doe"
- Hotel query by name = "Aloha Beach Resort"
- Amenities query by pool = true

## Run Locally

1. Start local MongoDB service
2. From this folder, run:

node index.js

## Run with Atlas

In PowerShell, set your Atlas URI first:

$env:MONGODB_ATLAS_URI="mongodb+srv://<username>:<password>@<cluster-url>/<db-name>?retryWrites=true&w=majority"
node index.js

If MONGODB_ATLAS_URI is not set, the script runs local only and skips Atlas.

## Notes

- Local connection URI in code:
  mongodb://127.0.0.1:27017/myCustomerDB
- Atlas URI is read from environment variable:
  MONGODB_ATLAS_URI
