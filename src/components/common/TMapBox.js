import React, { PureComponent } from 'react';
// import PropTypes from 'prop-types';
import mapboxgl from 'mapbox-gl';

// MapBox Quick Start Guide
//    https://docs.mapbox.com/mapbox-gl-js/overview/#quickstart
//
// MapBox CSS
// is included in src/index.html:
//    <link href=’https://api.tiles.mapbox.com/mapbox-gl-js/dist/mapbox-gl.css' rel=’stylesheet’ />
//
// mapboxgl.accessToken = 'pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpejY4M29iazA2Z2gycXA4N2pmbDZmangifQ.-g_vE53SD2WrJ6tFX7QHmA';
// const mapkey = `https://maps.googleapis.com/maps/api/js?key=${process.env.GOOGLE_MAPS_API}&v=3.exp&libraries=geometry,drawing,places`;
//
// mapboxgl is defined in import mapboxgl object
//

mapboxgl.accessToken = process.env.MAPBOX_API;

// const mapboxAPI = 'https://api.mapbox.com';

class TMapBox extends PureComponent {

  constructor(props) {
    super(props);
    // console.log("TMapBox.constructor");
    // console.log(props);
    // console.log("TMapBox.constructor .props.state");
    // console.log(props.state);


    this.state = {
      lat: props.state.lat,
      lng: props.state.lng,
      zoom: props.state.zoom
    };
    // console.log("TMapBox.constructor.state");
    // console.log(this.state);

  }

  componentDidMount() {
    const { lng, lat, zoom } = this.state;

    // console.log("TMapBox.componentDidMount");
    // console.log(lat);
    // console.log(lng);
    // console.log(zoom);

    const map = new mapboxgl.Map({
      container: this.mapContainer,
      style: 'mapbox://styles/mapbox/streets-v9',
      center: [lng, lat],
      zoom
    });

    // console.log(map);

    map.on('move', () => {
      const { lng, lat } = map.getCenter();

      this.setState({
        lng: lng.toFixed(4),
        lat: lat.toFixed(4),
        zoom: map.getZoom().toFixed(2)
      });
    });
  }

  render() {
    const { lng, lat, zoom } = this.state;

    return (
      <div>
        <div className="inline-block absolute top left mt12 ml12 bg-darken75 color-white z1 py6 px12 round-full txt-s txt-bold">
          <div>{`Longitude: ${lng} Latitude: ${lat} Zoom: ${zoom}`}</div>
        </div>
        <div ref={el => this.mapContainer = el} className="absolute top right left bottom" />
      </div>
    );
  }

}

export default TMapBox;