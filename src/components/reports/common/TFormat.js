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

  static asMoneyNoDecimals(inputValue) {
    return (
      <NumberFormat
        value={inputValue}
        displayType="text"
        decimalSeparator="."
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
    let newTextValue = textValue;
    if (newTextValue && newTextValue.includes('+1')) {
      newTextValue = newTextValue.replace('+1', '');
    }
    return (
      <NumberFormat
        value={newTextValue}
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

    const hDisplay = h > 0 ? h + (h === 1 ? ' hour ' : ' hours ') : '';
    const mDisplay = m > 0 ? m + (m === 1 ? ' minute ' : ' minutes ') : '';
    const sDisplay = s > 0 ? s + (s === 1 ? ' second' : ' seconds') : '';

    return hDisplay + mDisplay + sDisplay;
  }

  static asMinutesToHms(inputValue) {
    let t = this.asSecondsToHms(inputValue * 60);
    return (this.asSecondsToHms(inputValue * 60));
  }

  static asMinutesToDHms(seconds) {
    if (seconds) {
      seconds = Number(seconds);
      const d = Math.floor(seconds / (3600 * 24));
      const h = Math.floor(seconds % (3600*24) / 3600);
      const m = Math.floor(seconds % 3600 / 60);

      const dDisplay = d > 0 ? d + (d === 1 ? ' day ' : ' days ') : '';
      const hDisplay = h > 0 ? h + (h === 1 ? ' hour ' : ' hours ') : '';
      const mDisplay = m > 0 ? m + (m === 1 ? ' minute ' : ' minutes ') : '';
      // const sDisplay = s > 0 ? s + (s == 1 ? " second" : " seconds") : "";
      return dDisplay + hDisplay + mDisplay;
    }
    return '0';
  }

  // AG-Grid formatters
  static formatCurrency(
    num,
    locale = 'en-US',
    currency = 'USD',
    minimumFractionDigits = 2) {
    if (isNaN(num)) {
      return num;
    }
    return num.toLocaleString(locale, {style: 'currency', currency, minimumFractionDigits});
  }

  static currencyFormatter(value) {
    if (value) {
      return '$ ' + value.toFixed(2).replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,')
    } else {
      return "$ 0.00";
    }
  }

  static currencyFormatterRound(value) {
    if (value) {
      const val = Math.round(value);
      try {
        return '$ ' + String(val).replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,')
      } catch (e) {
        console.log("TCL: ERROR:", e);
      }
    }
    return '$ 0';
  }

  static formatNumber(number) {
    if (number) {
      return Math.floor(number)
        .toString()
        .replace(/(\d)(?=(\d{3})+(?!\d))/g, "$1,");
    } else {
      return "0";
    }
  }

  static formatPercent(number) {
    if (number) {
      let n = parseFloat(number)
        .toFixed(2)
        .toString()
        .replace(/\B(?=(\d{3})+(?!\d))/g, ',');
      return String(n) + " %";
    } else {
      return "0.00 %";
    }
  }

  static formatNumberDecimal(number) {
    if (number) {
      return parseFloat(number)
        .toFixed(2)
        .toString()
        .replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    } else {
      return "0.00";
    }
  }

  // Other formatters
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
