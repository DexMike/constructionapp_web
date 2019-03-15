import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { GoogleMap, Marker } from 'react-google-maps';

class TMap extends PureComponent {

  render() {
    // Map test ////////////////////////////////////////////////////
    const { compose, withProps, lifecycle } = require('recompose');
    const { input } = this.props;
    console.log('>>>INOUT INFO:');
    console.log(input);
    const {
      withScriptjs,
      withGoogleMap,
      GoogleMap,
      DirectionsRenderer
    } = require('react-google-maps');
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

          const address1 = '100 Congress Austin Texas 78701';
          const address2 = '400 Bowie St, Austin, TX 78703';

          DirectionsService.route({
            // origin: new google.maps.LatLng(41.8507300, -87.6512600),
            // destination: new google.maps.LatLng(41.8525800, -87.6514100),
            origin: address1,
            destination: address2,
            travelMode: google.maps.TravelMode.DRIVING,
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
    )(props =>
      <GoogleMap
        defaultZoom={7}
        defaultCenter={new google.maps.LatLng(41.8507300, -87.6512600)}
      >
        <MapWithADirectionsRenderer />
        {props.directions && <DirectionsRenderer directions={props.directions} />}
      </GoogleMap>
    );
  }
  // Map test ends //////////////////////////////////////////////<MapWithADirectionsRenderer />
}

TMap.propTypes = {
  input: PropTypes.shape({
    origin: PropTypes.string,
    destination: PropTypes.string
  }).isRequired
};

export default TMap;
