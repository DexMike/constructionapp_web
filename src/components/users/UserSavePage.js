import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Redirect } from 'react-router-dom';
import UserService from '../../api/UserService';
import UserForm from './UserForm';

class UserSavePage extends Component {
  constructor(props) {
    super(props);

    this.state = {
      goToDashboard: false,
      goToUser: false,
      user: {}
    };

    this.handlePageClick = this.handlePageClick.bind(this);
    this.handleDelete = this.handleDelete.bind(this);
  }

  async componentDidMount() {
    const { match } = this.props;

    if (match.params.id) {
      const user = await UserService.getUserById(match.params.id);
      this.setState({ user });
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
    await UserService.deleteUserById(id);
    this.handlePageClick('User');
  }

  renderGoTo() {
    const { goToDashboard, goToUser } = this.state;
    if (goToDashboard) {
      return <Redirect push to="/"/>;
    }
    if (goToUser) {
      return <Redirect push to="/users"/>;
    }
    return true;
  }

  render() {
    const { user } = this.state;
    return (
      <div className="container">
        {this.renderGoTo()}
        <button type="button"
                className="app-link"
                onClick={() => this.handlePageClick('Dashboard')}
        >
          Dashboard
        </button>
        &nbsp;&#62;
        <button type="button" className="app-link" onClick={() => this.handlePageClick('User')}>
          Users
        </button>
        &nbsp;&#62; Save
        <div className="row">
          <div className="col-md-12">
            <h3 className="page-title">Save User</h3>
          </div>
        </div>
        <UserForm
          user={user}
          handlePageClick={this.handlePageClick}
        />
      </div>
    );
  }
}

UserSavePage.propTypes = {
  match: PropTypes.shape({
    params: PropTypes.shape({
      id: PropTypes.string
    })
  })
};

UserSavePage.defaultProps = {
  match: {
    params: {}
  }
};

export default UserSavePage;
