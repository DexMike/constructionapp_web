import React, {Component} from 'react';
import * as PropTypes from 'prop-types';
import pinA from '../../img/PinA.png';
import pinB from '../../img/PinB.png';
// import truckIcon from '../../img/icons8-truck-30.png';
import LoadsService from '../../api/LoadService';
// import { type } from 'os';
import './overrides.css';

const refreshInterval = 5; // refresh every 15 seconds
let timerVar;
let count = 0;
const groupTrackings = new H.map.Group();

class TMapLive extends Component {
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
    this.ui = null;
    this.calculateRouteFromAtoB = this.calculateRouteFromAtoB.bind(this);
    this.onRouteSuccess = this.onRouteSuccess.bind(this);
    this.programmedRefresh = this.programmedRefresh.bind(this);
    this.addMarkerToGroup = this.addMarkerToGroup.bind(this);
    this.removeObjects = this.removeObjects.bind(this);
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
    this.ui = H.ui.UI.createDefault(this.map, this.platform.createDefaultLayers());

    // add a resize listener to make sure that the map occupies the whole container
    window.addEventListener('resize', () => this.map.getViewPort().resize());
    // MapEvents enables the event system
    // Behavior implements default interactions for pan/zoom (also on mobile touch environments)
    this.behavior = new H.mapevents.Behavior(new H.mapevents.MapEvents(this.map));
    // Create the default UI components
    this.ui = H.ui.UI.createDefault(this.map, defaultLayers);
    if (startAddress && endAddress) {
      if (trackings && trackings.length > 0) {
        const lineString = new H.geo.LineString();
        for (const tracking of trackings) {
          // this.addGPSPoint(tracking[1], tracking[0]);
          lineString.pushPoint({lat: tracking[1], lng: tracking[0]});
        }
        this.map.addObject(new H.map.Polyline(
          lineString, { style: { lineWidth: 4 }}
        ));
      } else {
        this.calculateRouteFromAtoB();
      }
      this.addMarkersToMap();
    }
    this.getLatestGPSForLoad();
    this.programmedRefresh(false);
  }

  componentWillUnmount() {
    this.programmedRefresh(true);
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

  async getLatestGPSForLoad() {
    const { loads } = this.props;
    const loadsList = loads();
    const allLoads = [];
    for (const load of loadsList) {
      allLoads.push(String(load.id));
    }

    // on ly get if there is one load or more
    if (allLoads.length > 0) {
      const gpsTrackings = await LoadsService.getLatestGPSForLoads(allLoads);
      this.map.addObject(groupTrackings);

      for (const gps of gpsTrackings) {
        this.removeObjects(gps.id); // clear before redrawing
        this.addMarkerToGroup(
          groupTrackings,
          {lat: gps.latitude, lng: gps.longitude},
          gps.firstName,
          gps.lastName
        );
      }
    }
  }

  removeObjects(id) {
    for (const object of groupTrackings.getObjects()) {
      if (object.id === `m_${id}`) {
        groupTrackings.removeObject(object);
      }
    }
  }

  addMarkerToGroup(group, coordinates, firstName, lastName) {
    const first = firstName.charAt(0);
    const last = lastName.charAt(0);
    const svgMarkup = '<svg height="45" width="45" xmlns="http://www.w3.org/2000/svg">'
      + '<circle cx="23" cy="23" r="20" stroke="white" stroke-width="2" fill="rgb(0, 111, 83)" />'
      + '<text x="23" y="30" font-size="16pt" '
      + 'font-family="Interstate, Arial" font-weight="normal" text-anchor="middle" '
      + `fill="white">${first}${last}</text>`
      + '</svg>';

    const icon = new H.map.Icon(svgMarkup);
    const marker = new H.map.Marker(coordinates, {icon});

    // Add the marker to the map and center the map at the location of the marker:
    group.addObject(marker);
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
        lineWidth: 4,
        strokeColor: 'rgba(0, 128, 255, 0.7)'
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
    let bounds = group.getBoundingBox(); // H.geo.Rect
    // zoom out a little so the markers fit
    const offsetFactor = 0.2;
    let smallFactor = 0;
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
    // not needed since bottom pin fits
    // boundParams.bottom -= (Math.abs(Math.abs(boundParams.top) - Math.abs(boundParams.bottom))
    //   * offsetFactor);
    boundParams.right += ((Math.abs(Math.abs(boundParams.left) - Math.abs(boundParams.right))
      + smallFactor) * offsetFactor);
    this.boundingBoxDistance = Math.sqrt((((boundParams.top - boundParams.bottom) ** 2))
      + (((boundParams.left - boundParams.right) ** 2)));
    bounds = new H.geo.Rect(boundParams.top, boundParams.left, boundParams.bottom,
      boundParams.right);
    // And zoom to its bounding rectangle
    this.map.getViewModel().setLookAtData({
      bounds
    });
  }

  addGPSPoint(
    latitude,
    longitude,
    strokeColor = 'rgba(0, 0, 255, 0.5)',
    fillColor = 'rgba(255, 255, 255, 0.5)'
  ) {
    console.log('>>Trying to add load: ', arguments);
    this.map.addObject(new H.map.Circle(
      {lat: latitude, lng: longitude}, (1 + (this.boundingBoxDistance * 500)),
      {
        style: {
          strokeColor, // Color of the perimeter
          lineWidth: 1,
          fillColor // Color of the circle
        }
      }
    ));
  }

  programmedRefresh(remove) {
    if (!remove) {
      const that = this;
      const timerTimer = function timerTimer() {
        count += 1;
        console.log(`>>>REFRESHING: ${Date.now()} COUNT: ${count}`);
        that.getLatestGPSForLoad();
      };
      timerVar = setInterval(timerTimer, (refreshInterval * 1000));
    } else {
      clearInterval(timerVar);
    }
  }

  render() {
    const {width, height, id} = this.props;
    return (
      <section style={{width, height}} id={`mapContainer${id}`}/>
    );
  }
}

TMapLive.propTypes = {
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
  trackings: PropTypes.arrayOf(PropTypes.arrayOf(PropTypes.number)),
  loads: PropTypes.func
};

TMapLive.defaultProps = {
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
  trackings: [],
  loads: null
};

export default TMapLive;
