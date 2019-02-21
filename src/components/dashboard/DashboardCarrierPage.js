import React, { Component } from 'react';
import { Card, CardBody, Col, Container, Row } from 'reactstrap';
import ProfileService from '../api/ProfileService';

class DashboardCarrierPage extends Component {
  constructor(props) {
    super(props);

    this.state = {
      profile: null
    };
  }

  async componentDidMount() {
    // TODO use this to set the layout navigation
    const profile = await ProfileService.getProfile();
    this.setState({ profile });
  }

  render() {
    const { profile } = this.state;
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
                {profile && profile.companyType
                && <p>{profile.companyType}</p> }
                <hr/>
                Dashboard Carrier Page
              </CardBody>
            </Card>
          </Col>
        </Row>
      </Container>
    );
  }
}

export default DashboardCarrierPage;
