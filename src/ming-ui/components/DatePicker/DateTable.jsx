import React, { Component } from 'react';
import DateTHead from './DateTHead';
import DateTBody from './DateTBody';

export default class DateTable extends Component {
  render() {
    const props = this.props;
    const prefixCls = props.prefixCls;
    return (
      <div className={`${prefixCls}-table`}>
        <DateTHead {...props} />
        <DateTBody {...props} />
      </div>
    );
  }
}
