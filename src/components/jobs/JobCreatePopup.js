import React, { Component } from 'react';
import { Redirect } from 'react-router-dom';
import moment from 'moment';
import PropTypes from 'prop-types';
import {
  Container,
  Row,
  Col,
  Card
} from 'reactstrap';
import JobCreateFormOne from './JobCreateFormOne';
import JobCreateFormTwo from './JobCreateFormTwo';
import ProfileService from '../../api/ProfileService';
import JobService from '../../api/JobService';
import AddressService from '../../api/AddressService';
import JobMaterialsService from '../../api/JobMaterialsService';

class JobCreatePopup extends Component {
  constructor(props) {
    super(props);

    this.state = {
      page: 1,
      job: [],
      loaded: false,
      validateFormOne: false,
      firstTabInfo: {},
      profile: [],
      goToJobDetail: false
    };
    this.nextPage = this.nextPage.bind(this);
    this.previousPage = this.previousPage.bind(this);
    this.gotoPage.bind(this);
    this.firstPage = this.firstPage.bind(this);
    this.closeNow = this.closeNow.bind(this);
    this.saveAndGoToSecondPage = this.saveAndGoToSecondPage.bind(this);
    this.getFirstTabInfo = this.getFirstTabInfo.bind(this);
    this.validateFormOne = this.validateFormOne.bind(this);
    this.validateFormOneRes = this.validateFormOneRes.bind(this);
    this.saveJobDraftOrCopy = this.saveJobDraftOrCopy.bind(this);
    this.renderGoTo = this.renderGoTo.bind(this);
    this.updateJob = this.updateJob.bind(this);
  }

  async componentDidMount() {
    const { jobId } = this.props;
    let job = [];
    if (jobId) {
      job = await JobService.getJobById(jobId);
      this.setState({firstTabInfo: job});
      this.getFirstTabInfo();
    }
    const profile = await ProfileService.getProfile();
    this.setState({ job, profile, loaded: true });
  }

  getFirstTabInfo() {
    const { firstTabInfo } = this.state;
    return firstTabInfo;
  }

  updateJob(newJob) {
    const { updateJob, updateCopiedJob } = this.props;
    if (newJob.copiedJob) {
      updateCopiedJob(newJob)
    }
    if (updateJob) {
      updateJob(newJob, null);
    }
  }

  // Used to either store a Copied or 'Saved' job to the database
  async saveJobDraftOrCopy(e) {
    const { profile } = this.state;
    const d = e;
    // return;

    // start location
    let startAddress = {
      id: null
    };
    if (d.selectedStartAddressId > 0) {
      startAddress.id = d.selectedStartAddressId;
    }
    if (d.selectedStartAddressId === 0 && d.startLocationAddressName.length > 0) {
      const address1 = {
        type: 'Delivery',
        name: d.startLocationAddressName,
        companyId: profile.companyId,
        address1: d.startLocationAddress1,
        address2: d.startLocationAddress2,
        city: d.startLocationCity,
        state: d.startLocationState,
        zipCode: d.startLocationZip,
        latitude: d.startLocationLatitude,
        longitude: d.startLocationLongitude,
        createdBy: profile.userId,
        createdOn: moment.utc().format(),
        modifiedBy: profile.userId,
        modifiedOn: moment.utc().format()
      };
      startAddress = await AddressService.createAddress(address1);
    }
    // end location
    let endAddress = {
      id: null
    };
    if (d.selectedEndAddressId > 0) {
      endAddress.id = d.selectedEndAddressId;
    }
    if (d.selectedEndAddressId === 0 && d.endLocationAddressName.length > 0) {
      const address2 = {
        type: 'Delivery',
        name: d.endLocationAddressName,
        companyId: profile.companyId,
        address1: d.endLocationAddress1,
        address2: d.endLocationAddress2,
        city: d.endLocationCity,
        state: d.endLocationState,
        zipCode: d.endLocationZip,
        latitude: d.endLocationLatitude,
        longitude: d.endLocationLongitude
      };
      endAddress = await AddressService.createAddress(address2);
    }

    let rateType = '';
    let rate = 0;
    if (d.selectedRatedHourOrTon && d.selectedRatedHourOrTon.length > 0) {
      if (d.selectedRatedHourOrTon === 'ton') {
        rateType = 'Ton';
        rate = Number(d.rateByTonValue);
        d.rateEstimate = d.estimatedTons;
      } else {
        rateType = 'Hour';
        rate = Number(d.rateByHourValue);
        d.rateEstimate = d.estimatedHours;
      }
    }

    const calcTotal = d.rateEstimate * rate;
    const rateTotal = Math.round(calcTotal * 100) / 100;

    if (d.jobDate && Object.prototype.toString.call(d.jobDate) === '[object Date]') {
      d.jobDate = moment(d.jobDate).format('YYYY-MM-DD HH:mm');
      d.jobDate = moment.tz(
        d.jobDate,
        profile.timeZone || Intl.DateTimeFormat().resolvedOptions().timeZone
      ).utc().format();
    } else {
      d.jobDate = '';
    }

    if (!d.truckType || d.truckType.lenght === 0) {
      d.truckType = '';
    } else {
      d.truckType = d.truckType.value;
    }

    const job = {
      companiesId: profile.companyId,
      name: d.name,
      status: 'Saved',
      startAddress: startAddress.id,
      endAddress: endAddress.id,
      startTime: d.jobDate,
      equipmentType: d.truckType,
      numEquipments: d.hourTrucksNumber,
      rateType,
      rate,
      rateEstimate: d.rateEstimate,
      rateTotal,
      notes: d.instructions,
      createdBy: profile.userId,
      createdOn: moment.utc().format(),
      modifiedBy: profile.userId,
      modifiedOn: moment.utc().format()
    };
    const newJob = await JobService.createJob(job);

    // add material
    if (newJob && Object.entries(d.selectedMaterials).length > 0) {
      const newMaterial = {
        jobsId: newJob.id,
        value: d.selectedMaterials.value,
        createdBy: profile.userId,
        createdOn: moment.utc().format(),
        modifiedBy: profile.userId,
        modifiedOn: moment.utc().format()
      };
      await JobMaterialsService.createJobMaterials(newMaterial);
    }

    this.setState({
      job: newJob,
      goToJobDetail: true
    });
  }

