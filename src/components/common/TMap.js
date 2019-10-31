import React, {Component} from 'react';
import * as PropTypes from 'prop-types';
import pinA from '../../img/PinA.png';
import pinB from '../../img/PinB.png';
import GeoUtils from '../../utils/GeoUtils';

const waypoints = [
	{
		"latitude" : 30.35647583,
		"longitude" : -97.73683213
	},
	{
		"latitude" : 30.35648651,
		"longitude" : -97.73683213
	},
	{
		"latitude" : 30.35624695,
		"longitude" : -97.73679066
	},
	{
		"latitude" : 30.35624850,
		"longitude" : -97.73679066
	},
	{
		"latitude" : 30.35609976,
		"longitude" : -97.73666628
	},
	{
		"latitude" : 30.35579936,
		"longitude" : -97.73657835
	},
	{
		"latitude" : 30.35546782,
		"longitude" : -97.73655741
	},
	{
		"latitude" : 30.35502630,
		"longitude" : -97.73640124
	},
	{
		"latitude" : 30.35420712,
		"longitude" : -97.73611028
	},
	{
		"latitude" : 30.35456325,
		"longitude" : -97.73623699
	},
	{
		"latitude" : 30.35383706,
		"longitude" : -97.73597466
	},
	{
		"latitude" : 30.35346064,
		"longitude" : -97.73577077
	},
	{
		"latitude" : 30.35317771,
		"longitude" : -97.73541881
	},
	{
		"latitude" : 30.35303396,
		"longitude" : -97.73508184
	},
	{
		"latitude" : 30.35285985,
		"longitude" : -97.73466756
	},
	{
		"latitude" : 30.35264067,
		"longitude" : -97.73416904
	},
	{
		"latitude" : 30.35245779,
		"longitude" : -97.73377112
	},
	{
		"latitude" : 30.35222649,
		"longitude" : -97.73337541
	},
	{
		"latitude" : 30.35219836,
		"longitude" : -97.73333169
	},
	{
		"latitude" : 30.35184243,
		"longitude" : -97.73359421
	},
	{
		"latitude" : 30.35146593,
		"longitude" : -97.73380094
	},
	{
		"latitude" : 30.35107905,
		"longitude" : -97.73406042
	},
	{
		"latitude" : 30.35068144,
		"longitude" : -97.73432896
	},
	{
		"latitude" : 30.35029799,
		"longitude" : -97.73456825
	},
	{
		"latitude" : 30.34993480,
		"longitude" : -97.73479602
	},
	{
		"latitude" : 30.34955111,
		"longitude" : -97.73502232
	},
	{
		"latitude" : 30.34912228,
		"longitude" : -97.73527624
	},
	{
		"latitude" : 30.34879151,
		"longitude" : -97.73549794
	},
	{
		"latitude" : 30.34840152,
		"longitude" : -97.73572049
	},
	{
		"latitude" : 30.34799968,
		"longitude" : -97.73593344
	},
	{
		"latitude" : 30.34760786,
		"longitude" : -97.73617681
	},
	{
		"latitude" : 30.34719698,
		"longitude" : -97.73645019
	},
	{
		"latitude" : 30.34678239,
		"longitude" : -97.73670267
	},
	{
		"latitude" : 30.34636382,
		"longitude" : -97.73697667
	},
	{
		"latitude" : 30.34584288,
		"longitude" : -97.73736909
	},
	{
		"latitude" : 30.34530987,
		"longitude" : -97.73770214
	},
	{
		"latitude" : 30.34489047,
		"longitude" : -97.73795487
	},
	{
		"latitude" : 30.34441018,
		"longitude" : -97.73819660
	},
	{
		"latitude" : 30.34388788,
		"longitude" : -97.73839423
	},
	{
		"latitude" : 30.34336254,
		"longitude" : -97.73853593
	},
	{
		"latitude" : 30.34286787,
		"longitude" : -97.73859623
	},
	{
		"latitude" : 30.34235018,
		"longitude" : -97.73867066
	},
	{
		"latitude" : 30.34184518,
		"longitude" : -97.73875330
	},
	{
		"latitude" : 30.34135911,
		"longitude" : -97.73883679
	},
	{
		"latitude" : 30.34091145,
		"longitude" : -97.73890154
	},
	{
		"latitude" : 30.34047646,
		"longitude" : -97.73897438
	},
	{
		"latitude" : 30.34006475,
		"longitude" : -97.73904265
	},
	{
		"latitude" : 30.33969027,
		"longitude" : -97.73910962
	},
	{
		"latitude" : 30.33925714,
		"longitude" : -97.73917733
	},
	{
		"latitude" : 30.33892447,
		"longitude" : -97.73923060
	},
	{
		"latitude" : 30.33865517,
		"longitude" : -97.73928610
	},
	{
		"latitude" : 30.33828434,
		"longitude" : -97.73934948
	},
	{
		"latitude" : 30.33787015,
		"longitude" : -97.73940231
	},
	{
		"latitude" : 30.33741191,
		"longitude" : -97.73947667
	},
	{
		"latitude" : 30.33697391,
		"longitude" : -97.73954355
	},
	{
		"latitude" : 30.33651325,
		"longitude" : -97.73962240
	},
	{
		"latitude" : 30.33606670,
		"longitude" : -97.73968979
	},
	{
		"latitude" : 30.33560839,
		"longitude" : -97.73976375
	},
	{
		"latitude" : 30.33522814,
		"longitude" : -97.73982401
	},
	{
		"latitude" : 30.33484165,
		"longitude" : -97.73979469
	},
	{
		"latitude" : 30.33484165,
		"longitude" : -97.73979469
	},
	{
		"latitude" : 30.33484162,
		"longitude" : -97.73979467
	},
	{
		"latitude" : 30.33499065,
		"longitude" : -97.73985056
	},
	{
		"latitude" : 30.33494066,
		"longitude" : -97.73984059
	},
	{
		"latitude" : 30.33458732,
		"longitude" : -97.73987878
	},
	{
		"latitude" : 30.33431208,
		"longitude" : -97.73991926
	},
	{
		"latitude" : 30.33392527,
		"longitude" : -97.73997108
	},
	{
		"latitude" : 30.33349185,
		"longitude" : -97.74001317
	},
	{
		"latitude" : 30.33305266,
		"longitude" : -97.74004985
	},
	{
		"latitude" : 30.33261709,
		"longitude" : -97.74007487
	},
	{
		"latitude" : 30.33218839,
		"longitude" : -97.74006351
	},
	{
		"latitude" : 30.33172847,
		"longitude" : -97.74003383
	},
	{
		"latitude" : 30.33127169,
		"longitude" : -97.74000436
	},
	{
		"latitude" : 30.33086591,
		"longitude" : -97.73997817
	},
	{
		"latitude" : 30.33047111,
		"longitude" : -97.73995269
	},
	{
		"latitude" : 30.33027990,
		"longitude" : -97.73994035
	},
	{
		"latitude" : 30.33000879,
		"longitude" : -97.73992502
	},
	{
		"latitude" : 30.32966305,
		"longitude" : -97.73990086
	},
	{
		"latitude" : 30.32938544,
		"longitude" : -97.73988146
	},
	{
		"latitude" : 30.32910725,
		"longitude" : -97.73986202
	},
	{
		"latitude" : 30.32869177,
		"longitude" : -97.73982994
	},
	{
		"latitude" : 30.32826323,
		"longitude" : -97.73979240
	},
	{
		"latitude" : 30.32783631,
		"longitude" : -97.73975889
	},
	{
		"latitude" : 30.32736852,
		"longitude" : -97.73976354
	},
	{
		"latitude" : 30.32689077,
		"longitude" : -97.73974520
	},
	{
		"latitude" : 30.32644706,
		"longitude" : -97.73972817
	},
	{
		"latitude" : 30.32599065,
		"longitude" : -97.73969532
	},
	{
		"latitude" : 30.32552879,
		"longitude" : -97.73967062
	},
	{
		"latitude" : 30.32503605,
		"longitude" : -97.73961707
	},
	{
		"latitude" : 30.32452335,
		"longitude" : -97.73953111
	},
	{
		"latitude" : 30.32404151,
		"longitude" : -97.73949103
	},
	{
		"latitude" : 30.32356519,
		"longitude" : -97.73945387
	},
	{
		"latitude" : 30.32312602,
		"longitude" : -97.73942019
	},
	{
		"latitude" : 30.32271610,
		"longitude" : -97.73938876
	},
	{
		"latitude" : 30.32239866,
		"longitude" : -97.73936638
	},
	{
		"latitude" : 30.32209832,
		"longitude" : -97.73934811
	},
	{
		"latitude" : 30.32191768,
		"longitude" : -97.73933512
	},
	{
		"latitude" : 30.32155019,
		"longitude" : -97.73930756
	},
	{
		"latitude" : 30.32111864,
		"longitude" : -97.73927519
	},
	{
		"latitude" : 30.32064337,
		"longitude" : -97.73923955
	},
	{
		"latitude" : 30.32009082,
		"longitude" : -97.73919811
	},
	{
		"latitude" : 30.31960013,
		"longitude" : -97.73917032
	},
	{
		"latitude" : 30.31903448,
		"longitude" : -97.73930400
	},
	{
		"latitude" : 30.31860972,
		"longitude" : -97.73956033
	},
	{
		"latitude" : 30.31819656,
		"longitude" : -97.73981938
	},
	{
		"latitude" : 30.31782663,
		"longitude" : -97.74005437
	},
	{
		"latitude" : 30.31740728,
		"longitude" : -97.74031574
	},
	{
		"latitude" : 30.31702907,
		"longitude" : -97.74055146
	},
	{
		"latitude" : 30.31666879,
		"longitude" : -97.74077599
	},
	{
		"latitude" : 30.31627523,
		"longitude" : -97.74100859
	},
	{
		"latitude" : 30.31588581,
		"longitude" : -97.74124909
	},
	{
		"latitude" : 30.31563613,
		"longitude" : -97.74140472
	},
	{
		"latitude" : 30.31567028,
		"longitude" : -97.74145335
	}
]
;

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
    this.calculateRouteMultiple = this.calculateRouteMultiple.bind(this);
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

      /*
      this.calculateRouteFromAtoB();
      this.addMarkersToMap();
      */
      this.calculateRouteMultiple();
    }

    // https://trelar.atlassian.net/browse/SG-930
    // don't delete commented code, please
    /*
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
    */
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
    console.log('>>GETING ROUTE FROM A TO B')
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

  calculateRouteMultiple() {
    console.log('>>GETING ROUTE MULTIPLE...')
    const {startAddress, endAddress} = this.props;
    const router = this.platform.getRoutingService();

    const wps = [];
    let count = 0;
    
    /**/
    for (const wp of waypoints) {
      const newWp = `${wp.latitude},${wp.longitude}`;
      wps.push(newWp);
    }
    console.log("TCL: TMap -> calculateRouteMultiple -> wps", wps)
    

    const routeRequestParams = {
      mode: 'balanced;truck;traffic:disabled;motorway:0',
      representation: 'display',
      routeattributes: 'no,lg',
      RouteLegAttributeType: 'wp,mn',
      maneuverattributes: 'direction,action',
      metricSystem: 'imperial',
      language: 'en-us', // en-us|es-es|de-de
      routeMatch:1
      // route: wps,
      // waypoint0: wps[0],
      // waypoint1: wps[wps.length - 1]
    };

    
    for (const wp of waypoints) {
      routeRequestParams['waypoint'+count] = `${wp.latitude},${wp.longitude}`;
      //wps.push(newWp);
      count ++;
    }
    /**/

    console.log("TCL: router", router)

    try {
        router.calculateRoute(
        routeRequestParams,
        this.onRouteSuccess,
        this.onRouteError
      );
    } catch (e) {
      console.log('>>ERROR: ', e);
    }
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

    let bounds = polyline.getBoundingBox(); // H.geo.Rect
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
    /*
    this.map.getViewModel().setLookAtData({
      bounds: polyline.getBoundingBox()
    });
    */
   
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
