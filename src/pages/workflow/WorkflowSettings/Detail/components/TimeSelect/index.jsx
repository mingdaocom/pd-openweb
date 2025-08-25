import React, { Component, Fragment } from 'react';
import { Dropdown } from 'ming-ui';
import Time from 'ming-ui/components/NewTimePicker';
import { EXEC_TIME_TYPE, TIME_TYPE, TIME_TYPE_NAME } from '../../../enum';
import './index.less';

export default class TimeSelect extends Component {
  static defaultProps = {
    dateNoTime: true,
  };

  componentWillReceiveProps(nextProps) {
    if (this.text && this.text.value !== nextProps.data.number) {
      this.text.value = nextProps.data.number;
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
        text: dateNoTime ? _l('在以上日期') : _l('在以上日期时间'),
        value: EXEC_TIME_TYPE.CURRENT,
        className: EXEC_TIME_TYPE.CURRENT === data.executeTimeType ? 'ThemeColor3' : '',
      },
      {
        text: _l('之前'),
        value: EXEC_TIME_TYPE.BEFORE,
        className: EXEC_TIME_TYPE.BEFORE === data.executeTimeType ? 'ThemeColor3' : '',
      },
      {
        text: _l('之后'),
        value: EXEC_TIME_TYPE.AFTER,
        className: EXEC_TIME_TYPE.AFTER === data.executeTimeType ? 'ThemeColor3' : '',
      },
    ];
    const unitList = [
      {
        text: TIME_TYPE_NAME[TIME_TYPE.MINUTE],
        value: TIME_TYPE.MINUTE,
        className: data.unit === TIME_TYPE.MINUTE ? 'ThemeColor3' : '',
      },
      {
        text: TIME_TYPE_NAME[TIME_TYPE.HOUR],
        value: TIME_TYPE.HOUR,
        className: data.unit === TIME_TYPE.HOUR ? 'ThemeColor3' : '',
      },
      {
        text: TIME_TYPE_NAME[TIME_TYPE.DAY],
        value: TIME_TYPE.DAY,
        className: data.unit === TIME_TYPE.DAY ? 'ThemeColor3' : '',
      },
    ];

    return (
      <Fragment>
        <div className="mTop10 flexRow alignItemsCenter">
          <Dropdown
            className="flowDropdown"
            style={{ width: data.executeTimeType === EXEC_TIME_TYPE.CURRENT ? '100%' : 192 }}
            data={list}
            value={data.executeTimeType}
            border
            onChange={this.updateTimeType}
          />
          {data.executeTimeType !== EXEC_TIME_TYPE.CURRENT && (
            <Fragment>
              <input
                type="text"
                className="ThemeBorderColor3 actionControlBox pTop0 pBottom0 pLeft10 pRight10 mLeft15"
                ref={text => {
                  this.text = text;
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
                <Dropdown
                  className="flowDropdown flex mLeft15"
                  data={unitList}
                  value={data.unit}
                  border
                  onChange={value => updateSource({ unit: value })}
                />
              )}
            </Fragment>
          )}
        </div>
        {dateNoTime && (
          <div className="mTop10 flexRow alignItemsCenter timeWidth">
            <Time
              type="minute"
              value={{
                hour: data.time ? parseInt(data.time.split(':')[0]) : 8,
                minute: data.time ? parseInt(data.time.split(':')[1]) : 0,
                second: 0,
              }}
              onChange={(event, value) => {
                updateSource({
                  time: value.hour.toString().padStart(2, '0') + ':' + value.minute.toString().padStart(2, '0'),
                });
              }}
            />
            <div className="flex mLeft15">{_l('执行')}</div>
          </div>
        )}
      </Fragment>
    );
  }
}
