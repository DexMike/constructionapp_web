import React, {Component} from 'react';
import {
  Button, ButtonToolbar, Card, CardBody, Col, Container, Modal,
  Row
} from 'reactstrap';
import '../addTruck/AddTruck.css';
import * as PropTypes from 'prop-types';
import truckImage from '../../img/default_truck.png';
import ProfileService from '../../api/ProfileService';
import CompanyService from '../../api/CompanyService';
import TSubmitButton from "../common/TSubmitButton";
import BidService from "../../api/BidService";
import GroupListService from "../../api/GroupListService";
import UserService from "../../api/UserService";

class CarrierRow extends Component {
  constructor(props) {
    super(props);
    this.state = {
      modalFavoriteCarrier: false,
      modalRequestJob: false,
      carrierCompany: null,
      profile: null,
      producerCompany: null,
      approveFavorite: '',
      approveRequest: '',
      isLoading: true,
      favoriteWarningEmail: '',
      forceSend: false
    };
    this.sendFavorite = this.sendFavorite.bind(this);
    this.editEquipment = this.editEquipment.bind(this);
    this.handleApproveInputChange = this.handleApproveInputChange.bind(this);
    this.toggleFavoriteModal = this.toggleFavoriteModal.bind(this);
    this.toggleRequestJobModal = this.toggleRequestJobModal.bind(this);
    this.handleRequest = this.handleRequest.bind(this);
  }

  async componentDidMount() {
    const {
      carrierId
    } = this.props;
    const profile = await ProfileService.getProfile();
    const producerCompany = await CompanyService.getCompanyById(profile.companyId);
    const carrierCompany = await CompanyService.getCompanyById(carrierId);
    this.setState({carrierCompany, producerCompany, profile, isLoading: false});
  }

  async toggleFavoriteModal() {
    const {modalFavoriteCarrier} = this.state;
    this.setState({
      modalFavoriteCarrier: !modalFavoriteCarrier
    });
  }

  async toggleRequestJobModal() {
    const {modalRequestJob} = this.state;
    this.setState({
      modalRequestJob: !modalRequestJob
    });
  }

  async sendFavorite(companyId, forceSend) {
    const {
      setFavorite
    } = this.props;
    const {carrierCompany, producerCompany} = {...this.state};
    const group = await GroupListService.getGroupListsByCompanyId(companyId, producerCompany.id);

    group.map((item) => {
      if (item.name === 'Favorite') {
        return item.companyId;
      }
      return null;
    });
    if (group.length === 0 && !forceSend
      && (carrierCompany.liabilityGeneral < producerCompany.liabilityGeneral
      || carrierCompany.liabilityAuto < producerCompany.liabilityAuto
      || carrierCompany.liabilityOther < producerCompany.liabilityOther)) {
      this.setState({modalFavoriteCarrier: true});
    } else {
      setFavorite(companyId);
    }
  }

  async handleRequest(companyId) {
    const {producerCompany} = {...this.state};
    const carrierCompany = CompanyService.getCompanyById(companyId);
    if (carrierCompany.liabilityGeneral < producerCompany.liabilityGeneral
      || carrierCompany.liabilityAuto < producerCompany.liabilityAuto
      || carrierCompany.liabilityOther < producerCompany.liabilityOther) {
      this.setState({modalRequestJob: true});
    } else {
      this.editEquipment(companyId);
    }
  }

  handleApproveInputChange(e) {
    this.setState({[e.target.name]: e.target.value.toUpperCase()});
  }

  editEquipment(companyId) {
    const {
      requestEquipment
    } = this.props;
    requestEquipment(companyId);
  }

