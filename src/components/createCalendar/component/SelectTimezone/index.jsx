import React, { PureComponent } from 'react';
import Dropdown from 'ming-ui/components/Dropdown';
import './index.less';

export default class SelectTimezone extends PureComponent {
  handleChange = timezone => {
    this.props.selectTimezone(timezone);
  };

  getDefaultTimezone = () => {
    let localTimezone = new Date().getTimezoneOffset();
    return (
      this.props.data.find(v => v.value === localTimezone) || {
        text: `(GMT+00:00) ${_l('格林尼治标准时间')}`,
        value: 0,
      }
    );
  };

  render() {
    const { data } = this.props;
    let { value, text } = this.getDefaultTimezone();
    return (
      <div className="timezoneWrap">
        <div className="timezoneLabel Gray_9e">{_l('时区')}</div>
        <Dropdown
          className="timezoneDropdown"
          isAppendBody
          data={data}
          onChange={this.handleChange}
          placeholder={text}
          defaultValue={value}
        />
      </div>
    );
  }
}
