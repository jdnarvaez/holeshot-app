import React, { useReducer, useEffect, useState } from 'react';

import RealtimeGraph from '../RealtimeGraph';

class Tachometer extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      cadence : 0,
      max : 0
    };
  }

  componentDidUpdate() {
    const { cadence } = this.props;
    const { max } = this.state;

    if (cadence > max) {
      this.setState({ max : cadence });
    }
  }

  render() {
    const { max } = this.state;
    const { crankDevice, cadence, connectDevice } = this.props;

    return (
      <RealtimeGraph units={'rpm'} currentValue={cadence} maxValue={max} device={crankDevice} connectDevice={connectDevice} />
    )
  }
}

export default Tachometer;
