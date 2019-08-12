import React, { Component } from 'react';
import TMap from './common/TMap';
import { Col, Container, Row } from 'reactstrap';

class HereTestPage extends Component {
  render() {
    return (
      <Row>
        <Col md={6}>
          <TMap id={1}/>
        </Col>
        <Col md={6}>
          <TMap id={2} center={{
            lat: 30.274983,
            lng: -95.739604
          }}
          />
        </Col>
      </Row>
    );
  }
}

export default HereTestPage;
