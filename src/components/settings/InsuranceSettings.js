import React, { Component } from 'react';
import {
  Button,
  Col,
  Container,
  Row
} from 'reactstrap';
import * as PropTypes from 'prop-types';
import moment from 'moment';
import CloneDeep from 'lodash.clonedeep';
import { Link } from 'react-router-dom';
import TField from '../common/TField';
import TDateTimePicker from '../common/TDateTimePicker';
import './Settings.css';
import CompanyService from '../../api/CompanyService';
import ProfileService from '../../api/ProfileService';


class InsuranceSettings extends Component {
  constructor(props) {
    super(props);

    this.state = {
      company: [],
      liabilityGeneral: 0,
      liabilityAuto: 0,
      liabilityOther: 0,
      liabilityExpiration: null,
      profile: null,
      reqHandlerGeneral: {
        touched: false,
        error: ''
      },
      reqHandlerAuto: {
        touched: false,
        error: ''
      },
      reqHandlerOther: {
        touched: false,
        error: ''
      },
      reqHandlerExp: {
        touched: false,
        error: ''
      }
    };

    this.handleInputChange = this.handleInputChange.bind(this);
    this.saveCompany = this.saveCompany.bind(this);
    this.jobDateChange = this.jobDateChange.bind(this);
  }

  async componentDidMount() {
    await this.setCompany();
    const { profile } = this.props;
    this.setState({ profile });
  }

  setCompany() {
    const { company } = this.props;
    this.setState({
      liabilityGeneral: company.liabilityGeneral,
      liabilityAuto: company.liabilityAuto,
      liabilityOther: company.liabilityOther,
      liabilityExpiration: company.liabilityExpiration,
      company
    });
  }

  handleInputChange(e) {
    const { value } = e.target;
    let reqHandler = '';

    if (e.target.name === 'liabilityGeneral') {
      reqHandler = 'reqHandlerGeneral';
    }
    if (e.target.name === 'liabilityAuto') {
      reqHandler = 'reqHandlerAuto';
    }
    if (e.target.name === 'liabilityOther') {
      reqHandler = 'reqHandlerOther';
    }
    if (e.target.name === 'liabilityExpiration') {
      reqHandler = 'reqHandlerExp';
    }

    this.setState({
      [reqHandler]: Object.assign({}, reqHandler, {
        touched: false
      }),
      [e.target.name]: value
    });
  }

  jobDateChange(data) {
    const {reqHandlerExp} = this.state;
    this.setState({
      liabilityExpiration: data,
      reqHandlerExp: Object.assign({}, reqHandlerExp, {
        touched: false
      })
    });
  }

  isFormValid() {
    const {
      liabilityGeneral,
      liabilityAuto,
      liabilityOther,
      liabilityExpiration
    } = this.state;
    let {
      reqHandlerGeneral,
      reqHandlerAuto,
      reqHandlerOther,
      reqHandlerExp
    } = this.state;
    let isValid = true;
    if (liabilityGeneral === null || liabilityGeneral.length === 0) {
      reqHandlerGeneral = {
        touched: true,
        error: 'Required input'
      };
      isValid = false;
    }

    if (liabilityAuto === null || liabilityAuto.length === 0) {
      reqHandlerAuto = {
        touched: true,
        error: 'Required input'
      };
      isValid = false;
    }

    if (liabilityOther === null || liabilityOther.length === 0) {
      reqHandlerOther = {
        touched: true,
        error: 'Required input'
      };
      isValid = false;
    }

    if (liabilityExpiration === null || liabilityExpiration.length === 0) {
      reqHandlerExp = {
        touched: true,
        error: 'Required input'
      };
      isValid = false;
    }

    this.setState({
      reqHandlerGeneral,
      reqHandlerAuto,
      reqHandlerOther,
      reqHandlerExp
    });
    if (isValid) {
      return true;
    }

    return false;
  }

  async saveCompany() {
    const {
      company,
      liabilityGeneral,
      liabilityAuto,
      liabilityOther,
      liabilityExpiration,
      profile
    } = this.state;
    /* if (!this.isFormValid()) {
      return;
    } */

    const updatedCompany = CloneDeep(company);

    updatedCompany.liabilityGeneral = liabilityGeneral;
    updatedCompany.liabilityAuto = liabilityAuto;
    updatedCompany.liabilityOther = liabilityOther;
    updatedCompany.liabilityExpiration = liabilityExpiration;
    updatedCompany.modifiedOn = moment.utc().format();
    updatedCompany.modifiedBy = profile.userId;

    try {
      await CompanyService.updateCompany(updatedCompany);
      // console.log('Updated');
    } catch (err) {
      // console.log(err);
    }
  }

  render() {
    const { profile } = this.props;
    const {
      liabilityGeneral,
      liabilityAuto,
      liabilityOther,
      liabilityExpiration,
      reqHandlerGeneral,
      reqHandlerAuto,
      reqHandlerOther,
      reqHandlerExp
    } = this.state;
    return (
      <Container>
        <Row className="tab-content-header">
          <Col md={12}>
            <span style={{fontWeight: 'bold', fontSize: 20}}>
              Insurance Settings
            </span>
          </Col>
        </Row>
        <Row className="pt-2">
          <Col md={12}>&nbsp;</Col>
          <Col md={6}>
            <span>
              {profile.companyType !== 'Carrier' ? 'Minimum ' : ''}General Liability
            </span>
            <TField
              className="settings-input"
              input={{
                onChange: this.handleInputChange,
                name: 'liabilityGeneral',
                value: liabilityGeneral,
                disabled: true
              }}
              placeholder="General Liability"
              type="text"
              meta={reqHandlerGeneral}
              readonly
            />
          </Col>
          <Col md={6}>
            <span>
              {profile.companyType !== 'Carrier' ? 'Minimum ' : ''}Auto Liability
            </span>
            <TField
              input={{
                onChange: this.handleInputChange,
                name: 'liabilityAuto',
                value: liabilityAuto,
                disabled: true
              }}
              placeholder="Auto Liability"
              type="text"
              meta={reqHandlerAuto}
            />
          </Col>
        </Row>
        <Row className="pt-2">
          <Col md={6}>
            <span>
              {profile.companyType !== 'Carrier' ? 'Minimum ' : ''}Other Liability
            </span>
            <TField
              input={{
                onChange: this.handleInputChange,
                name: 'liabilityOther',
                value: liabilityOther,
                disabled: true
              }}
              placeholder="Other Liability"
              type="text"
              meta={reqHandlerOther}
            />
          </Col>
          <Col md={6}>
            <span>Expiration Date:</span>
            <TDateTimePicker
              input={
                {
                  onChange: this.jobDateChange,
                  name: 'liabilityExpiration',
                  value: liabilityExpiration,
                  givenDate: liabilityExpiration
                }
              }
              onChange={this.jobDateChange}
              dateFormat="yyyy-MM-dd"
              meta={reqHandlerExp}
              placeholder="Liability expiration date"
              disabled
            />
          </Col>
        </Row>
        <Row>
          <Col md={12} className="pt-4 text-right">
            {/* <Link to="/">
              <Button className="mr-2">
              Cancel
              </Button>
            </Link>
            <Button
              color="primary"
              onClick={this.saveCompany}
            >
              Save
            </Button> */}
          </Col>
        </Row>
      </Container>
    );
  }
}

InsuranceSettings.propTypes = {
  company: PropTypes.objectOf(PropTypes.object).isRequired,
  profile: PropTypes.objectOf(PropTypes.object).isRequired
};

InsuranceSettings.defaultProps = {};

export default InsuranceSettings;
