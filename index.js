const express = require("express");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
require("dotenv").config();

const app = express();
const port = process.env.PORT || 7000;

// Middleware
app.use(cors());
app.use(express.json());

const verifyJwt = (req, res, next) => {
  const authorization = req.headers.authorization;
  if (!authorization) {
    return res
      .status(401)
      .send({ error: true, message: "Unauthorized access" });
  }

  const token = authorization.split(" ")[1];
  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
    if (err) {
      return res
        .status(401)
        .send({ error: true, message: "Unauthorized access" });
    }
    req.decoded = decoded;
    next();
  });
};

// MongoDB Connection
const uri = `mongodb+srv://dbUser:${process.env.DB_PASSWORD}@cluster0.ss5j1ke.mongodb.net/?appName=Cluster0`;
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
<<<<<<< HEAD
    // Connect to MongoDB
    await client.connect();
    console.log("Connected to MongoDB!");
=======
    await client.connect();
>>>>>>> ebe4eb9a2d200b0fb3d5a417b470b407102be86e

    const database = client.db("chicDB");
    const allCollections = database.collection("allCollections");
    const usersCollections = database.collection("usersCollections");
    const cartCollection = database.collection("cartCollection");

    // JWT Endpoint
    app.post("/jwt", (req, res) => {
      const user = req.body;
      const token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, {
<<<<<<< HEAD
        expiresIn: "12h",
=======
        expiresIn: "1h",
>>>>>>> ebe4eb9a2d200b0fb3d5a417b470b407102be86e
      });
      res.send({ token });
    });

    // Verify admin middleware
<<<<<<< HEAD
=======

>>>>>>> ebe4eb9a2d200b0fb3d5a417b470b407102be86e
    const verifyAdmin = async (req, res, next) => {
      const email = req.decoded.email;
      const query = { email: email };
      const user = await usersCollections.findOne(query);
      if (user?.role !== "admin") {
        return res
          .status(403)
          .send({ error: true, message: "Forbidden access" });
      }
      next();
    };

<<<<<<< HEAD
    app.post("/allCollections", verifyJwt, verifyAdmin, async (req, res) => {
      const newProduct = req.body;
      
      try {
        const result = await allCollections.insertOne(newProduct);
        res.status(201).send(result);
      } catch (error) {
        console.error("Error adding product:", error);
        res.status(500).send({ error: "Failed to add product" });
      }
    });

=======
>>>>>>> ebe4eb9a2d200b0fb3d5a417b470b407102be86e
    // Get all collections
    app.get("/allCollections", async (req, res) => {
      const result = await allCollections.find().toArray();
      res.send(result);
    });

<<<<<<< HEAD
    app.delete("/allCollections/:id", verifyJwt, verifyAdmin, async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
    
      try {
        const result = await allCollections.deleteOne(query);
        if (result.deletedCount === 1) {
          res.send({ success: true, message: "Product deleted successfully" });
        } else {
          res.status(404).send({ error: true, message: "Product not found" });
        }
      } catch (error) {
        res.status(500).send({ error: "Failed to delete product" });
      }
    });

=======
>>>>>>> ebe4eb9a2d200b0fb3d5a417b470b407102be86e
    app.get("/allCollections/:id", async (req, res) => {
      const id = req.params.id;
      console.log(`Fetching product with ID: ${id}`);
      const query = { _id: id };
      try {
        const product = await allCollections.findOne(query);
        if (product) {
          res.send(product);
        } else {
          res.status(404).send({ error: true, message: "Product not found" });
        }
      } catch (error) {
        console.error("Error fetching product:", error);
        res.status(500).send({ error: "Failed to retrieve product" });
      }
    });
<<<<<<< HEAD

=======
>>>>>>> ebe4eb9a2d200b0fb3d5a417b470b407102be86e
    // Save user
    app.post("/users", async (req, res) => {
      const user = req.body;
      const query = { email: user.email };
      const existingUser = await usersCollections.findOne(query);
      if (existingUser) {
        return res.send({ message: "User already exists" });
      }
      const result = await usersCollections.insertOne(user);
      res.send(result);
    });

    // Get users
    app.get("/users", verifyJwt, verifyAdmin, async (req, res) => {
      const result = await usersCollections.find().toArray();
      res.send(result);
    });

    // Check if user is admin
    app.get("/users/admin/:email", verifyJwt, async (req, res) => {
      const email = req.params.email;
      if (req.decoded.email !== email) {
        return res.send({ admin: false });
      }

      const query = { email: email };
      const user = await usersCollections.findOne(query);
      const result = { admin: user?.role === "admin" };
      res.send(result);
    });

    // Update user to admin
    app.patch("/users/admin/:id", async (req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) };
      const updatedDoc = { $set: { role: "admin" } };
      const result = await usersCollections.updateOne(filter, updatedDoc);
      res.send(result);
    });

<<<<<<< HEAD
    app.patch("/users/remove-admin/:id", async (req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) };
      const updatedDoc = { $set: { role: "user" } }; // Assuming the role reverts to 'user'
      const result = await usersCollections.updateOne(filter, updatedDoc);
      res.send(result);
    });

=======
>>>>>>> ebe4eb9a2d200b0fb3d5a417b470b407102be86e
    // Remove user
    app.delete("/users/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await usersCollections.deleteOne(query);
      res.send(result);
    });

    // Post cart data
    app.post("/carts", async (req, res) => {
      const item = req.body;
      const itemWithDate = { ...item, date: new Date().toISOString() };
      const result = await cartCollection.insertOne(itemWithDate);
      res.send(result);
    });

    // Get cart data
    app.get("/carts", verifyJwt, async (req, res) => {
      const email = req.query.email;
      if (!email) {
        return res.send([]);
      }
      const decodedEmail = req.decoded.email;
      if (email !== decodedEmail) {
        return res
          .status(403)
          .send({ error: true, message: "Forbidden access" });
      }
      const query = { email: email };
      const result = await cartCollection.find(query).toArray();
      res.send(result);
    });

    // Delete cart item
    app.delete("/carts/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      try {
        const result = await cartCollection.deleteOne(query);
        res.send(result);
      } catch (error) {
        res.status(500).send({ error: "Failed to delete item" });
      }
    });

    // Confirm connection
    await client.db("admin").command({ ping: 1 });
    console.log("Connected to MongoDB!");
<<<<<<< HEAD
  } catch (err) {
    console.error("Failed to connect to MongoDB:", err);
    process.exit(1);
=======
  } finally {
    // Leave client open to avoid closing connections prematurely
>>>>>>> ebe4eb9a2d200b0fb3d5a417b470b407102be86e
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("Welcome to Chic!");
});

app.listen(port, () => {
<<<<<<< HEAD
  console.log(`Juvenia is running on port ${port}`);
=======
  console.log(`Chic is running on port ${port}`);
>>>>>>> ebe4eb9a2d200b0fb3d5a417b470b407102be86e
});
