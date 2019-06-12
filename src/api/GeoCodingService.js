const { MAPBOX_API } = process.env;
class GeoCodingService {
  static async getGeoCode(addressString, entity) {
    const input = `https://api.mapbox.com/geocoding/v5/mapbox.places/${addressString}.json?access_token=${MAPBOX_API}`;
    const init = {
      method: 'GET',
      body: JSON.stringify(entity)
    };
    const response = await fetch(input, init);
    return response.json();
  }
}

export default GeoCodingService;
