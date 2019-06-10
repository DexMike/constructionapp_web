import React, { Component } from 'react';
import {
  Col,
  Container,
  Row,
  Button
} from 'reactstrap';
import * as PropTypes from 'prop-types';
import './Settings.css';

class NotificationsSettings extends Component {
  constructor(props) {
    super(props);
    this.state = {
      communicationTypes: [
        { id: 1, name: 'In App', enabled: false},
        { id: 2, name: 'Mobile', enabled: false },
        { id: 3, name: 'SMS', enabled: true },
        { id: 4, name: 'Email', enabled: false}
      ],
      // dummyData
      notifications: [
        {
          id: 1,
          type: 'carrierJobs',
          enabled: true,
          name: 'Notify me jobs scheduled for the next day',
          options: [
            { id: 1, name: 'In App', enabled: false },
            { id: 2, name: 'Mobile', enabled: false },
            { id: 3, name: 'SMS', enabled: true },
            { id: 4, name: 'Email', enabled: false }
          ]
        },
        {
          id: 2,
          type: 'carrierJobs',
          enabled: false,
          name: 'Notify me when a customer requests me for a Job',
          options: [
            { id: 1, name: 'In App', enabled: false },
            { id: 2, name: 'Mobile', enabled: false },
            { id: 3, name: 'SMS', enabled: true },
            { id: 4, name: 'Email', enabled: false }
          ]
        },
        {
          id: 12,
          type: 'carrierJobs',
          enabled: false,
          name: 'Notify me when a customer accepts my request for Job',
          options: [
            { id: 1, name: 'In App', enabled: false },
            { id: 2, name: 'Mobile', enabled: false },
            { id: 3, name: 'SMS', enabled: true },
            { id: 4, name: 'Email', enabled: false }
          ]
        },
        //
        {
          id: 3,
          type: 'customerJobs',
          enabled: true,
          name: 'Notify me when a Carrier has accepted my job offer',
          options: [
            { id: 1, name: 'In App', enabled: false },
            { id: 2, name: 'Mobile', enabled: false },
            { id: 3, name: 'SMS', enabled: true },
            { id: 4, name: 'Email', enabled: false }
          ]
        },
        {
          id: 4,
          type: 'customerJobs',
          enabled: false,
          name: 'Notify me when a Carrier has requested my job',
          options: [
            { id: 1, name: 'In App', enabled: false },
            { id: 2, name: 'Mobile', enabled: false },
            { id: 3, name: 'SMS', enabled: true },
            { id: 4, name: 'Email', enabled: false }
          ]
        },
        {
          id: 5,
          type: 'customerJobs',
          enabled: true,
          name: 'Notify me when the Carrier has started the job',
          options: [
            { id: 1, name: 'In App', enabled: false },
            { id: 2, name: 'Mobile', enabled: false },
            { id: 3, name: 'SMS', enabled: true },
            { id: 4, name: 'Email', enabled: false }
          ]
        },
        {
          id: 6,
          type: 'customerJobs',
          enabled: false,
          name: 'Notify me when the carrier has completed the job',
          options: [
            { id: 1, name: 'In App', enabled: false },
            { id: 2, name: 'Mobile', enabled: false },
            { id: 3, name: 'SMS', enabled: true },
            { id: 4, name: 'Email', enabled: false }
          ]
        },
        {
          id: 7,
          type: 'marketplace',
          enabled: true,
          name: 'Notify me of jobs that match my job preferences',
          options: [
            { id: 1, name: 'In App', enabled: false },
            { id: 2, name: 'Mobile', enabled: false },
            { id: 3, name: 'SMS', enabled: true },
            { id: 4, name: 'Email', enabled: false }
          ]
        },
        {
          id: 8,
          type: 'payments',
          enabled: true,
          name: 'Notify me when a load is being disputed',
          options: [
            { id: 1, name: 'In App', enabled: false },
            { id: 2, name: 'Mobile', enabled: false },
            { id: 3, name: 'SMS', enabled: true },
            { id: 4, name: 'Email', enabled: false }
          ]
        },
        {
          id: 9,
          type: 'payments',
          enabled: false,
          name: 'Notify me (Friday) when i receive a payment',
          options: [
            { id: 1, name: 'In App', enabled: false },
            { id: 2, name: 'Mobile', enabled: false },
            { id: 3, name: 'SMS', enabled: true },
            { id: 4, name: 'Email', enabled: false }
          ]
        },
        {
          id: 10,
          type: 'loads',
          enabled: false,
          name: 'Notify me when a load has started',
          options: [
            { id: 1, name: 'In App', enabled: false },
            { id: 2, name: 'Mobile', enabled: false },
            { id: 3, name: 'SMS', enabled: true },
            { id: 4, name: 'Email', enabled: false }
          ]
        },
        {
          id: 11,
          type: 'loads',
          enabled: false,
          name: 'Notify me when a load has completed',
          options: [
            { id: 1, name: 'In App', enabled: false },
            { id: 2, name: 'Mobile', enabled: false },
            { id: 3, name: 'SMS', enabled: true },
            { id: 4, name: 'Email', enabled: false }
          ]
        }
      ]
    };
    this.handleInputChange = this.handleInputChange.bind(this);
    this.setNotificationState = this.setNotificationState.bind(this);
    this.setAllNotificationsState = this.setAllNotificationsState.bind(this);
    this.saveSettings = this.saveSettings.bind(this);
  }

  async componentDidMount() {
    // const notifications = await LookupsService.getDefaultNotificationsSettings();
  }
  // to check or uncheck all checkboxes of the same class

