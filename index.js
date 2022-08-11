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
    //    create new user and save the user data to database 
        app.post("/adduser", async (req, res) => {
            const user = req.body;
            const result = await usersCollection.insertOne(user);
            res.send(result);
            console.log(result)
          });

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
            console.log(id)
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
        app.post('/approvedUser', async (req, res) => {
            const newUser = req.body;
         
             const result = await approvedUsersCollection.insertOne(newUser)
             console.log(result)
             res.send(result);

        })

     
      
          app.put("/approvedUser/admin/:email", async (req, res) => {
            const email = req.params.email;
            const filter = { email: email };
            const updateDoc = {
              $set: { role: "admin" },
            };
            const result = await approvedUsersCollection.updateOne(filter, updateDoc);
            res.send(result);
          });
          
          app.get("/approvedUser/:id", async (req, res) => {
            const id = req.params.id;
            const query = { _id: id };
            const user = await approvedUsersCollection.findOne(query);
            res.send(user);
          });

    } finally {
    }
}
run().catch(console.dir);

app.get('/', (req, res) => {
    res.send("digimoney server start successfully")
})




app.listen(port, () => console.log("Run successfully"))