import * as React from "react";
import debounce from "lodash.debounce";
import { ObservableSet, ObservableMap, computed, observable } from "mobx";
import { observer } from "mobx-react";
import { Test, classes } from "models/dist/index";
import { ClientState } from "models/dist/mobxWebsocket/index";
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

class FrontendAppModel {
  private socket?: ReturnType<typeof io>;
  @observable
  public connected = false;
  @observable
  public clientState?: ClientState;
  @observable
  test?: Test;

  public connect = (username: string) => {
    this.socket = this.socket || io("http://localhost:8080");
    if (this.socket.connected) {
      this.connected = true;
      this.clientState = new ClientState(this.socket, classes);
      const test = new Test({ emitter: this.clientState.emitter, id: "test" });
      this.test = test;
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
    console.log(this.model);
    return (
      <div className="App">
        {this.model.connected ? (
          <div>
            <p>Test</p>
            <p>{this.model.test?.test}</p>
            <p>{this.model.test?.roomTest}</p>
            <p>
              <button
                onClick={() => {
                  this.model.test?.setTest(this.model.test?.test + 1);
                }}
              >
                Set
              </button>
              <button
                onClick={() => {
                  this.model.test?.setRoomTest(this.model.test?.roomTest + 1);
                }}
              >
                Set button
              </button>
            </p>
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
