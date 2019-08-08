import React, { /* Component */ } from 'react';
import moment from 'moment-timezone';
import NumberFormat from 'react-number-format';

const toMil = 0.62137119;
const toKm = 1.609344;

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
        displayType="text"
        format="(###) ###-####"
        mask=""
      />
    );
  }


  // Some refs regarding Intl object, which returns the locale from
  // the browser if the user doesn't have a timeZone setting
  // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/DateTimeFormat/resolvedOptions
  // https://stackoverflow.com/questions/37798404/getting-timezone-using-intl-api-doesnt-work-in-firefox
  // http://kangax.github.io/compat-table/esintl/#test-DateTimeFormat_resolvedOptions().timeZone_defaults_to_the_host_environment

  static asDate(inputValue, userTimeZone) {
    if (userTimeZone && userTimeZone.length > 0) {
      return moment.utc(inputValue).tz(userTimeZone).format('MM/DD/YYYY');
    }
    return moment.utc(inputValue).tz(Intl.DateTimeFormat().resolvedOptions().timeZone).format('MM/DD/YYYY');
  }

  static asDateTime(inputValue, userTimeZone) {
    if (userTimeZone && userTimeZone.length > 0) {
      return moment.utc(inputValue).tz(userTimeZone).format('MM/DD/YYYY hh:mm a');
    }
    return moment.utc(inputValue).tz(Intl.DateTimeFormat().resolvedOptions().timeZone).format('MM/DD/YYYY hh:mm a');
  }

  static asDayWeek(inputValue, userTimeZone) {
    if (userTimeZone && userTimeZone.length > 0) {
      return moment.utc(inputValue).tz(userTimeZone).format('LLLL');
    }
    return moment.utc(inputValue).tz(Intl.DateTimeFormat().resolvedOptions().timeZone).format('LLLL');
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

  static asMetersToMiles(inputValue) {
    // Added this one since mapbox response returns the value in
    // meters when getting the distance between locations
    const miles = inputValue * toMil / 1000;
    return (
      <NumberFormat
        value={miles}
        displayType="text"
        decimalSeparator="."
        decimalScale={2}
        fixedDecimalScale
        thousandSeparator
        prefix=""
        suffix=" miles (one way)"
      />
    );
  }

  static asKilometersToMiles(inputValue) {
    const miles = inputValue * toMil;
    return (
      <NumberFormat
        value={miles}
        displayType="text"
        decimalSeparator="."
        decimalScale={2}
        fixedDecimalScale
        thousandSeparator
        prefix=""
        suffix=" miles"
      />
    );
  }

  static asMilesToKilometers(inputValue) {
    const km = inputValue * toKm;
    return (
      <NumberFormat
        value={km}
        displayType="text"
        decimalSeparator="."
        decimalScale={2}
        fixedDecimalScale
        thousandSeparator
        prefix=""
        suffix=" km"
      />
    );
  }

  static asSecondsToHms(inputValue) {
    const h = Math.floor(inputValue / 3600);
    const m = Math.floor((inputValue % 3600) / 60);
    const s = Math.floor(inputValue % 3600 % 60);

    const hDisplay = h > 0 ? h + (h === 1 ? ' hour, ' : ' hours, ') : '';
    const mDisplay = m > 0 ? m + (m === 1 ? ' minute, ' : ' minutes, ') : '';
    const sDisplay = s > 0 ? s + (s === 1 ? ' second' : ' seconds') : '';
    return hDisplay + mDisplay + sDisplay;
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

  static getValue(formatted) {
    if (typeof formatted.props !== 'undefined') {
      return `${formatted.props.prefix}${formatted.props.value}${formatted.props.suffix}`;
    }
    return '';
  }
}

export default TFormat;
