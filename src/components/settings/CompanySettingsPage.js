import React, { Component } from 'react';
import {
  Col,
  Container,
  Row,
  TabContent,
  TabPane,
  Nav,
  NavItem,
  NavLink
} from 'reactstrap';
import { Redirect } from 'react-router-dom';
import classnames from 'classnames';
import {withTranslation, Trans} from 'react-i18next';
import './Settings.css';

import CompanyProfile from './CompanyProfile';
import CompanyNotifications from './CompanyNotifications';
import PaymentSettings from './PaymentSettings';

import ProfileService from '../../api/ProfileService';
import UserService from '../../api/UserService';
import CompanyService from '../../api/CompanyService';
import AddressService from '../../api/AddressService';
import AttachmentsListPage from '../attachments/AttachmentsListPage';
import InsuranceSettings from './InsuranceSettings';

class CompanySettingsPage extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loaded: false,
      company: [],
      user: [],
      address: [],
      activeTab: '1',
      title: 'Profile',
      isAdmin: null
    };

    this.toggle = this.toggle.bind(this);
  }

  async componentDidMount() {
    this.mounted = true;
    const profile = await ProfileService.getProfile();
    const user = await UserService.getUserById(profile.userId);
    const company = await CompanyService.getCompanyById(profile.companyId);
    const address = await AddressService.getAddressById(company.addressId);
    let isAdmin = false;
    if (company.adminId === user.id) {
      isAdmin = true;
    } else {
      isAdmin = false;
    }
    if (this.mounted) {
      this.setState({
        company,
        user,
        address,
        isAdmin,
        profile,
        loaded: true
      });
    }
  }

  componentWillUnmount() {
    this.mounted = false;
  }

  toggle(tab) {
    const { activeTab } = this.state;
    let { title } = this.state;
    switch (tab) {
      case '1':
        title = 'Profile';
        break;
      case '2':
        title = 'Notifications';
        break;
      case '3':
        title = 'Payment Method';
        break;
      case '4':
        title = 'Attachments';
        break;
      case '5':
        title = 'Insurance';
        break;
      default:
        break;
    }
    if (activeTab !== tab) {
      this.setState({
        activeTab: tab,
        title
      });
    }
  }

  renderCarrierPayment() {
    return (
      <Col md={12}>
        <br/>
        <h3>Hello.</h3>
        <p style={{fontSize: 14}}>
          For your security we at Trelar do not keep or
          track your payment account information.
          That is kept securely at Hyperwallet, a PayPal company.
          To make changes to your account, please click this&nbsp;
          <a href="https://trelar.hyperwallet.com" target="_blank">link</a>
          &nbsp;or go directly to https://trelar.hyperwallet.com.<br/>
          <br/>
          Please remember that no one at Trelar will ever ask you for your
          bank or account information.<br/>
          <br/>
          Thank you.<br/>
          <strong>Trelar CSR team.</strong><br/>
        </p>
        <br/>
      </Col>
    );
  }

  renderCustomerPayment() {
    const { company } = this.state;
    return (
      <React.Fragment>
        <PaymentSettings company={company}/>
      </React.Fragment>
    );
  }

  renderTabs() {
    const { activeTab, user, company, address, isAdmin, profile } = this.state;
    const { t } = { ...this.props };
    const translate = t;
    return (
      <div>
        <Nav tabs>
          <NavItem>
            <NavLink
              className={classnames({ active: activeTab === '1' }, 'tab')}
              onClick={() => { this.toggle('1'); }}
            >
              <div className="navLink">{translate('Profile')}</div>
            </NavLink>
          </NavItem>
          {
            company.type === 'Carrier' ? (
              <NavItem>
                <NavLink
                  className={classnames({ active: activeTab === '2' }, 'tab')}
                  onClick={() => { this.toggle('2'); }}
                >
                  {translate('Notifications')}
                </NavLink>
              </NavItem>
            ) : null
          }
          <NavItem>
            <NavLink
              className={classnames({ active: activeTab === '3' }, 'tab')}
              onClick={() => { this.toggle('3'); }}
            >
              {translate('Payment Method')}
            </NavLink>
          </NavItem>
          <NavItem>
            <NavLink
              className={classnames({ active: activeTab === '4' }, 'tab')}
              onClick={() => { this.toggle('4'); }}
            >
              {translate('Attachments')}
            </NavLink>
          </NavItem>
          <NavItem>
            <NavLink
              className={classnames({ active: activeTab === '5' }, 'tab')}
              onClick={() => { this.toggle('5'); }}
            >
              {translate('Insurance')}
            </NavLink>
          </NavItem>
        </Nav>
        <TabContent
          activeTab={activeTab}
          style={{
            backgroundColor: '#FFF',
            marginLeft: 8,
            marginRight: 8,
            paddingLeft: 32,
            paddingRight: 32,
            borderRadius: 5
          }}
        >
          <TabPane tabId="1">
            <CompanyProfile
              user={user}
              address={address}
              company={company}
              admin={isAdmin}
            />
          </TabPane>
          <TabPane tabId="2">
            <CompanyNotifications
              userId={user.id}
              company={company}
            />
          </TabPane>
          <TabPane tabId="3">
            {
              company.type === 'Customer' ? this.renderCustomerPayment() : null
            }
            {
              company.type === 'Carrier' ? this.renderCarrierPayment() : null
            }
          </TabPane>
          <TabPane tabId="4">
            <AttachmentsListPage
              companyId={company.id}
            />
          </TabPane>
          <TabPane tabId="5">
            <InsuranceSettings
              company={company}
              profile={profile}
            />
          </TabPane>
        </TabContent>
      </div>
    );
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
    const { loaded, title, isAdmin } = this.state;
    const { t } = { ...this.props };
    const translate = t;
    if (isAdmin === false && this.mounted) {
      return <Redirect to="/settings" />;
    }
    if (loaded) {
      return (
        <Container className="dashboard">
          <Row>
            <Col md={12}>
              <h3 className="page-title">{translate('Company Settings')} / {translate(title)}</h3>
            </Col>
          </Row>
          <Row>
            <Col md={12}>
              {this.renderTabs()}
            </Col>
          </Row>
        </Container>
      );
    }
    return (
      <Container className="dashboard">
        <Row>
          <Col md={12}>
            <h3 className="page-title">{translate('Company Settings')}</h3>
          </Col>
        </Row>
        {this.renderLoader()}
      </Container>
    );
  }
}

export default withTranslation()(CompanySettingsPage);
