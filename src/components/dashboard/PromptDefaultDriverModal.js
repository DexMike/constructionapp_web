import React, {Component} from 'react';
import { Button, Col, ModalBody, ModalFooter, ModalHeader, Row } from 'reactstrap';
import { withTranslation } from 'react-i18next';
import EquipmentDetailService from '../../api/EquipmentDetailService';
import UserService from '../../api/UserService';

class PromptDefaultDriverModal extends Component {
  constructor(props) {
    super(props);

    this.state = {
      mostRecentDriver: {}
    };

    this.handleSkip = this.handleSkip.bind(this);
    this.handleYes = this.handleYes.bind(this);
  }

  async componentDidMount() {
    const { profile } = { ...this.props };
    const mostRecentDriver = await EquipmentDetailService
      .getMostRecentEnabledDriverByCompany(profile.companyId);
    this.setState({ mostRecentDriver });
  }

  handleSkip() {
    const { toggle, user } = { ...this.props };
    user.defaultDriverPrompt = false;
    UserService.updateUser(user).then(() => {}).catch((err) => { console.log(err); });
    toggle();
  }

  handleYes() {
    const { toggle, user } = { ...this.props };
    user.defaultDriverPrompt = false;
    UserService.updateUser(user)
      .then(() => {
        window.location.href = '/trucks';
      })
      .catch((err) => { console.log(err); });
    toggle();
  }

  render() {
    const { t, toggle } = { ...this.props };
    const { mostRecentDriver } = { ...this.state };
    const translate = t;
    return (
      <React.Fragment>
        <ModalHeader>
          <div style={{ fontSize: 22, fontWeight: 'bold' }}>
            <span className="lnr lnr-question-circle"/>
            &nbsp;
            {translate('Default Driver')}
          </div>
        </ModalHeader>
        <ModalBody className="text-left" backdrop="static">
          <p style={{ fontSize: 14 }}>
            {`${translate('A Driver')} ${mostRecentDriver.firstName} ${mostRecentDriver.lastName} `
            + `${translate('DEFAULT_DRIVER_PROMPT')}`}
          </p>
        </ModalBody>
        <ModalFooter>
          <Row style={{ width: '100%'}}>
            <Col md={6} className="text-left" />
            <Col md={6}>
              <Row>
                <Button color="secondary" onClick={() => { toggle(); }}>
                  {translate('Ask me later')}
                </Button>
                <Button color="secondary" onClick={this.handleSkip}>
                  {translate('Skip')}
                </Button>
                <Button
                  color="primary"
                  onClick={this.handleYes}
                >
                  {translate('Yes')}
                </Button>
              </Row>
            </Col>
          </Row>
        </ModalFooter>
      </React.Fragment>
    );
  }
}

export default withTranslation()(PromptDefaultDriverModal);
