class UserUtils {
  static async getUserIP() {
    const input = ' https://api.ipify.org/?format=json';
    const init = {
      method: 'GET'
    };
    const response = await fetch(input, init);
    return response.json();
  }

  static async getBrowserVersion() {
    var ua = navigator.userAgent,tem,M = ua.match(/(opera|chrome|safari|firefox|msie|trident(?=\/))\/?\s*(\d+)/i) || []; 
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

  static async getScreenDimentions() {
    return {
      height: window.innerWidth,
      width: window.innerHeight
    };
  }
}

export default UserUtils;
