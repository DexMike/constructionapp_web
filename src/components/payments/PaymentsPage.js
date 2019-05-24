import React, { Component } from 'react';
import { Redirect } from 'react-router-dom';
import { Card, CardBody, Col, Container, Row } from 'reactstrap';

import TTable from '../common/TTable';


class PaymentsPage extends Component {
  constructor(props) {
    super(props);

    this.state = {
    };

    this.renderGoTo = this.renderGoTo.bind(this);
    this.handleRowEdit = this.handleRowEdit.bind(this);
  }

  async componentDidMount() {
    
  }

  handleRowEdit(id) {
    console.log(id);
  }

  handlePageClick(menuItem) {
    if (menuItem) {
      this.setState({ [`goTo${menuItem}`]: true });
    }
  }

  async fetchPaymentsList() {
    
  }

  renderGoTo() {
    const status = this.state;
    if (status.goToDashboard) {
      return <Redirect push to="/"/>;
    }
    if (status.goToAddJob) {
      return <Redirect push to="/jobs/save"/>;
    }
    if (status.goToUpdateJob) {
      return <Redirect push to={`/jobs/save/${status.jobId}`}/>;
    }
    return false;
  }

  render() {
    const jobs = [{ date: '05/24/2019', name: 'Fixed Job', load: '1235-A', amount: '$12,335.88' }];
    return (
      <Container className="dashboard">
        <Row>
          <Col md={12}>
            <h3 className="page-title">Payments</h3>
          </Col>
        </Row>
        <Row>
          <Col md={12}>
            <Card>
              <CardBody>
                <TTable
                  columns={
                    [
                      {
                        name: 'date',
                        displayName: 'Job Date'
                      },
                      {
                        name: 'name',
                        displayName: 'Job Name'
                      },
                      {
                        name: 'load',
                        displayName: 'Load #'
                      },
                      {
                        name: 'amount',
                        displayName: 'Amount'
                      }
                    ]
                  }
                  data={jobs}
                  handleIdClick={this.handleJobEdit}
                />
              </CardBody>
            </Card>
          </Col>
        </Row>
      </Container>
    );
  }
}

export default PaymentsPage;
