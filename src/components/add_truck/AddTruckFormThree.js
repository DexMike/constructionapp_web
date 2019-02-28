import React, { PureComponent } from 'react';
import {
  Card,
  CardBody,
  Col
} from 'reactstrap';
// import EyeIcon from 'mdi-react/EyeIcon';

// import PropTypes from 'prop-types';
// import TCheckBox from '../common/TCheckBox';

class AddTruckFormThree extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      // showPassword: false
    };
    this.handleInputChange = this.handleInputChange.bind(this);
    // this.handleSubmit = this.handleSubmit.bind(this);
  }

  handleInputChange(e) {
    let { value } = e.target;
    if (e.target.name === 'isArchived') {
      value = e.target.checked ? Number(1) : Number(0);
    }
    this.setState({ [e.target.name]: value });
  }

  async saveAddress() {
    /*
    // use like FORM pages in others
    */
  }

  render() {
    // const { handleSubmit } = this.props;
    // const { showPassword } = this.state;
    return (
      <Col md={12} lg={12}>
        <Card>
          <CardBody>
            Add driver page (If redirected here, it means that a Truck has been found).
          </CardBody>
        </Card>
      </Col>
    );
  }
}

AddTruckFormThree.propTypes = {
  // handleSubmit: PropTypes.func.isRequired
};

export default AddTruckFormThree;
