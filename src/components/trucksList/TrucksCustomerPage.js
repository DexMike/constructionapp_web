import React, {Component} from 'react';
import {Redirect} from 'react-router-dom';
import {
  Button,
  Card,
  CardBody,
  Col,
  Container,
  Modal,
  Row
} from 'reactstrap';
import NumberFormat from 'react-number-format';
import TSelect from '../common/TSelect';
import JobCreateForm from '../jobs/JobCreateForm';
import truckImage from '../../img/default_truck.png';
import ProfileService from '../../api/ProfileService';
import './Truck.css';
import GroupService from '../../api/GroupService';
import GroupListService from '../../api/GroupListService';
import TruckFilter from '../filters/TruckFilter';

class TrucksCustomerPage extends Component {
  constructor(props) {
    super(props);

    // NOTE: if you update this list you have to update
    // Orion.EquipmentDao.filtersOrderByClause
    const sortByList = ['Hourly ascending', 'Hourly descending',
      'Tonnage ascending', 'Tonnage descending'];

    // Comment
    this.state = {
      loaded: false,
      // Look up lists
      materialTypeList: [],
      sortByList,
      equipments: [],
      selectedEquipment: {},
      modal: false,
      goToDashboard: false
    };

    this.renderGoTo = this.renderGoTo.bind(this);
    this.handleEquipmentEdit = this.handleEquipmentEdit.bind(this);
    this.returnSelectedMaterials = this.returnSelectedMaterials.bind(this);
    this.retrieveAllMaterials = this.retrieveAllMaterials.bind(this);
    this.toggleSelectMaterialsModal = this.toggleSelectMaterialsModal.bind(this);
    this.returnEquipments = this.returnEquipments.bind(this);
  }

  async componentDidMount() {
    const {filters} = this.state;
    // await this.fetchJobs();
    const profile = await ProfileService.getProfile();
    filters.userId = profile.userId;
    await this.fetchEquipments();
    await this.fetchFilterLists();
    this.setState({loaded: true});
  }

  returnEquipments(equipments) {
    this.setState({equipments});
    return equipments;
  }

  retrieveAllMaterials() {
    const {materialTypeList} = this.state;
    return materialTypeList;
  }


  handlePageClick(menuItem) {
    if (menuItem) {
      this.setState({[`goTo${menuItem}`]: true});
    }
  }

  async handleSetFavorite(companyId) {
    const {equipments} = this.state;

    try {
      const group = await GroupListService.getGroupListsByCompanyId(companyId);
      const profile = await ProfileService.getProfile();

      // we get check for groups.companyId = companyId that have name 'Favorite'
      group.map((item) => {
        if (item.name === 'Favorite') {
          return item.companyId;
        }
        return null;
      });

      // if we got a group with companyId
      if (group.length > 0) { // delete
        // first we delete the Group List
        await GroupListService.deleteGroupListById(group[0].id);
        // then the Group
        await GroupService.deleteGroupById(group[0].groupId);
      } else { // create "Favorite" Group record
        const groupData = {
          createdBy: profile.userId,
          companyId
        };
        await GroupListService.createFavoriteGroupList(groupData);
      }
      this.fetchFavoriteEquipments(equipments);
    } catch (error) {
      this.setState({equipments});
    }
  }

  handleEquipmentEdit(id) {
    const {equipments, filters} = this.state;

    const [selectedEquipment] = equipments.filter((equipment) => {
      if (id === equipment.id) {
        return equipment;
      }
      return false;
    }, id);

    // prevent dialog if no selected materials
    if (filters.materialType.length === 0) {
      const hauledMaterials = selectedEquipment.materials.match(/[^\r\n]+/g);
      const options = [];

      if (hauledMaterials && hauledMaterials.length > 0) {
        hauledMaterials.forEach((material) => {
          const m = {
            label: material,
            name: 'materialType',
            value: material
          };
          options.push(m);
        });
      }

      filters.materialType = options;

      // TODO:UI replace with a better error message dialog
      // alert('I\'m sorry but this Truck does not have any allowable materials.
      // Please select a truck with Materials');
      // return false;
    }
    this.setState({
      selectedEquipment,
      modal: true
    });
    return true;
  }

  toggleSelectMaterialsModal() {
    const {modalSelectMaterials} = this.state;
    this.setState({
      modalSelectMaterials: !modalSelectMaterials
    });
  }

