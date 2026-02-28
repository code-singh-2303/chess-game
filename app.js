const express = require('express');
const socket = require("socket.io");
const http = require("http");
const app = express();
const {Chess} = require("chess.js");
const path = require("path");
const { title } = require('process');

const server =  http.createServer(app);
const io = socket(server);

const chess = new Chess();
let players={};
let CurrentPlayer = 'w';


app.set("view engine","ejs");
app.use(express.static(path.join(__dirname,"public")));

app.get("/",(req,res)=>{
    res.render("index",{title:"CUSTOM CHESS GAME"});
});

io.on("connection",function(uniquesocket){
    console.log("CONNECTED");
    if(!players.white){
        players.white = uniquesocket.id;
        uniquesocket.emit("playerRole",'w');
    }
    else if(!players.black){
        players.black = uniquesocket.id;
        uniquesocket.emit("playerRole","b");
    }
    else{
        uniquesocket.emit("SpectatorRole");
    }
    uniquesocket.on("disconnect",function(){
        if(uniquesocket.id === players.white){
            delete players.white;
        }
        else if(uniquesocket.id === players.black){
            delete players.black;
        } 
    });
    uniquesocket.on("move",function(move){
    try{
        if(chess.turn() === 'w' && uniquesocket.id !== players.white){
            return
        }
        else if(chess.turn() === 'b' && uniquesocket.id !== players.black){
            return
        }
        const result = chess.move(move);
        if(result){
            CurrentPlayer = chess.turn();
            io.emit("move",move);
            io.emit("boardState",chess.fen());
        }
        else{
            console.log("Invalid move: ",move);
            uniquesocket.emit("Invalid move: ",move);
        }
    }
    catch(err){
        console.log(err);
        uniquesocket.emit("Invalid Move: ",move);
    };
    })
})

server.listen(3000,function(){
    console.log("SERVER CHAL RHA LADLE");
});