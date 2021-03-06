import React, { Component } from 'react';
import {
  Button,
  Row
} from 'reactstrap';
import '../addTruck/AddTruck.css';
import NumberFormat from 'react-number-format';
import PropTypes from 'prop-types';
import truckImage from '../../img/default_truck.png';

class EquipmentRow extends Component {
  sendFavorite(companyId) {
    const {
      setFavorite
    } = this.props;
    setFavorite(companyId);
  }

  editEquipment(companyId) {
    const {
      requestEquipment
    } = this.props;
    requestEquipment(companyId);
  }

  render() {
    const {
      id,
      companyId,
      favorite,
      rateType,
      hourRate,
      minHours,
      minCapacity,
      image,
      maxCapacity,
      type,
      tonRate,
      name,
      distance
    } = this.props;

    let imageTruck = '';
    // checking if there's an image for the truck
    if ((image).trim()) { // use of trim removes whitespace from img url
      imageTruck = image;
    } else {
      imageTruck = `${window.location.origin}/${truckImage}`;
    }

    // disabled while we get materials back
    // const allMaterials = materials.split(', ');
    const allMaterials = [];
    return (
      <React.Fragment>
        <Row className="truck-card truck-details" key={id}>
          <div className="col-md-12">
            <div className="row">
              <div className="col-md-3">
                <img width="100%" src={imageTruck} alt=""
                     styles="background-size:contain;"
                />
              </div>
              <div className="col-md-9">
                <div className="row truck-card">
                  <div className="col-md-9">
                    <h3 className="subhead">
                      {name} | {type} | <NumberFormat
                      value={maxCapacity}
                      displayType="text"
                      decimalSeparator="."
                      decimalScale={0}
                      fixedDecimalScale
                      thousandSeparator
                      prefix=" "
                      suffix=" Tons"
                      />
                    </h3>
                  </div>
                  <div className="col-md-3 button-card">
                    <Button
                      onClick={() => this.editEquipment(id)}
                      className="btn btn-primary"
                      styles="margin:0px !important"
                    >
                      Request
                    </Button>
                    <Button
                      color="link"
                      onClick={() => this.sendFavorite(companyId)}
                      className="material-icons favoriteIcon"
                    >
                      {favorite ? 'favorite' : 'favorite_border'}
                    </Button>
                  </div>
                </div>
                <div className="row truck-card">
                  <div className="col-md-6">
                    <h3 className="subhead">Rates</h3>
                    <Row>
                      {(rateType === 'Both' || rateType === 'Hour') && (
                        <React.Fragment>
                          <div className="col-md-6">
                            Hourly Rate:
                          </div>
                          <div className="col-md-6">
                            <NumberFormat
                              value={hourRate}
                              displayType="text"
                              decimalSeparator="."
                              decimalScale={2}
                              fixedDecimalScale
                              thousandSeparator
                              prefix="$ "
                              suffix=" / Hour"
                            />
                          </div>
                        </React.Fragment>
                      )}
                    </Row>
                    <Row>
                      <div className="col-md-6">
                        Hourly Minimum:
                      </div>
                      <div className="col-md-6">
                        <NumberFormat
                          value={minHours}
                          displayType="text"
                          decimalSeparator="."
                          decimalScale={2}
                          fixedDecimalScale
                          thousandSeparator
                          suffix=" Hours Min"
                        />
                      </div>
                    </Row>
                    {(rateType === 'Both' || rateType === 'Ton') && (
                      <React.Fragment>
                        <div className="row">
                          <div className="col-md-6">
                            Rate per Ton:
                          </div>
                          <div className="col-md-6">
                            <NumberFormat
                              value={tonRate}
                              displayType="text"
                              decimalSeparator="."
                              decimalScale={2}
                              fixedDecimalScale
                              thousandSeparator
                              prefix="$ "
                              suffix=" / Ton"
                            />
                          </div>
                        </div>
                        <div className="row">
                          <div className="col-md-6">
                            Minimum Tonnage Capacity:
                          </div>
                          <div className="col-md-6">
                            <NumberFormat
                              value={minCapacity}
                              displayType="text"
                              decimalSeparator="."
                              decimalScale={2}
                              fixedDecimalScale
                              thousandSeparator
                              suffix=" tons min"
                            />
                          </div>
                        </div>
                      </React.Fragment>
                    )}
                    <Row className="distance">
                      <div className="col-md-6">
                        Distance (mi):
                      </div>
                      <div className="col-md-6">
                        {distance ? distance.toFixed(2) : ''}
                      </div>
                    </Row>
                  </div>
                  <div className="col-md-6">
                    <h3 className="subhead">
                      Materials
                    </h3>
                    {allMaterials.map(material => (
                      <span
                        key={material}
                        className="badge badge-success"
                        style={{borderRadius: '15px', padding: '6px 20px', margin: '2px'}}
                      >
                        {material}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Row>
        <hr/>
      </React.Fragment>

    );
  }
}

EquipmentRow.propTypes = {
  // equipment: PropTypes.func.isRequired
  id: PropTypes.number,
  companyId: PropTypes.number,
  favorite: PropTypes.bool,
  rateType: PropTypes.string,
  hourRate: PropTypes.number,
  minHours: PropTypes.number,
  minCapacity: PropTypes.number,
  image: PropTypes.string,
  maxCapacity: PropTypes.number,
  type: PropTypes.string,
  tonRate: PropTypes.number,
  name: PropTypes.string,
  setFavorite: PropTypes.func,
  requestEquipment: PropTypes.func,
  distance: PropTypes.number
};

EquipmentRow.defaultProps = {
  id: PropTypes.number,
  companyId: PropTypes.number,
  favorite: PropTypes.bool,
  rateType: PropTypes.string,
  hourRate: PropTypes.number,
  minHours: PropTypes.number,
  minCapacity: PropTypes.number,
  image: PropTypes.string,
  maxCapacity: PropTypes.number,
  type: PropTypes.string,
  tonRate: PropTypes.number,
  name: PropTypes.string,
  setFavorite: PropTypes.func,
  requestEquipment: PropTypes.func,
  distance: PropTypes.number
};

export default EquipmentRow;
