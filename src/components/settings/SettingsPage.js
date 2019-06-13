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
import classnames from 'classnames';
import './Settings.css';
import { Trans } from 'react-i18next';


import UserSettings from './UserSettings';
import NotificationsSettings from './NotificationsSettings';
import PermissionsRolesSettings from './PermissionsRolesSettings';

import ProfileService from '../../api/ProfileService';
import UserService from '../../api/UserService';
import CompanyService from '../../api/CompanyService';
import AddressService from '../../api/AddressService';

class SettingsPage extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loaded: false,
      company: [],
      user: [],
      users: [],
      address: [],
      activeTab: '1',
      title: 'Profile',
      isAdmin: false
    };

    this.toggle = this.toggle.bind(this);
  }

  async componentDidMount() {
    const profile = await ProfileService.getProfile();
    const user = await UserService.getUserById(profile.userId);
    const company = await CompanyService.getCompanyById(profile.companyId);
    const address = await AddressService.getAddressById(company.addressId);
    const usersResponse = await UserService.getUsersByCompanyId(company.id);
    const users = usersResponse.data;
    let isAdmin = false;
    if (company.adminId === user.id) {
      isAdmin = true;
    }
    this.setState({
      company,
      user,
      users,
      address,
      isAdmin,
      loaded: true
    });
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
        title = 'Roles & Permissions';
        break;
      case '4':
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

  renderAdminTabs(activeTab) {
    return (
      <Nav tabs>
        <NavItem>
          <NavLink
            className={classnames({ active: activeTab === '1' }, 'tab')}
            onClick={() => { this.toggle('1'); }}
          >
            <div className="navLink"><Trans>Profile</Trans></div>
          </NavLink>
        </NavItem>
        <NavItem>
          <NavLink
            className={classnames({ active: activeTab === '2' }, 'tab')}
            onClick={() => { this.toggle('2'); }}
          >
            Notifications
          </NavLink>
        </NavItem>
        {
          /*
          <NavItem>
            <NavLink
              className={classnames({ active: activeTab === '3' }, 'tab')}
              onClick={() => { this.toggle('3'); }}
            >
              Permissions
            </NavLink>
          </NavItem>
          */
        }
      </Nav>
    );
  }

  renderUserTabs(activeTab) {
    return (
      <Nav tabs>
        <NavItem>
          <NavLink
            className={classnames({ active: activeTab === '1' }, 'tab')}
            onClick={() => { this.toggle('1'); }}
          >
            <div className="navLink"><Trans>Profile</Trans></div>
          </NavLink>
        </NavItem>
      </Nav>
    );
  }

  renderSettingsTabs() {
    const { activeTab, user, users, company, address, isAdmin } = this.state;
    return (
      <div>
        {
          isAdmin ? this.renderAdminTabs(activeTab) : this.renderUserTabs(activeTab)
        }
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
            <UserSettings
              user={user}
              address={address}
              admin={isAdmin}
            />
          </TabPane>
          <TabPane tabId="2">
            <NotificationsSettings
              company={company}
              user={user}
            />
          </TabPane>
          <TabPane tabId="3">
            <PermissionsRolesSettings users={users}/>
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
    const { loaded, title } = this.state;
    if (loaded) {
      return (
        <Container className="dashboard">
          <Row>
            <Col md={12}>
              <h3 className="page-title"><Trans>User Settings</Trans> / {title}</h3>
            </Col>
          </Row>
          <Container>
            <Row>
              <Col md={12}>
                {this.renderSettingsTabs()}
              </Col>
            </Row>
          </Container>
        </Container>
      );
    }
    return (
      <Container className="dashboard">
        <Row>
          <Col md={12}>
            <h3 className="page-title"><Trans>User Settings</Trans></h3>
          </Col>
        </Row>
        {this.renderLoader()}
      </Container>
    );
  }
}

export default SettingsPage;
