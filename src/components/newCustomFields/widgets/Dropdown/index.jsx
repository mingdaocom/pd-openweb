import React, { Component } from 'react';
import Dropdown from './dropdown';
import { Steps } from 'ming-ui';

export default class Widgets extends Component {
  render() {
    const { disabled, advancedSetting: { showtype, direction } = {}, value, options = [], enumDefault2 } = this.props;
    
    if (showtype === '2') {
      return (
        <Steps
          from="recordInfo"
          direction={direction}
          value={JSON.parse(value || '[]')[0]}
          disabled={disabled}
          data={{ options, enumDefault2 }}
          onChange={value => {
            this.props.onChange(JSON.stringify(value ? [value] : []));
          }}
        />
      );
    }

    return <Dropdown {...this.props} />;
  }
}
