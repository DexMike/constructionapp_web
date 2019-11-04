class GeoUtils {

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

  static getDistance(
    waypoint0,
    waypoint1,
    metricSystem = 'imperial', // optional
    language = 'en-us', // optional
    vehicletype = 'gasoline,5.5' // optional
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

    if (vehicletype) {
      params.vehicletype = vehicletype;
    }

    const router = platform.getRoutingService();
    return new Promise((resolve, reject) => router.calculateRoute(
      params,
      (result) => {
        const { route } = {
          route: result.response.route
        };
        resolve(route);
      },
      (err) => {
        reject(new Error(err));
      }
    ));
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
}

export default GeoUtils;
