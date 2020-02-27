import React, { useReducer, useEffect, useState } from 'react';

import SensorSelector from '../SensorSelector';

class CadenceSensorSelector extends React.Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  isSelected = (device) => {
    const { crankDevice } = this.props;
    return crankDevice && device && crankDevice.id === device.id;
  }

  render() {
    const { isSelected } = this;
    const { onCrankDeviceSelected, ...props } = this.props;
    return (<SensorSelector title={'Cadence Sensors'} {...props} onSensorSelected={onCrankDeviceSelected} isSelected={isSelected} />)
  }
}

export default CadenceSensorSelector;
