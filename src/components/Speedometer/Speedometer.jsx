import React, { useReducer, useEffect, useState } from 'react';

import RealtimeGraph from '../RealtimeGraph';

class Speedometer extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      speed : 0,
      max : 0
    };
  }

  componentDidUpdate() {
    const { speed } = this.props;
    const { max } = this.state;

    if (speed > max) {
      this.setState({ max : speed });
    }
  }

  render() {
    const { max } = this.state;
    const { wheelDevice, speed, connectDevice } = this.props;

    return (
      <RealtimeGraph units={'mph'} currentValue={speed} maxValue={max} device={wheelDevice} connectDevice={connectDevice} />
    )
  }
}

export default Speedometer;
