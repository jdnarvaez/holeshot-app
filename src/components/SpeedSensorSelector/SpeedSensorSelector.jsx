import React, { useReducer, useEffect, useState } from 'react';

import SensorSelector from '../SensorSelector';

class SpeedSensorSelector extends React.Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  isSelected = (device) => {
    const { wheelDevice } = this.props;
    return wheelDevice && device && wheelDevice.id === device.id;
  }

  render() {
    const { isSelected } = this;
    const { onWheelDeviceSelected, ...props } = this.props;

    return (<SensorSelector title={'Speed Sensors'} {...props} onSensorSelected={onWheelDeviceSelected} isSelected={isSelected} />
    )
  }
}

export default SpeedSensorSelector;
