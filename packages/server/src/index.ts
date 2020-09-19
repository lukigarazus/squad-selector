// import * as M from "./serverModels";
import { classes } from "models/dist/index";
import { ServerState } from "models/dist/mobxWebsocket/index";

const server = require("http").createServer();
const io = require("socket.io")(server);

// const App = new M.ServerAppModel(io.broadcast.bind(io));

// const sharedState = new Test();

const serverState = new ServerState(io, classes);
// setInterval(() => {
//   if (serverState.sharedState) {
//     console.log(serverState.sharedState.test + 1);
//     serverState.sharedState.setTest(serverState.sharedState.test + 1);
//   }
// }, 2000);
// io.on("connection", (socket: any) => {
//   console.log("Connected");
//   let user: UserModel | { error: string };
//   socket.on("join app", (name: string) => {
//     user = App.addUser(name);
//     if (user.error) {
//       socket.emit();
//     }
//   });
//   socket.on("join room", (room: string) => {
//     App.addUserToRoom(room, user);
//   });
// });

console.log("Server listens");
server.listen(8080);
