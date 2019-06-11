import React, { Component } from 'react';
import {
  Button,
  Col,
  Container,
  Row
} from 'reactstrap';
import * as PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import moment from 'moment';
import TFieldNumber from '../common/TFieldNumber';
import TSelect from '../common/TSelect';
import AddressService from '../../api/AddressService';
import CompanyService from '../../api/CompanyService';
import LookupsService from '../../api/LookupsService';

import './Settings.css';

class CompanyNotifications extends Component {
  constructor(props) {
    super(props);

    this.state = {
      equipmentTypes: [],
      materialTypes: [],
      rateTypes: [],
      selectedEquipments: ['Any'],
      selectedMaterials: ['Any'],
      selectedRateType: 'Any'
    };
    this.handleRateTypeChange = this.handleRateTypeChange.bind(this);
    this.handleCheckedMaterials = this.handleCheckedMaterials.bind(this);
    this.handleCheckedEquipments = this.handleCheckedEquipments.bind(this);
    this.saveCompanyNotificationsSettings = this.saveCompanyNotificationsSettings.bind(this);
  }

  async componentDidMount() {
    const { company } = this.props;
    await this.fetchLookupsValues();
  }

  setCheckedStatus(state, checkboxClass) {
    const x = document.getElementsByClassName(checkboxClass);
    for (let i = 0; i < x.length; i += 1) {
      x[i].checked = state;
    }
  }

  async fetchLookupsValues() {
    const lookups = await LookupsService.getLookups();

    let rateTypes = [];
    const equipmentTypes = [];
    const materialTypes = [];
    Object.values(lookups)
      .forEach((itm) => {
        if (itm.key === 'RateType') rateTypes.push(itm);
        if (itm.key === 'EquipmentType') equipmentTypes.push(itm.val1);
        if (itm.key === 'MaterialType') materialTypes.push(itm.val1);
      });

    rateTypes = rateTypes.map(rateType => ({
      value: String(rateType.val1),
      label: `${rateType.val1}`
    }));

    let index = equipmentTypes.indexOf('Any');
    equipmentTypes.splice(index, 1);
    equipmentTypes.push('Any');
    index = materialTypes.indexOf('Any');
    materialTypes.splice(index, 1);
    materialTypes.push('Any');

    this.setState({
      equipmentTypes,
      materialTypes,
      rateTypes
    });
  }

  handleRateTypeChange(e) {
    this.setState({
      selectedRateType: e.value
    });
  }

  handleCheckedEquipments(e) {
    console.log(88);
    let { selectedEquipments } = this.state;
    const { value } = e.target;

    if (value === 'Any') {
      this.setCheckedStatus(false, 'equipments-checkbox');
      if (selectedEquipments.indexOf(value) >= 0) {
        selectedEquipments = [];
      } else {
        selectedEquipments = ['Any'];
      }
      this.setState({
        selectedEquipments
      });
      return;
    }

    if (selectedEquipments.indexOf('Any') >= 0) {
      selectedEquipments.splice(0, 1);
    }

    if (selectedEquipments.indexOf(value) >= 0) {
      const index = selectedEquipments.indexOf(value);
      selectedEquipments.splice(index, 1);
    } else {
      selectedEquipments.push(value);
    }
    this.setState({
      selectedEquipments
    });
  }

  handleCheckedMaterials(e) {
    console.log(118);
    let { selectedMaterials } = this.state;
    const { value } = e.target;
    if (value === 'Any') {
      this.setCheckedStatus(false, 'materials-checkbox');
      if (selectedMaterials.indexOf(value) >= 0) {
        selectedMaterials = [];
      } else {
        selectedMaterials = ['Any'];
      }
      this.setState({
        selectedMaterials
      });
      return;
    }

    if (selectedMaterials.indexOf('Any') >= 0) {
      selectedMaterials.splice(0, 1);
    }

    if (selectedMaterials.indexOf(value) >= 0) {
      const index = selectedMaterials.indexOf(value);
      selectedMaterials.splice(index, 1);
    } else {
      selectedMaterials.push(value);
    }
    this.setState({
      selectedMaterials
    });
  }

