import React, { Component } from 'react';
import { Card, CardBody, Col, Container, Row } from 'reactstrap';

class DashboardPage extends Component {
  render() {
    return (
      <Container className="dashboard">
        <Row>
          <Col md={12}>
            <h3 className="page-title">Dashboard</h3>
          </Col>
        </Row>
        <Row>
          <Col md={12}>
            <Card>
              <CardBody>
                <hr/>
                /DashboardPage
              </CardBody>
            </Card>
          </Col>
        </Row>
        bunnies
      </Container>
    );
  }
}

export default DashboardPage;
