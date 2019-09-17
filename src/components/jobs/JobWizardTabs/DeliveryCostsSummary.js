import React from 'react';
import * as PropTypes from 'prop-types';
import {Row} from 'reactstrap';

const DeliveryCostsSummary = ({
  estMaterialPricing,
  deliveredPricePerTon,
  deliveredPriceJob,
  payType,
  oneWayCostPerTonHourPerMile,
  haulCostPerTonHour,
  estimatedCostForJob}) => (
    <React.Fragment>
      <Row className="col-md-12" style={{paddingBottom: 20}}>
        <Row className="col-md-12">
          {estMaterialPricing > 0 &&
          <div className="col-md-6 form__form-group">
            <Row className="col-md-12 ">
              <span className="form__form-group-label">Delivered Price</span>
            </Row>
            <Row className="col-md-12" style={{marginTop: -20}}>
              <hr/>
            </Row>
          </div>
          }
          <div className="col-md-6 form__form-group">
            <Row className="col-md-12 ">
              <span className="form__form-group-label">Haul Costs</span>
            </Row>
            <Row className="col-md-12" style={{marginTop: -20}}>
              <hr/>
            </Row>
          </div>
        </Row>
        <Row className="col-md-12">
          {estMaterialPricing > 0 &&
          <div className="col-md-6 form__form-group">
            <Row className="col-md-12">
              <div className="col-md-7 form__form-group">
                <span className="form__form-group-label">Material Price per ton</span>
              </div>
              <div className="col-md-1 form__form-group">
                      <span style={{}}
                      >
                        $
                      </span>
              </div>
              <div className="col-md-3 form__form-group">
                      <span style={{}}
                      >
                        {estMaterialPricing}
                      </span>
              </div>
            </Row>
            <Row className="col-md-12">
              <div className="col-md-7 form__form-group">
                <span className="form__form-group-label">Delivered Price per ton</span>
              </div>
              <div className="col-md-1 form__form-group">
                      <span style={{}}
                      >
                        $
                      </span>
              </div>
              <div className="col-md-3 form__form-group">
                      <span style={{}}
                      >
                        {deliveredPricePerTon}
                      </span>
              </div>
            </Row>
            <Row className="col-md-12">
              <div className="col-md-7 form__form-group">
                <span className="form__form-group-label">Delivered Price for job</span>
              </div>
              <div className="col-md-1 form__form-group">
                      <span style={{}}
                      >
                        $
                      </span>
              </div>
              <div className="col-md-3 form__form-group">
                      <span style={{}}
                      >
                        {deliveredPriceJob}
                      </span>
              </div>
            </Row>
          </div>
          }
          <div className="col-md-6 form__form-group">
            <Row className="col-md-12">
              <div className="col-md-7 form__form-group">
                <span className="form__form-group-label">One way cost / ton / mile</span>
              </div>
              <div className="col-md-1 form__form-group">
                      <span style={{}}
                      >
                        $
                      </span>
              </div>
              <div className="col-md-3 form__form-group">
                      <span style={{}}
                      >
                        {oneWayCostPerTonHourPerMile}
                      </span>
              </div>
            </Row>
            <Row className="col-md-12">
              <div className="col-md-7 form__form-group">
                <span className="form__form-group-label">Haul Cost per {payType}</span>
              </div>
              <div className="col-md-1 form__form-group">
                      <span style={{}}
                      >
                        $
                      </span>
              </div>
              <div className="col-md-3 form__form-group">
                      <span style={{}}
                      >
                        {haulCostPerTonHour}
                      </span>
              </div>
            </Row>
            <Row className="col-md-12">
              <div className="col-md-7 form__form-group">
                <span className="form__form-group-label">Estimated Cost for Job</span>
              </div>
              <div className="col-md-1 form__form-group">
                      <span style={{}}
                      >
                        $
                      </span>
              </div>
              <div className="col-md-3 form__form-group">
                      <span style={{}}
                      >
                        {estimatedCostForJob}
                      </span>
              </div>
            </Row>
          </div>
        </Row>
      </Row>
  </React.Fragment>
)

DeliveryCostsSummary.propTypes = {
  estMaterialPricing: PropTypes.number.isRequired,
  deliveredPricePerTon: PropTypes.number.isRequired,
  payType: PropTypes.number.isRequired,
  deliveredPriceJob: PropTypes.number.isRequired,
  oneWayCostPerTonHourPerMile: PropTypes.number.isRequired,
  estimatedCostForJob: PropTypes.number.isRequired,
  haulCostPerTonHour: PropTypes.number.isRequired,
};

export default DeliveryCostsSummary;
