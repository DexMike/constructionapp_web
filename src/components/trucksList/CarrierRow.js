import React, { Component } from 'react';
import {
  Button,
  Row,
  Container,
  ObjectRow
} from 'reactstrap';
import '../addTruck/AddTruck.css';
// import NumberFormat from 'react-number-format';
import PropTypes from 'prop-types';
import truckImage from '../../img/default_truck.png';
import CompanyService from '../../api/CompanyService';

class CarrierRow extends Component {
  constructor(props) {
    super(props);

    // Comment
    this.state = {
      loaded: false,
      totals: [],
      materials: []
    };
  }

  async componentDidMount() {
    const { carrierId } = this.props;
    const totals = await CompanyService.getCarriersTrucks(carrierId);
    const materials = await CompanyService.getCarriersMaterials(carrierId);
    this.setState({
      loaded: true,
      totals,
      materials
    });
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

  renderTotals(trucks) {
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
            trucks.map((value, i) => {
              return (
                <tr key={`tru_${i}`}>
                  <td>{value.name}</td>
                  <td style={{textAlign: 'center'}}>{value.count}</td>
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
      loaded,
      totals,
      materials
    } = this.state;

    const { carrierName } = this.props;

    if (loaded) {
      return (
        <React.Fragment>
          <Row className="truck-card truck-details">
            <div className="col-md-12">
              <div className="row">
                <div className="col-md-3">
                  <h5>
                    {carrierName}
                  </h5>
                  <img width="100%" src={truckImage} alt=""
                      styles="background-size:contain;"
                  />
                </div>
                <div className="col-md-9">
                  <div className="row truck-card">
                    <div className="col-md-7">
                      {this.renderTotals(totals)}
                    </div>
                    <div className="col-md-3">
                      {this.renderMaterials(materials)}
                    </div>
                    <div className="col-md-2 button-card">
                      <Button
                        onClick={() => this.handleEquipmentEdit(5)}
                        className="btn btn-primary"
                        styles="margin:0px !important"
                      >
                        Request
                      </Button>
                      <Button
                        color="link"
                        onClick={() => this.handleSetFavorite(6)}
                        className="material-icons favoriteIcon"
                      >
                        .
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
    return (
      <Container className="dashboard">
        Loading...
      </Container>
    );
  }
}

CarrierRow.propTypes = {
  carrierId: PropTypes.number,
  carrierName: PropTypes.string
};

CarrierRow.defaultProps = {
  carrierId: null,
  carrierName: null
};

export default CarrierRow;
