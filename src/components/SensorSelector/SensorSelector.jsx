import React from 'react';
import Animate from 'animate.css-react';
import 'animate.css/animate.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faLink, faUnlink } from '@fortawesome/free-solid-svg-icons';

import SignalMeter from '../SignalMeter';
import BatteryMeter from '../BatteryMeter';

import './SensorSelector.scss';

class SensorSelector extends React.Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  onSensorSelected = (device) => {
    const { onDisconnectDevice, onSensorSelected } = this.props;

    if (onDisconnectDevice) {
      try {
        onDisconnectDevice(device);
      } catch (err) {}
    }

    if (onSensorSelected) {
      try {
        onSensorSelected(device);
      } catch (err) {}
    }
  }

  render() {
    const { onSensorSelected } = this;
    const { isSelected, scanning } = this.props;

    return (
      <div className="sensor-selector">
        <div className="heading">
        {this.props.title}
        <div className={`progress ${this.props.scanning ? 'show' : ''}`}><div className="indeterminate"></div></div></div>
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
          className="sensor-selector-list"
          component="div">
          {!scanning && (!this.props.sensors || this.props.sensors.length === 0) && <div className="sensor-not-found">no sensors found</div>}
          {this.props.sensors && this.props.sensors.map(sensor => {
            const selected = isSelected(sensor);
            const connected = sensor.isConnected;
            const rssi = (selected && !connected) ? -100 : sensor.rssi;
            const batteryLevel = (selected && !connected) ? 0 : sensor.batteryLevel;

            return (
              <div key={sensor.id}>
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
                  className="sensor ripple"
                  key={sensor.id} onClick={() => onSensorSelected(sensor) }
                  component="div">
                  <div className={`icon`} key="icon">
                    <div>
                      {connected && <FontAwesomeIcon icon={faLink} className={`link ${connected ? 'connected' : ''}`}/>}
                      {!connected && selected && <FontAwesomeIcon icon={faUnlink} className={`unlink`}/>}
                    </div>
                  </div>
                  <div className="name" key="name">
                  {sensor.name}
                  </div>
                  <div className="signal" key="signal">
                    <SignalMeter rssi={rssi} />
                  </div>
                  {batteryLevel !== undefined && <div className="battery" key="battery">
                    <BatteryMeter level={batteryLevel} />
                  </div>}
                </Animate>
              </div>
            )})}
        </Animate>
      </div>
    )
  }
}

export default SensorSelector;
