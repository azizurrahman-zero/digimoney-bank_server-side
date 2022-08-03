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


app.get('/', (req, res) => {
    res.send("digimoney server start successfully")
})




app.listen(port, () => console.log("Run successfull"))