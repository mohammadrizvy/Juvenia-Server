const express = require("express");
const app = express();
const cors = require('cors');
const port = process.env.PORT || 7000
require ("dotenv").config();

// *Middleware

app.use(cors());
app.use(express.json());

app.get("/", (req , res ) => {
    res.send(" Fuck you ")
})


app.listen(port , ( ) => {
    console.log(`Chic is runnig is port ${port}`);
})