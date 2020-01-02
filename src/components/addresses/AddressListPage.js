import React, { Component } from 'react';
import { Redirect } from 'react-router-dom';
import PropTypes from 'prop-types';
import {
  Button,
  Card,
  CardBody,
  Col,
  Container,
  Row,
  Modal
} from 'reactstrap';
import { withTranslation } from 'react-i18next';
import TFieldNumber from '../common/TFieldNumber';
import AddressForm from './AddressForm';
import AddressService from '../../api/AddressService';
import ProfileService from '../../api/ProfileService';
import TTable from '../common/TTable';

class AddressListPage extends Component {
  constructor(props) {
    super(props);

    this.state = {
      addresses: [],
      addressId: 0,
      loaded: false,
      modal: false,
      profile: {},
      filters: {
        companyId: '',
        searchValue: '',
        zipCode: '',
        types: "'Delivery', 'PickUp'",
        page: 0,
        rows: 15,
        orderBy: '',
        order: ''
      },
      totalCount: 15
    };

    this.handleAddressEdit = this.handleAddressEdit.bind(this);
    this.handlePageChange = this.handlePageChange.bind(this);
    this.handleRowsPerPage = this.handleRowsPerPage.bind(this);
    this.handleFilterChange = this.handleFilterChange.bind(this);
    this.handleInputChange = this.handleInputChange.bind(this);
    this.handleResetFilters = this.handleResetFilters.bind(this);
    this.sortFilters = this.sortFilters.bind(this);
    this.toggle = this.toggle.bind(this);
  }

  async componentDidMount() {
    const { filters } = this.state;
    this.mounted = true;
    const profile = await ProfileService.getProfile();
    filters.companyId = profile.companyId;
    await this.handleFilterChange(filters);
    this.setState({
      profile,
      loaded: true
    });
  }

  componentWillUnmount() {
    this.mounted = false;
  }

  async handleFilterChange(filters) {
    let response = [];
    let totalCount = 0;
    let addresses = [];
    try {
      response = await AddressService.getAddressesByFilters(filters);
      totalCount = response.metadata.totalCount || 0;
      addresses = response.data;
    } catch (e) {
      // console.log(e);
    }
    // if (addresses && addresses.length > 0) {
    //   addresses = addresses.map((address) => {
    //     return address;
    //   });
    // }
    this.setState({
      addresses,
      totalCount,
      filters
    });
  }

  async toggle() {
    const { modal, filters } = this.state;
    if (modal) {
      await this.handleFilterChange(filters);
      this.setState(({
        modal: !modal,
        addressId: 0
      }));
    } else {
      this.setState(({
        modal: !modal
      }));
    }
  }

  sortFilters(orderBy, order) {
    const { filters } = this.state;
    const newFilters = filters;
    newFilters.orderBy = orderBy;
    newFilters.order = order;
    this.setState({
      filters: newFilters
    },
    function wait() {
      this.handleFilterChange(newFilters);
    });
  }

  async handleResetFilters() {
    const { filters } = this.state;
    const newFilters = filters;
    newFilters.searchValue = '';
    newFilters.zipCode = '';
    newFilters.orderBy = '';
    newFilters.order = '';
    await this.handleFilterChange(newFilters);
  }

  async handleInputChange(e) {
    const { filters } = this.state;
    const newFilters = filters;
    newFilters[e.target.name] = e.target.value;
    await this.handleFilterChange(newFilters);
  }

  handlePageClick(menuItem) {
    if (menuItem) {
      this.setState({ [`goTo${menuItem}`]: true });
    }
  }

  handleAddressEdit(id) {
    this.setState({
      modal: true,
      addressId: id
    });
  }

  handlePageChange(page) {
    const { filters } = this.state;
    const newFilters = filters;
    newFilters.page = page;
    this.setState({
      filters: newFilters
    },
    function wait() {
      this.handleFilterChange(newFilters);
    });
  }

  handleRowsPerPage(rows) {
    const { filters } = this.state;
    const newFilters = filters;
    newFilters.rows = rows;
    this.setState({
      filters: newFilters
    },
    function wait() {
      this.handleFilterChange(newFilters);
    });
  }

