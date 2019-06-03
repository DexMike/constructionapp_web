import React, {PureComponent} from 'react';
import PropTypes from 'prop-types';
import mapboxgl from 'mapbox-gl';
import {Container} from 'reactstrap';
import './css/mapBox.css';
import LoadService from "../../api/LoadService";

class TMapBoxPath extends PureComponent {
  async componentDidMount() {
    const {loadId, gpsTrackings} = this.props;
    const load = await LoadService.getLoadById(loadId);
    this.setMap(loadId, gpsTrackings, load);
  }

  setMap(loadId, gpsTrackings, load) {
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
      const markerStart = new mapboxgl.Marker().setLngLat(gpsTrackings[0]).addTo(map);
    });

    map.on('load', () => {
      const markerEnd = new mapboxgl.Marker().setLngLat(gpsTrackings[gpsTrackings.length - 1]).addTo(map);
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
        },
        paint: {
          'line-width': 3,
          'line-color': 'rgb(63, 177, 205)'
        }
      });

      map.addLayer({
        id: 'points',
        type: 'symbol',
        source: {
          type: 'geojson',
          data: {
            type: 'FeatureCollection',
            features: [{
              type: 'Feature',
              geometry: {
                type: 'Point',
                coordinates: gpsTrackings[0]
              },
              properties: {
                title: 'Start'
              }
            }, {
              type: 'Feature',
              geometry: {
                type: 'Point',
                coordinates: gpsTrackings[gpsTrackings.length - 1]
              },
              properties: {
                title: load.loadStatus === 'Started' ? 'In Progress' : 'Finish'
              }
            }]
          }
        },
        layout: {
          'text-field': '{title}',
          'text-font': ['Open Sans Semibold', 'Arial Unicode MS Bold'],
          'text-offset': [0, 0.6],
          'text-anchor': 'top'
        }
      });
    });


  }

  render() {
    const {loadId} = this.props;
    return (
      <Container className="dashboard">
        <div id={`map_${loadId}`} style={{width: '100%', height: '400px'}}/>
      </Container>
    );
  }
}

TMapBoxPath.propTypes = {
  gpsTrackings: PropTypes.array.isRequired,
  loadId: PropTypes.number.isRequired
};

export default TMapBoxPath;
