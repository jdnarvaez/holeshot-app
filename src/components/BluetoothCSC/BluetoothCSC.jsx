import React, { useReducer, useEffect, useState } from 'react';

const CYCLING_SPEED_AND_CADENCE = '00001816-0000-1000-8000-00805f9b34fb';
const CSC_SERVICE = '1816';
const CSC_MEASUREMENT = '2a5b';
const CSC_FEATURE = '2a5c';
const UINT16_MAX = 65536;
const UINT32_MAX = 4294967296;

class BluetoothCSC extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      crank : undefined,
      wheel : undefined,
      speed : 0,
      cadence : 0
    };
  }

  componentDidMount() {
    if (!window.ble) {
      return;
    }

    const { wheelDevice, crankDevice, wheelSize } = this.props;
    const devices = (wheelDevice === crankDevice) ? [wheelDevice] : [wheelDevice, crankDevice];

    devices.filter(d => !!d).forEach(device => {

    })
  }

  componentWillUnmount() {
    if (!window.ble) {
      return;
    }

    const { wheelDevice, crankDevice } = this.props;
    const devices = [wheelDevice, crankDevice];

    devices.filter(d => !!d).forEach(device => {
      ble.stopNotification(device.id, CSC_SERVICE, CSC_MEASUREMENT);
    })
  }



  render() {
    return (React.Children.map(this.props.children, child => React.cloneElement(child, { ...this.state } )));
  }
}

export default BluetoothCSC;
