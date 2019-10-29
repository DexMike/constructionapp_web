import { Button, Col, Modal, Row } from 'reactstrap';
import React, { Component } from 'react';
// import EquipmentsShortForm from './EquipmentsShortForm';
// import AuthService from '../../utils/AuthService';
// import ProfileService from '../../api/ProfileService';
import { withTranslation } from 'react-i18next';
import TTable from '../common/TTable';
import DriverForm from './DriverForm';
import ProfileService from '../../api/ProfileService';
import UserService from '../../api/UserService';

class AddFirstDriverPage extends Component {
  constructor(props) {
    super(props);

    this.state = {
      driversModal: false,
      userId: 0,
      companyId: 0,
      drivers: []
    };

    this.toggleAddDriversModal = this.toggleAddDriversModal.bind(this);
    this.handleAddedDriver = this.handleAddedDriver.bind(this);
  }

  async componentDidMount() {
    let { user, userId, companyId, drivers } = { ...this.state };
    try {
      const profile = await ProfileService.getProfile();
      user = await UserService.getUserById(profile.userId);
      // eslint-disable-next-line prefer-destructuring
      userId = profile.userId;
      // eslint-disable-next-line prefer-destructuring
      companyId = profile.companyId;
      drivers = [
        {
          driverName: `${user.firstName} ${user.lastName}`,
          driverStatus: 'Enabled'
        }
      ];
    } catch (e) {
      console.error(e);
    }

    this.setState({
      companyId,
      userId,
      drivers,
      user
    });
  }

  continueToApp() {
    window.location.href = '/';
  }

  toggleAddDriversModal() {
    const { driversModal } = this.state;
    this.setState({
      driversModal: !driversModal
    });
  }

  handleAddedDriver(user, driver) {
    const { drivers } = { ...this.state };
    const newDriver = { ...driver };
    const newUser = { ...user };
    // newEquipment.materials = equipment.selectedMaterials.map(mat => mat.label).join(', ');
    // delete newEquipment.selectedMaterials;
    drivers.push({
      driverName: `${newUser.firstName} ${newUser.lastName}`,
      driverStatus: newDriver.driverStatus
    });
    this.setState({ drivers });
  }

  renderDriversModal() {
    const { driversModal, user } = this.state;
    return (
      <Modal
        isOpen={driversModal}
        toggle={this.toggleAddDriversModal}
        className="driver-modal modal-  dialog--primary modal-dialog--header"
      >
        <div className="modal__body" style={{ padding: '0px' }}>
          <DriverForm
            toggle={this.toggleAddDriversModal}
            driverId={0}
            currentUser={user}
            onSuccess={this.handleAddedDriver}
          />
        </div>
      </Modal>
    );
  }

  render() {
    const { drivers } = { ...this.state };
    const { t } = { ...this.props };
    return (
      <React.Fragment>
        { this.renderDriversModal() }
        <div className="theme-light">
          <div className="wrapper">
            <main>
              <div className="account" style={{ background: 'rgb(231, 231, 226)' }}>
                <div className="account__wrapper">
                  <div className="account__card" style={{width: '600px', maxWidth: '600px'}}>
                    <div className="account__head">
                      <h3 className="account__title">
                        {t('Welcome to')}&nbsp;
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
                        {t('ADD_DRIVER_ASK')}
                      </Col>
                    </Row>
                    <Row>
                      <Col lg={12} style={{ marginBottom: 30 }}>
                        { drivers.length > 0 && (
                          <TTable
                            data={drivers}
                            columns={[
                              {
                                name: 'driverName',
                                displayName: t('Name')
                              }, {
                                name: 'driverStatus',
                                displayName: t('Status')
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
                      <Col md={6}>
                        <Button
                          onClick={this.toggleAddDriversModal}
                          type="button"
                          className="primaryButton"
                        >
                          {t('Add Driver')}
                        </Button>
                      </Col>
                      <Col md={6}>
                        { drivers.length > 0 && (
                          <Button
                            onClick={this.continueToApp}
                            type="button"
                            className="primaryButton"
                          >
                            {t('Continue')}
                          </Button>
                        )}
                        { drivers.length <= 0 && (
                          <Button
                            onClick={this.continueToApp}
                            type="button"
                            className="primaryButton"
                          >
                            {t('Skip')}
                          </Button>
                        )}
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

export default withTranslation()(AddFirstDriverPage);
