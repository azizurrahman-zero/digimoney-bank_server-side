const express = require('express')
const { MongoClient, ServerApiVersion } = require('mongodb');
const app = express()
const cors = require('cors')
app.use(cors())
app.use(express.json())


const port = process.env.PORT || 4000


// username: digi_money1
// password: 0cmJopaqLVn7snJi



const uri = "mongodb+srv://digi_money1:0cmJopaqLVn7snJi@cluster0.928uo.mongodb.net/?retryWrites=true&w=majority";
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });
client.connect(err => {
    const collection = client.db("test").collection("devices");
    console.log('db connected');
    // perform actions on the collection object
    client.close();
});
async function run() {
    try{
        await client.connect();
        const usersCollection = client.db("digi_money1").collection("users");


        app.get("/users", async (req, res) => {
            const query = {};
            const cursor = usersCollection.find(query);
            const users = await cursor.toArray();
            res.send(users);
          });

          app.put("/user/:email", async (req, res) => {
            const email = req.params.email;
            const user = req.body;
            const filter = { email: email };
            const options = { upsert: true };
            const updateDoc = {
              $set: user,
            };
            const result = await usersCollection.updateOne(filter, updateDoc, options);
            
            res.send({ result});
          });
    }finally {
  }
}
run().catch(console.dir);

app.get('/', (req, res) => {
    res.send("digimoney server start successfully")
})




app.listen(port, () => console.log("Run successfully"))