  setCheckedStatus(state, checkboxClass) {
    const x = document.getElementsByClassName(checkboxClass);
    for (let i = 0; i < x.length; i += 1) {
      x[i].checked = state;
    }
  }

  setAllNotificationsState(type, checkBoxId, e) {
    const { notifications } = this.state;
    const newNotifications = notifications;
    let { value } = e.target;
    if (value === 'on') {
      document.getElementById(checkBoxId).value = 'off';
      value = true;
    } else {
      document.getElementById(checkBoxId).value = 'on';
      value = false;
    }

    for (const i in newNotifications) {
      if (newNotifications[i].type === type) {
        newNotifications[i].enabled = value;
      }
    }

    this.setState({
      notifications: newNotifications
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

  setAllNotificationOptionState(type, option, checkBoxId, e) {
    const { notifications } = this.state;
    const newNotifications = notifications;
    let { value } = e.target;
    if (value === 'on') {
      document.getElementById(checkBoxId).value = 'off';
      value = true;
    } else {
      document.getElementById(checkBoxId).value = 'on';
      value = false;
    }

    for (const i in newNotifications) {
      if (newNotifications[i].type === type) {
        const { options } = newNotifications[i];
        for (const j in options) {
          if (options[j].id === option) {
            options[j].enabled = value;
            newNotifications[i].options = options;
          }
        }
      }
    }

    this.setState({
      notifications: newNotifications
    });
  }

  setNotificationOptionState(notificationId, optionId, e) {
    const { notifications } = this.state;
    let { value } = e.target;
    value = value === 'true';
    const notification = notifications.find(x => x.id === notificationId);
    const { options } = notification;
    const option = options.find(x => x.id === optionId);
    option.enabled = !value;
    let index = options.findIndex(x => x.id === optionId);
    notification.options[index] = option;
    index = notifications.findIndex(x => x.id === notificationId);
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

  handleInputChange(e) {
    const { value } = e.target;
    this.setState({
      [e.target.name]: value
    });
  }

  saveSettings() {
    const { company } = this.props;
    const {
      notifications
    } = this.state;

    const carrierJobs = [];
    const customerJobs = [];
    const marketplace = [];
    const payments = [];
    const loads = [];
    Object.values(notifications).forEach((itm) => {
      if (itm.type === 'carrierJobs') carrierJobs.push(itm);
      if (itm.type === 'customerJobs') customerJobs.push(itm);
      if (itm.type === 'marketplace') marketplace.push(itm);
      if (itm.type === 'payments') payments.push(itm);
      if (itm.type === 'loads') loads.push(itm);
    });

    const notificationsSettings = {
      companyId: company.id,
      jobs: {},
      marketplace,
      payments,
      loads
    };

    if (company.type === 'Customer') {
      notificationsSettings.jobs = customerJobs;
      delete notificationsSettings.marketplace;
      delete notificationsSettings.payments;
    } else {
      notificationsSettings.jobs = carrierJobs;
    }
    // notificationsSettings will be the object created from the selections
    // console.log(362, notificationsSettings);
  }

  renderTable(objectSettings) {
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
              objectSettings.communicationTypes.map(item => <td key={item.id} className="text-center"><strong>{item.name}</strong></td>)
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
                      onChange={e => this.setAllNotificationsState(objectSettings.type, `${objectSettings.type}SelectAll`, e)}
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
                    <td className="text-center" key={item.id}>
                      <label className="checkbox-container" htmlFor={`${objectSettings.type}option${item.id}SelectAll`}>
                        <input
                          type="checkbox"
                          disabled={!item.enabled}
                          onChange={e => this.setAllNotificationOptionState(
                            objectSettings.type,
                            item.id,
                            `${objectSettings.type}option${item.id}SelectAll`,
                            e
                          )
                          }
                          id={`${objectSettings.type}option${item.id}SelectAll`}
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
                <td>{notification.name}</td>
                {
                  notification.options.map((option, i) => (
                    <td className="text-center" key={`${notification.id}-${option.id}`}>
                      <label className="checkbox-container" htmlFor={`${notification.id}-${option.id}`}>
                        <input
                          type="checkbox"
                          value={option.enabled}
                          checked={option.enabled}
                          disabled={!objectSettings.communicationTypes[i].enabled}
                          id={`${notification.id}-${option.id}`}
                          onChange={
                            e => this.setNotificationOptionState(notification.id, option.id, e)}
                        />
                        <span className={`checkmark centered ${!objectSettings.communicationTypes[i].enabled ? 'disabled-checkbox' : null}`} />
                      </label>
                    </td>
                  ))
                }
              </tr>
            )))
          }
        </tbody>
      </table>
    );
  }

  renderJobSection() {
    const { communicationTypes, notifications } = this.state;
    const { company } = this.props;

    const carrierJobs = [];
    const customerJobs = [];
    Object.values(notifications).forEach((itm) => {
      if (itm.type === 'carrierJobs') carrierJobs.push(itm);
      if (itm.type === 'customerJobs') customerJobs.push(itm);
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
      notifications
    } = this.state;

    const marketplace = [];
    Object.values(notifications).forEach((itm) => {
      if (itm.type === 'marketplace') marketplace.push(itm);
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
    const { communicationTypes, notifications } = this.state;
    const payments = [];
    Object.values(notifications).forEach((itm) => {
      if (itm.type === 'payments') payments.push(itm);
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
    const { communicationTypes, notifications } = this.state;
    const loads = [];
    Object.values(notifications).forEach((itm) => {
      if (itm.type === 'loads') loads.push(itm);
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
      <Container>
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
        <Row className="pt-4">
          <Col md={12} className="text-right">
            <Button
              onClick={this.saveSettings}
            >
              Save
            </Button>
          </Col>
        </Row>
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
