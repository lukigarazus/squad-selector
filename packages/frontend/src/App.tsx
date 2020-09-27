import * as React from "react";
import debounce from "lodash.debounce";
import { ObservableSet, ObservableMap, computed, observable } from "mobx";
import { observer } from "mobx-react";
import { MainAppModel, classes, UserModel, RoomModel } from "models/dist/index";
import { ClientState } from "mobx-websocket";
import io from "socket.io-client";

import "./styles.css";

// class SearchModel {
//   constructor(private participantModel: ParticipantModel) {}

//   public searchPlayer = debounce(async (query: string) => {
//     const result = await (
//       await fetch(
//         `https://www.easports.com/fifa/ultimate-team/api/fut/item?name=${query}`
//       )
//     ).json();
//     console.log(result);
//   }, 1000);
// }

// interface ISearchCompProps {
//   model: ParticipantModel;
// }

// class SearchComp extends React.Component<ISearchCompProps> {
//   model: SearchModel;

//   constructor(props: ISearchCompProps) {
//     super(props);
//     this.model = new SearchModel(props.model);
//   }
//   render() {
//     return (
//       <div className="search">
//         <input onChange={(ev) => this.model.searchPlayer(ev.target.value)} />
//       </div>
//     );
//   }
// }

// interface IParticipantProps {
//   model: ParticipantModel;
// }

// @observer
// class ParticipantComp extends React.Component<IParticipantProps, {}> {
//   model: ParticipantModel;

//   constructor(props: IParticipantProps) {
//     super(props);
//     this.model = props.model;
//   }

//   render() {
//     return (
//       <div className="participant">
//         <h3>{this.model.name}</h3>
//         <div className="participant__body">
//           <div className="participant__players">
//             {this.model.players.map((el) => (
//               <div>{el}</div>
//             ))}
//           </div>
//           <SearchComp model={this.model} />
//         </div>
//       </div>
//     );
//   }
// }

const Room = ({ room, user }: { room: RoomModel; user: UserModel }) => (
  <div>
    <div>ROOM {room.id}</div>
    <div>
      {Object.keys(room.members).map((user) => (
        <div>{user}</div>
      ))}
    </div>
    <div>
      <button
        onClick={() => {
          room.deleteRoomMember(user.id);
        }}
      >
        Leave room
      </button>
    </div>
  </div>
);

class FrontendAppModel {
  private socket?: ReturnType<typeof io>;
  @observable
  public connected = false;
  @observable
  public clientState?: ClientState;
  @observable
  appModel?: MainAppModel;
  @observable
  user?: UserModel;

  public connect = (username: string) => {
    this.socket = this.socket || io("http://192.168.0.15:8081");
    if (this.socket.connected) {
      console.log(this.socket.id);
      this.socket.on("disconnect", () => {
        this.connected = false;
        this.socket = undefined;
        this.clientState = undefined;
        this.appModel = undefined;
        this.user = undefined;
      });
      this.socket.on("username taken", () => {
        this.connected = false;
        this.socket = undefined;
        this.clientState = undefined;
        this.appModel = undefined;
        this.user = undefined;

        alert("Username taken!");
      });
      this.connected = true;
      this.clientState = new ClientState(this.socket, classes);
      this.appModel = new MainAppModel({ emitter: this.clientState.emitter });
      setTimeout(() => {
        if (this.socket) {
          this.socket.emit("join app", username);
          this.socket.on("app joined", () => {
            console.log("APP JOINED", UserModel.instances);
            const getUser = () => {
              UserModel.instances[username]
                ? (this.user = UserModel.instances[username])
                : setTimeout(getUser, 0);
            };
            getUser();
          });
        }
      }, 0);
    } else {
      setTimeout(() => {
        this.connect(username);
      }, 1000);
    }
  };
}

@observer
class App extends React.Component<{}, {}> {
  model = new FrontendAppModel();

  render() {
    return (
      <div className="App">
        {this.model.user ? (
          <div>
            {this.model.appModel?.users && (
              <div>
                Users:{" "}
                {Object.values(this.model.appModel.users).map((user) => (
                  <div style={{ color: user.active ? "black" : "grey" }}>
                    {user.id}
                  </div>
                ))}
              </div>
            )}
            {!this.model.user.roomId ? (
              <>
                <div>
                  <h2>Rooms</h2>
                  <div>
                    {Object.values(this.model.appModel?.rooms || {}).map(
                      (room) => (
                        <div>
                          <div>Room {room.id}</div>
                          <div>
                            <button
                              onClick={() => {
                                if (this.model.user) {
                                  room.addUser(this.model.user.id);
                                }
                              }}
                            >
                              Join
                            </button>
                          </div>
                        </div>
                      )
                    )}
                  </div>
                  <div>
                    <button
                      onClick={() => {
                        this.model.appModel?.createRoom();
                      }}
                    >
                      Create a room
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <Room
                room={RoomModel.instances[this.model.user.roomId]}
                user={this.model.user}
              />
            )}
          </div>
        ) : (
          <div>
            <input placeholder="username" id="username" />
            <button
              onClick={() => {
                // @ts-ignore
                this.model.connect(document.getElementById("username").value);
              }}
            >
              Submit
            </button>
          </div>
        )}
      </div>
    );
  }
}

export default App;
