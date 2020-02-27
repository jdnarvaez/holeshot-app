import React, { useReducer, useEffect, useState } from 'react';
import Animate from 'animate.css-react';

import Stat from '../Stat';
import MaxSpeed from '../MaxSpeed';
import MaxCadence from '../MaxCadence';

import './Stats.scss';

class Stats extends React.Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  render() {
    return (
      <div className="stats">
        <MaxSpeed {...this.props} />
        <MaxCadence {...this.props} />
      </div>
    )
  }
}

export default Stats;
