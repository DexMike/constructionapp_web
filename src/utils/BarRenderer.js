/* eslint-disable no-multiple-empty-lines,
no-trailing-spaces,
object-curly-spacing,
no-unused-vars,
spaced-comment,
react/jsx-closing-bracket-location,
semi, quotes, no-empty,
react/no-string-refs,
prefer-const, comma-dangle, padded-blocks,
react/jsx-one-expression-per-line,
space-before-function-paren,
keyword-spacing, no-multi-spaces */
import React from 'react';
import {
  Button,
  Card,
  CardBody,
  Col,
  Container,
  Row
} from 'reactstrap';
import NumberFormat from 'react-number-format';

function formatNumber(number) {
  return Math.floor(number)
    .toString()
    .replace(/(\d)(?=(\d{3})+(?!\d))/g, "$1,");
}

function currencyFormatter(params) {
  return `$ ${formatNumber(params.value)}`;
}

// cell renderer for the proficiency column. this is a very basic cell renderer,
// it is arguable that we should not of used React and just returned a string of
// html as a normal ag-Grid cellRenderer.
export default class BarRenderer extends React.Component {
  render() {
    const data = this.props;    
    const maximum = data.value.max;
    let {total} = data.value;
    let {totalComp} = data.value;
    const {type} = data.value;
    let percent = 0;
    let percentComp = 0;
    let numberOfDecimals = 2;

    try {
      if (total === null) {
        total = 'N/A';
      } else if (typeof total === 'string') {
        total = Number(total.replace(/[^0-9]/g, ''));
      }
      if (totalComp === null) {
        totalComp = 'N/A';
      } else if (typeof totalComp === 'string') {
        totalComp = Number(totalComp.replace(/[^0-9]/g, ''));
      }
    } catch (e) {
      console.log('ERROR >>>>>', e)
    }

    // if the type is number we have to calculate percent 
    // from the maximum
    if ((type === 'number' || type === 'price' || type === 'integer') && total !== 'N/A') {
      if (total === 0) {
        percent = 0;
      } else {
        percent = Math.round((total * 100) / maximum);
      }
    }

    if ((type === 'number' || type === 'price' || type === 'integer') && totalComp !== 'N/A') {
      if (totalComp === 0) {
        percentComp = 0;
      } else {
        percentComp = Math.round((totalComp * 100) / maximum);
      }
    }

    if (type === 'integer') {
      numberOfDecimals = 0;
    }

    // avoid decimals in millions
    if (total >= 1000000) {
      total = Math.round(total);
      numberOfDecimals = 0;
    }
    if (totalComp >= 1000000) {
      totalComp = Math.round(totalComp);
      numberOfDecimals = 0;
    }

    return (
      <React.Fragment>
        <Row>
          <Col md={4} style={{ color: '#333333', fontWeight: 'bold', textAlign: 'right' }}>
            <NumberFormat
              value={total}
              displayType="text"
              decimalSeparator="."
              decimalScale={numberOfDecimals}
              fixedDecimalScale
              thousandSeparator
              prefix={type === 'price' ? '$' : ''}
            />
          </Col>
          <Col md={8} className="text-right">
            <div
              className="div-percent-bar"
              style={{
                width: `${percent}%`,
                marginTop: '4px',
                backgroundColor: '#218169',
                marginLeft: '4px',
                height: '21px'
              }}>
              &nbsp;
            </div>
          </Col>
        </Row>
        <Row>
          <Col md={4} style={{ color: '#999999', fontWeight: 'bold', textAlign: 'right' }}>
            <NumberFormat
              value={totalComp}
              displayType="text"
              decimalSeparator="."
              decimalScale={numberOfDecimals}
              fixedDecimalScale
              thousandSeparator
              prefix={type === 'price' ? '$' : ''}
            />
          </Col>
          <Col md={8} className="text-right">
            <div
              className="div-percent-bar"
              style={{
                width: `${percentComp}%`,
                marginTop: '4px',
                backgroundColor: '#9A9A9A',
                marginLeft: '4px',
                height: '21px'
              }}>
              &nbsp;
            </div>
          </Col>
        </Row>
      </React.Fragment>
    
    );
  }
}
