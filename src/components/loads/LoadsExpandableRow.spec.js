import { shallow } from 'enzyme';
import React from 'react';
import LoadsExpandableRow from './LoadsExpandableRow';
import LoadService from '../../api/LoadService';
import EmailService from '../../api/EmailService';
import moment from 'moment';

describe('<LoadsExpandableRow />', () => {

  const load = {
    id: 389,
    bookingEquipmentId: 73,
    customerSchedulerCompanyId: null,
    rateType: 'Ton',
    material: 'Sand',
    startTime: 1565112446000,
    endTime: 1565113396000,
    loadFee: null,
    loadStatus: 'Submitted',
    ticketNumber: 131,
    startAddressId: null,
    endAddressId: null,
    startGeoFence: null,
    endGeoFence: null,
    hoursEntered: 16,
    notes: null,
    createdBy: 3,
    createdOn: 1565094446000,
    modifiedBy: 3,
    modifiedOn: 1565094446000,
    isArchived: null,
    isExpanded: false
  };
  const job = {
    id: 252,
    companiesId: 3,
    orderId: null,
    name: 'Jasons Deli phase 1',
    status: 'Job Completed',
    startAddress: null,
    endAddress: null,
    startTime: 1565110800000,
    endTime: null,
    numEquipments: null,
    equipmentType: 'Super Dump',
    rateType: 'Ton',
    rate: 10,
    rateEstimate: 26,
    rateTotal: 427766,
    startGeoFence: null,
    endGeoFence: null,
    notes: '',
    createdBy: 4,
    createdOn: 1565091569000,
    modifiedBy: 3,
    modifiedOn: 1565091942000,
    isArchived: null,
    countJobs: 0,
    totalJobs: 0,
    estimatedEarnings: 0,
    company: null,
    materials: 'Sand'
  };
  const index = 0;

  it('renders correctly', () => {
    const wrapper = shallow(
      <LoadsExpandableRow load={load} job={job} index={index}/>
    );
    expect(wrapper.html()).toEqual('<div class="container">Loading...</div>');
  });

  it('should dispute a load', async () => {
    const company = {
      id: 3,
      legalName: 'Trelar Customer',
      dba: null,
      addressId: 78,
      adminId: 4,
      phone: '6129990787',
      url: 'www.trelar.com',
      fax: null,
      rating: null,
      createdBy: null,
      createdOn: 1555357742000,
      modifiedBy: null,
      modifiedOn: 1555357742000,
      isArchived: null,
      operatingRange: null,
      dotNumber: null,
      type: 'Customer',
      btCustomerId: null,
      totalCompanies: null,
      distance: null,
      companyStatus: '',
      liabilityGeneral: 0,
      liabilityAuto: 0,
      liabilityOther: 0,
      liabilityExpiration: 1565541115000,
      hwCustomerId: null,
      hwToken: null,
      adminPhone: null,
      isFavorite: null
    };
    const envString = (process.env.APP_ENV === 'Prod') ? '' : `[Env] ${process.env.APP_ENV} `;
    const disputeEmail = {
      toEmail: 'csr@trelar.com',
      toName: 'Trelar CSR',
      subject: `${envString}[Dispute] ${company.legalName}, Load Ticket Number ${load.ticketNumber}`,
      isHTML: true,
      body: 'Support,<br><br>The following customer has disputed a load.<br><br>'
        + `Time of dispute: ${moment(new Date()).format('lll')}<br>`
        + `Company: ${company.legalName}<br>`
        + `Load Ticket Number: ${load.ticketNumber}`,
      recipients: [
        {
          name: 'CSR',
          email: 'csr@trelar.com'
        }
      ],
      attachments: []
    };
    // const {load, disputeEmail} = {...this.state};
    load.loadStatus = 'Disputed';
    await LoadService.updateLoad(load);
    await EmailService.sendEmailToNonUsers(disputeEmail);
  });
});