  renderFavoriteModal() {
    const {
      modalFavoriteCarrier,
      producerCompany,
      carrierCompany,
      approveFavorite
    } = this.state;
    const {
      carrierId
    } = this.props;
    if (modalFavoriteCarrier) {
      return (
        <Modal
          isOpen={modalFavoriteCarrier}
          toggle={this.toggleViewJobModal}
          className="modal-dialog--primary modal-dialog--header"
        >
          <div className="modal__header">
            <button type="button" className="lnr lnr-cross modal__close-btn"
                    onClick={this.toggleViewJobModal}
            />
            <div className="bold-text modal__title">Carrier Favorite</div>
          </div>
          <div className="modal__body" style={{padding: '10px 25px 0px 25px'}}>
            <Container className="dashboard">
              <Row>
                <Col md={12} lg={12}>
                  <Card style={{paddingBottom: 0}}>
                    <CardBody
                      className="form form--horizontal addtruck__form"
                    >
                      <Row className="col-md-12">
                        Are you sure you want to accept this carrier as a favorite?
                      </Row>
                      <hr/>
                      <Row className="col-md-12" style={{paddingBottom: 50}}>
                        <Row className="col-md-12">
                          <span style={{fontWeight: 'bold'}}> Minimum Insurance Level Warning</span>
                        </Row>
                        <Row className="col-md-12">
                          {carrierCompany.liabilityGeneral < producerCompany.liabilityGeneral && (
                            <Row className="col-md-12">
                              <i className="material-icons iconSet" style={{color: 'red'}}>ic_report_problem</i>
                              General: {carrierCompany.legalName} has {carrierCompany.liabilityGeneral},
                              but requires {producerCompany.liabilityGeneral}
                            </Row>
                          )}
                          {carrierCompany.liabilityAuto < producerCompany.liabilityAuto && (
                            <Row className="col-md-12">
                              <i className="material-icons iconSet" style={{color: 'red'}}>ic_report_problem</i>
                              Auto: {carrierCompany.legalName} has {carrierCompany.liabilityAuto},
                              but requires {producerCompany.liabilityAuto}
                            </Row>
                          )}
                          {carrierCompany.liabilityOther < producerCompany.liabilityOther && (
                            <Row className="col-md-12">
                              <i className="material-icons iconSet" style={{color: 'red'}}>ic_report_problem</i>
                              Other: {carrierCompany.legalName} has {carrierCompany.liabilityOther},
                              but requires {producerCompany.liabilityOther}
                            </Row>
                          )}
                          <Row className="col-md-12">
                            To use this carrier, and override your insurance requirements,
                            you must type APPROVE in this box:
                            <Row className="col-md-12" style={{paddingTop: 15}}>
                              <div className="form__form-group-field">
                                <input
                                  name="approveInsurance"
                                  type="text"
                                  value={approveFavorite}
                                  onChange={this.handleApproveInputChange}
                                />
                              </div>
                            </Row>
                          </Row>
                        </Row>
                      </Row>
                      <Row className="col-md-12">
                        <ButtonToolbar className="col-md-4 wizard__toolbar">
                          <Button color="minimal" className="btn btn-outline-secondary"
                                  type="button"
                                  onClick={this.toggleFavoriteModal}
                          >
                            Cancel
                          </Button>
                        </ButtonToolbar>
                        <ButtonToolbar className="col-md-8 wizard__toolbar right-buttons">
                          <TSubmitButton
                            // onClick={() => this.saveBid('accept')}
                            onClick={() => {
                              if (approveFavorite === 'APPROVE') {
                                this.sendFavorite(carrierId, true);
                                this.toggleFavoriteModal();
                              }
                            }
                            }
                            className="primaryButton float-right"
                            loaderSize={10}
                            bntText="Yes, favorite this carrier"
                          />
                        </ButtonToolbar>
                      </Row>
                    </CardBody>
                  </Card>
                </Col>
              </Row>
            </Container>
          </div>
        </Modal>
      );
    }
    return null;
  }

  renderRequestJobModal() {
    const {
      modalRequestJob,
      producerCompany,
      carrierCompany,
      approveRequest
    } = this.state;
    const {
      carrierId
    } = this.props;
    if (modalRequestJob) {
      return (
        <Modal
          isOpen={modalRequestJob}
          toggle={this.toggleRequestJobModal}
          className="modal-dialog--primary modal-dialog--header"
        >
          <div className="modal__header">
            <button type="button" className="lnr lnr-cross modal__close-btn"
                    onClick={this.toggleRequestJobModal}
            />
            <div className="bold-text modal__title">Carrier Favorite</div>
          </div>
          <div className="modal__body" style={{padding: '10px 25px 0px 25px'}}>
            <Container className="dashboard">
              <Row>
                <Col md={12} lg={12}>
                  <Card style={{paddingBottom: 0}}>
                    <CardBody
                      className="form form--horizontal addtruck__form"
                    >
                      <Row className="col-md-12">
                        Are you sure you want to accept this carrier as a favorite?
                      </Row>
                      <hr/>
                      <Row className="col-md-12" style={{paddingBottom: 50}}>
                        <Row className="col-md-12">
                          <span style={{fontWeight: 'bold'}}> Minimum Insurance Level Warning</span>
                        </Row>
                        <Row className="col-md-12">
                          {carrierCompany.liabilityGeneral < producerCompany.liabilityGeneral && (
                            <Row className="col-md-12">
                              <i className="material-icons iconSet" style={{color: 'red'}}>ic_report_problem</i>
                              General: {carrierCompany.legalName} has {carrierCompany.liabilityGeneral},
                              but requires {producerCompany.liabilityGeneral}
                            </Row>
                          )}
                          {carrierCompany.liabilityAuto < producerCompany.liabilityAuto && (
                            <Row className="col-md-12">
                              <i className="material-icons iconSet" style={{color: 'red'}}>ic_report_problem</i>
                              Auto: {carrierCompany.legalName} has {carrierCompany.liabilityAuto},
                              but requires {producerCompany.liabilityAuto}
                            </Row>
                          )}
                          {carrierCompany.liabilityOther < producerCompany.liabilityOther && (
                            <Row className="col-md-12">
                              <i className="material-icons iconSet" style={{color: 'red'}}>ic_report_problem</i>
                              Other: {carrierCompany.legalName} has {carrierCompany.liabilityOther},
                              but requires {producerCompany.liabilityOther}
                            </Row>
                          )}
                          <Row className="col-md-12">
                            To use this carrier, and override your insurance requirements,
                            you must type APPROVE in this box:
                            <Row className="col-md-12" style={{paddingTop: 15}}>
                              <div className="form__form-group-field">
                                <input
                                  name="approveRequest"
                                  type="text"
                                  value={approveRequest}
                                  onChange={this.handleApproveInputChange}
                                />
                              </div>
                            </Row>
                          </Row>
                        </Row>
                      </Row>
                      <Row className="col-md-12">
                        <ButtonToolbar className="col-md-4 wizard__toolbar">
                          <Button color="minimal" className="btn btn-outline-secondary"
                                  type="button"
                                  onClick={this.toggleRequestJobModal}
                          >
                            Cancel
                          </Button>
                        </ButtonToolbar>
                        <ButtonToolbar className="col-md-8 wizard__toolbar right-buttons">
                          <TSubmitButton
                            // onClick={() => this.saveBid('accept')}
                            onClick={() => {
                              if (approveRequest === 'APPROVE') {
                                this.editEquipment(carrierId);
                                this.toggleRequestJobModal();
                              }
                            }
                            }
                            className="primaryButton float-right"
                            loaderSize={10}
                            bntText="Yes, request job"
                          />
                        </ButtonToolbar>
                      </Row>
                    </CardBody>
                  </Card>
                </Col>
              </Row>
            </Container>
          </div>
        </Modal>
      );
    }
    return null;
  }

