import React, { Component } from 'react';
import {
  Col,
  Container,
  Row
} from 'reactstrap';
import * as PropTypes from 'prop-types';
import './Settings.css';
import UserService from '../../api/UserService';

class NotificationsSettings extends Component {
  constructor(props) {
    super(props);
    this.state = {
      settings: [],
      communicationTypes: [
        { title: 'In App', name: 'app', enabled: false},
        { title: 'Mobile', name: 'mobile', enabled: false },
        { title: 'SMS', name: 'sms', enabled: true },
        { title: 'Email', name: 'email', enabled: false}
      ]
    };
    this.handleInputChange = this.handleInputChange.bind(this);
    this.setNotificationState = this.setNotificationState.bind(this);
    this.setAllNotificationsState = this.setAllNotificationsState.bind(this);
  }

  async componentDidMount() {
    const { user } = this.props;
    const settings = await UserService.getUserSettings(user.id);
    this.setState({
      settings
    });
  }

  async setAllNotificationsState(type, checkBoxId, e) {
    const { settings } = this.state;
    const newSettings = settings;
    let { value } = e.target;
    if (value === 'on') {
      document.getElementById(checkBoxId).value = 'off';
      value = 1;
    } else {
      document.getElementById(checkBoxId).value = 'on';
      value = 0;
    }

    for (const i in newSettings) {
      if (newSettings[i].key === type) {
        newSettings[i].enabled = value;
      }
    }

    await Promise.all(newSettings.map(async (notification) => {
      if (notification.key === type) {
        await UserService.updateUserNotification(notification);
      }
    }));

    this.setState({
      settings: newSettings
    });
  }

  setNotificationState(notificationId, e) {
    const { notifications } = this.state;
    let { value } = e.target;
    value = value === 'true';
    const notification = notifications.find(x => x.id === notificationId);
    notification.enabled = !value;

    const index = notifications.findIndex(x => x.id === notificationId);
    if (index !== -1) {
      this.setState({
        notifications: [
          ...notifications.slice(0, index),
          Object.assign({}, notifications[index], notification),
          ...notifications.slice(index + 1)
        ]
      });
    }
  }

  async setAllNotificationOptionState(key, method, checkBoxId, e) {
    const { settings } = this.state;
    const newSettings = settings;
    let { value } = e.target;
    if (value === 'on') {
      document.getElementById(checkBoxId).value = 'off';
      value = 1;
    } else {
      document.getElementById(checkBoxId).value = 'on';
      value = 0;
    }

    for (const i in newSettings) {
      if (newSettings[i].key === key) {
        newSettings[i][method] = value;
      }
    }

    await Promise.all(newSettings.map(async (notification) => {
      if (notification.key === key) {
        await UserService.updateUserNotification(notification);
      }
    }));

    this.setState({
      settings: newSettings
    });
  }

  async setNotificationOptionState(notificationId, key) {
    const { user } = this.props;
    const { settings } = this.state;

    const notification = settings.find(x => x.id === notificationId);
    const enabled = notification[key] ? 0 : 1;
    notification[key] = enabled;
    notification.modifiedBy = user.id;
    try {
      await UserService.updateUserNotification(notification);
      const index = settings.findIndex(x => x.id === notificationId);
      if (index !== -1) {
        this.setState({
          notifications: [
            ...settings.slice(0, index),
            Object.assign({}, settings[index], notification),
            ...settings.slice(index + 1)
          ]
        });
      }
    } catch (e) {
      // console.log(e);
    }
  }

  handleInputChange(e) {
    const { value } = e.target;
    this.setState({
      [e.target.name]: value
    });
  }

