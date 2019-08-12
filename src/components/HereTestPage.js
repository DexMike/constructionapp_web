import React, { Component } from 'react';
import TMap from './common/TMap';
import { Col, Container, Row } from 'reactstrap';

class HereTestPage extends Component {
  render() {
    const startAddress = {latitude: 30.35650900, longitude: -97.73686400};
    const endAddress = {latitude: 30.42309900, longitude: -97.76149700};
    const gpsTrackings = [[-122.406417,37.785834],[-122.406417,37.785834]];
    return (
      <Row>
        <Col md={6}>
          <TMap
            id="1"
            startAddress={startAddress}
            endAddress={endAddress}
          />
        </Col>
        <Col md={6}>
          <TMap
            id="2"
            width="100%"
            height={410}
            startAddress={{latitude: 30.42935881, longitude: -97.74502295}}
            endAddress={{latitude: 30.3568157, longitude: -97.73729526}}
            trackings={gpsTrackings}
          />
        </Col>
      </Row>
    );
  }
}

export default HereTestPage;
