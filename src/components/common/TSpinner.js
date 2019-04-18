import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { css } from '@emotion/core';
import { ClipLoader } from 'react-spinners';
import TMap from './TMapOriginDestination';

const override = css`
    display: block;
    margin: 0 auto;
    border-color: red;
`;

class TSpinner extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      loading: true
    };
  }

  render() {
    return (
      <div className="sweet-loading">
        <ClipLoader
          css={override}
          sizeUnit="px"
          size={20}
          color="#006f53"
          loading={this.state.loading}
        />
      </div>
    );
  }
}

TSpinner.propTypes = {
  input: PropTypes.shape({
    origin: PropTypes.string,
    destination: PropTypes.string
  }).isRequired
};


export default TSpinner;
