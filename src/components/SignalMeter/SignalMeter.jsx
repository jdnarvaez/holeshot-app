import React from 'react'

import './SignalMeter.scss';

function SignalMeter(props) {
  function barStyle(bar) {
    const strength = 100 + parseInt(props.rssi);

    return {
      borderRadius: 2,
      width: '20%',
      height: `${25 * bar}%`
    }
  }

  function className(bar) {
    const strength = 100 + parseInt(props.rssi);
    return strength >= 25 * (bar - 1) + 10 ? 'strong' : 'weak'
  }

  return (
    <div className="signal-meter">
      {[1, 2, 3, 4].map(bar => <div style={barStyle(bar)} className={`bar ${className(bar)}`} key={bar.toString()} />)}
    </div>
  )
}

export default SignalMeter;
