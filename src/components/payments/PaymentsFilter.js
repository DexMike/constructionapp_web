import { Button, Card, CardBody, Col, Row } from 'reactstrap';
import moment from 'moment';
import React, { Component } from 'react';
import { withTranslation } from 'react-i18next';
// import MultiSelect from '../common/TMultiSelect';
import * as PropTypes from 'prop-types';
import TSelect from '../common/TSelect';
// import TField from '../common/TField';
import TIntervalDatePicker from '../common/TIntervalDatePicker';

class PaymentsFilter extends Component {
  constructor(props) {
    super(props);

    const { isCarrier } = props;

    const HWStatusTypeList = [
      'CREATED', 'SCHEDULED', 'PENDING_ACCOUNT_ACTIVATION', 'PENDING_TAX_VERIFICATION',
      'PENDING_TRANSFER_METHOD_ACTION', 'PENDING_TRANSACTION_VERIFICATION', 'IN_PROGRESS',
      'COMPLETED', 'CANCELLED', 'FAILED', 'RECALLED', 'RETURNED', 'EXPIRED'
    ];

    const BTStatusTypeList = [
      'AUTHORIZATION_EXPIRED', 'AUTHORIZED', 'AUTHORIZING', 'SETTLEMENT_PENDING',
      'SETTLEMENT_CONFIRMED', 'SETTLEMENT_DECLINED', 'FAILED', 'GATEWAY_REJECTED',
      'PROCESSOR_DECLINED', 'SETTLED', 'SETTLING', 'SUBMITTED_FOR_SETTLEMENT', 'VOIDED'
    ];

    this.state = {
      // rateTypeList: ['Any'],
      // ref https://portal.hyperwallet.com/docs/api/v3/resources/payments/retrieve
      statusTypeList: isCarrier ? HWStatusTypeList : BTStatusTypeList,
      // filters
      filters: {
        name: '',
        startDate: new Date(moment().add(-2, 'weeks').format()),
        endDate: new Date(moment().format()),
        // rateType: [],
        statusType: []
      }
    };
  }

  handleFilterChange() {

  }

  render() {
    const {
      // rateTypeList,
      statusTypeList,
      filters
    } = this.state;
    const { isCarrier, t } = this.props;

    const companySearchType = isCarrier ? 'Customer' : 'Carrier';

    return (
      <Row>
        <Col md={12}>
          <Card>
            <CardBody>
              <form id="filter-form" className="form" onSubmit={(e) => {
                console.log(e);
              }}>
                <Col lg={12}>
                  <Row lg={12} id="filter-input-row">
                    <Col md="3">
                      <div className="filter-item-title">
                        {t(`Search by ${companySearchType} Name`)}
                      </div>
                      <input
                        name="name"
                        type="text"
                        placeholder={t('Name')}
                        value={filters.name}
                        onChange={() => {
                        }}
                      />
                    </Col>
                    <Col md="4">
                      <div className="filter-item-title">
                        {t('Date Range')}
                      </div>
                      <TIntervalDatePicker
                        startDate={filters.startDate}
                        endDate={filters.endDate}
                        name="dateInterval"
                        onChange={() => {
                        }}
                        dateFormat="m/d/Y"
                      />
                    </Col>
                    <Col md="5">
                      <div className="filter-item-title">
                        {t('Status Type')}
                      </div>
                      <TSelect
                        input={
                          {
                            onChange: () => {
                            },
                            name: 'statusType',
                            value: filters.statusType
                          }
                        }
                        meta={
                          {
                            touched: false,
                            error: 'Unable to select'
                          }
                        }
                        value={filters.statusType}
                        options={
                          statusTypeList.map(statusType => ({
                            name: 'statusType',
                            value: statusType,
                            label: statusType
                          }))
                        }
                        placeholder="All"
                      />
                    </Col>
                  </Row>
                </Col>
                <br/>

                <Col lg={12}>
                  <Row lg={12} id="filter-input-row">
                    <Col md="8"/>
                    <Col md="4" className="">
                      <Button
                        onClick={() => {
                        }}
                        className="btn btn-primary float-right mt-20"
                        styles="margin:0px !important"
                      >
                        {t('Reset')}
                      </Button>
                    </Col>
                  </Row>
                </Col>

              </form>
            </CardBody>
          </Card>
        </Col>
      </Row>
    );
  }
}

PaymentsFilter.propTypes = {
  isCarrier: PropTypes.boolean
};

PaymentsFilter.defaultProps = {
  isCarrier: false
};

export default withTranslation()(PaymentsFilter);
