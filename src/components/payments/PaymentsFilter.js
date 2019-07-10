import { Button, Card, CardBody, Col, Row } from 'reactstrap';
import moment from 'moment';
import React, {Component} from 'react';
// import MultiSelect from '../common/TMultiSelect';
import TSelect from '../common/TSelect';
// import TField from '../common/TField';
import TIntervalDatePicker from '../common/TIntervalDatePicker';

class PaymentsFilter extends Component {
  constructor(props) {
    super(props);
    this.state = {
      rateTypeList: ['Any'],
      // ref https://portal.hyperwallet.com/docs/api/v3/resources/payments/retrieve
      statusTypeList: [
        'CREATED', 'SCHEDULED', 'PENDING_ACCOUNT_ACTIVATION', 'PENDING_TAX_VERIFICATION',
        'PENDING_TRANSFER_METHOD_ACTION', 'PENDING_TRANSACTION_VERIFICATION', 'IN_PROGRESS',
        'COMPLETED', 'CANCELLED', 'FAILED', 'RECALLED', 'RETURNED', 'EXPIRED'
      ],
      // filters
      filters: {
        name: '',
        startDate: new Date(moment().add(-2, 'weeks').format()),
        endDate: new Date(moment().format()),
        rateType: [],
        statusType: []
      }
    };
  }

  handleFilterChange() {

  }

  render() {
    const {
      rateTypeList,
      statusTypeList,
      filters
    } = this.state;

    return (
      <Row>
        <Col md={12}>
          <Card>
            <CardBody>
              <form id="filter-form" className="form" onSubmit={(e) => { console.log(e); }}>
                <Col lg={12}>
                  <Row lg={12} id="filter-input-row">
                    <Col md="3">
                      <div className="filter-item-title">
                        Search by Customer Name
                      </div>
                      <input
                        name="name"
                        type="text"
                        placeholder="Name"
                        value={filters.name}
                        onChange={() => {}}
                      />
                    </Col>
                    <Col md="4">
                      <div className="filter-item-title">
                        Date Range
                      </div>
                      <TIntervalDatePicker
                        startDate={filters.startDate}
                        endDate={filters.endDate}
                        name="dateInterval"
                        onChange={() => {}}
                        dateFormat="MM/dd/yy"
                      />
                    </Col>
                    <Col md="2">
                      <div className="filter-item-title">
                        Rate Type
                      </div>
                      <TSelect
                        input={
                          {
                            onChange: () => {},
                            name: 'rateType',
                            value: filters.rateType
                          }
                        }
                        meta={
                          {
                            touched: false,
                            error: 'Unable to select'
                          }
                        }
                        placeholder="Any"
                        value={filters.rateType}
                        options={
                          rateTypeList.map(rateType => ({
                            name: 'rateType',
                            value: rateType,
                            label: rateType
                          }))
                        }
                      />
                    </Col>
                    <Col md="3">
                      <div className="filter-item-title">
                        Status Type
                      </div>
                      <TSelect
                        input={
                          {
                            onChange: () => {},
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
                    <Col md="8" />
                    <Col md="4" className="">
                      <Button
                        onClick={() => {}}
                        className="btn btn-primary float-right mt-20"
                        styles="margin:0px !important"
                      >
                        Reset Filters
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

export default PaymentsFilter;
