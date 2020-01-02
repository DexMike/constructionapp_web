class UserUtils {
  // Note: this api call is is sometimes not working so is best to get the remote ip address server side.
  // static async getUserIP() {
  //   const input = ' https://api.ipify.org/?format=json';
  //   const init = {
  //     method: 'GET'
  //   };
  //   const response = await fetch(input, init);
  //   return response.json();
  // }

  static async getBrowserVersion() {
    const ua = navigator.userAgent; let tem; let M = ua.match(/(opera|chrome|safari|firefox|msie|trident(?=\/))\/?\s*(\d+)/i) || [];
    if (/trident/i.test(M[1])) {
      tem = /\brv[ :]+(\d+)/g.exec(ua) || [];
      return {name: 'IE', version: (tem[1] || '')};
    }
    if (M[1] === 'Chrome') {
      tem = ua.match(/\bOPR|Edge\/(\d+)/);
      if (tem != null) {
        return {name: 'Opera', version: tem[1]};
      }
    }
    M = M[2] ? [M[1], M[2]] : [navigator.appName, navigator.appVersion, '-?'];
    tem = ua.match(/version\/(\d+)/i);
    if (tem != null) {
      M.splice(1, 1, tem[1]);
    }
    return {
      name: M[0],
      version: M[1]
    };
  }

  // remove non numeric (useful for converting phones to numbers for Twilio)
  static phoneToNumberFormat(phone) {
    const num = Number(phone.replace(/\D/g, ''));
    return num;
  }

  static async getScreenDimentions() {
    return {
      height: window.innerWidth,
      width: window.innerHeight
    };
  }

  static sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  static blobToFile(data, name, mimetype) {
    // let's convert the base64 data into a pdf and open it
    const binaryString = window.atob(data);
    const binaryLen = binaryString.length;
    const bytes = new Uint8Array(binaryLen);
    for (let i = 0; i < binaryLen; i += 1) {
      const ascii = binaryString.charCodeAt(i);
      bytes[i] = ascii;
    }
    const blob = new Blob([bytes], {type: mimetype});
    const link = document.createElement('a');
    link.href = window.URL.createObjectURL(blob);
    link.download = name;
    link.click();
  }
}

export default UserUtils;
