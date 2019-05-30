import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import mapboxgl from 'mapbox-gl';
import { Container } from 'reactstrap';
import './css/mapBox.css';

class TMapBoxPath extends PureComponent {
  componentDidMount() {
    const { loadId, gpsTrackings } = this.props;
    this.setMap(loadId, gpsTrackings);
  }

  setMap(loadId, gpsTrackings) {
    const center = Math.floor(gpsTrackings.length / 2);
    mapboxgl.accessToken = process.env.MAPBOX_API;
    const map = new mapboxgl.Map({
      container: `map_${loadId}`,
      style: 'mapbox://styles/mapbox/streets-v11',
      center: [gpsTrackings[center][0], gpsTrackings[center][1]],
      zoom: 15,
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
    const { loadId } = this.props;
    return (
      <Container className="dashboard">
        <div id={`map_${loadId}`} style={{width: '100%', height: '400px'}} />
      </Container>
    );
  }
}

TMapBoxPath.propTypes = {
  gpsTrackings: PropTypes.array.isRequired,
  loadId: PropTypes.number.isRequired
};

export default TMapBoxPath;