  renderTable(objectSettings) {
    console.log(147, objectSettings);
    return (
      <table className="table table-sm">
        <thead>
          <tr>
            <th scope="col" colSpan={objectSettings.communicationTypes.length + 2}>
              {objectSettings.title}
            </th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td className="text-center" style={{width: 10}}>
              <strong>On/Off</strong>
            </td>
            <td style={{width: 850}}>
              <strong>Notification</strong>
            </td>
            {
              objectSettings.communicationTypes.map(item => <td key={item.id} className="text-center"><strong>{item.title}</strong></td>)
            }
          </tr>
          {/* Select All Headers */}
          {
            objectSettings.notifications.length > 1 ? (
              <tr>
                <td className="text-center">
                  <label className="checkbox-container" htmlFor={`${objectSettings.type}SelectAll`}>
                    <input
                      type="checkbox"
                      onChange={e => this.setAllNotificationsState(objectSettings.title, `${objectSettings.type}SelectAll`, e)}
                      id={`${objectSettings.type}SelectAll`}
                    />
                    <span className="checkmark centered" />
                  </label>
                </td>
                <td>
                  <strong>Select All</strong>
                </td>
                {
                  objectSettings.communicationTypes.map(item => (
                    <td className="text-center" key={item.name}>
                      <label className="checkbox-container" htmlFor={`${objectSettings.type}option${item.name}SelectAll`}>
                        <input
                          type="checkbox"
                          disabled={!item.enabled}
                          onChange={e => this.setAllNotificationOptionState(
                            objectSettings.title,
                            item.name,
                            `${objectSettings.type}option${item.name}SelectAll`,
                            e
                          )
                          }
                          id={`${objectSettings.type}option${item.name}SelectAll`}
                        />
                        <span className={`checkmark centered ${!item.enabled ? 'disabled-checkbox' : null}`}/>
                      </label>
                    </td>
                  ))
                }
              </tr>
            ) : null
          }
          {
            objectSettings.notifications.map((notification => (
              <tr key={notification.id}>
                <td>
                  <label className="checkbox-container" htmlFor={`onOff${notification.id}`}>
                    <input
                      type="checkbox"
                      value={notification.enabled}
                      checked={notification.enabled}
                      id={`onOff${notification.id}`}
                      onChange={e => this.setNotificationState(notification.id, e)}
                    />
                    <span className="checkmark centered" />
                  </label>
                </td>
                <td>{notification.description}</td>
                <td className="text-center">
                  <label className="checkbox-container" htmlFor={`${notification.id}-InApp`}>
                    <input
                      type="checkbox"
                      checked={false}
                      disabled
                      id={`${notification.id}-InApp`}
                    />
                    <span className="checkmark centered disabled-checkbox"/>
                  </label>
                </td>
                <td className="text-center">
                  <label className="checkbox-container" htmlFor={`${notification.id}-Mobile`}>
                    <input
                      type="checkbox"
                      checked={false}
                      disabled
                      id={`${notification.id}-Mobile`}
                    />
                    <span className="checkmark centered disabled-checkbox"/>
                  </label>
                </td>
                <td className="text-center">
                  <label className="checkbox-container" htmlFor={`${notification.id}-${notification.sms}`}>
                    <input
                      type="checkbox"
                      value={notification.sms}
                      checked={notification.sms}
                      // disabled={!objectSettings.communicationTypes[i].enabled}
                      id={`${notification.id}-${notification.sms}`}
                      onChange={() => this.setNotificationOptionState(notification.id, 'sms')}
                    />
                    <span className="checkmark centered"/>
                  </label>
                </td>
                <td className="text-center">
                  <label className="checkbox-container" htmlFor={`${notification.id}-Email`}>
                    <input
                      type="checkbox"
                      checked={false}
                      disabled
                      id={`${notification.id}-Email`}
                    />
                    <span className="checkmark centered disabled-checkbox"/>
                  </label>
                </td>
              </tr>
            )))
          }
        </tbody>
      </table>
    );
  }

  renderJobSection() {
    const { communicationTypes, settings } = this.state;
    const { company } = this.props;

    const carrierJobs = [];
    const customerJobs = [];

    Object.values(settings).forEach((itm) => {
      if (itm.key === 'Job Offers') carrierJobs.push(itm);
      if (itm.key === 'Jobs') customerJobs.push(itm);
    });
    const jobsSettings = {
      title: 'Job Offers',
      type: 'carrierJobs',
      communicationTypes,
      notifications: carrierJobs
    };

    if (company.type === 'Customer') {
      jobsSettings.title = 'Jobs';
      jobsSettings.type = 'customerJobs';
      jobsSettings.notifications = customerJobs;
    }

    return (
      <div className="pt-4">
        {this.renderTable(jobsSettings)}
      </div>
    );
  }

  renderMarketplaceSection() {
    const {
      communicationTypes,
      settings
    } = this.state;

    const marketplace = [];
    Object.values(settings).forEach((itm) => {
      if (itm.key === 'Marketplace') marketplace.push(itm);
    });
    const marketplaceSettings = {
      title: 'Marketplace',
      type: marketplace,
      communicationTypes,
      notifications: marketplace
    };

    return (
      <div className="pt-4">
        {this.renderTable(marketplaceSettings)}
      </div>
    );
  }

  renderPaymentsSection() {
    const { communicationTypes, settings } = this.state;
    const payments = [];
    Object.values(settings).forEach((itm) => {
      if (itm.key === 'Payments') payments.push(itm);
    });
    const paymentsSettings = {
      title: 'Payments',
      type: 'payments',
      communicationTypes,
      notifications: payments
    };
    return (
      <div className="pt-4">
        {this.renderTable(paymentsSettings)}
      </div>
    );
  }

  renderLoadsSection() {
    const { communicationTypes, settings } = this.state;
    const loads = [];
    Object.values(settings).forEach((itm) => {
      if (itm.key === 'Loads') loads.push(itm);
    });
    const loadsSettings = {
      title: 'Loads',
      type: 'loads',
      communicationTypes,
      notifications: loads
    };
    return (
      <div className="pt-4">
        {this.renderTable(loadsSettings)}
      </div>
    );
  }

  renderCarrierSettings() {
    return (
      <Row>
        <Col md={12}>
          {this.renderJobSection()}
          {this.renderMarketplaceSection()}
          {this.renderPaymentsSection()}
        </Col>
      </Row>
    );
  }

  renderCustomerSettings() {
    return (
      <Row>
        <Col md={12}>
          {this.renderJobSection()}
          {this.renderLoadsSection()}
        </Col>
      </Row>
    );
  }

  render() {
    const { company } = this.props;
    return (
      <Container className="pb-4">
        <Row className="tab-content-header">
          <Col md={12}>
            <span style={{ fontWeight: 'bold', fontSize: 20 }}>
              Notifications
            </span>
          </Col>
        </Row>
        {
          company.type === 'Carrier'
            ? this.renderCarrierSettings()
            : null
        }
        {
          company.type === 'Customer'
            ? this.renderCustomerSettings()
            : null
        }
      </Container>
    );
  }
}

NotificationsSettings.propTypes = {
  company: PropTypes.shape({
    id: PropTypes.number,
    type: PropTypes.string
  })
};

NotificationsSettings.defaultProps = {
  company: {
    id: 0,
    type: ''
  }
};

export default NotificationsSettings;
