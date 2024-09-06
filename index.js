const express = require("express");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
require("dotenv").config();

const app = express();
const port = process.env.PORT || 7000;

//! Middleware
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

//! MongoDB Connection
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
    //! Connect to MongoDB
    await client.connect();
    console.log("Connected to MongoDB!");

    const database = client.db("chicDB");
    const allCollections = database.collection("allCollections");
    const usersCollections = database.collection("usersCollections");
    const cartCollection = database.collection("cartCollection");

    //! JWT Endpoint
    app.post("/jwt", (req, res) => {
      const user = req.body;
      const token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, {
        expiresIn: "24h",
      });
      res.send({ token });
    });

    //! Verify admin middleware
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

    // ! Add new product to the colltections
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

    //! Get all collections
    app.get("/allCollections", async (req, res) => {
      const result = await allCollections.find().toArray();
      res.send(result);
    });
    // !Delete single products

    app.delete("/allCollections/manage-items/:id", async (req, res) => {
      const id = req.params.id;
      console.log("Product delete id :", id)
      const query = { _id:  id };
      const result = await allCollections.deleteOne(query);
      res.send(result);
    });

    // !Find single product
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
    //! Save user
    app.post("/users", async (req, res) => {
      const user = req.body;
      const query = { email: user.email };
      const existingUser = await usersCollections.findOne(query);
      if (existingUser) {
        return res.send({ message: "User already exists" });
      }

      // Implementing the user creation date
      const now = new Date();

      const formattedDate = `${now.getDate()} ${now.toLocaleString("default", {
        month: "short",
      })} ${now.getFullYear()}`;

      user.createdAt = formattedDate;
      user.status = "Active"

      const result = await usersCollections.insertOne(user);
      res.send(result);
    });

    //! Get users
    app.get("/users", async (req, res) => {
      const result = await usersCollections.find().toArray();
      res.send(result);
    });

    app.get


    //! Check if user is admin
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

    //! Update user to admin
    app.patch("/users/admin/:id", async (req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) };
      const updatedDoc = { $set: { role: "admin" } };
      const result = await usersCollections.updateOne(filter, updatedDoc);
      res.send(result);
    });

    app.patch("/users/remove-admin/:id", async (req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) };
      const updatedDoc = { $set: { role: "user" } }; //! Assuming the role reverts to 'user'
      const result = await usersCollections.updateOne(filter, updatedDoc);
      res.send(result);
    });

    //! Remove user
    app.delete("/users/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await usersCollections.deleteOne(query);
      res.send(result);
    });

app.get("/users/:id", async (req, res) => {
  const id = req.params.id;

  try {
    const query = { _id: new ObjectId(id) }; // Convert id string to ObjectId
    const result = await usersCollections.findOne(query);

    if (!result) {
      return res.status(404).send({ message: "User not found" });
    }

    res.send(result);
  } catch (error) {
    console.error("Error fetching user:", error);
    res.status(500).send({ message: "Internal server error" });
  }
});
    //! Post cart data
    app.post("/carts", async (req, res) => {
      const item = req.body;
      const itemWithDate = { ...item, date: new Date().toISOString() };
      const result = await cartCollection.insertOne(itemWithDate);
      res.send(result);
    });

    //! Get cart data
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

    //! Delete cart item
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

    //! Confirm connection
    await client.db("admin").command({ ping: 1 });
    console.log("Connected to MongoDB!");
  } catch (err) {
    console.error("Failed to connect to MongoDB:", err);
    process.exit(1);
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("Welcome to Chic!");
});

app.listen(port, () => {
  console.log(`Juvenia is running on port ${port}`);
});