  renderMaterials(materials) {
    return (
      <table>
        <thead>
        <tr>
          <th>Materials Hauled</th>
        </tr>
        </thead>
        <tbody>
        {
          materials.map((value, i) => (
            <tr key={`li_${i}`}>
              <td>{value}</td>
            </tr>
          ))
        }
        </tbody>
      </table>
    );
  }

  renderTotals(equipmentTypes) {
    return (
      <table>
        <thead>
        <tr>
          <th>Type of Trucks</th>
          <th># of Trucks</th>
        </tr>
        </thead>
        <tbody>
        {
          equipmentTypes.map((value, i) => (
            <tr key={`tru_${i}`}>
              <td>{value.equipmentType}</td>
              <td style={{textAlign: 'center'}}>{value.count}</td>
            </tr>
          ))
        }
        </tbody>
      </table>
    );
  }

  render() {
    const {
      carrierName,
      carrierId,
      favorite,
      distance,
      equipmentTypes,
      materials
    } = this.props;
    const {isLoading} = this.state;
    if (!isLoading) {
      return (
        <React.Fragment>
          {this.renderFavoriteModal()}
          {this.renderRequestJobModal()}
          <Row className="truck-card truck-details">
            <div className="col-md-12">
              <div className="row">
                <div className="col-md-3">
                  <h5>
                    {carrierName} {distance ? `[Distance: ${distance.toFixed(2)} mi]` : ''}
                  </h5>
                  <br/>
                  <img src={truckImage} alt="" style={{width: 'auto', display: 'block', margin: '0 auto'}}
                  />
                </div>
                <div className="col-md-9">
                  <div className="row truck-card">
                    <div className="col-md-6">
                      {this.renderTotals(equipmentTypes)}
                    </div>
                    <div className="col-md-3">
                      {this.renderMaterials(materials)}
                    </div>
                    <div className="col-md-3 button-card">
                      <Button
                        onClick={() => this.handleRequest(carrierId)}
                        className="btn btn-primary"
                        styles="margin:0px !important"
                      >
                        Request Job
                      </Button>
                      <Button
                        color="link"
                        onClick={() => this.sendFavorite(carrierId, false)}
                        className={favorite ? 'material-icons favoriteIcon' : 'material-icons-outlined favoriteIcon'}
                      >
                        thumb_up
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Row>
          <hr/>
        </React.Fragment>
      );
    }
    return null;
  }
}

CarrierRow.propTypes = {
  carrierId: PropTypes.number,
  carrierName: PropTypes.string,
  favorite: PropTypes.bool,
  setFavorite: PropTypes.func,
  requestEquipment: PropTypes.func,
  distance: PropTypes.number,
  equipmentTypes: PropTypes.arrayOf(PropTypes.shape({
    equipmentType: PropTypes.string,
    count: PropTypes.number
  })),
  materials: PropTypes.arrayOf(PropTypes.string)
};

CarrierRow.defaultProps = {
  carrierId: null,
  carrierName: null,
  favorite: false,
  setFavorite: null,
  requestEquipment: null,
  distance: null,
  equipmentTypes: [],
  materials: []
};

export default CarrierRow;
