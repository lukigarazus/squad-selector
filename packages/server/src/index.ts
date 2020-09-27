// import * as M from "./serverModels";
import { classes, MainAppModel } from "models/dist/index";
import { ServerState } from "mobx-websocket";

const server = require("http").createServer();
const io = require("socket.io")(server);

// const App = new M.ServerAppModel(io.broadcast.bind(io));

// const sharedState = new Test();

const serverState = new ServerState(io, classes);
const appState = new MainAppModel({ emitter: serverState.emitter });

io.on("connection", (socket: any) => {
  socket.on("join app", (username: string) => {
    appState.createUser(username, socket.id);
    socket.username = username;
    socket.emit("app joined");
    console.log("JOIN APP");
  });
  socket.on("disconnect", () => {
    if (appState.users[socket.username]) {
      const username = socket.username;
      appState.users[socket.username].active = false;
      // @ts-ignore
      appState.users[socket.username].timeout = setTimeout(() => {
        appState.deleteUser(username);
      }, 60 * 1000 * 5);
    }
  });
  socket.on("join room", (room: string) => {});
});

console.log("Server listens");
server.listen(8081);
