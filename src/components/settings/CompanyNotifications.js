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
    this.state = {
      settings: [],
      equipmentTypes: [],
      materialTypes: [],
      rateTypes: [],
      companyEquipments: ['Any'],
      companyMaterials: ['Any'],
      companyOperatingRange: 0,
      selectedRateType: null
    };

    this.handleInputChange = this.handleInputChange.bind(this);
    this.handleRateTypeChange = this.handleRateTypeChange.bind(this);
    this.handleCheckedMaterials = this.handleCheckedMaterials.bind(this);
    this.handleCheckedEquipments = this.handleCheckedEquipments.bind(this);
    this.saveCompanyNotificationsSettings = this.saveCompanyNotificationsSettings.bind(this);
  }

  async componentDidMount() {
    const { company } = this.props;
    await this.fetchCompanySettings(company.id);
    await this.fetchLookupsValues();
  }

  async fetchCompanySettings(companyId) {
    const settings = await CompanyService.getCompanySettings(companyId);

    let companyOperatingRange = '';
    let companyRateType = '';
    const companyEquipments = [];
    const companyMaterials = [];
    Object.values(settings)
      .forEach((itm) => {
        if (itm.key === 'operatingRange') companyOperatingRange = itm.value;
        if (itm.key === 'rateType') companyRateType = itm.value;
        if (itm.key === 'equipmentType') companyEquipments.push(itm.value);
        if (itm.key === 'materialType') companyMaterials.push(itm.value);
      });

    this.setState({
      settings,
      companyOperatingRange,
      companyRateType,
      companyEquipments,
      companyMaterials
    });
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
      rateTypes
    });
  }

  handleInputChange(e) {
    const { value } = e.target;
    this.setState({
      [e.target.name]: value
    });
  }

  async handleRateTypeChange(e) {
    this.setState({
      companyRateType: e.value
    });
    // try {
    //   await CompanyService.updateCompanySettings(item);
    //   this.setState({
    //     rateType: [item],
    //     selectedRateType: item.value
    //   });
    // } catch (error) {
    //   // console.log(e);
    // }
  }

  handleCheckedEquipments(e) {
    let { companyEquipments } = this.state;
    const { value } = e.target;

    if (value === 'Any') {
      companyEquipments = ['Any'];
      this.setState({
        companyEquipments
      });
      return;
    }

    if (companyEquipments.indexOf('Any') >= 0) {
      companyEquipments.splice(0, 1);
    }

    if (companyEquipments.indexOf(value) >= 0) {
      const index = companyEquipments.indexOf(value);
      companyEquipments.splice(index, 1);
    } else {
      companyEquipments.push(value);
    }

    if (companyEquipments.length < 1) {
      companyEquipments = ['Any'];
    }
    this.setState({
      companyEquipments
    });
  }

  handleCheckedMaterials(e) {
    let { companyMaterials } = this.state;
    const { value } = e.target;
    if (value === 'Any') {
      companyMaterials = ['Any'];
      this.setState({
        companyMaterials
      });
      return;
    }

    if (companyMaterials.indexOf('Any') >= 0) {
      companyMaterials.splice(0, 1);
    }

    if (companyMaterials.indexOf(value) >= 0) {
      const index = companyMaterials.indexOf(value);
      companyMaterials.splice(index, 1);
    } else {
      companyMaterials.push(value);
    }

    if (companyMaterials.length < 1) {
      companyMaterials = ['Any'];
    }
    this.setState({
      companyMaterials
    });
  }

  async saveCompanyNotificationsSettings() {
    const {company, userId} = this.props;
    const {
      settings,
      companyOperatingRange,
      companyRateType,
      companyMaterials,
      companyEquipments
    } = this.state;
    const companyItemsIds = [];
    const newCompanyRateType = settings.find(x => x.key === 'rateType');
    newCompanyRateType.value = companyRateType;
    const newCompanyOperatingRange = settings.find(x => x.key === 'operatingRange');
    newCompanyOperatingRange.value = companyOperatingRange.toString();
    Object.values(settings)
      .forEach((itm) => {
        if (itm.key === 'equipmentType') companyItemsIds.push(itm.id);
        if (itm.key === 'materialType') companyItemsIds.push(itm.id);
      });

    try {
      await CompanyService.updateCompanySettings(newCompanyRateType);
      await CompanyService.updateCompanySettings(newCompanyOperatingRange);
      await Promise.all(companyItemsIds.map(async (id) => {
        await CompanyService.deleteCompanySettingsItem(id);
      }));

      await Promise.all(companyMaterials.map(async (material) => {
        const item = {
          companyId: company.id,
          key: 'materialType',
          value: material,
          createdOn: moment().unix() * 1000,
          createdBy: userId,
          modifiedOn: moment().unix() * 1000,
          modifiedBy: userId
        };
        await CompanyService.createCompanySettings(item);
      }));

      await Promise.all(companyEquipments.map(async (equipment) => {
        const item = {
          companyId: company.id,
          key: 'equipmentType',
          value: equipment,
          createdOn: moment().unix() * 1000,
          createdBy: userId,
          modifiedOn: moment().unix() * 1000,
          modifiedBy: userId
        };
        await CompanyService.createCompanySettings(item);
      }));

    } catch (error) {
      // console.log(error);
    }
    await this.fetchCompanySettings(company.id);
  }

  renderCompanyPreferences() {
    const {
      companyOperatingRange,
      materialTypes,
      equipmentTypes,
      rateTypes,
      companyMaterials,
      companyEquipments,
      companyRateType
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
                          checked={companyMaterials.includes(material)}
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
                          checked={companyEquipments.includes(equipment)}
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
                  name: 'companyRateType',
                  value: companyRateType
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
                name: 'companyOperatingRange',
                value: Number(companyOperatingRange)
              }}
              placeholder="Location Radius"
            />
          </Col>
        </Row>
      </div>
    );
  }

  render() {
    return (
      <Container>
        <Row className="tab-content-header">
          <Col md={12}>
            <span style={{fontWeight: 'bold', fontSize: 20}}>
              Company Notifications
            </span>
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

CompanyNotifications.propTypes = {
  company: PropTypes.shape({
    id: PropTypes.number
  }),
  userId: PropTypes.number
};

CompanyNotifications.defaultProps = {
  company: {
    id: 0
  },
  userId: 0
};

export default CompanyNotifications;
