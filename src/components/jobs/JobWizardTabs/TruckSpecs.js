import React, {PureComponent} from 'react';
import {
  Card,
  CardBody,
  // Container,
  Col,
  Row
} from 'reactstrap';
import PropTypes from 'prop-types';
import '../jobs.css';
import TField from '../../common/TField';
import TSpinner from '../../common/TSpinner';
import TFieldNumber from "../../common/TFieldNumber";


// import USstates from '../../utils/usStates';

class TruckSpecs extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      loaded: false
    };
    this.handleTruckTypeChange = this.handleTruckTypeChange.bind(this);
    this.handleTruckQuantityChange = this.handleTruckQuantityChange.bind(this);
  }

  async componentDidMount() {
    this.setState({loaded: true});
  }

  componentWillReceiveProps(nextProps) {
    const {data} = {...nextProps};
    this.setState({data: {...data}});
  }

  handleTruckQuantityChange(quantity) {
    const {data} = {...this.props};
    const {handleInputChange} = {...this.props};
    let {value} = quantity.target;
    value = value.replace(/\D/g, '');
    data.truckQuantity = value;
    handleInputChange('tabTruckSpecs', data);
  }

  handleTruckTypeChange(e) {
    const id = e.target.value;
    const {data, handleInputChange} = {...this.props};
    const {selectedTruckTypes} = data;
    const index = selectedTruckTypes.indexOf(id);
    if (index > -1) {
      selectedTruckTypes.splice(index, 1);
    } else {
      selectedTruckTypes.push(id);
    }
    data.reqHandlerTruckType.touched = false;
    handleInputChange('tabTruckSpecs', data);
  }


  render() {
    const {loaded} = {...this.state};
    const {data} = {...this.props};
    const {allTruckTypes, selectedTruckTypes} = data;
    const secondColumnStart = Math.floor(allTruckTypes.length / 2);
    if (loaded && data) {
      return (
        <Col md={12} lg={12}>
          <Card>
            <CardBody>
              <form
                className="form form--horizontal addtruck__form"
                // onSubmit={e => this.saveTruck(e)}
                autoComplete="off"
              >
                <Row className="col-md-12">
                  <div className="col-md-6 form__form-group">
    <span className="form__form-group-label">How many <span style={{
      fontWeight: 'bold',
      color: 'black'
    }}
    >trucks</span> do you need?</span>
                  </div>
                  <div className="col-md-3 form__form-group">
                    <TField
                      input={
                        {
                          onChange: this.handleTruckQuantityChange,
                          name: 'truckQuantity',
                          value: data.truckQuantity
                        }
                      }
                      placeholder="Any"
                      type="text"
                      id="truckQuantity"
                    />
                  </div>
                </Row>
                <Row className="col-md-12">
                  <hr/>
                </Row>
                <Row className="col-md-12">
                  <div className="col-md-12 form__form-group">
                    <span className="form__form-group-label">Select a truck types (s)</span>
                  </div>
                </Row>
                <Row className="col-md-12">
                  {
                    allTruckTypes.map((truckType, i) => (
                      <Col md={6} key={truckType}>
                        <div className="item-row">
                          <label className="checkbox-container" htmlFor={`enableMaterial${i}`}>
                            <input
                              id={`enableMaterial${i}`}
                              className={`materials-checkbox material-${truckType.label}`}
                              type="checkbox"
                              value={truckType.value}
                              checked={selectedTruckTypes.includes(truckType.value)}
                              onChange={this.handleTruckTypeChange}
                            />
                            <span className="checkmark" />
                            &nbsp;{truckType.label}
                          </label>
                        </div>
                      </Col>
                    ))
                  }
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

TruckSpecs.propTypes = {
  data: PropTypes.shape({
    truckQuantity: PropTypes.number,
    selectedTruckTypes: PropTypes.array,
    allTruckTypes: PropTypes.array,
    reqHandlerTruckType: PropTypes.shape({
      touched: PropTypes.bool,
      error: PropTypes.string
    })
  })
};

TruckSpecs.defaultProps = {
  data: null
};

export default TruckSpecs;
