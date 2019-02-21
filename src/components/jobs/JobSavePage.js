
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Redirect } from 'react-router-dom';
import JobForm from './JobForm';
import JobsService from '../../api/JobsService';

class JobSavePage extends Component {
  constructor(props) {
    super(props);

    this.state = {
      goToDashboard: false,
      goToJob: false,
      job: {}
    };

    this.handlePageClick = this.handlePageClick.bind(this);
    this.handleDelete = this.handleDelete.bind(this);
  }

  async componentDidMount() {
    const { match } = this.props;
    if (match.params.id) {
      const job = await JobsService.getJobById(match.params.id);
      this.setState({ job });
    }
  }

  handlePageClick(menuItem) {
    if (menuItem) {
      this.setState({ [`goTo${menuItem}`]: true });
    }
  }

  async handleDelete() {
    const { match } = this.props;
    const { id } = match.params;
    await JobsService.deleteJobById(id);
    this.handlePageClick('Job');
  }

  renderGoTo() {
    const { goToDashboard, goToJob } = this.state;
    if (goToDashboard) {
      return <Redirect push to="/" />;
    }
    if (goToJob) {
      return <Redirect push to="/jobs" />;
    }
    return false;
  }

  render() {
    const { job } = this.state;
    return (
      <div className="container">
        {this.renderGoTo()}
        <button type="button" className="app-link"
          onClick={() => this.handlePageClick('Dashboard')}
        >
          Dashboard
        </button>
        &#62;
        <button type="button" className="app-link" onClick={() => this.handlePageClick('Job')}>
          Jobs
        </button>
        &#62;Save
        <div className="row">
          <div className="col-md-12">
            <h3 className="page-title">
              Save Job
            </h3>
          </div>
        </div>
        <JobForm job={job} handlePageClick={this.handlePageClick} />
      </div>
    );
  }
}

JobSavePage.propTypes = {
  match: PropTypes.shape({
    params: PropTypes.shape({
      id: PropTypes.string
    })
  })
};

JobSavePage.defaultProps = {
  match: {
    params: {}
  }
};

export default JobSavePage;
