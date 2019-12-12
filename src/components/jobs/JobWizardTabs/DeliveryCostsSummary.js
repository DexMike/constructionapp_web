import React from 'react';
import * as PropTypes from 'prop-types';
import {Row} from 'reactstrap';
import ReactTooltip from "react-tooltip";
import TFormat from '../../common/TFormat';

const InfoMessageDelPrice = ({payType}) => {
  if (payType === 'Hour') {
    return (
      <p style={{color: 'white'}}>
        We do not charge you this.
        This is to help you calculate a delivered price for your customer.
        The per ton price is based on calculations <br/>using our mapping technology
        to see how many tons could be delivered in your estimated hours.
      </p>
    );
  }
  return (
    <p style={{color: 'white'}}>
      We do not charge you this. This is to help you calculate a delivered price
      for your customer.
    </p>
  );
};

const DeliveryCostsSummary = ({
  disabled,
  estMaterialPricing,
  deliveredPricePerTon,
  deliveredPriceJob,
  payType,
  quantityType,
  oneWayCostPerTonHourPerMile,
  haulCostPerTonHour,
  estimatedCostForJob}) => (
    <React.Fragment>
      <Row className="col-md-12" style={{paddingBottom: 20}}>
        <Row className="col-md-12">
          {estMaterialPricing > 0 &&
          <div className="col-md-6 form__form-group">
            <Row className="col-md-12 ">
              <div className={`col-md-${(quantityType === 'Hour'
                     && payType === 'Ton') ? '12' : '8'} form__form-group`}>
                <span className="form__form-group-label" style={{fontStyle: 'italic', fontWeight: 'bold', color: disabled ? '#C8C8C8' : 'rgb(0, 111, 83)'}}>
                  Delivered Price
                </span>
              </div>
              { !(quantityType === 'Hour'
                && payType === 'Ton') &&
                <div>
                  <div className="col-md-4 form__form-group">
                    <span className="form__form-group-label">
                      <span className={disabled ? 'infoCircleDisabled' : 'infoCircle'}>
                        <span style={{padding: 6, color: 'white'}} data-tip data-for="delPriceInfo">i</span>
                      </span>
                    </span>
                  </div>
                  {!disabled
                    && (
                      <div className="customTooltip">
                        <ReactTooltip id="delPriceInfo" effect="solid">
                          <InfoMessageDelPrice payType={payType}/>
                        </ReactTooltip>
                      </div>
                    )
                  }
                </div>
              }
            </Row>
          </div>
          }
          <div className="col-md-6 form__form-group">
            <Row className="col-md-12 ">
              <div className={`col-md-${payType === 'Hour' ? '8' : '12'} form__form-group`}>
                <span className="form__form-group-label" style={{fontStyle: 'italic', fontWeight: 'bold', color: disabled ? '#C8C8C8' : 'rgb(0, 111, 83)'}}>
                  Haul Costs
                </span>
              </div>
              {payType === 'Hour'
                && (
                <div>
                  <div className="col-md-4 form__form-group">
                    <span className="form__form-group-label">
                      <span className={disabled ? 'infoCircleDisabled' : 'infoCircle'}>
                        <span style={{padding: 6, color: 'white'}} data-tip data-for="haulCostInfo">i</span>
                      </span>
                    </span>
                  </div>
                  {!disabled
                    && (
                      <div className="customTooltip">
                        <ReactTooltip id="haulCostInfo" effect="solid">
                          <p style={{color: 'white'}}>
                            Estimated total cost is based on estimated hours
                            this job will take to deliver the tons you requested.<br/>
                            It is based on our mapping and routing information.
                          </p>
                        </ReactTooltip>
                      </div>
                    )
                    }
                </div>
                )
              }
            </Row>
          </div>
        </Row>
        <Row className="col-md-12">
          {estMaterialPricing > 0 &&
          <div className="col-md-6 form__form-group">
            <Row className="col-md-12">
              <div className="col-md-7 form__form-group">
                <span className="form__form-group-label"
                      style={{color: disabled ? '#C8C8C8' : null}}
                >
                  Material Price per ton
                </span>
              </div>
              <div className="col-md-1 form__form-group">
                <span
                  style={{color: disabled ? '#C8C8C8' : null}}
                >
                  $
                </span>
              </div>
              <div className="col-md-3 form__form-group">
                <span
                  style={{color: disabled ? '#C8C8C8' : null}}
                >
                  {TFormat.asNumber(estMaterialPricing)}
                </span>
              </div>
            </Row>
            <Row className="col-md-12">
              <div className="col-md-7 form__form-group">
                <span className="form__form-group-label"
                      style={{color: disabled ? '#C8C8C8' : null}}
                >
                  Delivered Price per ton
                </span>
              </div>
              <div className="col-md-1 form__form-group">
                <span
                  style={{color: disabled ? '#C8C8C8' : null}}
                >
                  $
                </span>
              </div>
              <div className="col-md-3 form__form-group">
                <span
                  style={{color: disabled ? '#C8C8C8' : null}}
                >
                  {TFormat.asNumber(deliveredPricePerTon)}
                </span>
              </div>
            </Row>
            <Row className="col-md-12">
              <div className="col-md-7 form__form-group">
                <span className="form__form-group-label"
                      style={{color: disabled ? '#C8C8C8' : null}}
                >
                  Delivered Price for job
                </span>
              </div>
              <div className="col-md-1 form__form-group">
                <span
                  style={{color: disabled ? '#C8C8C8' : null}}
                >
                  $
                </span>
              </div>
              <div className="col-md-3 form__form-group">
                <span
                  style={{color: disabled ? '#C8C8C8' : null}}
                >
                  {TFormat.asNumber(deliveredPriceJob)}
                </span>
              </div>
            </Row>
          </div>
          }
          <div className="col-md-6 form__form-group">
            <Row className="col-md-12">
              <div className="col-md-7 form__form-group">
                <span className="form__form-group-label"
                      style={{color: disabled ? '#C8C8C8' : null}}
                >
                  One way cost / ton / mile
                </span>
              </div>
              <div className="col-md-1 form__form-group">
                <span
                  style={{color: disabled ? '#C8C8C8' : null}}
                >
                  $
                </span>
              </div>
              <div className="col-md-3 form__form-group">
                <span
                  style={{color: disabled ? '#C8C8C8' : null}}
                >
                  {TFormat.asNumber(oneWayCostPerTonHourPerMile)}
                </span>
              </div>
            </Row>
            <Row className="col-md-12">
              <div className="col-md-7 form__form-group">
                <span className="form__form-group-label"
                      style={{color: disabled ? '#C8C8C8' : null}}
                >
                  Haul Cost per {payType}
                </span>
              </div>
              <div className="col-md-1 form__form-group">
                <span
                  style={{color: disabled ? '#C8C8C8' : null}}
                >
                  $
                </span>
              </div>
              <div className="col-md-3 form__form-group">
                <span style={{color: disabled ? '#C8C8C8' : null}}
                >
                  {TFormat.asNumber(haulCostPerTonHour)}
                </span>
              </div>
            </Row>
            <Row className="col-md-12">
              <div className="col-md-7 form__form-group">
                <span className="form__form-group-label"
                      style={{color: disabled ? '#C8C8C8' : null}}
                >
                  Estimated Cost for Job
                </span>
              </div>
              <div className="col-md-1 form__form-group">
                <span
                  style={{color: disabled ? '#C8C8C8' : null}}
                >
                  $
                </span>
              </div>
              <div className="col-md-3 form__form-group">
                <span
                  style={{color: disabled ? '#C8C8C8' : null}}
                >
                  {TFormat.asNumber(estimatedCostForJob)}
                </span>
              </div>
            </Row>
          </div>
        </Row>
      </Row>
    </React.Fragment>
);

InfoMessageDelPrice.propTypes = {
  payType: PropTypes.string.isRequired
};

DeliveryCostsSummary.propTypes = {
  estMaterialPricing: PropTypes.number.isRequired,
  deliveredPricePerTon: PropTypes.number.isRequired,
  payType: PropTypes.string.isRequired,
  quantityType: PropTypes.string.isRequired,
  deliveredPriceJob: PropTypes.number.isRequired,
  oneWayCostPerTonHourPerMile: PropTypes.number.isRequired,
  estimatedCostForJob: PropTypes.number.isRequired,
  haulCostPerTonHour: PropTypes.number.isRequired,
  disabled: PropTypes.bool
};

DeliveryCostsSummary.defaultProps = {
  disabled: false
};

export default DeliveryCostsSummary;
