import React, { Component, Fragment } from 'react';
import moment from 'moment';
import { Input, Select, TimePicker } from 'ming-ui/antd-components';
import { EXEC_TIME_TYPE, TIME_TYPE, TIME_TYPE_NAME } from '../../../enum';

export default class TimeSelect extends Component {
  static defaultProps = {
    dateNoTime: true,
  };

  /**
   * 修改类型
   */
  /**
   * 修改类型
   */

  componentDidUpdate(prevProps) {
    if (prevProps !== this.props) {
      if (this.text && this.text.value !== this.props.data.number) {
        this.text.value = this.props.data.number;
      }
    }
  }

  /**
   * 修改类型
   */
  updateTimeType = executeTimeType => {
    const { updateSource, dateNoTime } = this.props;
    let number;
    let unit;

    if (executeTimeType === EXEC_TIME_TYPE.CURRENT) {
      number = 0;
      unit = TIME_TYPE.DAY;
    } else {
      number = dateNoTime ? 1 : 15;
      unit = dateNoTime ? TIME_TYPE.DAY : TIME_TYPE.MINUTE;
      if (this.text) {
        this.text.value = number;
      }
    }

    updateSource({ executeTimeType, number, unit });
  };

  /**
   * 验证数值金额控件
   */
  checkNumberControl(evt, isBlur) {
    const num = evt.target.value.replace(/[^\d]/g, '');

    evt.target.value = num;

    if (isBlur) {
      this.props.updateSource({ number: num || 15 });
    }
  }

  render() {
    const { data, dateNoTime, updateSource } = this.props;
    const list = [
      {
        label: dateNoTime ? _l('在以上日期') : _l('在以上日期时间'),
        value: EXEC_TIME_TYPE.CURRENT,
      },
      {
        label: _l('之前'),
        value: EXEC_TIME_TYPE.BEFORE,
      },
      {
        label: _l('之后'),
        value: EXEC_TIME_TYPE.AFTER,
      },
    ];
    const unitList = [
      {
        label: TIME_TYPE_NAME[TIME_TYPE.MINUTE],
        value: TIME_TYPE.MINUTE,
      },
      {
        label: TIME_TYPE_NAME[TIME_TYPE.HOUR],
        value: TIME_TYPE.HOUR,
      },
      {
        label: TIME_TYPE_NAME[TIME_TYPE.DAY],
        value: TIME_TYPE.DAY,
      },
    ];

    return (
      <Fragment>
        <div className="mTop10 flexRow alignItemsCenter">
          <Select
            className="flowDropdown"
            style={{ width: data.executeTimeType === EXEC_TIME_TYPE.CURRENT ? '100%' : 192 }}
            options={list}
            value={data.executeTimeType}
            onChange={this.updateTimeType}
          />
          {data.executeTimeType !== EXEC_TIME_TYPE.CURRENT && (
            <Fragment>
              <Input
                className="mLeft15"
                ref={text => {
                  this.text = text?.input;
                }}
                defaultValue={data.number}
                style={{ width: 100, minWidth: 80 }}
                onKeyUp={evt => this.checkNumberControl(evt)}
                onPaste={evt => this.checkNumberControl(evt)}
                onBlur={evt => this.checkNumberControl(evt, true)}
              />
              {dateNoTime ? (
                <div className="mLeft15 flex">{TIME_TYPE_NAME[data.unit] || _l('天')}</div>
              ) : (
                <Select
                  className="flowDropdown flex mLeft15"
                  options={unitList}
                  value={data.unit}
                  onChange={value => updateSource({ unit: value })}
                />
              )}
            </Fragment>
          )}
        </div>
        {dateNoTime && (
          <div className="mTop10 flexRow alignItemsCenter">
            <TimePicker
              allowClear={false}
              format="HH:mm"
              inputReadOnly
              showNow={false}
              value={moment(data.time || '08:00', 'HH:mm')}
              onChange={(time, timeString) => updateSource({ time: timeString })}
            />
            <div className="flex mLeft15">{_l('执行')}</div>
          </div>
        )}
      </Fragment>
    );
  }
}
