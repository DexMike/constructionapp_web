import React, { Component } from 'react';
// import { Redirect } from 'react-router-dom';
import {
  Card,
  Col,
  Container,
  Row
} from 'reactstrap';

import HEREMap, { Marker, RouteLine } from 'here-maps-react';

/*
RouteFeatureWeightType
-3) strictExclude The routing engine guarantees that the route does not contain strictly excluded features.
 If the condition cannot be fulfilled no route is returned.
-2) softExclude The routing engine does not consider links containing the corresponding feature.
  If no route can be found because of these limitations the condition is weakened.
-1) avoid The routing engine assigns penalties for links containing the corresponding feature.
0)  normal The routing engine does not alter the ranking of links containing the corresponding feature.
*/
const routeFeatureWeightType = 0;
const center = {
  lat: 30.252606,
  lng: -97.754209
};

class EquipmentsMapTest extends Component {
  constructor(props) {
    super(props);

    this.state = {
      loaded: false,
      shape: {},
      timeAndDistance: '',
      instructions: []
    };
    this.onError = this.onError.bind(this);
    this.onSuccess = this.onSuccess.bind(this);
  }

  async componentDidMount() {
    // await this.fetchPayments();
    // this.setState({ loaded: true });
    const platform = new H.service.Platform({
      app_id: 'FlTEFFbhzrFwU1InxRgH',
      app_code: 'gTgJkC9u0YWzXzvjMadDzQ',
      useHTTPS: true
    });

    const routeRequestParams = {
      mode: `balanced;truck;traffic:disabled;motorway:${routeFeatureWeightType}`,
      representation: 'display',
      routeattributes: 'waypoints,summary,shape,legs,incidents',
      maneuverattributes: 'direction,action',
      waypoint0: '30.349027,-97.740831',
      waypoint1: '30.260708,-97.751145',
      /*
      waypoint0: '30.284608,-97.775877',
      waypoint1: '30.252606,-97.722753',
      */
      truckType: 'tractorTruck',
      limitedWeight: 700,
      metricSystem: 'imperial',
      language: 'de-de' // en-us|es-es
    };

    const router = platform.getRoutingService();

    router.calculateRoute(
      routeRequestParams,
      this.onSuccess,
      this.onError
    );
  }

  onError(error) {
    // console.log('>>ERROR : ', error);
  }

  onSuccess(result) {
    const route = result.response.route[0];
    // console.log(result.response);
    this.setState({
      loaded: true,
      shape: route.shape,
      timeAndDistance: `Travel time and distance: ${route.summary.text}`,
      instructions: route.leg[0]
    });
    // ... etc.
  }

  renderInstructions(instructions) {
    // console.log(typeof instructions, instructions);
    const allInstructions = instructions.map((item, key) => (
      <li
        key={item.id}
        className="instructions"
        dangerouslySetInnerHTML={{ __html: item.instruction }}
      />
    )
    );
    return (
      <React.Fragment>
        {allInstructions}
      </React.Fragment>
    )
  }

  render() {
    const {
      loaded,
      shape,
      timeAndDistance,
      instructions
    } = this.state;

    const opts = {
      layer: 'traffic',
      mapType: 'normal'
    };

    if (loaded) {
      return (
        <React.Fragment>
          <HEREMap
            style={{width: '500px', height: '400px', background: 'purple' }}
            appId="FlTEFFbhzrFwU1InxRgH"
            appCode="gTgJkC9u0YWzXzvjMadDzQ"
            center={center}
            zoom={14}
            setLayer={opts}
            hidpi={false}
            interactive
          >
            {/*
            <Marker {...center}>
              <div className="circle-marker" />
            </Marker>
            */}
            <RouteLine
              shape={shape}
              strokeColor="purple"
              lineWidth="4"
            />
          </HEREMap>
          <div
            className="instructions"
            dangerouslySetInnerHTML={{ __html: timeAndDistance }}
          />
          <br/>
          {this.renderInstructions(instructions.maneuver)}
        </React.Fragment>
      );
    }
    return (
      <Container className="dashboard">
        <Row>
          <Col md={12}>
            <Card>Loading...</Card>
          </Col>
        </Row>
      </Container>
    );
  }
}

export default EquipmentsMapTest;
