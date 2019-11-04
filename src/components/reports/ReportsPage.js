import React, { Component } from 'react';
import ReportsComparison from './ReportsComparison';

class ReportsPage extends Component {
  constructor(props) {
    super(props);
    this.state = {
      type: null
    };
  } // constructor

  async componentDidMount() {
    const { match } = this.props;
    let type = null;

    /*
    if (match.params.type === 'producer') {
      type = 'Producer';
    } else {
      type = 'Carrier';
    }

    this.setState({
      type,
      loaded: true
    });
    */
  }

  componentWillReceiveProps(nextProps) {
    /*
    const { match } = this.props;
    if (nextProps.match.params.type !== match.params.type) {
      let type = null;
      if (nextProps.match.params.type === 'producer') {
        type = 'Producer';
      } else {
        type = 'Carrier';
      }
      this.setState({
        type,
        loaded: true
      });
    }
    */
  }

  renderReportsFromCompanyType() {
    // const { type } = this.state;
    return (
      <React.Fragment>
        <ReportsComparison/>
      </React.Fragment>
    );
  }

  renderLoader() {
    return (
      <div className="load loaded inside-page">
        <div className="load__icon-wrap">
          <svg className="load__icon">
            <path fill="rgb(0, 111, 83)" d="M12,4V2A10,10 0 0,0 2,12H4A8,8 0 0,1 12,4Z"/>
          </svg>
        </div>
      </div>
    );
  }

  render() {
    return (
      <React.Fragment>
        {this.renderReportsFromCompanyType()}
      </React.Fragment>
    );
  }
}

export default ReportsPage;
