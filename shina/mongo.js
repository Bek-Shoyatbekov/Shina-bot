import { MongoClient } from "mongodb";
import { config } from "dotenv";
config();
// Connection URL
const url = process.env.MONGO_URI;

// Database name
const dbName = "shinaAdmin";

// Create a new document in the collection
const createDocument = async (document) => {
  const client = new MongoClient(url);
  return new Promise((resolve, reject) => {
    client
      .connect()
      .then(async () => {
        const db = client.db(dbName);
        const collection = db.collection("products");
        const result = await collection.insertOne(document);
        resolve(result);
      })
      .catch((err) => {
        reject(err);
      })
      .finally(() => {
        client.close();
      });
  });
};

// Find documents in the collection
const allProducts = async () => {
  const client = new MongoClient(url);
  try {
    await client.connect();
    const db = client.db(dbName);
    const collection = db.collection("products");
    const documents = await collection.find().toArray();
    return documents;
  } finally {
    client.close();
  }
};

// find data by parameters and return it
const findDocument = async (filter) => {
  const client = new MongoClient(url);
  return new Promise((resolve, reject) => {
    client
      .connect()
      .then(async () => {
        const db = client.db(dbName);
        const collection = db.collection("products");
        const documents = await collection.find(filter).toArray();
        resolve(documents);
      })
      .catch((err) => {
        reject(err);
      })
      .finally(() => {
        client.close();
      });
  });
};

// Update a document in the collection
const updateDocument = async (filter, update) => {
  const client = new MongoClient(url);
  return new Promise((resolve, reject) => {
    client
      .connect()
      .then(async () => {
        const db = client.db(dbName);
        const collection = db.collection("products");
        const result = await collection.updateOne(filter, { $set: update });
        resolve(result);
      })
      .catch((err) => {
        reject(err);
      })
      .finally(() => {
        client.close();
      });
  });
};

// Delete a document from the collection
const deleteDocument = async (filter) => {
  const client = new MongoClient(url);
  return new Promise((resolve, reject) => {
    client
      .connect()
      .then(async () => {
        const db = client.db(dbName);
        const collection = db.collection("products");
        const result = await collection.deleteOne(filter);
        resolve(result);
      })
      .catch((err) => {
        reject(err);
      })
      .finally(() => {
        client.close();
      });
  });
};

// get one field from all documents
// SELECT diameter FROM products WHERE company = 'Samsung'
const getByField = async (filter, field) => {
  const client = new MongoClient(url);
  return new Promise((resolve, reject) => {
    client
      .connect()
      .then(async () => {
        const db = client.db(dbName);
        const collection = db.collection("products");
        const documents = await collection
          .find(filter)
          .project({ [field]: 1, _id: 0 })
          .toArray();
        resolve(documents);
      })
      .catch((err) => {
        reject(err);
      })
      .finally(() => {
        client.close();
      });
  });
};

const getUSDRate = () => {
  const client = new MongoClient(url);
  return new Promise((resolve, reject) => {
    client
      .connect()
      .then(async () => {
        const db = client.db(dbName);
        const collection = db.collection("cons");
        const document = await collection
          .findOne({ id: 0 })
        resolve(document.val);
      })
      .catch((err) => {
        reject(err);
      })
      .finally(() => {
        client.close();
      });
  });
  let rate = 11600;
  return rate;
};

// Usage examples
//console.log(await createDocument({ name: 'John', age: 30, city: 'New York' }))
// findDocuments();
// updateDocument({ name: 'John' }, { city: 'San Francisco' });
// deleteDocument({ name: 'John' });

// Get specific fields in the collection
// const updateDocument = async (filter, update) => {
//   const client = new MongoClient(url);
//   return new Promise((resolve, reject) => {
//     client
//       .connect()
//       .then(async () => {
//         const db = client.db(dbName);
//         const collection = db.collection("products");
//         const result = await collection.updateOne(filter, { $set: update });
//         resolve(result);
//       })
//       .catch((err) => {
//         reject(err);
//       })
//       .finally(() => {
//         client.close();
//       });
//   });
// };

export {
  createDocument,
  allProducts,
  getByField,
  findDocument,
  updateDocument,
  deleteDocument,
  getUSDRate,
};
