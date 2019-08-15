class NumberFormatting {
  static asMoney(
    amount = 0,
    decimal = '.',
    decimalCount = 2,
    thousands = ',',
    prefix = '$ ',
    sufix = ''
  ) {
    try {
      decimalCount = Math.abs(decimalCount);
      decimalCount = isNaN(decimalCount) ? 2 : decimalCount;
      const negativeSign = amount < 0 ? '-' : '';
      const i = parseInt(amount = Math.abs(Number(amount) || 0).toFixed(decimalCount)).toString();
      const j = (i.length > 3) ? i.length % 3 : 0;
      return prefix + negativeSign
        + (j ? i.substr(0, j) + thousands : '')
        + i.substr(j).replace(/(\d{3})(?=\d)/g, `$1${thousands}`)
        + (decimalCount ? decimal + Math.abs(amount - i).toFixed(decimalCount).slice(2) : '');
    } catch (e) {
      console.log(e);
    }
  }
}


export default NumberFormatting;
