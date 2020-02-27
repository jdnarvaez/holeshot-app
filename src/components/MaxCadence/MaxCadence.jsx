import React, { useReducer, useEffect, useState } from 'react';
import { faTachometerAlt } from '@fortawesome/free-solid-svg-icons';

import Stat from '../Stat';

class MaxCadence extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      max : 0
    };
  }

  componentDidUpdate() {
    const { cadence } = this.props;
    const { max } = this.state;

    if (cadence > max) {
      this.setState({ max : cadence });
    }
  }

  render() {
    const { max } = this.state;

    return (
      <Stat icon={faTachometerAlt} name={'max cadence'} value={max} units={'rpm'} />
    )
  }
}

export default MaxCadence;
