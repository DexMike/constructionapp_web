import React, { Component } from 'react';
import PropTypes from 'prop-types';
import {
  Row,
  Col,
  Button,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Container,
  Card
} from 'reactstrap';
import JobService from '../../api/JobService';

class JobDeletePopup extends Component {
  constructor(props) {
    super(props);

    this.state = {
      loaded: false
    };

    this.closeNow = this.closeNow.bind(this);
    this.deleteJob = this.deleteJob.bind(this);
  }

  async componentDidMount() {
    this.setState({
      loaded: true
    });
  }

  closeNow() {
    const { toggle } = this.props;
    toggle();
  }

  async deleteJob() {
    const { jobId, deleteJobModalPopup } = this.props;

    try {
      await JobService.deleteJob(jobId);
    } catch (e) {
      console.error('>> NOT SAVED: JobDeletePopup -> deleteJob -> e', e);
    }

    // bubble to parent
    deleteJobModalPopup();
    this.closeNow();
    return false;
  }

  render() {
    const { loaded } = this.state;
    const { jobName } = this.props;
    if (loaded) {
      return (
        <React.Fragment>
          <ModalHeader>
            <div style={{ fontSize: 22, fontWeight: 'bold' }}>
              <span className="lnr lnr-warning"/>
              &nbsp;
              {jobName}
            </div>
          </ModalHeader>
          <ModalBody className="text-left" backdrop="static">
            <p style={{ fontSize: 14 }}>
              Are you sure you want to delete this job?
            </p>
          </ModalBody>
          <ModalFooter>
            <Row>
              <Col md={6} className="text-left">
                &nbsp;
              </Col>
              <Col md={6}>
                <Button color="secondary" onClick={this.closeNow}>
                  Cancel
                </Button>
                &nbsp;
                <Button
                  color="primary"
                  onClick={() => {
                    this.deleteJob();
                  }
                }
                >
                  Delete
                </Button>
              </Col>
            </Row>
          </ModalFooter>
        </React.Fragment>
      );
    }
    return (
      <Container className="dashboard">
        <Row>
          <Col md={12}>
            <Card>Loading...</Card>
          </Col>
        </Row>
      </Container>
    );
  }
}

JobDeletePopup.propTypes = {
  toggle: PropTypes.func,
  deleteJobModalPopup: PropTypes.func,
  jobName: PropTypes.string,
  jobId: PropTypes.number
};

JobDeletePopup.defaultProps = {
  toggle: null,
  deleteJobModalPopup: null,
  jobName: null,
  jobId: null
};


export default JobDeletePopup;
