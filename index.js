const express = require("express");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const jwt = require("jsonwebtoken");
const app = express();
const moment = require('moment')
const cors = require("cors");
app.use(cors());
app.use(express.json());
const nodemailer = require("nodemailer");

const port = process.env.PORT || 4000;

// username: digi_money1
// password: 0cmJopaqLVn7snJi

const uri =
  "mongodb+srv://digi_money1:0cmJopaqLVn7snJi@cluster0.928uo.mongodb.net/?retryWrites=true&w=majority";
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverApi: ServerApiVersion.v1,
});

// ============================JWT Token ===========================

function verifyJWT(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).send({ message: "UnAuthorized access" });
  }
  const token = authHeader.split(" ")[1];
  jwt.verify(token, '335426bed56892395f2c094e46516c4a2586e6d824c4b62ab099eab0538d8959307ec9b19873eca3f8b18c73848c033015f6876ee001ad4f15b3a96f1f909338', function (err, decoded) {
    if (err) {
      return res.status(403).send({ message: "Forbidden access" });
    }
    req.decoded = decoded;
    next();
  });
}

// ============================================== Sending to receiver email ==============================================

function receiverMail(addTransectionToReceiver) {

  // sending mail via nodemailer

const {senderEmail,senderAccountNumber,receive_money,data,reciverEmail}=addTransectionToReceiver.$push.transection
        // sending mail via nodemailer
       
        const msg = {
          from: 'testingdeveloper431@gmail.com', // sender address
          to: ` ${reciverEmail}`, // list of receivers
          subject: `Money Recived from ${senderEmail}`, // Subject line
          text: "hey you got a info", // plain text body
          html: `
             <p>Hey</p></br>
             <p>Your account has recived ${receive_money}$ from Account Number ${senderAccountNumber}
             </p> </br>
             <p>Best Regards</p> </br>
             <p>Digi Money Bank</p>

          `,
  };

  nodemailer
    .createTransport({
      service: "gmail",
      auth: {
        user: "testingdeveloper431@gmail.com",
        pass: "ajexwpkgpewiohct",
      },
      port: 587,
      host: "smtp.ethereal.email",
    })
    .sendMail(msg, (err) => {
      if (err) {
        return console.log("Error occures", err);
      } else {
        return console.log("email sent");
      }
    });
}

// ============================================== Sending to sender email ==============================================

function senderMail(addTransection) {
  const { senderEmail, receiverAccountnumber, amount, data, reciverEmail } =
    addTransection.$push.transection;

  // sending mail via nodemailer
  //
  const msg = {
    from: "testingdeveloper431@gmail.com", // sender address
    to: `${senderEmail}`, // list of receivers
    subject: `Money sent to from ${reciverEmail}`, // Subject line
    text: "hey you got a info", // plain text body
    html: `
               <p>Hey</p></br>
               <p>Your account has send ${amount}$ to Account Number ${receiverAccountnumber}
               </p> </br>
               <p>Best Regards</p> </br>
               <p>Digi Money Bank</p>
  
            `,
  };

  nodemailer
    .createTransport({
      service: "gmail",
      auth: {
        user: "testingdeveloper431@gmail.com",
        pass: "ajexwpkgpewiohct",
      },
      port: 587,
      host: "smtp.ethereal.email",
    })
    .sendMail(msg, (err) => {
      if (err) {
        return console.log("Error occures", err);
      } else {
        return console.log("email sent");
      }
    });
}