  renderModal() {
    const { modal, addressId, profile } = this.state;
    return (
      <React.Fragment>
        <Modal isOpen={modal} toggle={this.toggle} backdrop="static">
          <AddressForm
            toggle={this.toggle}
            addressId={addressId}
            profile={profile}
          />
        </Modal>
      </React.Fragment>
    );
  }

  renderAddressFilters() {
    const { filters } = this.state;
    const {t} = {...this.props};
    return (
      <Col md={12}>
        <Card>
          <CardBody>
            <div
              style={{
                backgroundColor: '#F9F9F7',
                paddingLeft: 16,
                paddingRight: 16,
                paddingTop: 16
              }}
            >
              <Row className="form">
                <Col md={8}>
                  <span className="form__form-group-label">
                    {t('Search By Value (Name, Address, City, State, Delivery/PickUp)')}
                  </span>
                  <input
                    name="searchValue"
                    value={filters.searchValue}
                    type="text"
                    onChange={this.handleInputChange}
                    placeholder={t('Enter a value to search')}
                    style={{ backgroundColor: 'white'}}
                  />
                </Col>
                <Col md={4}>
                  <span className="form__form-group-label">{t('Zip Code')}</span>
                  <TFieldNumber
                    input={{
                      onChange: this.handleInputChange,
                      name: 'zipCode',
                      value: filters.zipCode
                    }}
                    placeholder={t('Enter a zip code')}
                  />
                </Col>
                <Col md={12} className="text-right">
                  <br/>
                  <Button
                    className="btn btn-secondary"
                    type="button"
                    onClick={this.handleResetFilters}
                  >
                    {t('Reset')}
                  </Button>
                </Col>
              </Row>
            </div>
          </CardBody>
        </Card>
      </Col>
    );
  }

  render() {
    const { addresses, loaded, totalCount, profile } = this.state;
    const {t} = {...this.props};
    if (loaded && (profile.isAdmin === false || profile.companyType !== 'Customer')) {
      return <Redirect push to="/" />;
    }
    if (loaded) {
      return (
        <Container>
          {this.renderModal()}
          <Row>
            <Col md={6}>
              <h3 className="page-title">{t('Pickup/Delivery Addresses')}</h3>
            </Col>
            <Col md={6} className="text-right">
              <Button
                type="button"
                className="primaryButton"
                onClick={this.toggle}
              >
                {t('ADD ADDRESS')}
              </Button>
            </Col>
          </Row>
          <Row>
            {this.renderAddressFilters()}
            <Col md={12}>
              <Card>
                <CardBody>
                  <p className="pl-4">
                    {t('Displaying')}&nbsp;
                    {addresses.length}
                    &nbsp;
                    {t('out of')}
                    &nbsp;
                    {totalCount}
                    &nbsp;
                    {t('addresses')}
                  </p>
                  <TTable
                    columns={[
                      {
                        name: 'name',
                        displayName: t('Name')
                      },
                      /* {
                        name: 'type',
                        displayName: 'Type'
                      }, */
                      {
                        name: 'address1',
                        displayName: t('Address')
                      }, {
                        name: 'city',
                        displayName: t('City')
                      }, {
                        name: 'state',
                        displayName: t('State')
                      }, {
                        name: 'zipCode',
                        displayName: t('Zip Code')
                      }
                    ]}
                    data={addresses}
                    handleIdClick={this.handleAddressEdit}
                    handleSortChange={this.sortFilters}
                    handleRowsChange={this.handleRowsPerPage}
                    handlePageChange={this.handlePageChange}
                    totalCount={totalCount}
                    defaultRows={15}
                  />
                </CardBody>
              </Card>
            </Col>
          </Row>
        </Container>
      );
    }
    return (
      <Container className="dashboard">
        <div className="load loaded inside-page">
          <div className="load__icon-wrap">
            <svg className="load__icon">
              <path fill="rgb(0, 111, 83)" d="M12,4V2A10,10 0 0,0 2,12H4A8,8 0 0,1 12,4Z"/>
            </svg>
          </div>
        </div>
      </Container>
    );
  }
}

AddressListPage.propTypes = {
  companyId: PropTypes.number
};

AddressListPage.defaultProps = {
  companyId: null
};
export default withTranslation()(AddressListPage);