  saveAndGoToSecondPage(e) {
    this.setState({ firstTabInfo: e });
    this.setState({ page: 2 });
  }

  validateFormOne() {
    this.setState({ validateFormOne: true });
  }

  validateFormOneRes(res) {
    this.setState({ validateFormOne: res });
  }

  closeNow() {
    const { toggle } = this.props;
    toggle();
  }

  firstPage() {
    this.setState({ page: 1 });
  }

  nextPage() {
    const { page } = this.state;
    // just checking if the state changeo
    this.setState({ page: page + 1 });
  }

  previousPage() {
    const { page } = this.state;
    this.setState({ page: page - 1 });
  }

  gotoPage(pageNumber) {
    this.setState({ page: pageNumber });
  }

  renderGoTo() {
    const { goToJobDetail, job } = this.state;
    if (goToJobDetail) {
      return <Redirect push to={`/jobs/save/${job.id}`}/>;
    }
    return false;
  }

  render() {
    const { equipmentId, companyId, editDriverId, updateJob, copyJob } = this.props;
    const {
      job,
      page,
      loaded,
      validateFormOne
    } = this.state;
    if (loaded) {
      return (
        <Container className="dashboard">
          {this.renderGoTo()}
          <Row>
            {/* <h1>TEST</h1> */}
            <Col md={12} lg={12}>
              <Card style={{paddingBottom: 0}}>
                <div className="wizard">
                  <div className="wizard__steps">
                    {/* onClick={this.gotoPage(1)} */}
                    <div
                      role="link"
                      tabIndex="0"
                      onKeyPress={this.handleKeyPress}
                      onClick={this.firstPage}
                      className={`wizard__step${page === 1 ? ' wizard__step--active' : ''}`}
                    >
                      <p>Create Job</p>
                    </div>
                    <div
                      role="link"
                      tabIndex="0"
                      onKeyPress={this.handleKeyPress}
                      onClick={this.validateFormOne}
                      className={`wizard__step${page === 2 ? ' wizard__step--active' : ''}`}
                    >
                      <p>Send Job</p>
                    </div>
                  </div>
                  <div className="wizard__form-wrapper">
                    {/* onSubmit={this.nextPage} */}
                    {page === 1
                      && (
                      <JobCreateFormOne
                        p={page}
                        onClose={this.closeNow}
                        gotoSecond={this.saveAndGoToSecondPage}
                        firstTabData={this.getFirstTabInfo}
                        validateOnTabClick={validateFormOne}
                        validateRes={this.validateFormOneRes}
                        saveJobDraftOrCopy={this.saveJobDraftOrCopy}
                        copyJob={copyJob}
                      />
                      )}
                    {page === 2
                      && (
                      <JobCreateFormTwo
                        p={page}
                        onClose={this.closeNow}
                        firstTabData={this.getFirstTabInfo}
                        jobId={job.id}
                        saveJobDraftOrCopy={this.saveJobDraftOrCopy}
                        updateJob={this.updateJob}
                        copyJob={copyJob}
                      />
                      )}
                    {/* onSubmit={onSubmit} */}
                  </div>
                </div>
              </Card>
            </Col>
          </Row>
        </Container>
      );
    }
    return (
      <Container className="dashboard">
        <Row>
          <Col md={12}>
            <Card>Loading...</Card>
          </Col>
        </Row>
      </Container>
    );
  }
}

JobCreatePopup.propTypes = {
  toggle: PropTypes.func.isRequired,
  jobId: PropTypes.number,
  updateJob: PropTypes.func,
  copyJob: PropTypes.bool,
  updateCopiedJob: PropTypes.func
};

JobCreatePopup.defaultProps = {
  jobId: null,
  updateJob: null,
  copyJob: false,
  updateCopiedJob: null
};


export default JobCreatePopup;
