const express=require('express')
const app=express()
const cors=require('cors')
app.use(cors())


const port=process.env.PORT || 4000

app.get('/',(req,res)=>{
    res.send("digimoney server start successfully")
})




app.listen(port,()=>console.log("Run successfull"))