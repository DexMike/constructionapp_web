import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Redirect } from 'react-router-dom';
import { Card, CardBody, Col, Row, Button, Container } from 'reactstrap';
import TFileUploadSingle from '../common/TFileUploadSingle';
import AttachmentService from '../../api/AttachmentService';
import './Attachments.css';


class AttachmentForm extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loaded: false,
      attachment: [],
      files: []
    };

    this.handleInputChange = this.handleInputChange.bind(this);
    this.handleImageUpload = this.handleImageUpload.bind(this);
    // this.saveAttachment = this.saveAttachment.bind(this);
  }

  async componentDidMount() {
    const { action, id } = this.props;
    this.mounted = true;
    let files;
    let attachment;
    if (action === 'Add') {
      attachment = [];
    } else {
      attachment = await AttachmentService.getAttachmentById(id);
      if (attachment.image
        && attachment.image.trim().length > 0) {
        const urlPieces = attachment.image.split('/');
        const name = (urlPieces.length > 0) ? urlPieces[urlPieces.length - 1] : 'undefined';
        files = [
          {
            name,
            preview: attachment.image
          }
        ];
      }
    }

    this.setState({
      files,
      attachment,
      loaded: true
    });
  }

  async componentWillReceiveProps() {
    this.mounted = true;
  }

  componentWillUnmount() {
    this.mounted = false;
  }

  handleInputChange(e) {
    const { value } = e.target;
    this.setState({
      [e.target.name]: value
    });
  }

  async handleImageUpload(filesToUpload) {
    this.setState({ files: filesToUpload });
  }

  renderAttachmentForm() {
    const {
      files,
      imageUploading
    } = this.state;
    const { toggleModal } = this.props;
    return (
      <Container>
        <Row>
          <Col md={12}>
            <h4 className="subhead">
              Upload an attachment
            </h4>
            <br />
            <TFileUploadSingle
              name="image"
              files={files}
              onChange={this.handleImageUpload}
            />
            {imageUploading && <span>Uploading Image...</span>}
          </Col>
        </Row>
        <br/>
        <Row className="mt-4">
          <Col md={4}>
            <Button
              className="account__btn btn-delete"
              onClick={() => this.handleDelete()}
            >
              Delete Attachment
            </Button>
          </Col>
          <Col md={4}>
            <Button
              className="app-link account__btn btn-back"
              onClick={() => toggleModal()}
            >
              Cancel
            </Button>
          </Col>
          <Col md={4}>
            <Button
              type="submit"
              className="account__btn btn-save"
              // onClick={this.saveAttachment}
            >
              Submit
            </Button>
          </Col>
        </Row>
      </Container>
    );
  }

  render() {
    const { loaded } = this.state;
    if (loaded) {
      return (
        <React.Fragment>
          <Card>
            <CardBody>
              <Col md={12} lg={12}>
                {this.renderAttachmentForm()}
              </Col>
            </CardBody>
          </Card>
        </React.Fragment>
      );
    }
    return (
      <React.Fragment>
        <Col md={12} lg={12}>
          &nbsp;
        </Col>
      </React.Fragment>
    );
  }
}

export default AttachmentForm;
