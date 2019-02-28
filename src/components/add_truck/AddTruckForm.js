import React, { PureComponent } from 'react';
import { Col, Card, Row, Container } from 'reactstrap';
import PropTypes from 'prop-types';
import AddTruckFormOne from './AddTruckFormOne';
import AddTruckFormTwo from './AddTruckFormTwo';
import AddTruckFormThree from './AddTruckFormThree';
import AddTruckFormFour from './AddTruckFormFour';


class AddTruckForm extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      page: 1,
      loaded: false
    };
    this.nextPage = this.nextPage.bind(this);
    this.previousPage = this.previousPage.bind(this);
  }

  async componentDidMount() {
    const { incomingPage } = this.props;
    // this is to prevent mounting if we must go to page three
    if (incomingPage === 3) {
      this.setState({ page: 3, loaded: true });
    } else {
      this.setState({ page: 1, loaded: true });
    }
  }

  nextPage() {
    const { page } = this.state;
    // just checking if the state changed
    this.setState({ page: page + 1 });
  }

  previousPage() {
    const { page } = this.state;
    this.setState({ page: page - 1 });
  }

  render() {
    // const { onSubmit } = this.props;
    const { page, loaded } = this.state;
    if (loaded) {
      return (
        <Container className="dashboard">
          <Row>
            {/* <h1>TEST</h1> */}
            <Col md={12} lg={12}>
              <Card>
                <div className="wizard">
                  <div className="wizard__steps">
                    <div className={`wizard__step${page === 1 ? ' wizard__step--active' : ''}`}>
                      <p>Add Truck</p>
                    </div>
                    <div className={`wizard__step${page === 2 ? ' wizard__step--active' : ''}`}>
                      <p>Add Schedule</p>
                    </div>
                    <div className={`wizard__step${page === 3 ? ' wizard__step--active' : ''}`}>
                      <p>Add Driver</p>
                    </div>
                    <div className={`wizard__step${page === 4 ? ' wizard__step--active' : ''}`}>
                      <p>Summary</p>
                    </div>
                  </div>
                  <div className="wizard__form-wrapper">
                    {page === 1
&& <AddTruckFormOne p={page} onSubmit={this.nextPage} handleSubmit={this.nextPage} />
                    }
                    {/* onSubmit={this.nextPage} */}
                    {page === 2
&& <AddTruckFormTwo previousPage={this.previousPage} handleSubmit={this.nextPage} />}
                    {page === 3
&& <AddTruckFormThree previousPage={this.previousPage} handleSubmit={this.nextPage} />}
                    {page === 4
                      && <AddTruckFormFour previousPage={this.previousPage} />}
                    {/* onSubmit={onSubmit} */}
                  </div>
                </div>
              </Card>
            </Col>
          </Row>
        </Container>
      );
    }
    return (
      <Container>
        Loading...
      </Container>
    );
  }
}

AddTruckForm.propTypes = {
  company: PropTypes.shape({
    id: PropTypes.number,
    page: PropTypes.number
  }),
  incomingPage: PropTypes.number
};

AddTruckForm.defaultProps = {
  company: PropTypes.shape({
    id: PropTypes.number,
    page: PropTypes.number
  })// ,
  // onSubmit: PropTypes.func.isRequired
};

AddTruckForm.defaultProps = {
  company: null,
  incomingPage: 0
};

export default AddTruckForm;
