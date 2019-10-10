import { Button, Card, CardBody, Col, Container, Modal, Row } from 'reactstrap';
import React, { Component } from 'react';
import MultiEquipmentsForm from './MultiEquipmentsForm';
import AuthService from '../../utils/AuthService';
import ProfileService from '../../api/ProfileService';

class AddFirstEquipmentPage extends Component {

  constructor(props) {
    super(props);

    this.state = {
      equipmentsModal: false,
      userId: 0,
      companyId: 0
    };

    this.toggleAddMultiTrucksModal = this.toggleAddMultiTrucksModal.bind(this);
  }

  async componentDidMount() {
    let { userId, companyId } = { ...this.state };
    try {
      const profile = await ProfileService.getProfile();
      userId = profile.userId;
      companyId = profile.companyId;
    } catch (e) {
      console.error(e);
    }

    this.setState({
      companyId,
      userId
    });
  }

  async logOut() {
    await AuthService.logOut();
  }

  handleAddedTruck() {
    window.location.href = '/';
  }

  toggleAddMultiTrucksModal() {
    const { equipmentsModal } = this.state;
    this.setState({
      equipmentsModal: !equipmentsModal
    }, this.loadEquipments);
  }

  renderEquipmentsModal() {
    const { equipmentsModal, userId, companyId } = this.state;
    return (
      <Modal
        isOpen={equipmentsModal}
        toggle={this.toggleAddMultiTrucksModal}
        className="equipments-modal modal-dialog--primary modal-dialog--header"
      >
        <div className="modal__body">
          <MultiEquipmentsForm
            userId={userId}
            companyId={companyId}
            toggle={this.toggleAddMultiTrucksModal}
            onSuccess={this.handleAddedTruck}
          />
        </div>
      </Modal>
    );
  }

  render() {
    return (
      <React.Fragment>
        { this.renderEquipmentsModal() }
        <div className="theme-light">
          <div className="wrapper">
            <main>
              <div className="account" style={{ background: 'rgb(231, 231, 226)' }}>
                <div className="account__wrapper">
                  <div className="account__card">
                    <div className="account__head">
                      <h3 className="account__title">
                        Welcome to&nbsp;
                        <span className="account__logo">
                        TRE
                          <span className="account__logo-accent">
                          LAR
                          </span>
                        </span>
                      </h3>
                    </div>
                    <Row>
                      <Col lg={12} style={{ marginBottom: 30 }}>
                        Add your trucks to your profile to start using the app.
                      </Col>
                    </Row>
                    <Row className="col-12 pt-4">
                      <Col md={6}>
                        <Button
                          style={{width: 120}}
                          onClick={this.toggleAddMultiTrucksModal}
                          type="button"
                          className="primaryButton"
                        >
                          Add a Truck
                        </Button>
                      </Col>
                      <Col md={6} className="text-right">
                        <Button className="tertiaryButton" type="button" onClick={this.logOut}>
                          Log Out
                        </Button>
                      </Col>
                    </Row>
                  </div>
                </div>
              </div>
            </main>
          </div>
        </div>
      </React.Fragment>
    );
  }
}

export default AddFirstEquipmentPage;
