const mongoose = require('mongoose');
const dns = require('dns');
const Customer = require('./customerModel');
const Hotel = require('./hotelModel');
const Amenities = require('./amenitiesModel');

// Force public resolvers because local router DNS intermittently refuses SRV queries.
dns.setServers(['8.8.8.8', '1.1.1.1']);

const localConnectionString = 'mongodb://127.0.0.1:27017/myCustomerDB';
const atlasConnectionString = 'mongodb+srv://cortez:12Maui34@cluster0.b3uwvsd.mongodb.net/myCustomerDB?retryWrites=true&w=majority&appName=Cluster0';
const atlasFallbackConnectionString = 'mongodb://cortez:12Maui34@ac-u5vzjcq-shard-00-00.b3uwvsd.mongodb.net:27017,ac-u5vzjcq-shard-00-01.b3uwvsd.mongodb.net:27017,ac-u5vzjcq-shard-00-02.b3uwvsd.mongodb.net:27017/myCustomerDB?ssl=true&replicaSet=atlas-2uarcs-shard-0&authSource=admin&retryWrites=true&w=majority&appName=Cluster0';

const customersToInsert = [
  {
    firstName: 'Lexter',
    lastName: 'Cortez',
    email: 'lexter.cortez@example.com',
    phone: '555-123-4567'
  },
  {
    firstName: 'Jane',
    lastName: 'Doe',
    email: 'jane.doe@example.com',
    phone: '555-987-6543'
  },
  {
    firstName: 'Alice',
    lastName: 'Johnson',
    email: 'alice.johnson@example.com',
    phone: '555-555-1234'
  }
];

const hotelsToInsert = [
  {
    name: 'Aloha Beach Resort',
    rating: 5,
    location: 'Honolulu, HI',
    description: 'Oceanfront resort with private beach access.'
  },
  {
    name: 'Mountain View Lodge',
    rating: 4,
    location: 'Wailuku, HI',
    description: 'Scenic lodge with volcano and valley views.'
  },
  {
    name: 'City Center Suites',
    rating: 3,
    location: 'Hilo, HI',
    description: 'Modern business hotel near shopping and dining.'
  }
];

const amenitiesToInsert = [
  { pool: true, lawn: true, BBQ: true, laundry: true },
  { pool: false, lawn: true, BBQ: false, laundry: true },
  { pool: true, lawn: false, BBQ: true, laundry: false }
];

async function runCrudForConnection(connectionUri, connectionName) {
  try {
    await mongoose.connect(connectionUri);
    console.log(`Connected to ${connectionName}.`);

    await Customer.deleteMany({});
    await Hotel.deleteMany({});
    await Amenities.deleteMany({});

    const insertedCustomers = await Customer.insertMany(customersToInsert);
    const insertedHotels = await Hotel.insertMany(hotelsToInsert);
    const insertedAmenities = await Amenities.insertMany(amenitiesToInsert);

    console.log(`Inserted ${insertedCustomers.length} customers.`);
    console.log(`Inserted ${insertedHotels.length} hotels.`);
    console.log(`Inserted ${insertedAmenities.length} amenities records.`);

    const customerByLastName = await Customer.find({ lastName: 'Doe' });
    const hotelByName = await Hotel.find({ name: 'Aloha Beach Resort' });
    const amenitiesWithPool = await Amenities.find({ pool: true });

    console.log("Customers with last name 'Doe':", customerByLastName);
    console.log("Hotels named 'Aloha Beach Resort':", hotelByName);
    console.log('Amenities where pool is true:', amenitiesWithPool);
  } catch (error) {
    console.error(`Error running operations for ${connectionName}:`, error.message);
    throw error;
  } finally {
    await mongoose.disconnect();
    console.log(`Disconnected from ${connectionName}.`);
  }
}

async function main() {
  await runCrudForConnection(localConnectionString, 'Local MongoDB');

  try {
    await runCrudForConnection(atlasConnectionString, 'MongoDB Atlas');
  } catch (error) {
    const message = error && error.message ? error.message : '';
    if (message.includes('querySrv ECONNREFUSED')) {
      console.log('SRV DNS lookup refused. Retrying Atlas with non-SRV URI...');
      await runCrudForConnection(atlasFallbackConnectionString, 'MongoDB Atlas (fallback)');
    } else {
      throw error;
    }
  }
}

main();