import PropTypes from 'prop-types';
import React, { Component } from 'react';
import Dropdown from 'ming-ui/components/Dropdown';
import cx from 'classnames';
import Icon from 'ming-ui/components/Icon';
import Checkbox from 'ming-ui/components/Checkbox';
import { REMINDTYPE } from '../../constant';
import { updateRemind, updateRemindVoice } from '../../common';

const typeArr = [REMINDTYPE.NONE, REMINDTYPE.MINUTE, REMINDTYPE.HOUR, REMINDTYPE.DAY];
const convert = (remindType, remindTime) => {
  const index = typeArr.indexOf(remindType);
  if (index > -1) {
    return remindTime / (index === 3 ? 60 * 24 : Math.pow(60, index - 1));
  } else {
    return null;
  }
};

const convertToMinutes = (remindType, value) => {
  const index = typeArr.indexOf(remindType);
  if (index >= 1) {
    return value * (index === 3 ? 60 * 24 : Math.pow(60, index - 1));
  } else {
    return 0;
  }
};

export default class CalendarRemind extends Component {
  static propTypes = {
    id: PropTypes.string.isRequired,
    change: PropTypes.func.isRequired, // callback
    remindTime: PropTypes.number,
    remindType: PropTypes.oneOf([REMINDTYPE.NONE, REMINDTYPE.MINUTE, REMINDTYPE.HOUR, REMINDTYPE.DAY]),
  };

  constructor(props) {
    super(props);
    this.state = {
      value: convert(props.remindType, props.remindTime),
    };
  }

  componentWillReceiveProps(nextProps) {
    this.setState({
      value: convert(nextProps.remindType, nextProps.remindTime),
    });
  }

  // 修改日程提醒类型
  changeRemindType(value) {
    let setValue = 1;
    if (+value === REMINDTYPE.MINUTE) {
      setValue = 15;
    }
    const callback = () => {
      updateRemind({
        id: this.props.id,
        remindType: +value,
        remindTime: this.state.value,
      }).then(() => {
        this.props.change({
          remindType: +value,
          remindTime: convertToMinutes(+value, this.state.value),
        });
      });
    };
    this.setState(
      {
        value: setValue,
      },
      callback
    );
  }

  // 修改日程提醒时间
  changeRemindTime(event) {
    const { id, remindType, remindTime } = this.props;
    let value = parseInt(event.target.value, 10);
    if (isNaN(value)) {
      value = remindType === REMINDTYPE.MINUTE ? 15 : 1;
    }
    const minutes = convertToMinutes(remindType, value);
    if (minutes === remindTime) {
      this.props.change({
        remindTime: minutes,
      });
    } else {
      updateRemind({
        id,
        remindType,
        remindTime: value,
      }).done(() => {
        this.props.change({
          remindTime: minutes,
        });
      });
    }
  }
  // 修改日程语音提醒
  changeVoiceRemind(checked, value, event) {
    const { id } = this.props;
    const voiceRemind = !checked;
    updateRemindVoice({
      id,
      voiceRemind,
    }).done(() => {
      this.props.change({
        voiceRemind,
      });
    });
  }
  // 修改提醒时间
  onChangeRemind = (evt) => {
    let value = $.trim(evt.currentTarget.value);

    if (value < 0) {
      value = 1;
    } else if (value > 99) {
      value = 99;
    }

    this.setState({ value });
  };

  render() {
    const { remindType, editable, voiceRemind } = this.props;
    const dropDownProps = {
      data: [
        { text: _l('分钟'), value: REMINDTYPE.MINUTE + '' },
        { text: _l('小时'), value: REMINDTYPE.HOUR + '' },
        { text: _l('天'), value: REMINDTYPE.DAY + '' },
        { text: _l('无'), value: REMINDTYPE.NONE + '' },
      ],
      value: remindType + '',
      key: 'remind-input',
      onChange: this.changeRemindType.bind(this),
    };

    if (!editable) {
      return null;
    } else {
      return (
        <div className="calendarRemind calRow">
          <Icon icon={'task-point-more'} className="Font20 calIcon" />
          <div className="calLine">
            <span className="formLabel">{_l('提醒%19000')}:</span>
            {remindType === REMINDTYPE.NONE ? null : (
              <span>
                {_l('提前%19001')}
                <input
                  type="text"
                  className="remindBox ThemeBorderColor3"
                  value={this.state.value}
                  onChange={this.onChangeRemind}
                  onBlur={this.changeRemindTime.bind(this)}
                />
              </span>
            )}
            <Dropdown {...dropDownProps} className="InlineBlock" />
            {remindType === REMINDTYPE.NONE ? null : (
              <span className="mLeft50 Gray_9e InlineBlock">
                <Checkbox className="Font12 InlineBlock TxtMiddle" size="small" checked={voiceRemind} onClick={this.changeVoiceRemind.bind(this)}>
                  {_l('电话提醒')}
                </Checkbox>
                <span className="mLeft10 TxtMiddle" data-tip={_l('勾选电话提醒，将以电话语音形式通知您')}>
                  <i className="icon-help" />
                </span>
              </span>
            )}
          </div>
        </div>
      );
    }
  }
}
