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
import CompanyService from '../../api/CompanyService';
import LookupsService from '../../api/LookupsService';

import './Settings.css';

class CompanyNotifications extends Component {
  constructor(props) {
    super(props);
    const settings = {
      id: 0,
      companyId: 0,
      rateType: '',
      operatingRange: 0,
      materialType: 'Any',
      equipmentType: 'Any'
    };
    this.state = {
      ...settings,
      equipmentTypes: [],
      materialTypes: [],
      rateTypes: [],
      selectedEquipments: ['Any'],
      selectedMaterials: ['Any'],
      selectedRateType: 'Any'
    };

    this.handleInputChange = this.handleInputChange.bind(this);
    this.handleRateTypeChange = this.handleRateTypeChange.bind(this);
    this.handleCheckedMaterials = this.handleCheckedMaterials.bind(this);
    this.handleCheckedEquipments = this.handleCheckedEquipments.bind(this);
    this.saveCompanyNotificationsSettings = this.saveCompanyNotificationsSettings.bind(this);
  }

  async componentDidMount() {
    const { company } = this.props;
    const settings = await CompanyService.getCompanySettings(company.id);
    await this.setSettings(settings);
    await this.fetchLookupsValues();
    this.setState({
      settings
    });
  }

  async setSettings(settingsProps) {
    const settings = settingsProps;
    Object.keys(settings)
      .map((key) => {
        if (settings[key] === null) {
          settings[key] = '';
        }
        return true;
      });
    this.setState({
      ...settings
    });
  }

  setCheckedStatus(state, checkboxClass) {
    const x = document.getElementsByClassName(checkboxClass);
    for (let i = 0; i < x.length; i += 1) {
      x[i].checked = state;
    }
  }

  async fetchLookupsValues() {
    const {
      rateType,
      materialType,
      equipmentType
    } = this.state;
    let {
      selectedEquipments,
      selectedMaterials,
      selectedRateType
    } = this.state;

    selectedEquipments = equipmentType.split(', ');
    selectedMaterials = materialType.split(', ');
    selectedRateType = rateType;
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

    rateTypes = rateTypes.map(rate => ({
      value: String(rate.val1),
      label: `${rate.val1}`
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
      rateTypes,
      selectedEquipments,
      selectedMaterials,
      selectedRateType
    });
  }

  handleInputChange(e) {
    const { value } = e.target;
    this.setState({
      [e.target.name]: value
    });
  }

  handleRateTypeChange(e) {
    this.setState({
      selectedRateType: e.value
    });
  }

  handleCheckedEquipments(e) {
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
    const {
      settings,
      selectedRateType,
      selectedMaterials,
      selectedEquipments,
      operatingRange
    } = this.state;

    const newSettings = settings;
    newSettings.materialType = selectedMaterials.join(', ');
    newSettings.equipmentType = selectedEquipments.join(', ');
    newSettings.operatingRange = parseInt(operatingRange, 10);
    newSettings.rateType = selectedRateType;
    try {
      newSettings.modifiedOn = moment()
        .unix() * 1000;
      await CompanyService.updateCompanySettings(newSettings);
    } catch (err) {
      // console.log(err);
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
            <span className="sub-header">Job Preferences</span>
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
              onClick={this.saveCompanyNotificationsSettings}
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
