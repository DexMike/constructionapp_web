import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';

const {
  compose,
  withProps,
  lifecycle
} = require('recompose');
const {
  withScriptjs,
  withGoogleMap,
  GoogleMap,
  DirectionsRenderer
} = require('react-google-maps');

class TMap extends PureComponent {
  doRender() {
    const { directions } = this.props;
    this.renderGmap(directions);
  }

  renderGmap(directions, google) {
    return (
      <GoogleMap
        defaultZoom={7}
        defaultCenter={
          new google.maps.LatLng(41.8507300, -87.6512600)
        }
      >
        {directions && <DirectionsRenderer directions={directions} />}
      </GoogleMap>
    );
  }

  render() {
    // Map test ////////////////////////////////////////////////////

    const { input } = this.props;

    const props = withProps({
      googleMapURL: 'https://maps.googleapis.com/maps/api/js?key=AIzaSyAsnyBy0GMNoCQxfm0CxaAF-ys_2HNDCOc&v=3.exp&libraries=geometry,drawing,places',
      loadingElement: <div style={{ height: '100%' }} />,
      containerElement: <div style={{ height: '400px' }} />,
      mapElement: <div style={{ height: '100%' }} />
    });

    const lifecycleMap = lifecycle({
      componentDidMount() {
        const DirectionsService = new google.maps.DirectionsService();
        const address1 = input.origin;
        const address2 = input.destination;

        DirectionsService.route({
          origin: address1,
          destination: address2,
          travelMode: google.maps.TravelMode.DRIVING
        }, (result, status) => {
          if (status === google.maps.DirectionsStatus.OK) {
            this.setState({
              directions: result
            });
          } else {
            // console.error(` error fetching directions ${result}`);
          }
        });
      }
    });

    const MapWithADirectionsRenderer = compose(
      props,
      withScriptjs,
      withGoogleMap,
      lifecycleMap
    )(props => (
      <GoogleMap
        defaultZoom={7}
        defaultCenter={
          new google.maps.LatLng(41.8507300, -87.6512600)
        }
      >
        {props.directions && <DirectionsRenderer directions={props.directions} />}
      </GoogleMap>
    ));

    return (
      <MapWithADirectionsRenderer />
    );
  }

  // Map test ends //////////////////////////////////////////////
}

TMap.propTypes = {
  input: PropTypes.shape({
    origin: PropTypes.string,
    destination: PropTypes.string
  }).isRequired
};

export default TMap;
