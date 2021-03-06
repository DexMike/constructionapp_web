import React, { Component } from 'react';
import { Redirect } from 'react-router-dom';
import { Card, CardBody, Col, Container, Row } from 'reactstrap';
import { withTranslation } from 'react-i18next';
import TTable from '../common/TTable';
import TFormat from '../common/TFormat';

import ProfileService from '../../api/ProfileService';
import TMapGeneralLive from '../common/TMapGeneralLive';

class EquipmentGeneralMap extends Component {
  constructor(props) {
    super(props);

    this.state = {
      profileType: null,
      profileCompanyId: 0,
      loaded: false,
      shiftText: ''
    };

    this.noTrucksOnShift = this.noTrucksOnShift.bind(this);
  }

  async componentDidMount() {
    // TODO -> need to recheck if this an Admin
    const profile = await ProfileService.getProfile();
    this.setState({
      profileType: profile.companyType,
      profileCompanyId: profile.companyId,
      loaded: true
    });
  }

  noTrucksOnShift(trucksNumber) {
    const {t} = {...this.props};
    const plural = trucksNumber === 1 ? `${t('There is')} ${trucksNumber} ${t('truck')}` : `${t('There are')} ${trucksNumber} ${t('trucks')}`;
    const shiftText = `${plural} ${t('on an active shift')}.`;
    this.setState({ shiftText });
  }

  renderLoader() {
    return (
      <div className="load loaded inside-page">
        <div className="load__icon-wrap">
          <svg className="load__icon">
            <path fill="rgb(0, 111, 83)" d="M12,4V2A10,10 0 0,0 2,12H4A8,8 0 0,1 12,4Z"/>
          </svg>
        </div>
      </div>
    );
  }

  render() {
    const title = 'General Trucks Map';
    const { loaded, profileType, profileCompanyId, shiftText } = this.state;
    const {t} = {...this.props};
    if (loaded) {
      return (
        <Container className="dashboard">
          <Row>
            <Col md={12}>
              <h3 className="page-title">{t('Truck Locator')}</h3>
            </Col>
          </Row>
          <TMapGeneralLive
            id="generalMap"
            width="98%"
            height="600px"
            profileType={profileType}
            profileCompanyId={profileCompanyId}
            onTrucksLoaded={this.noTrucksOnShift}
          />
          <Row>
            <Col md={12}>
              {shiftText}
            </Col>
          </Row>
        </Container>
      );
    }
    return (
      <Container className="container">
        <Row>
          <Col md={12}>
            <h3 className="page-title">{title}</h3>
          </Col>
        </Row>
        {this.renderLoader()}
      </Container>
    );
  }
}

export default withTranslation()(EquipmentGeneralMap);
