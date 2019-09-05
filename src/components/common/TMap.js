import React, {Component} from 'react';
import * as PropTypes from 'prop-types';
import pinA from '../../img/PinA.png';
import pinB from '../../img/PinB.png';
import GeoUtils from '../../utils/GeoUtils';

class TMap extends Component {
  constructor(props) {
    super(props);

    this.platform = new H.service.Platform({
      apikey: process.env.HERE_MAPS_API_KEY,
      useCIT: true,
      app_id: process.env.HERE_MAPS_APP_ID,
      app_code: process.env.HERE_MAPS_APP_CODE,
      useHTTPS: true
    });
    this.map = null;
    this.behavior = null;
    this.ui = null;
    this.boundingBoxDistance = 0;

    this.calculateRouteFromAtoB = this.calculateRouteFromAtoB.bind(this);
    this.onRouteSuccess = this.onRouteSuccess.bind(this);
  }

  componentDidMount() {
    const {
      zoom,
      center,
      id,
      startAddress,
      endAddress,
      trackings
    } = this.props;
    const defaultLayers = this.platform.createDefaultLayers();
    const mapDiv = document.getElementById(`mapContainer${id}`);
    const mapOptions = {};
    mapOptions.center = center;
    mapOptions.zoom = zoom;
    this.map = new H.Map(mapDiv, defaultLayers.vector.normal.map, mapOptions);
    // add a resize listener to make sure that the map occupies the whole container
    window.addEventListener('resize', () => this.map.getViewPort().resize());
    // MapEvents enables the event system
    // Behavior implements default interactions for pan/zoom (also on mobile touch environments)
    this.behavior = new H.mapevents.Behavior(new H.mapevents.MapEvents(this.map));
    // Create the default UI components
    this.ui = H.ui.UI.createDefault(this.map, defaultLayers);

    if (startAddress && endAddress) {
      /**/
      this.calculateRouteFromAtoB();
      this.addMarkersToMap();
    }

    if (trackings && trackings.length > 0) {
      const lineString = new H.geo.LineString();
      for (const tracking of trackings) {
        // this.addGPSPoint(tracking[1], tracking[0]);
        lineString.pushPoint({lat: tracking[1], lng: tracking[0]});
      }
      this.map.addObject(new H.map.Polyline(
        lineString,
        {
          style: {
            lineWidth: 5,
            strokeColor: 'rgb(0, 196, 147)'
          }
        }
      ));
    }
  }

  onRouteSuccess(result) {
    const route = result.response.route[0];
    this.addRouteShapeToMap(route);
    // for (const tracking of trackings) {
    //   this.addGPSPoint(tracking[1], tracking[0]);
    // }
  }

  onRouteError(error) {
    console.error(error);
  }

  calculateRouteFromAtoB() {
    const {startAddress, endAddress} = this.props;
    const router = this.platform.getRoutingService();
    const routeRequestParams = {
      mode: 'balanced;truck;traffic:disabled;motorway:0',
      representation: 'display',
      routeattributes: 'waypoints,summary,shape,legs,incidents',
      maneuverattributes: 'direction,action',
      truckType: 'tractorTruck',
      limitedWeight: 700,
      metricSystem: 'imperial',
      language: 'en-us', // en-us|es-es|de-de
      waypoint0: `${startAddress.latitude},${startAddress.longitude}`,
      waypoint1: `${endAddress.latitude},${endAddress.longitude}`
    };

    router.calculateRoute(
      routeRequestParams,
      this.onRouteSuccess,
      this.onRouteError
    );
  }

  /**
   * Creates a H.map.Polyline from the shape of the route and adds it to the map.
   * @param {Object} route A route as received from the H.service.RoutingService
   */
  addRouteShapeToMap(route) {
    const lineString = new H.geo.LineString();
    const routeShape = route.shape;

    routeShape.forEach((point) => {
      const parts = point.split(',');
      lineString.pushLatLngAlt(parts[0], parts[1]);
    });

    const polyline = new H.map.Polyline(lineString, {
      style: {
        lineWidth: 2,
        strokeColor: 'rgb(0, 111, 83)'
      }
    });
    // Add the polyline to the map
    this.map.addObject(polyline);
    // let bounds = polyline.getBoundingBox(); // H.geo.Rect
  }

  addMarkersToMap() {
    const {startAddress, endAddress} = this.props;
    const pinAIcon = new H.map.Icon(`${window.location.origin}/${pinA}`,
      { size: { w: 35, h: 50 } });
    const markerA = new H.map.Marker({ lat: startAddress.latitude, lng: startAddress.longitude },
      { zIndex: 0, icon: pinAIcon });
    const pinBIcon = new H.map.Icon(`${window.location.origin}/${pinB}`,
      { size: { w: 35, h: 50 } });
    const markerB = new H.map.Marker({ lat: endAddress.latitude, lng: endAddress.longitude },
      { zIndex: 0, icon: pinBIcon });
    const group = new H.map.Group();
    group.addObjects([markerA, markerB]);
    this.map.addObject(group);
    const bounds = group.getBoundingBox(); // H.geo.Rect
    // And zoom to its bounding rectangle
    this.map.getViewModel().setLookAtData({
      bounds: GeoUtils.setZoomBounds(bounds)
    });
  }

  addGPSPoint(latitude, longitude) {
    this.map.addObject(new H.map.Circle(
      {lat: latitude, lng: longitude}, (1 + (this.boundingBoxDistance * 500)),
      {
        style: {
          strokeColor: 'rgba(0, 0, 255, 0.5)', // Color of the perimeter
          lineWidth: 1,
          fillColor: 'rgba(255, 255, 255, 0.5)' // Color of the circle
        }
      }
    ));
  }

  render() {
    const {width, height, id} = this.props;
    return (
      <section style={{width, height}} id={`mapContainer${id}`}/>
    );
  }
}

TMap.propTypes = {
  id: PropTypes.string,
  width: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  height: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  zoom: PropTypes.number,
  center: PropTypes.shape({
    lat: PropTypes.number,
    lng: PropTypes.number
  }),
  startAddress: PropTypes.shape({
    latitude: PropTypes.number,
    longitude: PropTypes.number
  }),
  endAddress: PropTypes.shape({
    latitude: PropTypes.number,
    longitude: PropTypes.number
  }),
  trackings: PropTypes.arrayOf(PropTypes.arrayOf(PropTypes.number))
};

TMap.defaultProps = {
  id: '1',
  width: 400,
  height: 400,
  zoom: 10,
  center: {
    lat: 30.274983,
    lng: -97.739604
  },
  startAddress: null,
  endAddress: null,
  trackings: []
};

export default TMap;