  returnSelectedMaterials() {
    const {filters} = this.state;
    return filters.materialType;
  }

  preventModal() {
    this.setState({modal: false});
  }

  renderGoTo() {
    const status = this.state;
    if (status.goToDashboard) {
      return <Redirect push to="/"/>;
    }
    // if (status.goToAddJob) {
    //   return <Redirect push to="/jobs/save"/>;
    // }
    // if (status.goToUpdateJob) {
    //   return <Redirect push to={`/jobs/save/${status.jobId}`}/>;
    // }
    return false;
  }

  // renderSelectMaterialModal
  renderSelectMaterialModal() {
    const {
      modalSelectMaterials,
      toggleSelectMaterialsModal
    } = this.state;
    return (
      <Modal
        isOpen={modalSelectMaterials}
        toggle={this.toggleAddJobModal}
        className="modal-dialog--primary modal-dialog--header"
      >
        <div className="modal__header">
          <button
            type="button"
            className="lnr lnr-cross modal__close-btn"
            onClick={!toggleSelectMaterialsModal}
          />
          <h4 className="bold-text modal__title white_title">
            Select material
          </h4>
        </div>
        <div className="modal__body" style={{padding: '25px 25px 20px 25px'}}>
          Please select a material type for this job
        </div>

        <Row className="col-md-12">
          <div className="col-md-6">
            &nbsp;
          </div>
          <div className="col-md-6">
            <Button
              color="primary"
              onClick={!toggleSelectMaterialsModal}
              type="button"
              className="next float-right"
            >
              Close
            </Button>
          </div>
        </Row>
      </Modal>
    );
  }

  renderModal() {
    const {
      modal,
      selectedEquipment,
      materialTypeList
      // equipments
    } = this.state;
    // let { modalSelectMaterials } = this.state;

    const mats = this.returnSelectedMaterials();

    if (mats.length < 1 && modal && materialTypeList.length > 0) {
      // console.log(367);
      // this.toggleSelectMaterialsModal();
      // modalSelectMaterials = !modalSelectMaterials;
      this.preventModal();
      return false;
      // alert('Please select a material type for this job');
    }

    return (
      <Modal
        isOpen={modal}
        toggle={this.toggleAddJobModal}
        className="modal-dialog--primary modal-dialog--header form"
      >
        <div className="modal__header">
          <button type="button" className="lnr lnr-cross modal__close-btn"
                  onClick={this.toggleAddJobModal}
          />
          <div className="bold-text modal__title">Job Request</div>
        </div>
        <div className="modal__body" style={{padding: '25px 25px 20px 25px'}}>
          <JobCreateForm
            selectedEquipment={selectedEquipment}
            closeModal={this.toggleAddJobModal}
            selectedMaterials={this.returnSelectedMaterials}
            getAllMaterials={this.retrieveAllMaterials}
          />
        </div>
      </Modal>
    );
  }

  renderTitle() {
    return (
      <Row>
        <Col md={12}>
          <h3 className="page-title">Truck Search</h3>
        </Col>
      </Row>
    );
  }

