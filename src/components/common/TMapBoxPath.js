import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import mapboxgl from 'mapbox-gl';
import { Container } from 'reactstrap';
import './css/mapBox.css';

class TMapBoxPath extends PureComponent {
  componentDidMount() {
    const { gpsTrackings } = this.props;
    this.setMap(gpsTrackings);
  }

  setMap(gpsTrackings) {
    // const cPointOrigin = waypoints[0];
    // const cPointDestination = waypoints[waypoints.length - 1];

    mapboxgl.accessToken = process.env.MAPBOX_API;
    const map = new mapboxgl.Map({
      container: 'map',
      style: 'mapbox://styles/mapbox/streets-v11',
      center: [-97.7430608, 30.267153],
      zoom: 13,
      mode: 'driving',
      attributionControl: false
    });

    map.on('load', () => {
      map.addLayer({
        id: 'route',
        type: 'line',
        source: {
          type: 'geojson',
          data: {
            type: 'Feature',
            properties: {},
            geometry: {
              type: 'LineString',
              coordinates: gpsTrackings
            }
          }
        }
      });
    });
  }

  render() {
    return (
      <Container className="dashboard">
        <div id="map" />
      </Container>
    );
  }
}

TMapBoxPath.propTypes = {
  gpsTrackings: PropTypes.array.isRequired
};

export default TMapBoxPath;
