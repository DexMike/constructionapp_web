import React, { Component } from 'react';
import {
  Card,
  CardBody,
  Col,
  Container,
  Row
} from 'reactstrap';

import MapboxDemo1 from '../../img/Mapbox_Demo1.png';
import MapboxDemo2 from '../../img/Mapbox_Demo2.png';

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

  renderMapboxDemo() {
    return (
      <Row>
        <Col md={12}>
          <Card>
            <CardBody>
              <Row>
                <div className="col-md-12 mt-1">
                  <img width="100%" height="100%" src={MapboxDemo1} alt=""/>
                </div>
                <div className="col-md-12 mt-1">
                  <img width="100%" height="100%" src={MapboxDemo2} alt=""/>
                </div>
              </Row>
            </CardBody>
          </Card>
        </Col>
      </Row>
    );
  }

  render() {
    const { loaded } = this.state;
    if (loaded) {
      return (
        <Container className="dashboard">
          {this.renderMapboxDemo()}
        </Container>
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
