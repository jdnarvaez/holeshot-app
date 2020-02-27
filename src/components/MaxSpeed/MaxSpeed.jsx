import React, { useReducer, useEffect, useState } from 'react';
import { faBolt } from '@fortawesome/free-solid-svg-icons';

import Stat from '../Stat';

class MaxSpeed extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      max : 0
    };
  }

  componentDidUpdate() {
    const { speed } = this.props;
    const { max } = this.state;

    if (speed > max) {
      this.setState({ max : speed });
    }
  }

  render() {
    const { max } = this.state;

    return (
      <Stat icon={faBolt} name={'max speed'} value={max} units={'mph'} />
    )
  }
}

export default MaxSpeed;
