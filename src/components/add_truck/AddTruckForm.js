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
    this.gotoPage.bind(this);
    // console.log(props);
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
    // console.log(32);
    const { page } = this.state;
    // just checking if the state changed
    this.setState({ page: page + 1 });
  }

  gotoPage(pageNumber) {
    // console.log(40);
    this.setState({ page: pageNumber });
  }

  previousPage() {
    const { page } = this.state;
    this.setState({ page: page - 1 });
  }

  handleKeyPress(event) {
    if (event.key === 'Enter') {
      // console.log('enter press here!');
    }
  }

  render() {
    const { company } = this.props;
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
                    {/* onClick={this.gotoPage(1)} */}
                    <div
                      role="link"
                      tabIndex="0"
                      onKeyPress={this.handleKeyPress}
                      className={`wizard__step${page === 1 ? ' wizard__step--active' : ''}`}
                    >
                      <p>Add Truck</p>
                    </div>
                    <div
                      role="link"
                      tabIndex="0"
                      onKeyPress={this.handleKeyPress}
                      className={`wizard__step${page === 2 ? ' wizard__step--active' : ''}`}
                    >
                      <p>Add Schedule</p>
                    </div>
                    <div
                      role="link"
                      tabIndex="0"
                      onKeyPress={this.handleKeyPress}
                      className={`wizard__step${page === 3 ? ' wizard__step--active' : ''}`}
                    >
                      <p>Add Driver</p>
                    </div>
                    <div
                      role="link"
                      tabIndex="0"
                      onKeyPress={this.handleKeyPress}
                      className={`wizard__step${page === 4 ? ' wizard__step--active' : ''}`}
                    >
                      <p>Summary</p>
                    </div>
                  </div>
                  <div className="wizard__form-wrapper">
                    {/* onSubmit={this.nextPage} */}
                    {page === 1
                      && (
                      <AddTruckFormOne
                        p={page}
                        company={company}
                        onTruckSave={this.nextPage}
                        handleSubmit={this.nextPage}
                      />
                      )}
                    {page === 2
                      && (
                      <AddTruckFormTwo
                        onSubmit={this.nextPage}
                        company={company}
                        previousPage={this.previousPage}
                        handleSubmit={this.nextPage}
                      />
                      )}
                    {page === 3
                      && (
                        <AddTruckFormThree
                          previousPage={this.previousPage}
                          company={company}
                          onDriverSave={this.nextPage}
                          handleSubmit={this.nextPage}
                        />
                      )}
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
