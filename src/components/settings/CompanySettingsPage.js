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
import './Settings.css';

import CompanyProfile from './CompanyProfile';
import CompanyNotifications from './CompanyNotifications';

import ProfileService from '../../api/ProfileService';
import UserService from '../../api/UserService';
import CompanyService from '../../api/CompanyService';
import AddressService from '../../api/AddressService';

class CompanySettingsPage extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loaded: false,
      company: [],
      user: [],
      address: [],
      activeTab: '1',
      title: 'Company Profile',
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
        <p>
          Hello.<br/>
          <br/>
          For your security we at Trelar do not keep or
          track your payment account information.
          That is kept securely at Hyperwallet, a PayPal company.
          To make changes to your account, please click this link<br/>
          <a href="https://www.hyperwallet.com" target="_blank">www.hyperwallet.com</a><br/>
          or go directly to www.hyperwallet.com.<br/>
          <br/>
          Please remember that no one at Trelar will ever ask you for your
          bank or account information.<br/>
          <br/>
          Thank you.<br/>
          Trelar CSR team.<br/>
        </p>
      </Col>
    );
  }

  renderCustomerPayment() {
    return (
      <Col md={12}>
        <p>
          Hello.<br />
          <br/>
          We do not store your full banking and account information.<br/>
          <br/>
          Please contact customer support at csr@trelar.net if you'd
          like to update your payment information.<br />
          <br/>
          Thank you.<br />
          Trelar CSR team.<br />
        </p>
      </Col>
    );
  }

  renderTabs() {
    const { activeTab, user, company, address, isAdmin } = this.state;
    return (
      <div>
        <Nav tabs>
          <NavItem>
            <NavLink
              className={classnames({ active: activeTab === '1' }, 'tab')}
              onClick={() => { this.toggle('1'); }}
            >
              <div className="navLink">Company Profile</div>
            </NavLink>
          </NavItem>
          {
            company.type === 'Carrier' ? (
              <NavItem>
                <NavLink
                  className={classnames({ active: activeTab === '2' }, 'tab')}
                  onClick={() => { this.toggle('2'); }}
                >
                  Notifications
                </NavLink>
              </NavItem>
            ) : null
          }
          <NavItem>
            <NavLink
              className={classnames({ active: activeTab === '3' }, 'tab')}
              onClick={() => { this.toggle('3'); }}
            >
              Payment Method
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
              company={company}
            />
          </TabPane>
          <TabPane tabId="3">
            <Row className="pt-4 pb-4">
              {
                company.type === 'Customer' ? this.renderCustomerPayment() : null
              }
              {
                company.type === 'Carrier' ? this.renderCarrierPayment() : null
              }
            </Row>
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
    if (isAdmin === false && this.mounted) {
      return <Redirect to="/settings" />;
    }
    if (loaded) {
      return (
        <Container className="dashboard">
          <Row>
            <Col md={12}>
              <h3 className="page-title">Company Settings / {title}</h3>
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
            <h3 className="page-title">Company Settings</h3>
          </Col>
        </Row>
        {this.renderLoader()}
      </Container>
    );
  }
}

export default CompanySettingsPage;
