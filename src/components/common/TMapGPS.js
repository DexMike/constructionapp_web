import React, {Component} from 'react';
import * as PropTypes from 'prop-types';
import pinA from '../../img/PinA.png';
import pinB from '../../img/PinB.png';
import truckImg from '../../img/icons8-truck-30.png';
import GeoUtils from '../../utils/GeoUtils';
// import MapService from '../../api/MapService';
import GPSTrackingService from '../../api/GPSTrackingService';
import LoadService from '../../api/LoadService';

// this reduces the results times the number specified
const reducer = 20; // one twenieth
const maxPointsThreshold = 1000;

class TMapGPS extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loadedText: 'Loading route',
      gpsPointsPresent: false
    };

    this.platform = new H.service.Platform({
      apikey: process.env.HERE_MAPS_API_KEY,
      useCIT: true,
      app_id: process.env.HERE_MAPS_APP_ID,
      app_code: process.env.HERE_MAPS_APP_CODE,
      useHTTPS: true
    });
    this.mapGPS = null;
    this.behavior = null;
    this.ui = null;
    this.boundingBoxDistance = 0;
    this.onRouteSuccess = this.onRouteSuccess.bind(this);
    this.onRouteSuccessRecommended = this.onRouteSuccessRecommended.bind(this);
    this.addRouteShapeToMap = this.addRouteShapeToMap.bind(this);
    this.addMarkersToMap = this.addMarkersToMap.bind(this);
    this.reducer = this.reducer.bind(this);
    this.arragePoints = this.arragePoints.bind(this);
    this.addRouteShapeToMapRecommended = this.addRouteShapeToMapRecommended.bind(this);
  }

  async componentDidMount() {
    const {
      zoom,
      center,
      id,
      loadId
    } = this.props;
    const defaultLayers = this.platform.createDefaultLayers();
    const mapDiv = document.getElementById(`mapContainer${id}`);
    const mapOptions = {};
    mapOptions.center = center;
    mapOptions.zoom = zoom;
    this.mapGPS = new H.Map(mapDiv, defaultLayers.vector.normal.map, mapOptions);
    // add a resize listener to make sure that the map occupies the whole container
    window.addEventListener('resize', () => this.mapGPS.getViewPort().resize());
    // MapEvents enables the event system
    // Behavior implements default interactions for pan/zoom (also on mobile touch environments)
    this.behavior = new H.mapevents.Behavior(new H.mapevents.MapEvents(this.mapGPS));
    // Create the default UI components
    this.ui = H.ui.UI.createDefault(this.mapGPS, defaultLayers);

    if (loadId) {
      this.calculateRouteFromAtoB(true); // this one draws the recommended route
      await this.getRouteGPS(); // this one draws the points directly from gps_trackings
    }
  }

  onRouteSuccess(result) {
    const { gpsPointsPresent } = this.state;
    const wps = this.arragePoints(result);
    if (wps.length > 2) {
      this.addRouteShapeToMap({
        shape: wps
      });
      // if no points were obtained from GPS, draw markers
      if (!gpsPointsPresent) {
        this.setMarkersSimple();
      }
    }
  }

  onRouteSuccessRecommended(result) {
    const wps = this.arragePoints(result);
    if (wps.length >= 2) {
      this.addRouteShapeToMapRecommended({
        shape: wps
      });
      this.setState({
        gpsPointsPresent: true
      }, () => {
        this.setMarkersSimple();
      });
    }
  }

  onRouteError(error) {
    console.error(error);
  }

  async getRouteGPS() {
    const { loadId, loadStatus } = this.props;

    let wps = [];
    // instead of getting the info here, we will query the backend
    try {
      wps = await GPSTrackingService.getGPSTrackingByLoadId(loadId);
    } catch (e) {
      console.log('ERROR: ', e);
    }
    if (wps.length > maxPointsThreshold) {
      wps = this.reducer(wps);
    }
    // this.setMarkers(distanceInfo);
    if (wps.length >= 2) {
      this.addRouteShapeToMap({
        shape: wps
      }, true);
      this.setState({
        gpsPointsPresent: true
      });

      // since we have GPS positions, let's draw a little truck
      // in the final one, provided the status is not 'Ended'.
      // Before drawing the truck, let's make sure that the shift has not ended.
      const isShiftOn = await LoadService.isShiftOn(loadId);

      if (loadStatus !== 'Ended' && isShiftOn) {
        this.addTruckMarker({
          latitude: wps.pop()[0],
          longitude: wps.pop()[1]
        });
      }
    }
  }

  setMarkersSimple() {
    const { startAddress, endAddress } = this.props;
    this.addMarkersToMap(startAddress, endAddress);
    this.setState({
      loadedText: ''
    });
  }

  setInsideBounds(polyline) {
    try {
      const bounds = polyline.getBoundingBox();
      this.mapGPS.getViewModel().setLookAtData({
        bounds: GeoUtils.setZoomBounds(bounds)
      });
    } catch (e) {
      console.log('MAP ERROR: ', e);
    }
  }

  /**
   * Creates a H.map.Polyline from the shape of the route and adds it to the map.
   * @param {Object} route A route as received from the H.service.RoutingService
   */
  addRouteShapeToMapRecommended(route) {
    const { gpsPointsPresent } = this.state;
    const lineString = new H.geo.LineString();
    const routeShape = route.shape;

    routeShape.forEach((point) => {
      lineString.pushLatLngAlt(point[0], point[1]);
    });

    const polyline = new H.map.Polyline(lineString, {
      style: {
        lineWidth: 4,
        strokeColor: 'rgba(0, 201, 151, 0.45)'
      }
    });

    this.mapGPS.addObject(polyline);

    if (!gpsPointsPresent) {
      this.setInsideBounds(polyline);
    }
  }

  /**
   * Creates a H.map.Polyline from the shape of the route and adds it to the map.
   * @param {Object} route A route as received from the H.service.RoutingService
   */
  addRouteShapeToMap(route, center) {
    const lineString = new H.geo.LineString();
    const routeShape = route.shape;
    const lineStringReturn = new H.geo.LineString();
    let returnPointsCount = 0;

    routeShape.forEach((point) => {
      if (point[2] === 0) {
        lineString.pushLatLngAlt(point[0], point[1]);
      } else {
        lineStringReturn.pushLatLngAlt(point[0], point[1]);
        returnPointsCount += 1;
      }
    });

    const polyline = new H.map.Polyline(lineString, {
      style: {
        lineWidth: 2,
        strokeColor: 'rgb(0, 111, 83)'
      }
    });

    // Draw return line, if we have points
    if (returnPointsCount > 2) {
      const polylineHalf = new H.map.Polyline(lineStringReturn, {
        style: {
          lineWidth: 2,
          strokeColor: 'rgb(45, 140, 200)'
        }
      });
      this.mapGPS.addObject(polylineHalf);
    }

    // Add the polyline to the map
    this.mapGPS.addObject(polyline);

    if (center) {
      this.setInsideBounds(polyline);
    }
  }

  calculateRouteFromAtoB(recommended) {
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

    if (recommended) {
      router.calculateRoute(
        routeRequestParams,
        this.onRouteSuccessRecommended,
        this.onRouteError
      );
    } else {
      router.calculateRoute(
        routeRequestParams,
        this.onRouteSuccess,
        this.onRouteError
      );
    }
  }

  reducer(input) {
    const reduced = [];
    let reducerCount = 0;
    for (const wp of input) {
      if (reducerCount % reducer === 0) {
        reduced.push(wp);
      }
      reducerCount += 1;
    }
    return reduced;
  }

  arragePoints(result) {
    const route = result.response.route[0];
    const wps = [];
    for (const wp of route.shape) {
      const wpoint = wp.split(',');
      const newWp = [wpoint[0], wpoint[1], 0];
      wps.push(newWp);
    }
    return wps;
  }

  addMarkersToMap(startAddress, endAddress) {
    // const {startAddress, endAddress} = this.props;
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
    this.mapGPS.addObject(group);
  }

  addTruckMarker(truckPosition) {
    // const {startAddress, endAddress} = this.props;
    const truck = new H.map.Icon(
      `${window.location.origin}/${truckImg}`,
      {
        size: { w: 30, h: 30 }
        // anchor: { x: -15, y: -15 }
      }
    );

    const marker = new H.map.Marker(
      {
        lat: truckPosition.latitude, lng: truckPosition.longitude
      },
      { zIndex: 0, icon: truck }
    );

    const groupTruck = new H.map.Group();
    groupTruck.addObjects([marker]);
    this.mapGPS.addObject(groupTruck);
  }

  renderLoader() {
    const { loadedText } = this.state;
    if (loadedText !== '') {
      return (
        <React.Fragment>
          {loadedText}
          <div className="load__icon-wrap">
            <svg className="load__icon">
              <path fill="#4ce1b6" d="M12,4V2A10,10 0 0,0 2,12H4A8,8 0 0,1 12,4Z"/>
            </svg>
          </div>
        </React.Fragment>
      );
    }
    return false;
  }

  render() {
    const {width, height, id } = this.props;
    return (
      <React.Fragment>
        <section
          style={{width, height}}
          id={`mapContainer${id}`}
        />
        {this.renderLoader()}
      </React.Fragment>
    );
  }
}

TMapGPS.propTypes = {
  id: PropTypes.string,
  width: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  height: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  zoom: PropTypes.number,
  loadId: PropTypes.number,
  loadStatus: PropTypes.string,
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
  })
};

TMapGPS.defaultProps = {
  id: '1',
  width: 400,
  height: 400,
  zoom: 10,
  loadId: 0,
  loadStatus: null,
  center: null,
  startAddress: null,
  endAddress: null
};

export default TMapGPS;
