// import express from "express";
const express = require("express");
const app = express();
const cors = require("cors");
const port = process.env.PORT || 7000;
const jwt = require("jsonwebtoken");
require("dotenv").config();

// *Middleware

app.use(cors());
app.use(express.json());

const verifyJwt = (req, res, next) => {
  const authorization = req.headers.authorization; // Fix here
  console.log("Authorization token form verify jwt : ",authorization)
  if (!authorization) {
    return res.status(401).send({ error: true, message: "Unauthorized access" });
  }

  const token = authorization.split(' ')[1];
  
  console.log("Splited token : ",token)

  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
    if (err) {
      return res.status(401).send({ error: true, message: "Unauthorized access" });
    }
    req.decoded = decoded;
    next();
  });
};


//! MONGODB

const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const uri = `mongodb+srv://dbUser:${process.env.DB_PASSWORD}@cluster0.ss5j1ke.mongodb.net/?appName=Cluster0`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();

    const database = client.db("chicDB");
    const allCollections = database.collection("allCollections");
    const usersCollections = database.collection("usersCollections");
    const cartCollection = database.collection("cartCollection");

    // ? JWT

    app.post("/jwt" , (req , res) => {
      const user = req.body;
      const token = jwt.sign(user , process.env.ACCESS_TOKEN_SECRET , {expiresIn : "1h" })
      console.log("Token form app.post : " , token)
      res.send({token})
    })

    // ? Getting all collections

    app.get("/allCollections", async (req, res) => {
      const result = await allCollections.find().toArray();
      res.send(result);
    });

    // ? Saving user

    app.post("/users", async (req, res) => {
      const user = req.body;
      const query = { email: user.email };
      const existingUser = await usersCollections.findOne(query);
      console.log("Existsing user : ", existingUser);
      if (existingUser) {
        return res.send({ message: "User already exists" });
      }
      console.log(user);
      const result = await usersCollections.insertOne(user);
      res.send(result);
    });

    // ? Get users API

    app.get("/users", async (req, res) => {
      const result = await usersCollections.find().toArray();
      res.send(result);
    });

    // ? User Update to ADMIN

    app.patch("/users/admin/:id", async (req, res) => {
      const id = req.params.id;
      // console.log(id);
      const filter = { _id: new ObjectId(id) };
      const updatedDoc = {
        $set: {
          role: "admin",
        },
      };
      const result = await usersCollections.updateOne(filter, updatedDoc);
      res.send(result);
    });

    // ? Remove user

    app.delete("/users/:id", async (req, res) => {
      const id = req.params.id;
      // console.log(id,"delete user")
      const query = { _id: new ObjectId(id) };
      const result = await usersCollections.deleteOne(query);
      res.send(result);
    });

    //? Posting cart data

    app.post("/carts", async (req, res) => {
      const item = req.body;
      console.log(item);
      const today = new Date().toISOString();
      const itemWithDate = {
        ...item,
        date: today, // Adding the current date and time
      };
      const result = await cartCollection.insertOne(itemWithDate);
      res.send(result);
    });

    // ? Gettig
    app.get('/carts', verifyJwt, async (req, res) => {
      const email = req.query.email;
      if (!email) {
        return res.send([]);
      }
      const decodedEmail = req.decoded.email;
      if (email !== decodedEmail) {
        return res.status(403).send({ error: true, message: "Forbidden access" });
      }
      const query = { email: email };
      const result = await cartCollection.find(query).toArray();
      res.send(result);
    });

    // ? Deleting cart

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
    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send(" Fuck you ");
});

app.listen(port, () => {
  console.log(`Chic is runnig is port ${port}`);
});
