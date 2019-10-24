import React, { Component } from 'react';
import { Route, Switch } from 'react-router-dom';
import MainWrapper from '../MainWrapper';
import WrappedRoutes from './WrappedRoutes';
import LoginPage from '../login/LoginPage';
// import HereTestPage from '../HereTestPage';
import AddFirstEquipmentPage from '../equipments/AddFirstEquipmentPage';
import AddFirstDriverPage from '../drivers/AddFirstDriverPage';

class Router extends Component {
  render() {
    return (
      <MainWrapper theme={this.context}>
        <main>
          <Switch>
            <Route exact path="/login" component={LoginPage}/>
            <Route exact path="/first-truck" component={AddFirstEquipmentPage}/>
            <Route exact path="/first-driver" component={AddFirstDriverPage}/>
            <Route path="/" component={WrappedRoutes}/>
            {/* <Route path="/" component={HereTestPage}/> */}
          </Switch>
        </main>
      </MainWrapper>
    );
  }
}

export default Router;
