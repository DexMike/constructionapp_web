import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import mapboxgl from 'mapbox-gl';
import { Container } from 'reactstrap';
import './css/mapBox.css';

class TMapBoxOriginDestination extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      origin: '',
      destination: '',
      zoom: 13
    };
  }

  componentDidMount() {
    const { input } = this.props;
    const waypoints = input.gpsData.gps;
    this.setMap(input.origin, input.destination, waypoints, input.coords);
  }

  setMap(origin, destination, waypoints, coords) {

    mapboxgl.accessToken = process.env.MAPBOX_API;
    const map = new mapboxgl.Map({
      container: 'map',
      style: 'mapbox://styles/mapbox/streets-v11',
      center: [-97.7430608, 30.267153],
      zoom: 13,
      mode: 'driving',
      attributionControl: false
    });

    map.on('click', this.clickHandler());

    map.on('load', () => {
      // FIRST
      const directions = new MapboxDirections(
        {
          accessToken: mapboxgl.accessToken,
          // unit: 'metric',
          // profile: 'driving',
          container: 'directions', // Specify an element thats not the map container.
          controls: {
            inputs: false,
            instructions: false
          }
        }
      );
      map.addControl(directions, 'top-left');
      map.addControl(new mapboxgl.FullscreenControl());
      directions.setOrigin(origin);
      directions.setDestination(destination);

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
              coordinates: coords
            }
          }
        },
        layout: {
          'line-join': 'round',
          'line-cap': 'round'
        },
        paint: {
          'line-color': '#888',
          'line-width': 8
        }
      });

      // Plot the actual route (as recorded by GPS)
      map.addLayer({
        id: 'points',
        type: 'symbol',
        source: {
          type: 'geojson',
          data: {
            type: 'FeatureCollection',
            features: waypoints
          }
        },
        layout: {
          'icon-image': '{icon}-15',
          'text-field': '{title}',
          'text-font': ['Open Sans Semibold', 'Arial Unicode MS Bold'],
          'text-offset': [0, 0.6],
          'text-anchor': 'top'
        }
      });
    });
  }

  clickHandler() {
    return false;
  }

  render() {
    return (
      <Container className="dashboard">
        <div id="map" />
      </Container>
    );
  }
}

TMapBoxOriginDestination.propTypes = {
  input: PropTypes.shape({
    origin: PropTypes.string,
    destination: PropTypes.string,
    gpsData: PropTypes.object,
    gpsCoords: PropTypes.object
  }).isRequired
};

export default TMapBoxOriginDestination;