  renderEquipmentRow(equipment) {
    let imageTruck = '';

    // checking if there's an image for the truck
    if ((equipment.image).trim()) { // use of trim removes whitespace from img url
      imageTruck = equipment.image;
    } else {
      imageTruck = `${window.location.origin}/${truckImage}`;
    }

    return (
      <React.Fragment>
        <Row className="truck-card truck-details">
          <div className="col-md-12">
            <div className="row">
              <div className="col-md-3">
                <img width="100%" src={imageTruck} alt=""
                     styles="background-size:contain;"
                />
              </div>
              <div className="col-md-9">
                <div className="row truck-card">
                  <div className="col-md-9">
                    <h3 className="subhead">
                      {equipment.name} | {equipment.type} | <NumberFormat
                      value={equipment.maxCapacity}
                      displayType="text"
                      decimalSeparator="."
                      decimalScale={0}
                      fixedDecimalScale
                      thousandSeparator
                      prefix=" "
                      suffix=" Tons"
                      />
                    </h3>
                  </div>
                  <div className="col-md-3 button-card">
                    <Button
                      onClick={() => this.handleEquipmentEdit(equipment.id)}
                      className="btn btn-primary"
                      styles="margin:0px !important"
                    >
                      Request
                    </Button>
                    <Button
                      color="link"
                      onClick={() => this.handleSetFavorite(equipment.companyId)}
                      className="material-icons favoriteIcon"
                    >
                      {equipment.favorite ? 'favorite' : 'favorite_border'}
                    </Button>
                  </div>
                </div>
                <div className="row truck-card">
                  <div className="col-md-6">
                    <h3 className="subhead">Rates</h3>
                    <Row>
                      {(equipment.rateType === 'Both' || equipment.rateType === 'Hour') && (
                        <React.Fragment>
                          <div className="col-md-6">
                            Hourly Rate:
                          </div>
                          <div className="col-md-6">
                            <NumberFormat
                              value={equipment.hourRate}
                              displayType="text"
                              decimalSeparator="."
                              decimalScale={2}
                              fixedDecimalScale
                              thousandSeparator
                              prefix="$ "
                              suffix=" / Hour"
                            />
                          </div>
                        </React.Fragment>
                      )}
                    </Row>
                    <Row>
                      <div className="col-md-6">
                        Hourly Minimum:
                      </div>
                      <div className="col-md-6">
                        <NumberFormat
                          value={equipment.minHours}
                          displayType="text"
                          decimalSeparator="."
                          decimalScale={2}
                          fixedDecimalScale
                          thousandSeparator
                          suffix=" hours min"
                        />
                      </div>
                    </Row>
                    {(equipment.rateType === 'Both' || equipment.rateType === 'Ton') && (
                      <React.Fragment>
                        <div className="row">
                          <div className="col-md-6">
                            Rate per Ton:
                          </div>
                          <div className="col-md-6">
                            <NumberFormat
                              value={equipment.tonRate}
                              displayType="text"
                              decimalSeparator="."
                              decimalScale={2}
                              fixedDecimalScale
                              thousandSeparator
                              prefix="$ "
                              suffix=" / Ton"
                            />
                          </div>
                        </div>
                        <div className="row">
                          <div className="col-md-6">
                            Minimum Tonnage Capacity:
                          </div>
                          <div className="col-md-6">
                            <NumberFormat
                              value={equipment.minCapacity}
                              displayType="text"
                              decimalSeparator="."
                              decimalScale={2}
                              fixedDecimalScale
                              thousandSeparator
                              suffix=" tons min"
                            />
                          </div>
                        </div>
                      </React.Fragment>
                    )}
                  </div>
                  <div className="col-md-6">
                    <h3 className="subhead">
                      Materials
                    </h3>
                    {equipment.materials}
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

  renderEquipmentTable() {
    const {
      sortByList,
      filters,
      equipments
    } = this.state;

    return (
      <Container>
        <Card>
          <CardBody>
            <Row className="truck-card">
              <Col md={6} id="equipment-display-count">
                Displaying&nbsp;
                {equipments.length}
                &nbsp;of&nbsp;
                {equipments.length}
              </Col>
              <Col md={6}>
                <Row>
                  <Col md={6} id="sortby">Sort By</Col>
                  <Col md={6}>
                    <TSelect
                      input={
                        {
                          onChange: this.handleSelectFilterChange,
                          name: 'sortBy',
                          value: filters.sortBy
                        }
                      }
                      meta={
                        {
                          touched: false,
                          error: 'Unable to select'
                        }
                      }
                      value={filters.sortBy}
                      options={
                        sortByList.map(sortBy => ({
                          name: 'sortBy',
                          value: sortBy,
                          label: sortBy
                        }))
                      }
                      placeholder={sortByList[0]}
                    />
                  </Col>
                </Row>
              </Col>
              <hr/>
            </Row>
            {
              equipments.map(equipment => (
                <React.Fragment key={equipment.id}>
                  {this.renderEquipmentRow(equipment)}
                </React.Fragment>
              ))
            }
          </CardBody>
        </Card>
      </Container>
    );
  }

  render() {
    const {loaded} = this.state;
    if (loaded) {
      return (
        <Container className="dashboard">
          {this.renderModal()}
          {this.renderGoTo()}
          {this.renderTitle()}
          <div className="truck-container">
            <TruckFilter returnEquipments={this.returnEquipments}/>
            {/* {this.renderTable()} */}
            {this.renderEquipmentTable()}
          </div>
        </Container>
      );
    }
    return (
      <div>
        Loading...
      </div>
    );
  }
}

export default TrucksCustomerPage;
