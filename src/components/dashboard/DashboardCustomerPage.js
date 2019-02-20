import React, { Component } from 'react';
import { Card, CardBody, Col, Container, Row } from 'reactstrap';

class DashboardCustomerPage extends Component {
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
                Dashboard Customer Page
              </CardBody>
            </Card>
          </Col>
        </Row>
      </Container>
    );
  }
}

export default DashboardCustomerPage;
