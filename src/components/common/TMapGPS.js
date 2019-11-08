import React, {Component} from 'react';
import * as PropTypes from 'prop-types';
import pinA from '../../img/PinA.png';
import pinB from '../../img/PinB.png';
import GeoUtils from '../../utils/GeoUtils';
import MapService from '../../api/MapService';
import GPSTrackingService from '../../api/GPSTrackingService';

// this reduces the results times the number specified
const reducer = 10; // one tenth
const maxPointsThreshold = 400;

class TMapGPS extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loadedText: 'Loading route'
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

    // this.calculateRouteFromAtoB = this.calculateRouteFromAtoB.bind(this);
    this.calculateRouteGPS = this.calculateRouteGPS.bind(this);
    this.addRouteShapeToMap = this.addRouteShapeToMap.bind(this);
    this.addMarkersToMap = this.addMarkersToMap.bind(this);
    this.reducer = this.reducer.bind(this);
    this.setMarkers = this.setMarkers.bind(this);
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
      // await this.calculateRouteGPS(); // this queries here.com for the api route
      await this.getRouteGPS(); // this one draws the points directly from gps_trackings
    }
  }

  async getRouteGPS() {
    const { loadId } = this.props;

    let distanceInfo = [];
    let wps = [];
    // instead of getting the info here, we will query the backend
    try {
      distanceInfo = await GPSTrackingService.getGPSTrackingByLoadId(loadId);
    } catch (e) {
      console.log('ERROR: ', e);
    }
    /*
    for (const wp of distanceInfo) {
      let newWp = '';
      // newWp = `${wp[1]},${wp[0]}`;
      wps.push(newWp);
    }
    */
    if (distanceInfo.length > maxPointsThreshold) {
      distanceInfo = this.reducer(distanceInfo);
    }
    this.setMarkers(distanceInfo);
  }

  setMarkers(distanceInfo) {
    // markers
    if (distanceInfo.length > 1) {
      const start = distanceInfo[0];
      const end = distanceInfo.pop();
      const startAddress = {
        latitude: start[0],
        longitude: start[1]
      };
      const endAddress = {
        latitude: end[0],
        longitude: end[1]
      };
      this.addMarkersToMap(startAddress, endAddress);
      this.setState({
        loadedText: ''
      });

      try {
        this.addRouteShapeToMap({
          shape: distanceInfo
        });
      } catch (e) {
        console.log('TCL: ERROR_>', e);
      }
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
    // console.log('TCL: Total REDUCED -> wps', reduced.length, reduced);
    return reduced;
  }

  async calculateRouteGPS() {
    const { loadId } = this.props;

    let distanceInfo = [];
    let wps = [];
    // instead of getting the info here, we will query the backend
    try {
      distanceInfo = await MapService.getDistanceForFleet(loadId);
    } catch (e) {
      console.log('ERROR: ', e);
    }

    for (const wp of distanceInfo.waypoints) {
      let newWp = '';
      /*
      if (wp.mappedPosition.latitude === 0 || wp.mappedPosition.longitude === 0) {
        newWp = `${wp.originalPosition.latitude},${wp.originalPosition.longitude}`;
      } else {
        newWp = `${wp.mappedPosition.latitude},${wp.mappedPosition.longitude}`;
      }
      */
      // use only original
      newWp = `${wp.originalPosition.latitude},${wp.originalPosition.longitude}`;
      wps.push(newWp);
    }

    if (wps.length > maxPointsThreshold) {
      wps = this.reducer(wps);
    }
    this.setMarkers(wps);
  }

  /**
   * Creates a H.map.Polyline from the shape of the route and adds it to the map.
   * @param {Object} route A route as received from the H.service.RoutingService
   */
  addRouteShapeToMap(route) {
    const lineString = new H.geo.LineString();
    const routeShape = route.shape;
    const lineStringReturn = new H.geo.LineString();

    routeShape.forEach((point) => {
      lineString.pushLatLngAlt(point[0], point[1]);
      
      // Return route
      if (point[2] === 1) {
        lineStringReturn.pushLatLngAlt(point[0], point[1]);
      }
    });

    const polyline = new H.map.Polyline(lineString, {
      style: {
        lineWidth: 2,
        strokeColor: 'rgb(0, 111, 83)'
      }
    });
    // Return poliline
    const polylineHalf = new H.map.Polyline(lineStringReturn, {
      style: {
        lineWidth: 2,
        strokeColor: 'rgb(45, 140, 200)'
      }
    });

    // Add the polyline to the map
    this.mapGPS.addObject(polyline);
    const bounds = polyline.getBoundingBox();
    const newBounds = GeoUtils.setZoomBounds(bounds);

    // Add the return polyline to the map
    this.mapGPS.addObject(polylineHalf);

    // And zoom to its bounding rectangle
    this.mapGPS.getViewModel().setLookAtData({
      newBounds
    });
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
    const bounds = group.getBoundingBox(); // H.geo.Rect
    // And zoom to its bounding rectangle
    this.mapGPS.getViewModel().setLookAtData({
      bounds: GeoUtils.setZoomBounds(bounds)
    });
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
  center: null,
  startAddress: null,
  endAddress: null
};

export default TMapGPS;
