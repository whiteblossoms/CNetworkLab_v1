
const express = require('express');
const app = express();

const http = require('http');
const server = http.createServer(app);
const { Server } = require("D:/nodejs/node_modules/npm/node_modules/socket.io");
const io = new Server(server);

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});

const busboyCons = require('D:/Learning/nodejsWp/node_modules/busboy');
const path = require('path');
const fs = require('fs');

// this is important!
app.use(express.static('uploads'));

app.post('/upload', function(req, res) {
   const bb = busboyCons({ headers: req.headers });
   req.pipe(bb);
   bb.on('file', (fieldname, file, filename) => {
      const ext = path.extname(filename.filename);
      console.log(filename);
      const newFilename = `${Date.now()}${ext}`;
      console.log(newFilename);
      req.newFilename = newFilename;
      req.originalFilename = filename;
      const saveTo = path.join('uploads', newFilename);
      file.pipe(fs.createWriteStream(saveTo));
   });
   bb.on('finish', () => {
      res.json({
         originalFilename: req.originalFilename,
         newFilename: req.newFilename
      });
   });
});


var users={}
let usocket={};

io.on('connection', (socket) => {
  
  socket.on('join',name=>{
    console.log(`${name} joined!`);
    console.log(name);
    socket.name=name;
    users[name]=name;
    
    usocket[name]=socket;
   
    
    io.emit('chat message',name+" joined!");
  })
  socket.on('chat message', (msg) => {
    io.emit('chat message', msg);
    
  });
  socket.on('file', (f) => {
   
    io.emit('file',f);
  });
  
  socket.on('chatTo', (d) => {
   console.log(d.name);
   console.log(d.msg);
   console.log(d.to);
   console.log( usocket[String(d.name)]);
   usocket[String(d.name)].emit('to'+d.name,d);
   usocket[String(d.to)].emit('to'+d.to,d);
    
  });

});



server.listen(3000, () => {
  console.log('listening on *:3000');
});