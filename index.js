const express = require('express')
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const app = express()
const cors = require('cors')
app.use(cors())
app.use(express.json())


const port = process.env.PORT || 4000


// username: digi_money1
// password: 0cmJopaqLVn7snJi



const uri = "mongodb+srv://digi_money1:0cmJopaqLVn7snJi@cluster0.928uo.mongodb.net/?retryWrites=true&w=majority";
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });


async function run() {
    try {
        await client.connect();
        const usersCollection = client.db("digi_money1").collection("users");
        const approvedUsersCollection = client.db("digi_money1").collection("approvedUsers");


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

            res.send({ result });
        });

        // // delete from request user database
        // app.delete('/users/:id', async (req, res) => {
        //     const id = req.params.id;
        //     const query = { _id: ObjectId(id) };
        //     const result = await usersCollection.deleteOne(query);
        //     res.send(result);
        // })

        // delete from users a user
        app.delete('/users/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const result = await usersCollection.deleteOne(query);
            res.send(result);
        })

        app.get('/approvedUsers', async (req, res) => {
            const query = {};
            const cursor = approvedUsersCollection.find(query);
            const users = await cursor.toArray();
            res.send(users);
        })

        // post approved users
        app.post('/approvedUsers', async (req, res) => {
            const newUser = req.body;
            const result = await approvedUsersCollection.insertOne(newUser)
            res.send(result);

        })




    } finally {
    }
}
run().catch(console.dir);

app.get('/', (req, res) => {
    res.send("digimoney server start successfully")
})




app.listen(port, () => console.log("Run successfully"))