import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import mapboxgl from 'mapbox-gl';
import { Container } from 'reactstrap';
import './css/mapBox.css';

mapboxgl.accessToken = process.env.MAPBOX_API;
// console.log(process.env.MAPBOX_API);
// console.log(process.env.GOOGLE_MAPS_API);

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
    this.setMap(input.origin, input.destination, waypoints);
  }

  setMap(origin, destination, waypoints) {
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

      // This is a reference, please do not delete
      /*
      const directionsTwo = new MapboxDirections(
        {
          accessToken: mapboxgl.accessToken,
          container: 'directions',
          controls: {
            inputs: false,
            instructions: false
          }
        }
      );
      map.addControl(directionsTwo, 'top-left');
      map.addControl(new mapboxgl.FullscreenControl());
      directionsTwo.setOrigin(cPointOrigin);

      if (waypoints.length > 1) {
        for (let i = 0; i < waypoints.length; i += 1) {
          const loc = {
            type: 'Feature',
            geometry: {
              type: 'Point',
              coordinates: [
                waypoints[i][1],
                waypoints[i][0]
              ]
            },
            properties: {
              title: 'Mapbox DC',
              icon: 'monument'
            }
          };
          directionsTwo.addWaypoint(i, loc);
        }
        directionsTwo.setDestination(cPointDestination);
      }
      */

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
    gpsData: PropTypes.object
  }).isRequired
};

export default TMapBoxOriginDestination;
