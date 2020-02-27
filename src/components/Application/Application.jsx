import React, { useReducer, useEffect, useState } from 'react';
import Toggle from 'react-toggle';
import MultiSwitch from 'react-multi-switch-toggle'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBiking, faList, faCogs } from '@fortawesome/free-solid-svg-icons';
import Animate from 'animate.css-react';
import 'animate.css/animate.css'

import Training from '../Training';
import Settings from '../Settings';

import BluetoothCSC from '../BluetoothCSC';
import Stats from '../Stats';
import Speedometer from '../Speedometer';
import Tachometer from '../Tachometer';

import './Application.scss';

import bg from './bg.png';

const CYCLING_SPEED_AND_CADENCE = '00001816-0000-1000-8000-00805f9b34fb';
const CSC_SERVICE = '1816';
const CSC_MEASUREMENT = '2a5b';
const CSC_FEATURE = '2a5c';
const UINT16_MAX = 65536;
const UINT32_MAX = 4294967296;

class Application extends React.Component {
  constructor(props) {
    super(props);

    const w = { id: "54364F70-F619-9380-940C-F242BCC249A3", rssi: -53, name: "BK6 S-047439", wheel_data_present: true, isConnected : false };
    const c = { id: "54364F70-F619-9380-940C-F242BCC2ffff", rssi: -53, name: "BK6 S-047483", crank_data_present: true, isConnected : false };

    this.state = {
      activeTab : 0,
      orientation : (window.innerHeight < window.innerWidth) ? 'landscape' : 'portrait',
      wheelSize : 20,
      crankDevice : undefined,
      wheelDevice : undefined,
      crank : undefined,
      wheel : undefined,
      speed : 0,
      cadence : 0
    };
  }

  setActiveTab = (activeTab) => {
    this.setState({ activeTab });
  }

  onOrientationChange = () => {
    const { orientation } = this.state;
    this.setState({ orientation : orientation === 'landscape' ? 'portrait' : 'landscape' })
  }

  onWheelSizeChanged = (tab) => {
    switch (tab) {
      case 0:
        return this.setState({ wheelSize : 20 });
      case 1:
        return this.setState({ wheelSize : 22 });
      case 2:
        return this.setState({ wheelSize : 24 });
    }
  }

  onCrankDeviceSelected = (device) => {
    const { connectDevice, disconnectDevice } = this;
    const { crankDevice } = this.state;

    if (device && crankDevice && device.id === crankDevice.id) {
      return this.setState({ crankDevice : undefined }, () => {
        disconnectDevice(crankDevice)
      });
    }

    this.setState({ crankDevice : device }, () => {
      if (device) {
        connectDevice(device)
      }
    });
  }

  onWheelDeviceSelected = (device) => {
    const { connectDevice, disconnectDevice } = this;
    const { wheelDevice } = this.state;

    if (device && wheelDevice && device.id === wheelDevice.id) {
      return this.setState({ wheelDevice : undefined }, () => {
        disconnectDevice(wheelDevice)
      });
    }

    this.setState({ wheelDevice : device }, () => {
      if (device) {
        connectDevice(device)
      }
    });
  }

  componentDidMount() {
    this._mounted = true;

    try {
      navigator.splashscreen.hide();
    } catch (error) {  }

    window.addEventListener('orientationchange', this.onOrientationChange, false);
  }

  componentWillUnmount() {
    this._mounted = false;
    window.removeEventListener('orientationchange', this.onOrientationChange);

    const { disconnectDevice } = this;
    const { wheelDevice, crankDevice } = this.state;
    const devices = [wheelDevice, crankDevice];

    devices.filter(d => !!d).forEach(device => disconnectDevice(device));
  }

  disconnectDevice = (device) => {
    if (!window.ble) {
      return;
    }

    ble.stopNotification(device.id, CSC_SERVICE, CSC_MEASUREMENT, () => {
      ble.disconnect(device.id, () => {}, (error) => { console.error(error) })
    }, (error) => { console.error(error) });
  }

