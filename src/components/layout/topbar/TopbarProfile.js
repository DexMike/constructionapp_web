import React, { PureComponent } from 'react';
import DownIcon from 'mdi-react/ChevronDownIcon';
import { Collapse } from 'reactstrap';
import { Auth } from 'aws-amplify';
import TopbarMenuLink from './TopbarMenuLink';
import Ava from '../../../img/ava.png';

// const Ava = `${process.env.PUBLIC_URL}/img/ava.png`;

class TopbarProfile extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      collapse: false,
      email: ''
    };
    this.toggle = this.toggle.bind(this);
  }

  async componentDidMount() {
    const currentSession = await Auth.currentSession();
    this.setState({ email: currentSession.idToken.payload.email });
  }

  toggle() {
    const { collapse } = this.state;
    this.setState({ collapse: !collapse });
  }

  render() {
    const { collapse, email } = this.state;
    return (
      <div className="topbar__profile">
        <button type="button" className="topbar__avatar" onClick={this.toggle}>
          <img className="topbar__avatar-img" src={`${window.location.origin}/${Ava}`}
               alt="avatar"
          />
          <p className="topbar__avatar-name">{email}</p>
          <DownIcon className="topbar__icon"/>
        </button>
        {collapse && <button type="button" className="topbar__back" onClick={this.toggle}/>}
        <Collapse isOpen={collapse} className="topbar__menu-wrap">
          <div className="topbar__menu">
            <TopbarMenuLink title="Toggle Theme" icon="layers" path="/"/>
            <div className="topbar__menu-divider"/>
            <TopbarMenuLink title="Log Out" icon="exit" path="/"/>
          </div>
        </Collapse>
      </div>
    );
  }
}

export default TopbarProfile;
