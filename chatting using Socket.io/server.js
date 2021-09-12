const express= require("express")
const socket = require("socket.io")
const app = express()
const io = socket(server)
const mongoose = require("mongoose")
const bodyParser = require("body-parser")
const customId = require("custom-id")

//CHAT SCHEMA
const chat_schema = mongoose.Schema({
    roomID:{type:String},
    sender:{type:String},
    receiver:{type:String},
   
    chats:[{
      username:{type:String},
      data:{type:Object},
      isRead:{type:Boolean}
    }]
  })
const chat_model = new mongoose.model("chat",chat_schema)
app.get("/chatting", (req,res)=>{
    res.render("chatting")
})

app.post("/get-room-id", async(req,res)=>{
    console.log(req.body.r)
    let roomID = customId({
      sender: req.body.sender,
      receiver: req.body.r
    })
    const data = new chat_model({
        roomID:roomID,
        sender:req.body.sender,
      receiver: req.body.r,

    })
    data.save()
    res.send(roomID)
    })
    app.post("/get-my-senders", async(req,res)=>{
        console.log(req.body.sender)
     let doc = await chat_model.find({$or:[{sender:req.body.sender},{receiver:req.body.sender}]})
    //  console.log(doc)
     res.send(doc)
    })
    app.post("/get-chats", async(req,res)=>{
     let doc = await chat_model.find({roomID:req.body.roomID})
     doc.forEach(res=>{
        res.chats.forEach(async(chat)=>{

            await chat_model.findOneAndUpdate({roomID:req.body.roomID},
                        {$set:{"chats.$[outer].isRead":"true"}},
                        {"arrayFilters":[{"outer._id":chat._id}]}
                        )
           
        })
     })
    
      res.send(doc)
    })
    app.post("/send-msg", async(req,res)=>{
        console.log(`isread is ${req.body.isRead}`)
        let flag=true
        if(req.body.isRead == 1){
            flag=false
        }
        
      await chat_model.findOneAndUpdate({roomID:req.body.roomID},{
          
          $push:{
              chats:{username:req.body.sender,data:req.body.msg,isRead:flag}
          }
      })
    })
    app.post("/get-unread", async (req,res)=>{
        let doc = await chat_model.find({
            $or:[{sender:req.body.sender},{receiver:req.body.sender}], chats:{$elemMatch:{isRead:false}}
        })
        let rooms =[]
        doc.forEach(doc=>{
            doc.chats.forEach(chat=>{
                if(chat.username != req.body.sender & chat.isRead != true){
                    rooms.push(doc.roomID)
                }
            })
        })
        res.send(rooms)
        console.log(rooms)
    })
//io

 io.on("connection",(socket)=>{
     socket.on("join-room",data=>{
         if(data.prev_room != "nothing"){
         socket.leave(data.prev_room)
         console.log("left "+data.prev_room)
         }
       socket.join(data.room)
       console.log("joined room"+data.room)
       
     })
    socket.on("get-clients-no",room=>{
        let clientNumber = io.sockets.adapter.rooms.get(room).size
        console.log(clientNumber)
        socket.emit("get-clients-no",clientNumber)
    })
      socket.on("express-chat",data=>{
    
        socket.to(data.roomID).emit("express-chat",data)
      })
      socket.on('disconnect',()=>{
          console.log("disconnected")
      })
      
    
    })
    

