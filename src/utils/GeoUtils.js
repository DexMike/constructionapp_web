class GeoUtils {
  static getDistance(
    waypoint0,
    waypoint1,
    metricSystem = 'imperial',
    language = 'en-us'
  ) {
    const platform = new H.service.Platform({
      apikey: process.env.HERE_MAPS_API_KEY,
      useCIT: true,
      app_id: process.env.HERE_MAPS_APP_ID,
      app_code: process.env.HERE_MAPS_APP_CODE,
      useHTTPS: true
    });

    const params = {
      mode: 'fastest;truck;traffic:disabled',
      waypoint0, // '37.7397,-121.4252'
      waypoint1, // '37.9577,-121.2908'
      routeattributes: 'summary',
      metricSystem,
      language
    };

    const router = platform.getRoutingService();

    return {
      router,
      params
    };
  }
}

export default GeoUtils;
