import React, { Component } from 'react';
import { BrowserRouter } from 'react-router-dom';
import createHistory from 'history/createBrowserHistory';
import 'bootstrap/dist/css/bootstrap.css';
import '../scss/app.scss';
import ScrollToTop from './ScrollToTop';
import Router from './routing/Router';

export const history = createHistory();

class App extends Component {
  constructor(props) {
    super(props);

    this.state = {
      loading: true,
      loaded: false
    };
  }

  componentDidMount() {
    window.addEventListener('load', () => {
      this.setState({ loading: false });
      setTimeout(() => this.setState({ loaded: true }), 500);
    });
  }

  renderLoader() {
    const { loading } = this.state;
    return (
      <div className={`load${loading ? '' : ' loaded'}`}>
        <div className="load__icon-wrap">
          <svg className="load__icon">
            <path fill="#4ce1b6" d="M12,4V2A10,10 0 0,0 2,12H4A8,8 0 0,1 12,4Z"/>
          </svg>
        </div>
      </div>
    );
  }

  render() {
    const { loaded } = this.state;
    return (
      <BrowserRouter>
        <ScrollToTop>
          <React.Fragment>
            {!loaded && this.renderLoader()}
            <div>
              <Router history={history}/>
            </div>
          </React.Fragment>
        </ScrollToTop>
      </BrowserRouter>
    );
  }
}

export default App;