  connectDevice = (device) => {
    if (!window.ble) {
      return;
    }

    ble.connect(device.id, () => {
      const { crankDevice, wheelDevice } = this.state;

      if (this._mounted) {
        if (crankDevice && crankDevice.id === device.id) {
          crankDevice.isConnected = true;
          this.setState({ crankDevice : crankDevice });
        }

        if (wheelDevice && wheelDevice.id === device.id) {
          wheelDevice.isConnected = true;
          this.setState({ wheelDevice : wheelDevice });
        }
      }

      ble.startNotification(device.id, CSC_SERVICE, CSC_MEASUREMENT, (buffer) => {
        const { wheelSize } = this.state;
        const value = new DataView(buffer);
        var offset = 0;
        const flags = value.getUint8(offset, true);
        offset += 1;
        const wheel_data_present = (flags & 0x01) > 0;
        const crank_data_present = (flags & 0x02) > 0;
        const nextState = {};

        if (wheel_data_present) {
          const wheel_revolutions = value.getUint32(offset, true);
          offset += 4;
          const last_wheel_event_time = value.getUint16(offset, true);
          offset += 2;

          nextState.wheel = {
            revolutions : wheel_revolutions,
            event_time : last_wheel_event_time
          };
        }

        if (crank_data_present) {
          const crank_revolutions = value.getUint16(offset, true);
          offset += 2;
          const last_crank_event_time = value.getUint16(offset, true);

          nextState.crank = {
            revolutions : crank_revolutions,
            event_time : last_crank_event_time
          };
        }

        const { wheel, crank } = this.state;

        if (wheel && nextState.wheel) {
          const wheelTimeDiff = this.diffForSample(nextState.wheel.event_time, wheel.event_time, UINT16_MAX) / 1024;
          const wheelDiff = this.diffForSample(nextState.wheel.revolutions, wheel.revolutions, UINT32_MAX);
          const sampleDistance = wheelDiff * Math.PI * (wheelSize); // distance in inches
          const inchPerSecond = sampleDistance / wheelTimeDiff;
          const speed = wheelTimeDiff == 0 ? 0 : ((sampleDistance / wheelTimeDiff) * 0.0568182); // ips => mph
          nextState.speed = Math.round((speed + Number.EPSILON) * 10) / 10;

          // const distance = nextState.wheel.revolutions * wheelSize;
          // const distance -= startDistance; // need start distance;
        }

        if (crank && nextState.crank) {
          const crankTimeDiff = this.diffForSample(nextState.crank.event_time, crank.event_time, UINT16_MAX) / 2014;
          const crankDiff = this.diffForSample(nextState.crank.revolutions, crank.revolutions, UINT16_MAX);
          const cadence = (crankTimeDiff == 0) ? 0 : (60 * crankDiff / crankTimeDiff); // RPM
          nextState.cadence = Math.round(cadence);
        }

        this.setState(nextState);
      }, (error) => {
        const { crankDevice, wheelDevice } = this.state;

        if (this._mounted) {
          if (crankDevice && crankDevice.id === device.id) {
            crankDevice.isConnected = false;
            this.setState({ crankDevice : crankDevice });
          }

          if (wheelDevice && wheelDevice.id === device.id) {
            wheelDevice.isConnected = false;
            this.setState({ wheelDevice : wheelDevice });
          }
        }

        console.error(error);
      });
    }, (err) => {
      console.error(err);
    });
  }

  diffForSample = (current, previous, max) => {
    if (current >= previous) {
      return current - previous;
    } else {
      return (max - previous) + current;
    }
  }

  render() {
    const { setActiveTab, onWheelSizeChanged, onCrankDeviceSelected, onWheelDeviceSelected, connectDevice } = this;
    const { orientation, activeTab} = this.state;

    return (
      <div className={`application ${orientation}`}>
        <div className="bg-image"><img src={bg} /></div>
          <Animate
            enter="bounceIn"
            leave="bounceOut"
            appear="bounceIn"
            change="bounceOut"
            durationAppear={1000}
            durationEnter={1000}
            durationLeave={1000}
            animateChangeIf={false}
            durationChange={1000}
            className={`main-panel ${orientation}`}
            style={{ maxHeight : `${innerHeight - 130}px` }}
            component="div">
            {activeTab === 0 &&
              <Training
                key="training"
                connectDevice={connectDevice}
                onWheelSizeChanged={onWheelSizeChanged}
                onCrankDeviceSelected={onCrankDeviceSelected}
                onWheelDeviceSelected={onWheelDeviceSelected}
                {...this.state} />
            }
            {activeTab === 2 &&
              <Settings
                key="settings"
                onWheelSizeChanged={onWheelSizeChanged}
                onCrankDeviceSelected={onCrankDeviceSelected}
                onWheelDeviceSelected={onWheelDeviceSelected}
                {...this.state} />
            }
          </Animate>
          <div className={`indicator ${activeTab === 1 ? 'one' : (activeTab === 2 ? 'two' : '')}`} />
          <Animate
            enter="bounceIn"
            leave="bounceOut"
            appear="fadeInRight"
            change="flipInX"
            durationAppear={1000}
            durationEnter={1000}
            durationLeave={1000}
            animateChangeIf={false}
            durationChange={1000}
            className={`navigation-panel ${orientation}`}
            component="div">
            <div className={`btn ripple ${activeTab === 0 ? 'active' : ''}`} onClick={() => setActiveTab(0)}>
              <div><FontAwesomeIcon icon={faBiking} /></div>
            </div>
            <div className={`btn ripple ${activeTab === 1 ? 'active' : ''}`} onClick={() => setActiveTab(1)}>
              <div><FontAwesomeIcon icon={faList} /></div>
            </div>
            <div className={`btn ripple ${activeTab === 2 ? 'active' : ''}`} onClick={() => setActiveTab(2)}>
              <div><FontAwesomeIcon icon={faCogs} /></div>
            </div>
          </Animate>
      </div>
    )
  }
}

export default Application;
