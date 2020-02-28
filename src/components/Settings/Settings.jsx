import React, { useReducer, useEffect, useState } from 'react';
import MultiSwitch from 'react-multi-switch-toggle'
import Animate from 'animate.css-react';
import 'animate.css/animate.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faLink } from '@fortawesome/free-solid-svg-icons';

import WheelSizeSelector from '../WheelSizeSelector';
import CadenceSensorSelector from '../CadenceSensorSelector';
import SpeedSensorSelector from '../SpeedSensorSelector';
import Stats from '../Stats';
import Speedometer from '../Speedometer';
import Tachometer from '../Tachometer';

import './Settings.scss';

const CYCLING_SPEED_AND_CADENCE = '00001816-0000-1000-8000-00805f9b34fb';
const CSC_SERVICE = '1816';
const CSC_MEASUREMENT = '2a5b';
const CSC_FEATURE = '2a5c';

const BATTERY_SERVICE = '180F';
const BATTERY_LEVEL = '2A19';

class Settings extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      scanning : true,
      devices : []
    };
  }

  onDisconnectDevice = (device) => {
    const { devices } = this.state;
    const updatedDevices = devices.filter(d => d.id !== device.id);

    this.setState({ devices : updatedDevices });
  }

  knownDevice = (id) => {
    const { devices } = this.state;
    return devices.map(d => d.id).indexOf(id) > -1;
  }

  scanForDevices = () => {
    this.performScan();
  }

  readBatteryLevel = (device, disconnect) => {
    ble.read(device.id, CSC_SERVICE, CSC_FEATURE, (buffer) => {
      const { devices } = this.state;
      const nextState = {};
      const value = new DataView(buffer);
      const flags = value.getUint8(0, true);
      const wheel_data_present = (flags & 0x01) > 0;
      const crank_data_present = (flags & 0x02) > 0;
      device.wheel_data_present = wheel_data_present;
      device.crank_data_present = crank_data_present;

      if (!this._mounted) {
        if (disconnect) {
          ble.disconnect(device.id);
        }

        return;
      }

      // Replace device in list
      const oldDevice = devices.find(d => d.id === device.id);

      if (oldDevice && oldDevice.batteryLevel !== undefined) {
        device.batteryLevel = oldDevice.batteryLevel;
      }

      const updatedDevices = devices.filter(d => d.id !== device.id).concat(device);

      this.setState({ devices : updatedDevices }, () => {
        ble.read(device.id, BATTERY_SERVICE, BATTERY_LEVEL, (data) => {
          const { devices } = this.state;
          const currentDevice = devices.find(d => d.id === device.id);

          if ((!this._mounted || !currentDevice) && disconnect) {
            ble.disconnect(device.id);
            return;
          }

          // Replace device in list
          currentDevice.batteryLevel = new Uint8Array(data)[0];
          const updatedDevices = devices.filter(d => d.id !== currentDevice.id).concat(currentDevice);

          if (disconnect) {
            ble.disconnect(device.id);
          }

          this.setState({ devices : updatedDevices });
        }, (error) => {
          console.error(error);

          if (disconnect) {
            ble.disconnect(device.id);
          }
        });
      });
    }, error => {
      console.error(error);

      if (disconnect) {
        ble.disconnect(device.id);
      }
    })
  }

  performScan = () => {
    const scannedDevices = [];
    clearTimeout(this.canceler);
    clearTimeout(this.scanner);

    this.setState({ scanning : true }, () => {
      ble.connectedPeripheralsWithServices([CYCLING_SPEED_AND_CADENCE], (connectedDevices) => {
        connectedDevices.forEach(device => {
          device.isConnected = true;
        });

        connectedDevices.forEach(device => scannedDevices.push(device));
        connectedDevices.forEach(device => this.readBatteryLevel(device, false));

        const component = this;

        function completeScan() {
          ble.scan([CYCLING_SPEED_AND_CADENCE], 5, (device) => {
            scannedDevices.push(device);

            if (component.knownDevice(device.id) || scannedDevices.indexOf(device.id) > -1) {
              return;
            }

            ble.connect(device.id, () => {
              component.readBatteryLevel(device, true);
            }, error => {
              console.error(error);
            });
          }, (error) => {
            console.error(error);
          });

          component.canceler = setTimeout(() => {
            const { devices  } = component.state;
            const scannedDeviceIds = scannedDevices.map(device => device.id);
            const updatedDevices = devices.filter(device => scannedDeviceIds.indexOf(device.id) > -1);

            if (!component._mounted) {
              return;
            }

            component.setState({ scanning : false, devices : updatedDevices }, () => {
              ble.stopScan();
              component.scanner = setTimeout(component.performScan, 5 * 1000);
            });
          }, 5 * 1000);
        }

        if (connectedDevices.length > 0) {
          this.setState({ devices : connectedDevices }, () => {
            completeScan();
          });
        } else {
          completeScan();
        }
      }, (error) => {
        console.error(error);
        this.setState({ scanning : false });
      });
    });
  }

  componentDidMount() {
    this._mounted = true;

    if (!window.ble) {
      return;
    }

    this.scanForDevices();
  }

  componentWillUnmount() {
    this._mounted = false;

    if (!window.ble) {
      return;
    }

    clearTimeout(this.canceler);
    clearTimeout(this.scanner);
    ble.stopScan();
  }

  render() {
    const { onDisconnectDevice } = this;
    const { wheelDevice, crankDevice } = this.props;
    const { devices, scanning } = this.state;

    // probably slow for huge arrays but ¯\_(ツ)_/¯
    const allDevices = [wheelDevice, crankDevice].concat(devices).filter(d => !!d);
    const deviceMap = {};

    allDevices.forEach(device => {
      var attributes = deviceMap[device.id];

      if (!attributes) {
        attributes = {};
        deviceMap[device.id] = attributes;
      }

      for (var property in device) {
        attributes[property] = device[property];
      }
    })

    const uniqueDevices = Object.values(deviceMap);

    return (
      <div className="settings panel" key="settings">
        <WheelSizeSelector {...this.props} />
        <CadenceSensorSelector {...this.props} sensors={uniqueDevices.filter(d => d.crank_data_present)} scanning={scanning} onDisconnectDevice={onDisconnectDevice} />
        <SpeedSensorSelector {...this.props} sensors={uniqueDevices.filter(d => d.wheel_data_present)} scanning={scanning} onDisconnectDevice={onDisconnectDevice} />
      </div>
    )
  }
}

export default Settings;
