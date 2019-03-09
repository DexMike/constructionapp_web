import React, { Component } from 'react';
import moment from 'moment';
import NumberFormat from 'react-number-format';

class TFormat {

  static asMoney(inputValue) {
    return (
      <NumberFormat
        value={inputValue}
        displayType="text"
        decimalSeparator="."
        decimalScale={2}
        fixedDecimalScale
        thousandSeparator
        prefix="$&nbsp;"
        suffix=""
      />
    );
  };

  static asMoneyByHour(inputValue) {
    return (
      <NumberFormat
        value={inputValue}
        displayType="text"
        decimalSeparator="."
        decimalScale={2}
        fixedDecimalScale
        thousandSeparator
        prefix="$&nbsp;"
        suffix="&nbsp;/&nbsp;Hour"
      />
    );
  };

  static asMoneyByTons(inputValue) {
    return (
      <NumberFormat
        value={inputValue}
        displayType="text"
        decimalSeparator="."
        decimalScale={2}
        fixedDecimalScale
        thousandSeparator
        prefix="$&nbsp;"
        suffix="&nbsp;/&nbsp;Ton"
      />
    );
  };

  static asHours(inputValue) {
    return (
      <NumberFormat
        value={inputValue}
        displayType="text"
        decimalSeparator="."
        // decimalScale={2}
        fixedDecimalScale
        thousandSeparator
        prefix=""
        suffix="&nbsp;Hours"
      />
    );
  }


  static asTons(inputValue) {
    return (
      <NumberFormat
        value={inputValue}
        displayType="text"
        decimalSeparator="."
        // decimalScale={2}
        fixedDecimalScale
        thousandSeparator
        prefix=""
        suffix="&nbsp;Tons"
      />
    );
  }

  static asTonsByTons(inputValue) {
    return (
      <NumberFormat
        value={inputValue}
        displayType="text"
        decimalSeparator="."
        decimalScale={2}
        fixedDecimalScale
        thousandSeparator
        prefix=""
        suffix="&nbsp;/&nbsp;Tons"
      />
    );
  }

  static asTonsByHours(inputeValue) {
    return (
      <NumberFormat
        value={inputValue}
        displayType="text"
        decimalSeparator="."
        decimalScale={2}
        fixedDecimalScale
        thousandSeparator
        prefix=""
        suffix="&nbsp;/&nbsp;Hour"
      />
    );
  }

  static asPhone(inputValue) {
    // <NumberFormat format="+1 (###) ###-####" mask="_" />
    return (
      <NumberFormat
        value={inputValue}
        type="text"
        format="(###) ###-####"
        mask=""
      />
    );
  }

  static asDate(inputValue) {
    return moment(inputValue).format("MM/DD/YYYY");
  }

  static asDateTime(inputValue) {
    return moment(inputValue).format("MM/DD/YYYY HH:mm");
  }

  static asZip5(inputValue) {
    return (
      <NumberFormat
        value={inputValue}
        type="text"
        format="#####"
        mask="_"
      />
    )
  };
}

export default TFormat;
