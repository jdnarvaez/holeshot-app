import React, { useReducer, useEffect, useState } from 'react';
import Toggle from 'react-toggle';
import MultiSwitch from 'react-multi-switch-toggle'
import { Motion, spring } from 'react-motion';
import { Pie } from '@vx/shape';
import { Group } from '@vx/group';
import { GradientLightgreenGreen, GradientOrangeRed, GradientPinkRed } from '@vx/gradient';
import Animate from 'animate.css-react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faLink, faUnlink } from '@fortawesome/free-solid-svg-icons';

import SignalMeter from '../SignalMeter';
import BatteryMeter from '../BatteryMeter';

import './RealtimeGraph.scss';

class RealtimeGraph extends React.Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  render() {
    const { currentValue, maxValue, device, connectDevice } = this.props;
    const width = 225;
    const height = 225;
    const radius = Math.min(width, height) / 2;
    const centerY = height / 2;
    const centerX = width / 2;

    return (
      <Animate
        enter="bounceIn"
        leave="bounceOut"
        appear="bounceIn"
        change="flipInX"
        durationAppear={1000}
        durationEnter={1000}
        durationLeave={1000}
        animateChangeIf={false}
        durationChange={1000}
        className="metric"
        component="div">
        <div className="graph">
          <svg width={width} height={height}>
            <defs>
              <linearGradient id="current-gradient" x1="34%" y1="100%" x2="66%" y2="0%" >
                <stop offset="0%" style={{ stopColor : 'var(--background-color)', stopOpacity : '1' }} />
                <stop offset="44%" style={{ stopColor : 'var(--background-secondary-color)', stopOpacity : '1' }} />
                <stop offset="100%" style={{ stopColor : 'var(--primary-color)', stopOpacity : '1' }} />
              </linearGradient>
              <linearGradient id="max-gradient" x1="34%" y1="100%" x2="66%" y2="0%" >
                <stop offset="0%" style={{ stopColor : 'var(--background-color)', stopOpacity : '1' }} />
                <stop offset="30%" style={{ stopColor : 'var(--background-secondary-color)', stopOpacity : '1' }} />
                <stop offset="100%" style={{ stopColor : 'var(--secondary-color)', stopOpacity : '1' }} />
              </linearGradient>
            </defs>
            <Group top={centerY} left={centerX}>
              <Pie
                outerRadius={radius - 45}
                innerRadius={radius - 25}
                cornerRadius={3}
                padAngle={0}
              >
                {pie => {
                  const arc = {
                    startAngle: Math.PI,
                    endAngle: 2 * Math.PI + Math.PI / 2,
                    padAngle: 0
                  }

                  return (
                    <Motion defaultStyle={{ opacity : 0, endAngle : Math.PI }} style={{ opacity : spring(100, { stiffness : 90 }), endAngle : spring(2 * Math.PI + Math.PI / 2, { stiffness : 90 }) }} key={`arc-max`}>
                      {value => {
                        const new_arc = Object.assign({}, arc);
                        new_arc.endAngle = value.endAngle;

                        return (
                          <Group>
                            <path d={pie.path(new_arc)} fill={"url('#max-gradient')"} fillOpacity={value.opacity / 100} />
                          </Group>
                        );
                      }}
                    </Motion>
                  )
                }}
              </Pie>
              <Pie
                outerRadius={radius - 20}
                innerRadius={radius}
                cornerRadius={3}
                padAngle={0}
              >
                {pie => {
                  const arc = {
                    startAngle: Math.PI,
                    endAngle: 2 * Math.PI + Math.PI / 2,
                    padAngle: 0
                  }

                  const range = (2 * Math.PI + Math.PI / 2) - Math.PI;
                  var pct = currentValue / maxValue;

                  if (isNaN(pct)) {
                    pct = 0;
                  }

                  return (
                    <Motion defaultStyle={{ endAngle : 0 }} style={{ endAngle : spring(pct, { stiffness : 90 }) }} key={`arc-max`}>
                      {value => {
                        const new_arc = Object.assign({}, arc);
                        new_arc.endAngle = Math.PI + range * value.endAngle;

                        return (
                          <Group>
                            <path d={pie.path(new_arc)} fill={"url('#current-gradient')"} />
                          </Group>
                        );
                      }}
                    </Motion>
                  )
                }}
              </Pie>
            </Group>
          </svg>
        </div>
        {device && <div className="device" onClick={() => { if (device.isConnected) { return; } connectDevice(device) }}>
          <div className="name">
          {device.name}
          </div>
          <div className="signal" key="signal">
            <SignalMeter rssi={device.isConnected ? device.rssi : -100} />
          </div>
          {!device.isConnected && <FontAwesomeIcon icon={faUnlink} />}
          {device.isConnected && device.batteryLevel !== undefined && <div className="battery" key="battery">
            <BatteryMeter level={device.batteryLevel} />
          </div>}
        </div>}
        <div className="current-value">
        {this.props.currentValue}
        </div>
        <div className="units">
        {this.props.units}
        </div>
      </Animate>
    )
  }
}

export default RealtimeGraph;
