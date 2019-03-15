import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
// import { GoogleMap, Marker } from 'react-google-maps';

class TMap extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      directions: null
    };
  }

  render() {
    // Map test ////////////////////////////////////////////////////
    const { compose, withProps, lifecycle } = require('recompose');
    const { input } = this.props;
    // const { directions } = this.state;

    console.log('>>>INOUT INFO:');
    console.log(input);
    const {
      withScriptjs,
      withGoogleMap,
      GoogleMap,
      DirectionsRenderer
    } = require('react-google-maps');
    let googleCenter = null;
    const MapWithADirectionsRenderer = compose(
      withProps({
        googleMapURL: 'https://maps.googleapis.com/maps/api/js?key=AIzaSyAsnyBy0GMNoCQxfm0CxaAF-ys_2HNDCOc&v=3.exp&libraries=geometry,drawing,places',
        loadingElement: <div style={{ height: '100%' }} />,
        containerElement: <div style={{ height: '400px' }} />,
        mapElement: <div style={{ height: '100%' }} />
      }),
      withScriptjs,
      withGoogleMap,
      lifecycle({
        componentDidMount() {
          const DirectionsService = new google.maps.DirectionsService();
          googleCenter = new google.maps.LatLng(30.271699, -97.745049);
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
              console.error(`error fetching directions ${result}`);
            }
          });
        }
      })
    )(props => (
      <GoogleMap
        defaultZoom={7}
        defaultCenter={new google.maps.LatLng(41.8507300, -87.6512600)}
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
