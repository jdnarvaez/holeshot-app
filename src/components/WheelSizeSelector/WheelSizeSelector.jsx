import React, { useReducer, useEffect, useState } from 'react';
import MultiSwitch from 'react-multi-switch-toggle'

import './WheelSizeSelector.scss';

class WheelSizeSelector extends React.Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  render() {
    const { wheelSize } = this.props;
    const selectedSwitch = wheelSize === 20 ? 0 : (wheelSize === 22 ? 1 : 2);

    return (
      <div className="size-selector">
        <div className="caption">wheel size</div>
        <MultiSwitch
            texts={[
              '20"',
              '22"',
              '24"',
            ]}
            selectedSwitch={selectedSwitch}
            borderWidth={'0'}
            onToggleCallback={this.props.onWheelSizeChanged}
            fontColor={'var(--main)'}
            selectedFontColor={'var(--background-color)'}
            selectedSwitchColor={'var(--primary-color)'}
            eachSwitchWidth={(innerWidth - 44) / 3}
            height={'26px'}
            fontSize={'20px'}
        >
        </MultiSwitch>
      </div>
    )
  }
}

export default WheelSizeSelector;
