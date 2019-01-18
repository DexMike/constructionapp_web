import React, {Component} from 'react';
import AgentService from "../api/AgentService";

class App extends Component {

  constructor(props) {
    super(props);

    this.state = {
      addresses: []
    }
  }

  async componentDidMount() {
    await this.fetchAddresses();
  }

  async fetchAddresses() {
    const addresses = await AgentService.getAddresses();
    this.setState({addresses});
  }

  renderAddresses() {
    // const addresses = await AgentService.getAddresses();
    return this.state.addresses.map((address) => {
      return (
        <div key={address.id}>{JSON.stringify(address)}</div>
      );
    });
  }

  render() {
    return (
      <div>
        <h1>Welcome to Trelar webapp.</h1>
        <div>
          <p>Here we are pulling from the backend api:</p>
          <pre>{this.renderAddresses()}</pre>
        </div>
        {/*<input value={'text'} type={'text'} onChange={() => {}}/>*/}
      </div>
    );
  }
}

export default App;
