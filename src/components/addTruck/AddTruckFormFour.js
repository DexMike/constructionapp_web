import React, { PureComponent } from 'react';
import {
  Card,
  CardBody,
  Col
} from 'reactstrap';

// import EyeIcon from 'mdi-react/EyeIcon';

// import PropTypes from 'prop-types';
// import TCheckBox from '../common/TCheckBox';

class AddTruckFormFour extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      // showPassword: false
    };
    this.handleInputChange = this.handleInputChange.bind(this);
    // this.handleSubmit = this.handleSubmit.bind(this);
  }

  // on the login I can find something like this
  showPassword(e) {
    e.preventDefault();
    const { showPassword } = this.state;
    this.setState({
      showPassword
    });
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
          <CardBody />
        </Card>
      </Col>
    );
  }
}

AddTruckFormFour.propTypes = {
  // handleSubmit: PropTypes.func.isRequired
};

export default AddTruckFormFour;
