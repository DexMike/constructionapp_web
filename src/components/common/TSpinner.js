import React, { PureComponent } from 'react';
import { css } from '@emotion/core';
import { ClipLoader } from 'react-spinners';
import * as PropTypes from 'prop-types';

const override = css`
    display: inline-block;
    margin: 0 auto;
    border-color: red;
`;

class TSpinner extends PureComponent {
  render() {
    const { loading, color, customCss, loaderSize } = this.props;
    return (
      <div className="sweet-loading" style={customCss}>
        <ClipLoader
          css={override}
          sizeUnit="px"
          size={loaderSize}
          color={color}
          loading={loading}
        />
      </div>
    );
  }
}

TSpinner.propTypes = {
  loading: PropTypes.bool,
  color: PropTypes.string,
  customCss: PropTypes.shape(),
  loaderSize: PropTypes.number
};

TSpinner.defaultProps = {
  loading: true,
  color: '#006f53',
  customCss: null,
  loaderSize: 20
};

export default TSpinner;
