const offsetFactor = 0.2;
let smallFactor = 0;
const hereDotComTimeout = 4000; // ms

class GeoUtils {
  static getDistance(
    waypoint0,
    waypoint1,
    metricSystem = 'imperial',
    language = 'en-us'
  ) {
    const platform = this.setPlatform();

    const params = {
      mode: 'fastest;truck;traffic:disabled',
      waypoint0, // '37.7397,-121.4252'
      waypoint1, // '37.9577,-121.2908'
      routeattributes: 'summary',
      metricSystem,
      language
    };

    const router = platform.getRoutingService();

    return new Promise((resolve, reject) => {
      const timeoutId = setTimeout(() => {
        reject(new Error('Unable to contact here.com'));
      }, hereDotComTimeout);
      router.calculateRoute(
        params,
        (result) => {
          clearTimeout(timeoutId);
          const route = result.response.route[0];
          const { summary } = route;
          resolve(summary);
        },
        (err) => {
          clearTimeout(timeoutId);
          const errorValues = {
            baseTime: 0,
            distance: 0,
            flags: [],
            text: err,
            trafficTime: 0,
            travelTime: 0,
            _type: 'RouteSummaryType'
          };
          resolve({errorValues});
        }
      );
    });
  }

  static setPlatform() {
    const platform = new H.service.Platform({
      apikey: process.env.HERE_MAPS_API_KEY,
      useCIT: true,
      app_id: process.env.HERE_MAPS_APP_ID,
      app_code: process.env.HERE_MAPS_APP_CODE,
      useHTTPS: true
    });
    return platform;
  }

  // HOW TO USE
  // await GeoUtils.getCoordsFromAddress('7756 Northcross Drive, Austin TX 78757');
  static async getCoordsFromAddress(address = '') {
    const platform = this.setPlatform();
    let data = {};
    const geocoder = platform.getGeocodingService();
    const geocodingParams = {
      searchText: address
    };
    await geocoder.geocode(geocodingParams, (result) => {
      const locations = result.Response.View[0].Result;
      if (locations[0]) {
        data = {
          lat: locations[0].Location.DisplayPosition.Latitude,
          lng: locations[0].Location.DisplayPosition.Longitude
        };
      }
    });
    return data;
  }

  // HOW TO USE
  // GeoUtils.getAddressFromCoords({lat: 30.356873, lng: -97.736977});
  static async getAddressFromCoords(coords = {}) {
    const platform = this.setPlatform();
    let data = '';
    const geocoder = platform.getGeocodingService();
    const reverseGeocodingParameters = {
      prox: `${coords.lat},${coords.lng}`,
      mode: 'retrieveAddresses',
      maxresults: 1
    };
    await geocoder.reverseGeocode(reverseGeocodingParameters, (result) => {
      const location = result.Response.View[0].Result[0];
      data = location.Location.Address.Label;
    });
    return data;
  }

  // sets a margin for a group of markers
  static setZoomBounds(allBounds) {
    let bounds = allBounds;
    const boundParams = {
      top: bounds.getTop(),
      left: bounds.getLeft(),
      bottom: bounds.getBottom(),
      right: bounds.getRight()
    };
    if ((Math.abs(Math.abs(boundParams.top) - Math.abs(boundParams.bottom) <= 0.0001))) {
      smallFactor = 0.01;
    }
    boundParams.top += ((Math.abs(Math.abs(boundParams.top) - Math.abs(boundParams.bottom))
      + smallFactor) * offsetFactor);
    boundParams.left -= ((Math.abs(Math.abs(boundParams.left) - Math.abs(boundParams.right))
      + smallFactor) * offsetFactor);
    boundParams.bottom -= (Math.abs(Math.abs(boundParams.top) - Math.abs(boundParams.bottom))
      * offsetFactor);
    boundParams.right += ((Math.abs(Math.abs(boundParams.left) - Math.abs(boundParams.right))
      + smallFactor) * offsetFactor);
    this.boundingBoxDistance = Math.sqrt((((boundParams.top - boundParams.bottom) ** 2))
      + (((boundParams.left - boundParams.right) ** 2)));
    bounds = new H.geo.Rect(boundParams.top, boundParams.left, boundParams.bottom,
      boundParams.right);

    return bounds;
  }
}

export default GeoUtils;
