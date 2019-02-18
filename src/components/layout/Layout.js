import React, { Component } from 'react';
import classNames from 'classnames';
import Sidebar from './sidebar/Sidebar';
import Topbar from './topbar/Topbar';
import ProfileService from '../../api/ProfileService';

class Layout extends Component {
  constructor(props) {
    super(props);

    this.state = {
      sidebarShow: false,
      sidebarCollapse: false
    };

    this.changeSidebarVisibility = this.changeSidebarVisibility.bind(this);
    this.changeMobileSidebarVisibility = this.changeMobileSidebarVisibility.bind(this);
  }

  async componentDidMount() {
    const profile = await ProfileService.getProfile();
    this.setState({ profile });
  }

  changeSidebarVisibility() {
    const { sidebarCollapse } = this.state;
    this.setState({ sidebarCollapse: !sidebarCollapse });
  }

  changeMobileSidebarVisibility() {
    const { sidebarShow } = this.state;
    this.setState({ sidebarShow: !sidebarShow });
  }

  render() {
    const { sidebarShow, sidebarCollapse } = this.state;
    const layoutClass = classNames({
      layout: true,
      'layout--collapse': sidebarCollapse
    });

    return (
      <div className={layoutClass}>
        <Topbar
          changeMobileSidebarVisibility={this.changeMobileSidebarVisibility}
          changeSidebarVisibility={this.changeSidebarVisibility}
        />
        <Sidebar
          sidebarShow={sidebarShow}
          sidebarCollapse={sidebarCollapse}
          changeMobileSidebarVisibility={this.changeMobileSidebarVisibility}
        />
      </div>
    );
  }
}

export default Layout;
