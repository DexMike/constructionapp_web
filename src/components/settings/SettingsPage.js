import React, { Component } from 'react';
import { Container } from 'reactstrap';

class SettingsPage extends Component {
  constructor(props) {
    super(props);

    this.state = {
      loaded: true
    };
  } // constructor


  async componentDidMount() {
    //
  }

  render() {
    const { loaded } = this.state;
    if (loaded) {
      return (
        <React.Fragment></React.Fragment>
      );
    }
    return (
      <Container className="dashboard">
        Loading...
      </Container>
    );
  }
}

export default SettingsPage;
