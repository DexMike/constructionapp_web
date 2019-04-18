import React, { Component } from 'react';
import TSpinner from './common/TSpinner';

class LoaderTestPage extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: true
    };

    this.toggleLoading = this.toggleLoading.bind(this);
  }

  toggleLoading() {
    const { loading } = this.state;
    this.setState({loading: !loading});
  }

  render() {
    const { loading } = this.state;
    return (
      <div>
        <button type="button" name="toggle" onClick={this.toggleLoading}>Toggle</button>
        <TSpinner loading={loading} />
      </div>
    );
  }
}

export default LoaderTestPage;
