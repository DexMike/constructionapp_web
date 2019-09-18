import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import './graph.css';
import { Col, Row, classNames } from 'reactstrap';
import NumberFormatting from '../../utils/NumberFormatting';

class TSimpleGraph extends PureComponent {
  /*
  constructor(props) {
    super(props);
    // this.handleKeypress = this.handleKeypress.bind(this);
  }
  */

  render() {
    const {
      type,
      asMoney,
      threshold
    } = this.props;

    let { value } = this.props;
    const percent = Math.round((value * 100) / threshold);
    let textClass = 'light-gray';
    let barClass = 'gray-bar';

    if (asMoney) {
      value = NumberFormatting.asMoney(value, '.', 2, ',', '$', '');
    }

    if (type === 'baseline') {
      textClass = 'dark-gray';
      barClass = 'green-bar';
    }

    return (
      <React.Fragment>
        <Row>
          <Col md={6}>
            <span className={textClass}>
              {value}
            </span>
          </Col>
          <Col md={6}>
            <div className="graph-container">
              <div className={`wid ${barClass}`} style={{ width: `${percent}%` }}>
                &nbsp;
              </div>
            </div>
          </Col>
        </Row>
      </React.Fragment>
    );
  }
}

TSimpleGraph.propTypes = {
  type: PropTypes.string,
  value: PropTypes.number,
  threshold: PropTypes.number,
  asMoney: PropTypes.bool
};

TSimpleGraph.defaultProps = {
  type: null,
  value: 0,
  threshold: 0,
  asMoney: false
};

export default TSimpleGraph;
