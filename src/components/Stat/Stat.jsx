import React, { useReducer, useEffect, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faLocationArrow, faMapMarker, faMapMarked, faList, faCompass, faBook, faTasks, faUsers, faCogs } from '@fortawesome/free-solid-svg-icons';
import Animate from 'animate.css-react';

import './Stat.scss';

class Stat extends React.Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  render() {
    return (
      <Animate
        appear="bounceIn"
        durationAppear={1000}
        durationEnter={1000}
        durationLeave={1000}
        animateChangeIf={false}
        durationChange={1000}
        className="stat"
        component="div">
        <div className="icon">
          <div><FontAwesomeIcon icon={this.props.icon} /></div>
        </div>
        <div className="text">
          <div className="name">
          {this.props.name}
          </div>
          <div className="measurement">
            <div className="value">
            {this.props.value}
            </div>
            <div className="units">
            {this.props.units}
            </div>
          </div>
        </div>
      </Animate>
    )
  }
}

export default Stat;
