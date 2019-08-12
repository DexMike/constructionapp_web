import React, {Component} from 'react';
import * as PropTypes from 'prop-types';

class TMap extends Component {
  componentDidMount() {
    const { zoom, center, id } = this.props;

    const platform = new H.service.Platform({
      apikey: process.env.HERE_MAPS_API_KEY,
      useCIT: true,
      app_id: process.env.HERE_MAPS_APP_ID,
      app_code: process.env.HERE_MAPS_APP_CODE,
      useHTTPS: true
    });

    const defaultLayers = platform.createDefaultLayers();
    const mapDiv = document.getElementById(`mapContainer${id}`);
    const mapOptions = {};
    mapOptions.center = center;
    mapOptions.zoom = zoom;
    const map = new H.Map(mapDiv, defaultLayers.vector.normal.map, mapOptions);
  }

  render() {
    const {width, height, id} = this.props;
    return (
      <div style={{width, height}} id={`mapContainer${id}`}/>
    );
  }
}

TMap.propTypes = {
  id: PropTypes.number,
  width: PropTypes.number,
  height: PropTypes.number,
  zoom: PropTypes.number,
  center: PropTypes.shape({
    lat: PropTypes.number,
    lng: PropTypes.number
  })
};

TMap.defaultProps = {
  id: 1,
  width: 400,
  height: 400,
  zoom: 10,
  center: {
    lat: 30.274983,
    lng: -97.739604
  }
};

export default TMap;
