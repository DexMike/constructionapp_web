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
    this.setMap(input.origin, input.destination);
  }

  setMap(origin, destination) {
    mapboxgl.accessToken = 'pk.eyJ1IjoicmF1bHRyZWxhciIsImEiOiJjanV1MnVkM2wwZWY1NDNrZjZ5dXJkbTR4In0.rMU0bd9xlsFxupjk7vlWhA';
    const map = new mapboxgl.Map({
      container: 'map',
      style: 'mapbox://styles/mapbox/streets-v11',
      center: [-97.7430608, 30.267153],
      zoom: 13,
      mode: 'driving',
      attributionControl: false
    });

    map.on('load', () => {
      const directions = new MapboxDirections(
        {
          accessToken: mapboxgl.accessToken,
          container: 'directions', // Specify an element thats not the map container.
          // UI controls
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
    });
  }

  render() {
    return (
      <Container className="dashboard">
        <div id="map" />
        <div id="extras" />
      </Container>
    );
  }
}

TMapBoxOriginDestination.propTypes = {
  input: PropTypes.shape({
    origin: PropTypes.string,
    destination: PropTypes.string
  }).isRequired
};

export default TMapBoxOriginDestination;