async function run() {
  try {
    await client.connect();
    const usersCollection = client.db("digi_money1").collection("users");
    const approvedUsersCollection = client
      .db("digi_money1")
      .collection("approvedUsers");
    const usersReviewCollection = client
      .db("digi_money1")
      .collection("reviews");
    const transectionCollection = client
      .db("digi_money1")
      .collection("transection");



    //    create new user and save the user data to database
    app.post("/adduser", async (req, res) => {
      const user = req.body;
      const result = await usersCollection.insertOne(user);
      res.send(result);
   
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
      const result = await usersCollection.updateOne(
        filter,
        updateDoc,
        options
      );
      const token = jwt.sign(
        { email: email },
        '335426bed56892395f2c094e46516c4a2586e6d824c4b62ab099eab0538d8959307ec9b19873eca3f8b18c73848c033015f6876ee001ad4f15b3a96f1f909338',
        { expiresIn: "1h" }
      );
      res.send({ result, token });
    });
    // delete from users a user
    app.delete("/users/:id", async (req, res) => {
      const id = req.params.id;
      console.log(id);
      const query = { _id: ObjectId(id) };
      const result = await usersCollection.deleteOne(query);
      res.send(result);
    });

    app.get("/approvedUsers",verifyJWT, async (req, res) => {
      const query = {};
      const cursor = approvedUsersCollection.find(query);
      const users = await cursor.toArray();
      res.send(users);
    });
        // delete from users a user
        app.delete('/users/:id', async (req, res) => {
            const id = req.params.id;
         
            const query = { _id: ObjectId(id) };
            const result = await usersCollection.deleteOne(query);
            res.send(result);
        })

          //=======================================================check approved user============================================//
          app.get('/checkuser:email',async(req,res)=>{
            const email=req.params.email
            const result=await approvedUsersCollection.findOne({email:email})
            if(result){
              console.log("yes")
              res.send({userexist:true})
              return
            }else{
              res.send({userexist:false})
              console.log("no")
              return
            }
           
          })

    app.get("/finduser", async (req, res) => {
      const email = req.query.email;

      const result = await approvedUsersCollection.findOne({ email: email });
      if (!result) {
        res.send({ find: false });
        return;
      } else {
        res.send(result);
      }
    });

    // adding account number
    app.patch("/accountNumber/:id", async (req, res) => {
      const id = req.params.id;
      const data = req.body;
      const query = { _id: ObjectId(id) };
      console.log(query);
      console.log(data);
      const update = {
        $set: {
          accountNumber: data.accountNumber,
        },
      };
      const result = await usersCollection.updateOne(query, update);
      res.send(result);
    });

    // post approved users
    app.post("/approvedUsers",verifyJWT, async (req, res) => {
      const newUser = req.body;

      const result = await approvedUsersCollection.insertOne(newUser);
      console.log(result);
      res.send(result);
    });
    // update ammount
    app.patch("/approvedUsers/:id", async (req, res) => {
      const id = req.params.id;
      const updatedAmount = req.body;
      const query = { _id: id };
      const update = {
        $set: {
          amount: updatedAmount.amount,
        },
      };
      const result = await approvedUsersCollection.updateOne(query, update);
      res.send(result);
    });
        // adding account number
        app.patch("/accountNumber/:id", async (req, res) => {
          const id = req.params.id;
          const data = req.body;
          const query = { _id: ObjectId(id) };
    
          const update = {
            $set: {
              accountNumber:data.accountNumber
            },
          };
          const result = await usersCollection.updateOne(query, update);
          res.send(result);
        });

        // post approved users
        app.post('/approvedUsers', async (req, res) => {
            const newUser = req.body;
         
             const result = await approvedUsersCollection.insertOne(newUser)
            
             res.send(result);

        })
  //============================================ update ammount===========================================//
    app.patch("/approvedUsers/:id", async (req, res) => {
        const id = req.params.id;
        const updatedAmount = req.body;
        const query = { accountNumber: id };
        const update = {
          $set: {
            amount:updatedAmount.amount
          },
        };
        const result = await approvedUsersCollection.updateOne(query, update);
        res.send(result);
      });
      // ==========================================deposite amount=========================================//
      app.patch("/deposite/:accountnumber",async(req,res)=>{
           const accountNumber=req.params.accountnumber 
           const updatedAmount=req.body;
           const query={accountNumber:accountNumber}
           const update={
            $set:{

              amount:updatedAmount.amount
            }
           }

           const result=await approvedUsersCollection.updateOne(query,update)
           res.send(result)
      })
      
  

    app.put("/approvedUsers/admin/:email", async (req, res) => {
      const email = req.params.email;
      const filter = { email: email };
      const updateDoc = {
        $set: { role: "admin" },
      };
      const result = await approvedUsersCollection.updateOne(filter, updateDoc);
      res.send(result);
    });

    app.get("/approvedUser/:id",verifyJWT, async (req, res) => {
      const id = req.params.id;
      const query = { _id: id };
      const user = await approvedUsersCollection.findOne(query);
      res.send(user);
    });

    app.put("/user/:email", async (req, res) => {
      const email = req.params.email;
      const user = req.body;
      const filter = { email: email };
      const options = { upsert: true };
      const updateDoc = {
        $set: user,
      };
      const result = await usersCollection.updateOne(
        filter,
        updateDoc,
        options
      );

      res.send({ result });
    });

    // delete from users a user
    app.delete("/users/:id", async (req, res) => {
      const id = req.params.id;

      const query = { _id: ObjectId(id) };
      const result = await usersCollection.deleteOne(query);
      res.send(result);
    });

    app.get("/approvedUsers",verifyJWT, async (req, res) => {
      const query = {};
      const cursor = approvedUsersCollection.find(query);
      const users = await cursor.toArray();
      res.send(users);
    });

    // adding account number
    app.patch("/accountNumber/:id", async (req, res) => {
      const id = req.params.id;
      const data = req.body;
      const query = { _id: ObjectId(id) };
    
      const update = {
        $set: {
          accountNumber: data.accountNumber,
        },
      };
      const result = await usersCollection.updateOne(query, update);
      res.send(result);
    });

    // post approved users
    app.post("/approvedUsers", async (req, res) => {
      const newUser = req.body;
      const result = await approvedUsersCollection.insertOne(newUser);

      res.send(result);
    });


    app.put("/approvedUsers/admin/:email",verifyJWT, async (req, res) => {
      const email = req.params.email;
      const filter = { email: email };
      const updateDoc = {
        $set: { role: "admin" },
      };
      const result = await approvedUsersCollection.updateOne(filter, updateDoc);
      res.send(result);
    });

    app.get("/approvedUser/:id",verifyJWT, async (req, res) => {
      const id = req.params.id;
      const query = { _id: id };
      const user = await approvedUsersCollection.findOne(query);
      res.send(user);
    });

    app.put("/user/:email", async (req, res) => {
      const email = req.params.email;
      const user = req.body;
      const filter = { email: email };
      const options = { upsert: true };
      const updateDoc = {
        $set: user,
      };
      const result = await usersCollection.updateOne(
        filter,
        updateDoc,
        options
      );

      res.send({ result });
    });

    // delete from users a user
    app.delete("/users/:id", async (req, res) => {
      const id = req.params.id;

      const query = { _id: ObjectId(id) };
      const result = await usersCollection.deleteOne(query);
      res.send(result);
    });

    // post approved users
    app.post("/approvedUsers", async (req, res) => {
      const newUser = req.body;
   
      const result = await approvedUsersCollection.insertOne(newUser);
    
      res.send(result);
    });

    // Get a single user information

    app.get("/approvedUsers",verifyJWT, async (req, res) => {
      const query = {};
      const cursor = approvedUsersCollection.find(query);
      const users = await cursor.toArray();
      res.send(users);
    });

    // post approved users
    app.post("/approvedUser", async (req, res) => {
      const newUser = req.body;
      const result = await approvedUsersCollection.insertOne(newUser);
      res.send(result);
    });
    app.delete("/approvedUser/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: id };
      const result = await approvedUsersCollection.deleteOne(query);
      res.send(result);
    });

    app.put("/approvedUser/admin/:email", async (req, res) => {
      const email = req.params.email;
      const filter = { email: email };
      const updateDoc = {
        $set: { role: "admin" },
      };
      const result = await approvedUsersCollection.updateOne(filter, updateDoc);
      res.send(result);
    });

    app.get("/approvedUser/:id",verifyJWT, async (req, res) => {
      const id = req.params.id;
      const query = { _id: id };
      const user = await approvedUsersCollection.findOne(query);
      res.send(user);
    });

    // ===============================================customer review ============================================//
    // Insert review data  to database
    app.post("/review", async (req, res) => {
      const review = req.body;
      const result = await usersReviewCollection.insertOne(review);
      res.send(result);
    });
    //get all review data from database
    app.get("/review", async (req, res) => {
      const result = await usersReviewCollection.find({}).toArray();
      res.send(result);
    });
    // ==================================================Check admin ============================================//
    app.get("/admin", async (req, res) => {
      const email = req.query.email;
      const getUser = await approvedUsersCollection.findOne({ email: email });
      if (getUser) {
        const isAdmin = getUser.role === "admin";
        return res.send({ admin: isAdmin });
      } else {
        return res.send({ admin: false });
      }
    });

    // ==============================================Transfer Balance==========================================//
    app.patch("/transfer", async (req, res) => {
      const { accountNumber, amount } = req.body;
      const email = req.query.email;
      const receiverinfoquery = { accountNumber: accountNumber };
      const senderinfoquery = { email: email };
      // find receiver account by account number
      const findTargetedaccount = await approvedUsersCollection.findOne(
        receiverinfoquery
      );
      if(!findTargetedaccount){
    
        return res.send({message:"Account number did not match "})
      }
      
      const updateAmount =parseFloat(findTargetedaccount.amount) + parseFloat(amount);
      const update = {
        $set: {
          amount: updateAmount,
        },
      };
      const transferBalance = await approvedUsersCollection.updateOne(
        receiverinfoquery,
        update
      );
      if (transferBalance.modifiedCount) {
        const findSenderInfo = await approvedUsersCollection.findOne(
          senderinfoquery
        );

        const updateSenderAmount =
          parseFloat(findSenderInfo.amount) - parseFloat(amount);

        const updatesender = {
          $set: {
            amount: updateSenderAmount,
          },
        };
        const finalResult = await approvedUsersCollection.updateOne(
          senderinfoquery,
          updatesender
        );

        // add transection to sender  database
    
        senderMail(addTransection);
     
        //add transection object to receiver database
    

        // add transection to sender  database 
        const addTransection={
          $push:{
            ["transection"]:{send_money:amount,receiverAccountnumber:accountNumber,senderEmail:findSenderInfo.email,
            reciverEmail:findTargetedaccount.email,staus:"complete",statustwo:"outgoing",data:new Date(),reveiverName:findTargetedaccount.displayName}
          }
        }
        senderMail(addTransection);
        const insertTransection=await approvedUsersCollection.updateOne(senderinfoquery,addTransection)
   
        //add transection object to receiver database 
        const addTransectionToReceiver={
          $push:{
            ["transection"]:{receive_money:amount,senderAccountNumber:findSenderInfo.accountNumber,senderEmail:findSenderInfo.email, reciverEmail:findTargetedaccount.email, staus:"complete",statustwo:"incomming",data:new Date(),senderName:findSenderInfo.displayName}
          }
        }
        receiverMail(addTransectionToReceiver);
        const insertTransectionDataToReceiver =
          await approvedUsersCollection.updateOne(
            receiverinfoquery,
            addTransectionToReceiver
          );

        res.send({
          finalResult,
          insertTransectionDataToReceiver,
          insertTransection,
        });
      }
    });


    // pagenation for transection history 
    app.get("/transectionCount/:account",async(req,res)=>{
       const accountNumber=req.params.account
       const findDocument= await approvedUsersCollection.findOne({accountNumber:accountNumber})
       const transectionHistory=findDocument?.transection
       const count =transectionHistory?.length
       if(count){
        res.send({count})
       }
      
       
    });
    // get all transection 
    app.get('/transection/:account',async(req,res)=>{
      const page=req.query.page  
      const accountNumber=req.params.account
      const findDocument= await approvedUsersCollection.findOne({accountNumber:accountNumber})
      const transectionHistory=findDocument?.transection
   
   
      let sortedTransection=[];
      if(transectionHistory){
    
        let sorted = [...transectionHistory].sort((a,b) =>new moment(a.date).format('YYYYMMDD') - new moment(b.date).format('YYYYMMDD'))
        sortedTransection=sorted.reverse()
      }
    
      if(page==0){
        res.send(sortedTransection)
     
        return
      }
      function paginateArray(arr , itemPerPage , pageIndex) {
        const lastIndex = itemPerPage * pageIndex;
        const firstIndex = lastIndex - itemPerPage;
        return arr.slice(firstIndex , lastIndex);
    }
    

    const index=parseInt(page)  
    const result=paginateArray(sortedTransection,10,index)
    res.send(result)
  

    })
  } finally {
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("digimoney server start successfully");
});

app.listen(port, () => console.log("Run successfully"));
