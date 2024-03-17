require("dotenv").config();
const express = require("express");
const cors = require("cors");
const { MongoClient } = require("mongodb");

const username = process.env.MONGO_USERNAME;
const password = process.env.MONGO_PASSWORD; // '@' should already be percent-encoded in the environment variable
const cluster_address = process.env.MONGO_CLUSTER_ADDRESS;
const database = process.env.MONGO_DATABASE; // assuming 'test' is your database name
const options = "retryWrites=true&w=majority"; // your connection options

const mongoUri = `mongodb+srv://${username}:${password}@${cluster_address}/${database}?${options}`;
const client = new MongoClient(mongoUri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
const app = express();
app.use(cors());
app.use(express.json());

async function main() {
  try {
    await client.connect();
    const database = client.db("ItemsCLicks");
    const links = database.collection("links");

    // Endpoint to record a link click
    app.post("/recordClick", async (req, res) => {
      const { link } = req.body;
      const result = await links.updateOne(
        { link },
        { $inc: { clicks: 1 } },
        { upsert: true }
      );
      res.status(200).json(result);
    });

    // Start the server
    const port = process.env.PORT || 3001;
    app.listen(port, () => {
      console.log(`Server running at http://localhost:${port}`);
    });
  } catch (e) {
    console.error(e);
  }
}

main().catch(console.error);
