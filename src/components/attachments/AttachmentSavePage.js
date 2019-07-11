import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Redirect } from 'react-router-dom';
import AttachmentForm from './AttachmentForm';

class AttachmentSavePage extends Component {
  constructor(props) {
    super(props);

    this.state = {
      loaded: false,
      goToCompany: false,
      goToDashboard: false,
      goToAttachments: false
    };

    this.handlePageClick = this.handlePageClick.bind(this);
    this.handleDelete = this.handleDelete.bind(this);
  }

  async componentDidMount() {
    this.setState({ loaded: true });
  }

  handlePageClick(menuItem) {
    const { location } = this.props;
    if (menuItem) {
      if (location.fromCompanyId && location.fromCompanyId !== 0) {
        this.setState({ goToCompany: true });
      } else {
        this.setState({ [`goTo${menuItem}`]: true });
      }
    }
  }

  async handleDelete() {
    this.handlePageClick('Attachment');
  }

  renderGoTo() {
    const { goToDashboard, goToCompany } = this.state;
    const { location } = this.props;
    if (goToDashboard) {
      return <Redirect push to="/"/>;
    }
    if (goToCompany) {
      return <Redirect push to={`/tables/companies/${location.fromCompanyId}/tab/7/save`} />;
    }
    return true;
  }

  render() {
    const { loaded } = this.state;
    if (loaded) {
      return (
        <div className="container">
          {this.renderGoTo()}
          <button type="button" className="app-link"
                  onClick={() => this.handlePageClick('Dashboard')}
          >
            Dashboard
          </button>
          &#62;
          <button type="button" className="app-link" onClick={() => this.handlePageClick('Attachment')}>
            Attachments
          </button>
          &#62;Save
          <div className="row">
            <div className="col-md-12">
              <h3 className="page-title">
                Save Attachment
              </h3>
            </div>
          </div>
          <AttachmentForm/>
        </div>
      );
    }
    return (
      <div className="container">
        Loading ...
      </div>
    );
  }
}

export default AttachmentSavePage;
