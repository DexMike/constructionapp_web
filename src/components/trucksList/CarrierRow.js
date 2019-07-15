import React, { Component } from 'react';
import {
  Button,
  Row
} from 'reactstrap';
import '../addTruck/AddTruck.css';
import * as PropTypes from 'prop-types';
import truckImage from '../../img/default_truck.png';

class CarrierRow extends Component {
  constructor(props) {
    super(props);
    this.sendFavorite = this.sendFavorite.bind(this);
    this.editEquipment = this.editEquipment.bind(this);
  }

  sendFavorite(companyId) {
    // console.log(39, companyId);
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

  renderMaterials(materials) {
    return (
      <table>
        <thead>
          <tr>
            <th>Materials Hauled</th>
          </tr>
        </thead>
        <tbody>
          {
            materials.map((value, i) => {
              return (
                <tr key={`li_${i}`}>
                  <td>{value}</td>
                </tr>
              );
            })
          }
        </tbody>
      </table>
    );
  }

  renderTotals(equipmentTypes) {
    return (
      <table>
        <thead>
          <tr>
            <th>Type of Trucks</th>
            <th># of Trucks</th>
          </tr>
        </thead>
        <tbody>
          {
            equipmentTypes.map((value, i) => {
              return (
                <tr key={`tru_${i}`}>
                  <td>{value.equipmentType}</td>
                  <td style={{ textAlign: 'center' }}>{value.count}</td>
                </tr>
              );
            })
          }
        </tbody>
      </table>
    );
  }

  render() {
    const {
      carrierName,
      carrierId,
      favorite,
      distance,
      equipmentTypes,
      materials
    } = this.props;

    return (
      <React.Fragment>
        <Row className="truck-card truck-details">
          <div className="col-md-12">
            <div className="row">
              <div className="col-md-3">
                <h5>
                  {carrierName} {distance ? `[Distance: ${distance.toFixed(2)} mi]` : ''}
                </h5>
                <img width="100%" src={truckImage} alt=""
                     styles="background-size:contain;"
                />
              </div>
              <div className="col-md-9">
                <div className="row truck-card">
                  <div className="col-md-7">
                    {this.renderTotals(equipmentTypes)}
                  </div>
                  <div className="col-md-3">
                    {this.renderMaterials(materials)}
                  </div>
                  <div className="col-md-2 button-card">
                    <Button
                      onClick={() => this.editEquipment(5)}
                      className="btn btn-primary"
                      styles="margin:0px !important"
                    >
                      Request
                    </Button>
                    <Button
                      color="link"
                      onClick={() => this.sendFavorite(carrierId)}
                      className={favorite ? 'material-icons favoriteIcon' : 'material-icons-outlined favoriteIcon'}
                    >
                      thumb_up
                    </Button>
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

CarrierRow.propTypes = {
  carrierId: PropTypes.number,
  carrierName: PropTypes.string,
  favorite: PropTypes.bool,
  setFavorite: PropTypes.func,
  requestEquipment: PropTypes.func,
  distance: PropTypes.number,
  equipmentTypes: PropTypes.arrayOf(PropTypes.shape({
    equipmentType: PropTypes.string,
    count: PropTypes.number
  })),
  materials: PropTypes.arrayOf(PropTypes.string)
};

CarrierRow.defaultProps = {
  carrierId: null,
  carrierName: null,
  favorite: false,
  setFavorite: null,
  requestEquipment: null,
  distance: null,
  equipmentTypes: [],
  materials: []
};

export default CarrierRow;
