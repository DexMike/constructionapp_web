import React, { PureComponent } from 'react';
import {
  Col,
  Card,
  CardBody,
  Row,
  Container,
  Button,
  ButtonToolbar,
  Modal
} from 'reactstrap';
import PropTypes from 'prop-types';
import EquipmentsService from '../../api/EquipmentService';
import AddTruckForm from './AddTruckForm';
import './AddTruck.css';

class AddTruck extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      loaded: false,
      totalTrucks: 0,
      modal: false
    };
    this.toggleAddTruckModal = this.toggleAddTruckModal.bind(this);
    this.closeIt = this.closeIt.bind(this);
  }

  async componentDidMount() {
    await this.fetchCompanyTrucks();
  }

  toggleAddTruckModal() {
    const { modal } = this.state;
    this.setState({
      modal: !modal
    });
  }

  // Pull trucks
  async fetchCompanyTrucks() {
    const { match } = this.props;
    const materials = await EquipmentsService.getEquipmentByEquipmentIdAndType(
      match.params.id,
      'Truck'
    );
    // console.log(materials);
    this.toggleAddTruckModal();
    this.setState({
      totalTrucks: materials.length,
      loaded: true
    });
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

  handlePageClick(menuItem) {
    if (menuItem) {
      this.setState({ [`goTo${menuItem}`]: true });
    }
  }

  renderModal() {
    const { match } = this.props;
    const {
      totalTrucks,
      modal
    } = this.state;
    let tabShow = 1;
    if (totalTrucks > 0) {
      tabShow = 3;
    }
    return (
      <Modal
        isOpen={modal}
        toggle={this.toggleAddTruckModal}
        className="modal-dialog--primary modal-dialog--header"
      >
        <div className="modal__header">
          <button type="button" className="lnr lnr-cross modal__close-btn" onClick={this.toggleAddTruckModal}/>
          <h4 className="bold-text modal__title">Truck and Drivers management</h4>
        </div>
        <div className="modal__body" style={{ padding: '12px' }}>
          <AddTruckForm id={match.params.id} incomingPage={tabShow} handlePageClick={() => {}} />
        </div>
      </Modal>
    );
  }

  renderButton() {
    return (
      <Container className="dashboard">
        <Row>
          {/* <h1>TEST</h1> */}
          <Col md={12} lg={12}>
            <Card>
              <CardBody>
                <Row className="col-md-12">
                  <div className="card__title">
                    <h5 className="bold-text">
                        Welcome to Trelar, Lets add a truck so customers can find you
                    </h5>
                  </div>
                </Row>
                <Row className="col-md-12">
                  <ButtonToolbar className="form__button-toolbar wizard__toolbar">
                    <Button
                      color="success"
                      type="button"
                      onClick={() => {
                        this.toggleAddTruckModal();
                      }}
                      className="previous"
                    >
                      Launch it
                    </Button>
                  </ButtonToolbar>
                </Row>
              </CardBody>
            </Card>
          </Col>
        </Row>
      </Container>
    );
  }

  render() {
    const { loaded } = this.state;
    if (loaded) {
      return (
        <Container className="dashboard">
          {this.renderModal()}
          {this.renderButton()}
        </Container>
      );
    }
    return (
      <Container className="dashboard">
        Loading...
      </Container>
    );
  }
}

AddTruck.propTypes = {
  /*
  equipment: PropTypes.shape({
    id: PropTypes.number
  }),
  */
  match: PropTypes.shape({
    params: PropTypes.shape({
      id: PropTypes.string
    })
  })
};

AddTruck.defaultProps = {
  // company: null,
  match: {
    params: {}
  }
};

export default AddTruck;
