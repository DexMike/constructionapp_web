import { Button, Card, CardBody, Col, Container, Modal, Row } from 'reactstrap';
import React, { Component } from 'react';
import MultiEquipmentsForm from './MultiEquipmentsForm';
import AuthService from '../../utils/AuthService';
import ProfileService from '../../api/ProfileService';
import TTable from '../common/TTable';

class AddFirstEquipmentPage extends Component {

  constructor(props) {
    super(props);

    this.state = {
      equipmentsModal: false,
      userId: 0,
      companyId: 0,
      equipments: []
    };

    this.toggleAddMultiTrucksModal = this.toggleAddMultiTrucksModal.bind(this);
    this.handleAddedTruck = this.handleAddedTruck.bind(this);
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

  handleAddedTruck(equipment) {
    // const { numberOfTrucks,
    //   truckType,
    //   selectedMaterials,
    //   isRatedHour,
    //   isRatedTon,
    //   maxCapacity,
    //   maxDistanceToPickup,
    //   ratesCostPerHour,
    //   ratesCostPerTon,
    //   minTons,
    //   minOperatingTime } = { ...equipments };
    const {equipments} = { ...this.state };
    const newEquipment = {...equipment};
    newEquipment.materials = equipment.selectedMaterials.map(mat => mat.label).join(', ');
    delete newEquipment.selectedMaterials;
    equipments.push(newEquipment);
    this.setState({equipments});
  }

  continueToApp() {
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
    const { equipments } = { ...this.state };
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
                    <Row>
                      <Col lg={12} style={{ marginBottom: 30 }}>
                        { equipments.length > 0 && (
                          <TTable
                          data={equipments}
                          columns={[
                            {
                              name: 'truckType',
                              displayName: 'Type of Truck'
                            }, {
                              name: 'materials',
                              displayName: 'Materials'
                            }, {
                              name: 'maxCapacity',
                              displayName: 'Capacity    '
                            }
                          ]}
                          handleIdClick={() => {}}
                          handlePageChange={() => {}}
                          handleRowsChange={() => {}}
                          />
                        )}
                      </Col>
                    </Row>
                    <Row className="col-12 pt-4">
                      <Col md={4}>
                        <Button
                          style={{width: 120}}
                          onClick={this.toggleAddMultiTrucksModal}
                          type="button"
                          className="primaryButton"
                        >
                          Add a Truck
                        </Button>
                      </Col>
                      <Col md={4}>
                        { equipments.length > 0 && (
                        <Button
                          style={{width: 120}}
                          onClick={this.continueToApp}
                          type="button"
                          className="primaryButton"
                        >
                          Continue
                        </Button>
                        )}
                      </Col>
                      <Col md={4} className="text-right">
                        <Button
                          className="tertiaryButton"
                          style={{width: 100}}
                          type="button"
                          onClick={this.logOut}
                        >
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
