import React, { /* Component */ } from 'react';
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
  }

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
  }

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
  }

  // inputRateType
  // inputRate
  // inputeRateEstimate
  static asMoneyByRate(inputRateType, inputRate, inputRateEstimate) {
    if (inputRateType === 'Hour') {
      return TFormat.asMoney(inputRate * inputRateEstimate);
    }
    if (inputRateType === 'Ton') {
      return TFormat.asMoney(inputRate * inputRateEstimate);
    }
    return '$ 0.00';
  }

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

  static asTonsByHours(inputValue) {
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

  static asPhoneText(textValue) {
    // <NumberFormat format="+1 (###) ###-####" mask="_" />
    return (
      <NumberFormat
        value={textValue}
        displayType={"text"}
        format="(###) ###-####"
        mask=""
      />
    );
  }


  static asDate(inputValue) {
    return moment(inputValue).format('MM/DD/YYYY');
  }

  static asDateTime(inputValue) {
    return moment(inputValue).format('MM/DD/YYYY hh:mm');
  }

  static asDayWeek(inputValue) {
    return moment(inputValue).format('LLLL');
  }

  static asZip5(inputValue) {
    return (
      <NumberFormat
        value={inputValue}
        type="text"
        format="#####"
        mask="_"
      />
    );
  }

  static asPercent(inputValue, decimal = 0) {
    return (
      <NumberFormat
        value={inputValue}
        displayType="text"
        decimalSeparator="."
        decimalScale={decimal}
        fixedDecimalScale
        thousandSeparator
        prefix=""
        suffix="%"
      />
    );
  }

  static asWholeNumber(inputValue) {
    return (
      <NumberFormat
        value={inputValue}
        displayType="text"
        decimalSeparator="."
        decimalScale={0}
        fixedDecimalScale
        thousandSeparator
        prefix=""
        suffix=""
      />
    );
  }


  static asNumber(inputValue) {
    return (
      <NumberFormat
        value={inputValue}
        displayType="text"
        decimalSeparator="."
        decimalScale={2}
        fixedDecimalScale
        thousandSeparator
        prefix=""
        suffix=""
      />
    );
  }

  static asDistance(inputValue) {
    return (
      <NumberFormat
        value={inputValue}
        displayType="text"
        decimalSeparator="."
        decimalScale={2}
        fixedDecimalScale
        thousandSeparator
        prefix=""
        suffix=" mi"
      />
    );
  }

  materialsAsString(materials) {
    let materialsString = '';
    if (materials) {
      let index = 0;
      for (const material of materials) {
        if (index !== materials.length - 1) {
          materialsString += `${material}, `;
        } else {
          materialsString += material;
        }
        index += 1;
      }
    }
    return materialsString;
  }
}

export default TFormat;
