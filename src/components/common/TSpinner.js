import React, { PureComponent } from 'react';
import { css } from '@emotion/core';
import { ClipLoader } from 'react-spinners';
import * as PropTypes from 'prop-types';

const override = css`
    display: block;
    margin: 0 auto;
    border-color: red;
`;

class TSpinner extends PureComponent {
  render() {
    const { loading } = this.props;
    return (
      <div className="sweet-loading">
        <ClipLoader
          css={override}
          sizeUnit="px"
          size={20}
          color="#006f53"
          loading={loading}
        />
      </div>
    );
  }
}

TSpinner.propTypes = {
  loading: PropTypes.bool
};

TSpinner.defaultProps = {
  loading: true
};

export default TSpinner;
