import React, { Component } from 'react';
import { Redirect } from 'react-router-dom';
import {
  Col,
  Container,
  Row,
  Button,
  Modal
} from 'reactstrap';
import PropTypes from 'prop-types';
import TTable from '../common/TTable';
import TFormat from '../common/TFormat';
import AttachmentForm from './AttachmentForm';
import AttachmentService from '../../api/AttachmentService';

class AttachmentsListPage extends Component {
  constructor(props) {
    super(props);

    this.state = {
      attachments: [],
      currentPreview: '',
      modal: false,
      attachmentModal: false,
      attachmentId: 0,
      action: '',
      loaded: false,
      // page: 0,
      // rows: 10,
      totalCount: 10
    };

    this.handleAttachmentEdit = this.handleAttachmentEdit.bind(this);
    this.handleItemPreview = this.handleItemPreview.bind(this);
    this.handlePageChange = this.handlePageChange.bind(this);
    this.handleRowsPerPage = this.handleRowsPerPage.bind(this);
    this.togglePreview = this.togglePreview.bind(this);
    this.toggleAttachmentForm = this.toggleAttachmentForm.bind(this);
  }

  async componentDidMount() {
    const { companyId } = this.props;
    this.mounted = true;
    const attachments = await AttachmentService.getCompanyAttachments(companyId);

    attachments.map((item) => {
      const newAttachment = item;
      newAttachment.createdOn = TFormat.asDate(item.createdOn);
      const imgName = item.image.split(/[\s/]+/);
      newAttachment.imgName = imgName[imgName.length - 1];
      newAttachment.imgPreview = item.image;
      return newAttachment;
    });
    this.setState({
      attachments,
      loaded: true
    });
  }

  componentWillUnmount() {
    this.mounted = false;
  }

  togglePreview() {
    const { modal } = this.state;
    this.setState({ modal: !modal });
  }

  toggleAttachmentForm() {
    this.setState(prevState => ({
      attachmentModal: !prevState.attachmentModal
    }));
  }

  handlePageClick(menuItem) {
    if (menuItem) {
      this.setState({ [`goTo${menuItem}`]: true });
    }
  }

  handleAttachmentEdit(id) {
    // this.setState({
    //   attachmentId: id
    // });
    // this.toggleAttachmentForm();
  }

  handleItemPreview(src) {
    this.setState({
      currentPreview: src
    });
    this.togglePreview();
  }

  handlePageChange(/* page */) {
  }

  handleRowsPerPage(/* rows */) {
  }

  renderAttachmentModalForm() {
    const { attachmentModal, action, attachmentId } = this.state;
    return (
      <React.Fragment>
        <Modal isOpen={attachmentModal} toggle={this.toggleAttachmentForm}>
          <AttachmentForm
            toggleModal={this.toggleAttachmentForm}
            action={action}
            id={attachmentId}
          />
        </Modal>
      </React.Fragment>
    );
  }

  renderModal() {
    const { modal, currentPreview } = this.state;
    return (
      <React.Fragment>
        <Modal isOpen={modal} toggle={this.togglePreview}>
          <img src={currentPreview} alt="attachment"/>
        </Modal>
      </React.Fragment>
    );
  }

  renderHeaders() {
    const { companyId } = this.props;
    if (companyId) {
      return false;
    }
    return (
      <div>
        <button type="button" className="app-link"
          onClick={() => this.handlePageClick('Dashboard')}
        >
          Dashboard
        </button>
        &#62;Attachments
        <Row>
          <Col md={12}>
            <h3 className="page-title">Attachments</h3>
          </Col>
        </Row>
      </div>
    );
  }

  render() {
    const { loaded, attachments, totalCount } = this.state;
    if (loaded) {
      return (
        <Container className="dashboard">
          {this.renderHeaders()}
          {this.renderModal()}
          {this.renderAttachmentModalForm()}
          <Row>
            <Col md={12} className="text-right pt-4">
              {
                /*
                <Button
                style={{ width: 200, color: '#FFF' }}
                className="btn btn-primary account__btn account__btn--small"
                onClick={() => {
                  this.setState({ action: 'Add' });
                  this.toggleAttachmentForm();
                }}
              >
                    Add Attachment
              </Button>
                */
              }
            </Col>
          </Row>
          <Row>
            <Col md={12}>
              <TTable
                columns={[
                  // {
                  //   name: 'id',
                  //   displayName: 'ID'
                  // }, {
                  //   name: 'companyId',
                  //   displayName: 'Company'
                  // },
                  {
                    name: 'createdOn',
                    displayName: 'Created On'
                  },
                  {
                    name: 'imgName',
                    displayName: 'name'
                  },
                  {
                    name: 'imgPreview',
                    displayName: 'Preview'
                  }
                ]}
                data={attachments}
                handleIdClick={this.handleAttachmentEdit}
                handleItemPreview={this.handleItemPreview}
                handleRowsChange={this.handleRowsPerPage}
                handlePageChange={this.handlePageChange}
                totalCount={totalCount}
              />
            </Col>
          </Row>
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

AttachmentsListPage.propTypes = {
  companyId: PropTypes.number
};

AttachmentsListPage.defaultProps = {
  companyId: 0
};

export default AttachmentsListPage;
