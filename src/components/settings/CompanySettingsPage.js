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
      users: [],
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
    const usersResponse = await UserService.getUsersByCompanyId(company.id);
    const users = usersResponse.data;
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
        users,
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
        title = 'Company Profile';
        break;
      case '2':
        title = 'Company Notifications';
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
        </TabContent>
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
          <Container>
            <Row>
              <Col md={12}>
                {this.renderTabs()}
              </Col>
            </Row>
          </Container>
        </Container>
      );
    }
    return (
      <Container className="dashboard">
        Loading...
      </Container>
    );
  }
}

export default CompanySettingsPage;
