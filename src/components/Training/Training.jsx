import React from 'react';

import Stats from '../Stats';
import Speedometer from '../Speedometer';
import Tachometer from '../Tachometer';

import './Training.scss';

class Training extends React.Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  render() {
    return (
      <div className="training panel" key="training">
        <div className="metrics">
          <Stats {...this.props} />
          <Speedometer {...this.props} />
          <Tachometer {...this.props} />
        </div>
      </div>
    )
  }
}

export default Training;
