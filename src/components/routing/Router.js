import React, { Component } from 'react';
import { Route, Switch } from 'react-router-dom';
import MainWrapper from '../MainWrapper';
import WrappedRoutes from './WrappedRoutes';
import LoaderTestPage from '../LoaderTestPage';
import LoginPage from '../login/LoginPage';
// import LoaderTestPage from '../../'

class Router extends Component {
  render() {
    return (
      <MainWrapper theme={this.context}>
        <main>
          <Switch>
            <Route exact path="/login" component={LoginPage}/>
            <Route path="/" component={WrappedRoutes}/>
          </Switch>
        </main>
      </MainWrapper>
    );
  }
}

export default Router;
