import React, {PureComponent} from 'react';
import {withTranslation} from 'react-i18next';
import {
  Card,
  CardBody,
  // Container,
  Col,
  Button,
  Row
} from 'reactstrap';
import PropTypes from 'prop-types';
import SelectField from '../../common/TSelect';
import '../jobs.css';
import TField from '../../common/TField';
import TSpinner from '../../common/TSpinner';
import TFormat from '../../common/TFormat';

// import USstates from '../../utils/usStates';

class JobMaterials extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      loaded: false
    };
    this.handleMaterialTypeChange = this.handleMaterialTypeChange.bind(this);
    this.handleSubMaterialTypeChange = this.handleSubMaterialTypeChange.bind(this);
    this.handleQuantityTypeChange = this.handleQuantityTypeChange.bind(this);
    this.handleQuantityChange = this.handleQuantityChange.bind(this);
    this.handleOffClick = this.handleOffClick.bind(this);
    this.handleEstimatedMaterialPricingChange = this.handleEstimatedMaterialPricingChange.bind(this);
  }

  async componentDidMount() {
    this.setState({loaded: true});
  }

  componentWillReceiveProps(nextProps) {
    const {data} = {...nextProps};
    this.setState({data: {...data}});
  }

  handleMaterialTypeChange(materialType) {
    const {data} = {...this.props};
    const {handleInputChange} = {...this.props};
    data.selectedMaterial = materialType;
    data.reqHandlerMaterials.touched = false;
    handleInputChange('tabMaterials', data);
  }

  handleSubMaterialTypeChange(materialType) {
    const {data} = {...this.props};
    const {handleInputChange} = {...this.props};
    data.selectedSubMaterial = materialType;
    handleInputChange('tabMaterials', data);
  }

  handleQuantityTypeChange(quantityType) {
    const {data} = {...this.props};
    const {handleInputChange} = {...this.props};
    data.quantityType = quantityType;
    data.reqHandlerQuantity.touched = false;
    handleInputChange('tabMaterials', data);
  }

  handleQuantityChange(quantity) {
    const {data, handleInputChange} = {...this.props};
    let {value} = quantity.target;
    // value = value.replace(/\D/g, '');
    value = TFormat.asIntegerNoLeadingZeros(value);
    data.quantity = value;
    handleInputChange('tabMaterials', data);
  }

  handleOffClick(e) {
    const {data, handleInputChange} = {...this.props};
    if (e === 'estimatedMaterialPricing') {
      data.estMaterialPricing = TFormat.asFloatTwoDecimals(data.estMaterialPricing);
      handleInputChange('tabMaterials', data);
    }
  }


  handleEstimatedMaterialPricingChange(estimatedMaterialPricing) {
    const {data} = {...this.props};
    const {handleInputChange} = {...this.props};
    let {value} = estimatedMaterialPricing.target;
    value = TFormat.asFloatOneLeadingZero(value);
    data.estMaterialPricing = value;
    handleInputChange('tabMaterials', data);
  }


  render() {
    const { t } = { ...this.props };
    const translate = t;
    const {loaded} = {...this.state};
    const {data} = {...this.props};
    if (loaded && data) {
      return (
        <Col md={12} lg={12}>
          <Card>
            <CardBody>
              {/* this.handleSubmit  */}
              <div className="dashboard dashboard__job-create-section-title">
                <span>{translate('Select a Material Type')}</span>
              </div>
              <form
                className="form form--horizontal addtruck__form"
                // onSubmit={e => this.saveTruck(e)}
                autoComplete="off"
              >
                <Row className="col-md-12">
                  <div className="col-md-6 form__form-group">
                    <span className="form__form-group-label">{translate('Material Type')}&nbsp;
                      <span style={{fontSize: 12, color: 'rgb(101, 104, 119)'}}>( {translate('required')} )</span>
                    </span>
                    <SelectField
                      input={
                        {
                          onChange: this.handleMaterialTypeChange,
                          name: 'materialType',
                          value: data.selectedMaterial
                        }
                      }
                      meta={data.reqHandlerMaterials}
                      value={data.selectedMaterial}
                      options={data.allMaterials}
                      placeholder={translate('Select Material')}
                    />
                  </div>
                  {/*<div className="col-md-6 form__form-group">*/}
                  {/*  <span className="form__form-group-label">Sub Material</span>*/}
                  {/*  <SelectField*/}
                  {/*    input={*/}
                  {/*      {*/}
                  {/*        onChange: this.handleSubMaterialTypeChange,*/}
                  {/*        name: 'subMaterialType',*/}
                  {/*        value: data.selectedSubMaterial*/}
                  {/*      }*/}
                  {/*    }*/}
                  {/*    value={data.selectedSubMaterial}*/}
                  {/*    options={data.allMaterials}*/}
                  {/*    placeholder="Select Material"*/}
                  {/*  />*/}
                  {/*</div>*/}
                </Row>
                <Row className="col-md-12">
                  <hr/>
                </Row>
                <Row className="col-md-12">
                  <div className="col-md-6 form__form-group">
                    <span className="form__form-group-label">{translate('What is the quantity for this job?')}</span>
                  </div>
                  <div className="col-md-6 form__form-group">
                    <Button
                      color="primary"
                      className={data.quantityType === 'Hour' ? 'toggle__button' : 'toggle__button-active'}
                      onClick={() => this.handleQuantityTypeChange('Ton')}

                    >
                      <p>{translate('tons')}</p>
                    </Button>
                    <Button
                      color="primary"
                      className={data.quantityType === 'Ton' ? 'toggle__button' : 'toggle__button-active'}
                      onClick={() => this.handleQuantityTypeChange('Hour')}

                    >
                      <p>{translate('hours')}</p>
                    </Button>
                  </div>
                </Row>
                <Row className="col-md-12" style={{paddingTop: 15}}>
                  <div className="col-md-6 form__form-group">
                    <span className="form__form-group-label" style={{paddingTop: 20}}>{translate('HOW_MANY_1')}&nbsp;
                      <span style={{
                        fontWeight: 'bold',
                        color: 'black'
                      }}
                      >
                        {data.quantityType === 'Ton' ? `${translate('tons')}` : `${translate('hours')}`}
                      </span>
                      &nbsp;{data.quantityType === 'Ton' ? `${translate('do you need delivered')}` : `${translate('will be worked')}`}?
                    </span>
                  </div>
                  <div className="col-md-3 form__form-group">
                    <span
                      className="form__form-group-label"
                    >{data.quantityType === 'Ton' ? `${translate('Estimated Tons')}` : `${translate('Estimated Hours')}`}
                      <span
                        style={{fontSize: 12, color: 'rgb(101, 104, 119)'}}
                      > ( {translate('required')} )
                      </span>
                    </span>
                    <TField
                      input={
                        {
                          onChange: this.handleQuantityChange,
                          name: 'quantity',
                          value: data.quantity
                        }
                      }
                      placeholder=""
                      type="text"
                      meta={data.reqHandlerQuantity}
                      id="quantity"
                    />
                  </div>
                </Row>
                <Row className="col-md-12">
                  <hr/>
                </Row>
                <div className="dashboard dashboard__job-create-section-title">
                  <span>{translate('Estimated Material Pricing')}</span> ( {translate('for calculation of delivered price')} )
                </div>
                <Row className="col-md-12">
                  <div className="col-md-3 form__form-group">
                    <span
                      className="form__form-group-label"
                    >{translate('Price ($ / ton)')}
                    </span>

                    <TField
                      input={
                        {
                          onChange: this.handleEstimatedMaterialPricingChange,
                          name: 'estimatedMaterialPricing',
                          value: data.estMaterialPricing
                        }
                      }
                      offClick={this.handleOffClick}
                      placeholder=""
                      type="text"
                      // meta={data.reqHandlerEstimatedTons}
                      id="estimatedMaterialPricing"
                    />
                  </div>
                  {/*<div className="col-md-3 form__form-group">*/}
                  {/*  <span*/}
                  {/*    className="form__form-group-label">Total*/}
                  {/*  </span>*/}
                  {/*  <text>$</text>*/}
                  {/*</div>*/}
                </Row>

              </form>
            </CardBody>
          </Card>
        </Col>
      );
    }
    return (
      <Col md={12}>
        <Card style={{paddingBottom: 0}}>
          <CardBody>
            <Row className="col-md-12"><TSpinner loading/></Row>
          </CardBody>
        </Card>
      </Col>
    );
  }
}

JobMaterials.propTypes = {
  data: PropTypes.shape({
    materialType: PropTypes.string,
    quantityType: PropTypes.string,
    quantity: PropTypes.number,
    allMaterials: PropTypes.array,
    selectedMaterial: PropTypes.shape({
      value: PropTypes.string,
      label: PropTypes.string
    }),
    selectedSubMaterial: PropTypes.shape({
      value: PropTypes.string,
      label: PropTypes.string
    }),
    estMaterialPricing: PropTypes.string,
    reqHandlerMaterials: PropTypes.shape({
      touched: PropTypes.bool,
      error: PropTypes.string
    }),
    reqHandlerQuantity: PropTypes.shape({
      touched: PropTypes.bool,
      error: PropTypes.string
    })
  })
};

JobMaterials.defaultProps = {
  data: null
};

export default withTranslation()(JobMaterials);
