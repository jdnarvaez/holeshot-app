import React from 'react'

import './BatteryMeter.scss';

function BatteryMeter(props) {
  return (
    <div className="battery-meter">
      <div className="outer">
        <div className="level" style={{ width : `${props.level}%`}} />
      </div>
      <div className="bump"></div>
    </div>
  )
}

export default BatteryMeter;