  async saveCompanyNotificationsSettings() {
    if (!this.isFormValid()) {
      return;
    }

    const company = this.setCompanyInfo();
    const address = this.setAddressInfo();
    if (company && company.id) {
      company.modifiedOn = moment()
        .unix() * 1000;
      try {
        await CompanyService.updateCompany(company);
        await AddressService.updateAddress(address);
        // console.log('Updated');
      } catch (err) {
        // console.log(err);
      }
    }
  }

  renderCompanyPreferences() {
    const {
      operatingRange,
      materialTypes,
      equipmentTypes,
      rateTypes,
      selectedMaterials,
      selectedEquipments,
      selectedRateType
    } = this.state;
    return (
      <div className="pt-4">
        <Row style={{fontSize: 14}}>
          <Col md={4}>
            <Row style={{paddingLeft: 12}}>
              <Col md={12}>
                <strong>Material Type</strong>
                {
                  /*
                  <TField
                    input={{
                      name: 'materials',
                      value: selectedMaterials.toString(),
                      readOnly: true
                    }}
                    placeholder="Material Types"
                    type="text"
                  />
                  */
                }
              </Col>
              {
                materialTypes.map((material, i) => (
                  <Col md={12} key={material}>
                    <div className="item-row">
                      <label className="checkbox-container" htmlFor={`enableMaterial${i}`}>
                        <input
                          id={`enableMaterial${i}`}
                          className={`materials-checkbox material-${material}`}
                          type="checkbox"
                          value={material}
                          checked={selectedMaterials.includes(material)}
                          onChange={this.handleCheckedMaterials}
                        />
                        <span className="checkmark" />
                        &nbsp;{material}
                      </label>
                    </div>
                  </Col>
                ))
              }
            </Row>
          </Col>
          <Col md={4}>
            <Row>
              <Col md={12}>
                <strong>
                  Truck Type
                </strong>
                {
                  /*
                  <TField
                    input={{
                      name: 'equipments',
                      value: selectedEquipments.toString(),
                      readOnly: true
                    }}
                    placeholder="Equipment Types"
                    type="text"
                  />
                  */
                }
              </Col>
              {
                equipmentTypes.map((equipment, i) => (
                  <Col md={12} key={equipment}>
                    <div className="item-row">
                      <label className="checkbox-container" htmlFor={`enableTruck${i}`}>
                        <input
                          id={`enableTruck${i}`}
                          className="trucks-checkbox"
                          type="checkbox"
                          value={equipment}
                          checked={selectedEquipments.includes(equipment)}
                          onChange={this.handleCheckedEquipments}
                        />
                        <span className="checkmark" />
                        &nbsp;{equipment}
                      </label>
                    </div>
                  </Col>
                ))
              }
            </Row>
          </Col>
          <Col md={2}>
            <strong>
              Rate Type
            </strong>
            <TSelect
              input={
                {
                  onChange: this.handleRateTypeChange,
                  name: 'selectedRateType',
                  value: selectedRateType
                }
              }
              options={rateTypes}
              placeholder="Select rate type"
            />
          </Col>
          <Col md={2}>
            <strong>
              Location Radius (Miles)
            </strong>
            <TFieldNumber
              input={{
                onChange: this.handleInputChange,
                name: 'operatingRange',
                value: operatingRange
              }}
              placeholder="Location Radius"
            />
          </Col>
        </Row>
      </div>
    );
  }

  render() {
    const { company } = this.props;
    return (
      <Container>
        <Row className="tab-content-header">
          <Col md={6}>
            <span style={{fontWeight: 'bold', fontSize: 20}}>
              Company - {company.legalName}
            </span>
          </Col>
          <Col md={6} className="text-right">
            <strong>Website:</strong> {company.url}
          </Col>
        </Row>
        <Row className="pt-4 pl-3 pr-3">
          <Col md={12} className="separator">
            <span className="sub-header">Notifications</span>
          </Col>
        </Row>
        {this.renderCompanyPreferences()}
        <Row>
          <Col md={12} className="pt-4 text-right">
            <Link to="/">
              <Button className="mr-2">
              Cancel
              </Button>
            </Link>
            <Button
              color="primary"
              onClick={this.saveCompany}
            >
              Save
            </Button>
          </Col>
        </Row>
      </Container>
    );
  }
}

export default CompanyNotifications;
