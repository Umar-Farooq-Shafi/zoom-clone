const express = require("express");
const app = express();
var http = require("http").Server(app);
const { v4: uuidv4 } = require("uuid");
const io = require("socket.io")(http);
const { ExpressPeerServer } = require("peer");

const peerServer = ExpressPeerServer(http, { debug: true });

// using Moddleware
app.set("view engine", "ejs");
app.use(express.static("public"));
app.use("/peerjs", peerServer);

const PORT = process.env.PORT || 8080;

// redirecting to user
app.get("/", (req, res) => {
  res.redirect(`/${uuidv4()}`);
});

app.get("/:room", (req, res) => {
  res.render("room", { roomId: req.params.room });
});

// establieshing the connection
io.on("connection", soc => {
  // Joining to the client side
  soc.on("join-room", (roomId, id) => {
    soc.join(roomId);

    // brodcasting
    soc.to(roomId).broadcast.emit("user-connected", id);

    // Recieving message from user
    soc.on("message", message => {
      io.to(roomId).emit("createMessage", message);
    });
  });
});

//create a server object:
http.listen(PORT, console.log(`Server running on PORT ${PORT}`)); //the server object listens on port 8080
