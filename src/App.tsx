import * as React from "react";
import debounce from "lodash.debounce";
import { ObservableSet, ObservableMap, computed } from "mobx";
import { observer } from "mobx-react";
import "./styles.css";

class SearchModel {
  constructor(private participantModel: ParticipantModel) {}

  public searchPlayer = debounce(async (query: string) => {
    const result = await (
      await fetch(
        `https://www.easports.com/fifa/ultimate-team/api/fut/item?name=${query}`
      )
    ).json();
    console.log(result);
  }, 1000);
}

interface ISearchCompProps {
  model: ParticipantModel;
}

class SearchComp extends React.Component<ISearchCompProps> {
  model: SearchModel;

  constructor(props: ISearchCompProps) {
    super(props);
    this.model = new SearchModel(props.model);
  }
  render() {
    return (
      <div className="search">
        <input onChange={(ev) => this.model.searchPlayer(ev.target.value)} />
      </div>
    );
  }
}

class ParticipantModel {
  public playersSet = new ObservableSet<string>();
  public hasTurn = false;

  constructor(public name: string) {}

  @computed
  public get players() {
    return Array.from(this.playersSet) as string[];
  }
}

class AppModel {
  private usedPlayers = new ObservableSet<string>();

  public turn?: ParticipantModel;
  public participantsMap = new ObservableMap<ParticipantModel>();

  public hasPlayer = (name: string) => {
    return this.usedPlayers.has(name);
  };

  public addPlayer = (name: string) => {
    this.usedPlayers.add(name);
  };

  public addParticipants = (participants: string[]) => {
    participants.forEach(this.addParticipant);
  };

  public addParticipant = (participant: string) => {
    if (!this.participantsMap.has(participant))
      this.participantsMap.set(participant, new ParticipantModel(participant));
  };

  public setTurn = (name: string) => {
    const participant = this.turn;
    if (participant) participant.hasTurn = false;
    const newParticipant = this.participantsMap.get(name);
    newParticipant.hasTurn = true;
    this.turn = newParticipant;
  };

  @computed
  public get participants() {
    return Array.from(this.participantsMap.values()) as ParticipantModel[];
  }
}

interface IParticipantProps {
  model: ParticipantModel;
}

@observer
class ParticipantComp extends React.Component<IParticipantProps, {}> {
  model: ParticipantModel;

  constructor(props: IParticipantProps) {
    super(props);
    this.model = props.model;
  }

  render() {
    return (
      <div className="participant">
        <h3>{this.model.name}</h3>
        <div className="participant__body">
          <div className="participant__players">
            {this.model.players.map((el) => (
              <div>{el}</div>
            ))}
          </div>
          <SearchComp model={this.model} />
        </div>
      </div>
    );
  }
}

@observer
class App extends React.Component<{}, {}> {
  model = new AppModel();
  componentDidMount() {
    this.model.addParticipants(["Kaczy", "Damian", "Szkop", "Pruk"]);
  }
  render() {
    return (
      <div className="App">
        <h1>SQUAD CHOOSER</h1>
        <div className="participants">
          {this.model.participants.map((p) => (
            <ParticipantComp model={p} />
          ))}
        </div>
      </div>
    );
  }
}

export default App;
