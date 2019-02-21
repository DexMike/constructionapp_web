import React, { Component } from 'react';
import { Route, Switch } from 'react-router-dom';
import MainWrapper from '../MainWrapper';
import WrappedRoutes from './WrappedRoutes';
import LoginPage from '../login/LoginPage';

class Router extends Component {
  render() {
    return (
      <MainWrapper theme={this.context}>
        <main>
          <Switch>
            <Route exact path="/log_in" component={LoginPage}/>
            <Route path="/" component={WrappedRoutes}/>
          </Switch>
        </main>
      </MainWrapper>
    );
  }
}

export default Router;
