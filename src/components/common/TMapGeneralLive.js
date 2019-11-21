import React, {Component} from 'react';
import * as PropTypes from 'prop-types';
// import truckIcon from '../../img/icons8-truck-30.png';
import LoadsService from '../../api/LoadService';
// import { type } from 'os';
import './overrides.scss';
import GeoUtils from '../../utils/GeoUtils';

const refreshInterval = 15; // refresh every 15 seconds
let timerVar;
let count = 0;

const groupTrackings = new H.map.Group();

class TMapGeneralLive extends Component {
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
    this.programmedRefresh = this.programmedRefresh.bind(this);
    this.addMarkerToGroup = this.addMarkerToGroup.bind(this);
    this.removeObjects = this.removeObjects.bind(this);
  }

  componentDidMount() {
    const {
      zoom,
      center
    } = this.props;
    const defaultLayers = this.platform.createDefaultLayers();
    const mapDiv = document.getElementById('generalMap');
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

    this.getLatestGPSForLoad();
    this.programmedRefresh(false);
    // console.log('>> This is a live view...')
  }

  componentWillUnmount() {
    this.programmedRefresh(true);
  }

  onRouteError(error) {
    console.error(error);
  }

  async getLatestGPSForLoad() {
    const { profileType, profileCompanyId, onTrucksLoaded } = this.props;
    let gpsTrackings = [];

    if (profileType === 'Carrier') {
      // if carrier
      /*
      showing all the trucks that are working for that carrier
      (independent of job). This is for ALL TRUCKS that
      are on a shift.
      */
      // console.log('This is a Carrier', profileCompanyId);
      gpsTrackings = await LoadsService.getLastGPSForCompanyId(profileCompanyId);
    } else if (profileType === 'Customer') {
      // if customer
      /*
      all jobs with an open shift and that are working for
      the customerâ€™s company -linked by the
      customerSchedulerCompanyId from loads
      */
      // console.log('This is a Customer', profileCompanyId);
      gpsTrackings = await LoadsService.getLastGPSForSchedulerCustomer(profileCompanyId);
    }

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

    onTrucksLoaded(gpsTrackings.length);

    // set zoom and margin
    if (gpsTrackings.length > 0) {
      const bounds = groupTrackings.getBoundingBox();
      this.map.getViewModel().setLookAtData({
        bounds: GeoUtils.setZoomBounds(bounds)
      });
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

  addGPSPoint(
    latitude,
    longitude,
    strokeColor = 'rgba(0, 0, 255, 0.5)',
    fillColor = 'rgba(255, 255, 255, 0.5)'
  ) {
    // console.log('>>Trying to add load: ', arguments);
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
        // console.log(`>>>REFRESHING: ${Date.now()} COUNT: ${count}`);
        that.getLatestGPSForLoad();
      };
      timerVar = setInterval(timerTimer, (refreshInterval * 1000));
    } else {
      clearInterval(timerVar);
    }
  }

  render() {
    const {width, height} = this.props;
    return (
      <section style={{width, height}} id="generalMap"/>
    );
  }
}

TMapGeneralLive.propTypes = {
  // id: PropTypes.string,
  width: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  height: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  zoom: PropTypes.number,
  center: PropTypes.shape({
    lat: PropTypes.number,
    lng: PropTypes.number
  }),
  profileType: PropTypes.string,
  profileCompanyId: PropTypes.number,
  onTrucksLoaded: PropTypes.func
};

TMapGeneralLive.defaultProps = {
  // id: '1',
  width: 400,
  height: 400,
  zoom: 4,
  center: {
    lat: 39.850033,
    lng: -87.6500523
  },
  profileType: null,
  profileCompanyId: null,
  onTrucksLoaded: null
};

export default TMapGeneralLive;
