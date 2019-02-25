import React, { Component } from 'react';
import { Redirect } from 'react-router-dom';
import {
  Card,
  CardBody,
  Col,
  Container,
  Row
} from 'reactstrap';
import moment from 'moment';
import EquipmentService from '../../api/EquipmentService';
import TTable from '../common/TTable';

class EquipmentListPage extends Component {
  constructor(props) {
    super(props);

    this.state = {
      activeTab: '1',
      equipments: [],
      goToDashboard: false,
      goToAddEquipment: false,
      goToUpdateEquipment: false,
      equipmentId: 0
    };

    this.renderGoTo = this.renderGoTo.bind(this);
    this.handleEquipmentEdit = this.handleEquipmentEdit.bind(this);
    this.toggle = this.toggle.bind(this);
  }

  async componentDidMount() {
    await this.fetchEquipments();
  }

  toggle(tab) {
    const { activeTab } = this.state;
    if (activeTab !== tab) {
      this.setState({
        activeTab: tab
      });
    }
  }

  async fetchEquipments() {
    let equipments = await EquipmentService.getEquipments();
    equipments = equipments.map((equipment) => {
      const newEquipment = equipment;
      newEquipment.modifiedOn = moment(equipment.modifiedOn)
        .format();
      newEquipment.createdOn = moment(equipment.createdOn)
        .format();
      return newEquipment;
    });
    this.setState({ equipments });
  }

  handlePageClick(menuItem) {
    if (menuItem) {
      this.setState({ [`goTo${menuItem}`]: true });
    }
  }

  handleEquipmentEdit(id) {
    this.setState({
      goToUpdateEquipment: true,
      equipmentId: id
    });
  }

  renderGoTo() {
    const { goToDashboard, goToAddEquipment, goToUpdateEquipment, equipmentId } = this.state;
    if (goToDashboard) {
      return <Redirect push to="/" />;
    }
    if (goToAddEquipment) {
      return <Redirect push to="/trucks/save" />;
    }
    if (goToUpdateEquipment) {
      return <Redirect push to={`/trucks/save/${equipmentId}`} />;
    }
    return true;
  }

  render() {
    const { equipments } = this.state;
    return (
      <Container className="dashboard">
        {this.renderGoTo()}
        <button type="button" className="app-link"
          onClick={() => this.handlePageClick('Dashboard')}
        >
          Dashboard
        </button>
        &nbsp;&#62; Trucks
        <Row>
          <Col md={12}>
            <h3 className="page-title">Equipment</h3>
          </Col>
        </Row>
        <Row>
          <Col md={12} lg={12}>
            <Card>
              <CardBody className="products-list">
                <div className="tabs tabs--bordered-bottom">
                  <div className="tabs__wrap">
                    <TTable
                          columns={
                            [
                              {
                                name: 'id',
                                displayName: 'ID'
                              },
                              {
                                name: 'image',
                                displayName: 'Image'
                              },
                              {
                                name: 'companyId',
                                displayName: 'CompanyID'
                              },
                              {
                                name: 'name',
                                displayName: 'Name'
                              },
                              {
                                name: 'licensePlate',
                                displayName: 'License Plate'
                              },
                              {
                                name: 'modifiedBy',
                                displayName: 'Modified By'
                              },
                              {
                                name: 'modifiedOn',
                                displayName: 'Modified On'
                              },
                              {
                                name: 'isArchived',
                                displayName: 'Is Archived'
                              }
                            ]
                          }
                          data={equipments}
                          handleIdClick={this.handleEquipmentEdit}
                    />
                  </div>
                </div>
              </CardBody>
            </Card>
          </Col>
        </Row>
      </Container>
    );
  }
}

export default EquipmentListPage;
