import React, { Component } from 'react';
import * as PropTypes from 'prop-types';
import { Redirect } from 'react-router-dom';
import EquipmentForm from './EquipmentForm';
import EquipmentService from '../../api/EquipmentService';

class EquipmentSavePage extends Component {
  constructor(props) {
    super(props);

    this.state = {
      goToDashboard: false,
      goToEquipment: false,
      equipment: {}
    };

    this.handlePageClick = this.handlePageClick.bind(this);
    this.handleDelete = this.handleDelete.bind(this);
  }

  async componentDidMount() {
    const { match } = this.props;
    if (match.params.id) {
      const equipment = await EquipmentService.getEquipmentById(match.params.id);
      this.setState({ equipment });
    }
  }

  handlePageClick(menuItem) {
    if (menuItem) {
      this.setState({ [`goTo${menuItem}`]: true });
    }
  }

  async handleDelete() {
    const { match } = this.props;
    const { id } = match.params;
    await EquipmentService.deleteEquipmentById(id);
    this.handlePageClick('Equipment');
  }

  renderGoTo() {
    const { goToDashboard, goToEquipment } = this.state;
    if (goToDashboard) {
      return <Redirect push to="/" />;
    }
    if (goToEquipment) {
      return <Redirect push to="/trucks" />;
    }
    return false;
  }

  render() {
    const { equipment } = this.state;
    return (
      <div className="container">
        {this.renderGoTo()}
        <button type="button" className="app-link"
          onClick={() => this.handlePageClick('Dashboard')}
        >
          Dashboard
        </button>
        &#62;
        <button type="button" className="app-link" onClick={() => this.handlePageClick('Equipment')}>
          Trucks
        </button>
        &#62;Save
        <div className="row">
          <div className="col-md-12"><h3 className="page-title">Save Truck</h3></div>
        </div>
        <EquipmentForm equipment={equipment} handlePageClick={this.handlePageClick} />
      </div>
    );
  }
}

EquipmentSavePage.propTypes = {
  match: PropTypes.shape({
    params: PropTypes.shape({
      id: PropTypes.string
    })
  })
};

EquipmentSavePage.defaultProps = {
  match: {
    params: {}
  }
};

export default EquipmentSavePage;
