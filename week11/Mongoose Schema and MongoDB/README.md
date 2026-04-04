# Week 11 - Mongoose Schema and MongoDB CRUD

This project extends the starter Mongoose customer example with two additional models:
- Hotel
- Amenities

It performs CRUD-style operations against:
- Local MongoDB
- MongoDB Atlas

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

From this folder, run:

node index.js

The script currently includes local and Atlas connection strings directly in `index.js`.

## Issues Encountered and Fixes

1. Atlas SRV DNS error on first connection attempt
  - Error: `querySrv ECONNREFUSED _mongodb._tcp.cluster0...`
  - Cause: Node DNS resolver was not successfully resolving SRV records in this network.
  - Fix: Added Node DNS servers at runtime in `index.js`:
    - `dns.setServers(['8.8.8.8', '1.1.1.1'])`

2. Different behavior between `nslookup` and Node DNS
  - `nslookup` SRV returned valid Atlas records.
  - Node `dns.resolveSrv()` initially failed with `ECONNREFUSED`.
  - After setting DNS servers in code, Atlas connected successfully.

3. Atlas network access
  - During testing, open access (`0.0.0.0/0`) may be used temporarily.
  - Recommended after testing: remove `0.0.0.0/0` and allow only current client IP.

## Notes

- Local connection URI in code:
  `mongodb://127.0.0.1:27017/myCustomerDB`
- Atlas connection URI is currently in `index.js`.
- Before publishing to a public repo, rotate Atlas credentials and move them to environment variables.
