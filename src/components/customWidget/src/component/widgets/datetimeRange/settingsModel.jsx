import React from 'react';
import config from '../../../config';
import moment from 'moment';

import Dropdown from 'ming-ui/components/Dropdown';
import Checkbox from 'ming-ui/components/Checkbox';
import RadioGroup from 'ming-ui/components/RadioGroup';
import DatePicker from 'ming-ui/components/DatePicker';
import Support from 'ming-ui/components/Support'

const RangePicker = DatePicker.RangePicker;

import { DefaultValueOptions, InputType, RangeLengthType, SignType, getRange } from './data';
import firstInputSelect from '../../common/firstInputSelect';

@firstInputSelect
class SettingsModel extends React.Component {
  isSignAvailable = true;
  /**
   * 默认数据
   */
  defaultValueTypeOptions = [
    {
      value: DefaultValueOptions.NONE,
      text: _l('不设置'),
    },
    {
      value: DefaultValueOptions.TODAY,
      text: _l('当日'),
    },
    {
      value: DefaultValueOptions.THIS_WEEK,
      text: _l('本周'),
    },
    {
      value: DefaultValueOptions.LAST_SEVEN_DAYS,
      text: _l('最近 7 天'),
    },
    {
      value: DefaultValueOptions.THIS_MONTH,
      text: _l('本月'),
    },
    {
      value: DefaultValueOptions.PICK,
      text: _l('指定日期'),
    },
  ];

  /**
   * 控件类型
   */
  controlTypeOptions = [
    {
      value: SignType.DATETIMERANGE,
      text: _l('不关联'),
    },
    {
      value: SignType.LEAVE,
      text: _l('请假类型'),
    },
    {
      value: SignType.OVERTIME,
      text: _l('加班类型'),
    },
    {
      value: SignType.FIELDWORK,
      text: _l('出差类型'),
    },
  ];

  /**
   * 时间段控件类型
   */
  typeOptions = [
    {
      value: InputType.DATE,
      text: _l('日期'),
    },
    {
      value: InputType.DATE_TIME,
      text: _l('日期时间'),
    },
  ];

  /**
   * 是否显示时长统计
   */
  showRangeLengthOptions = [
    {
      value: RangeLengthType.show,
      text: _l('显示'),
    },
    {
      value: RangeLengthType.hide,
      text: _l('不显示'),
    },
  ];

  /**
   * 修改控件类型
   */
  controlTypeChanged = value => {
    let controlName = '时间段';
    if (value === SignType.LEAVE) {
      controlName = '请假';
    } else if (value === SignType.OVERTIME) {
      controlName = '加班';
    } else if (value === SignType.FIELDWORK) {
      controlName = '出差';
    } else if (value === SignType.OUTWORK) {
      controlName = '出差';
    }
    this.props.changeWidgetData(this.props.widget.id, {
      dataSource: value,
      controlName,
    });
  };

  /**
   * 修改时间段控件类型
   */
  typeChanged = value => {
    this.props.changeWidgetData(this.props.widget.id, {
      type: value,
    });
  };

  /**
   * 修改控件名称
   */
  controlNameChanged = () => {
    this.props.changeWidgetData(this.props.widget.id, {
      controlName: this.refs.controlName.value,
    });
  };

  /**
   * 自定义时间段
   */
  updateTimeRange = pickedData => {
    let rangeText = '';
    if (pickedData && pickedData.length === 2) {
      rangeText = `${pickedData[0].valueOf()},${pickedData[1].valueOf()}`;
    } else {
      rangeText = '';
    }

    this.props.changeWidgetData(this.props.widget.id, {
      enumDefault: DefaultValueOptions.PICK,
      default: rangeText,
    });
  };

  /**
   * 修改默认数据
   */
  defaultValueTypeChanged = value => {
    this.props.changeWidgetData(this.props.widget.id, {
      enumDefault: value,
      default: '',
      value: '',
    });
  };

  /**
   * 修改是否显示时长统计
   */
  showRangeLengthChanged = value => {
    this.props.changeWidgetData(this.props.widget.id, {
      enumDefault2: value,
    });
  };

  /**
   * 修改关联到考勤
   */
  bindToSignChanged = (checked, value) => {
    if (checked && !this.props.widget.data.dataSource) {
      this.props.changeWidgetData(this.props.widget.id, {
        dataSource: SignType.LEAVE,
      });
    }

    if (!checked) {
      this.props.changeWidgetData(this.props.widget.id, {
        dataSource: null,
      });
    }
  };

  render() {
    let timeRangePicker = null;

    /**
     * 已选择的时间段数据
     */
    let range = [];
    /**
     * 展示文字
     */
    let pickerText = _l('请选择');

    if (this.props.widget.data.default) {
      this.props.widget.data.default.split(',').map((item, i, list) => {
        range.push(moment(parseInt(item, 10)));
        return null;
      });
    }

    let timeFormat = 'YYYY-MM-DD HH:mm';
    let timePicker = true;
    if (this.props.widget.data.type === InputType.DATE) {
      timeFormat = 'YYYY-MM-DD';
      timePicker = false;
    }

    if (range && range.length === 2) {
      let times = [];
      times = range.map((item, i, list) => {
        return item.format(timeFormat);
      });

      pickerText = times.join(_l(' 至 '));
    }

    if (this.props.widget.data.enumDefault === DefaultValueOptions.PICK) {
      timeRangePicker = (
        <RangePicker
          timePicker={timePicker}
          selectedValue={range}
          format={timeFormat}
          onOk={this.updateTimeRange}
          onClear={this.updateTimeRange}
        >
          <div className="rangePickerToggle ThemeColor3">{pickerText}</div>
        </RangePicker>
      );
    }

    let items = null;
    const dataSource = this.props.widget.data.dataSource;
    if (!dataSource || dataSource === SignType.DATETIMERANGE) {
      items = [
        <div key="type" className="wsItem">
          <span className="wsLf">
            <span>{_l('类型')}</span>
          </span>
          <RadioGroup
            className="wsRadioGroup"
            data={this.typeOptions}
            checkedValue={this.props.widget.data.type}
            onChange={this.typeChanged}
            size="small"
          />
        </div>,
        <div key="name" className="wsItem">
          <span className="wsLf">
            <span>{_l('名称')}</span>
          </span>
          <input
            className="ThemeBorderColor3"
            type="text"
            ref="controlName"
            value={this.props.widget.data.controlName}
            onChange={this.controlNameChanged}
          />
        </div>,
        <div key="default-value" className="wsItem">
          <span className="wsLf">
            <span>{_l('默认项')}</span>
            <span
              className="tip-top-right tipWidth"
              data-tip={_l(
                '用户创建新对象(任务、记录或表单等)时，此处配置的内容作为默认值，会自动填入字段中，填写者仍可再修改',
              )}
              style={{
                verticalAlign: 'middle',
                marginTop: '-5px',
                marginLeft: '4px',
                display: 'inline-block',
                opacity: 1,
                zIndex: 100,
              }}
            >
              <i
                className="icon-novice-circle pointer"
                style={{
                  color: '#b0b0b0',
                }}
              />
            </span>
          </span>
          <Dropdown
            className="wsDropdown noBorder"
            data={this.defaultValueTypeOptions}
            value={this.props.widget.data.enumDefault}
            onChange={this.defaultValueTypeChanged}
            width="140px"
          />
          {timeRangePicker}
        </div>,
        <div key="show-range" className="wsItem">
          <span className="wsLf">
            <span>{_l('时长统计')}</span>
          </span>
          <RadioGroup
            className="wsRadioGroup"
            data={this.showRangeLengthOptions}
            checkedValue={this.props.widget.data.enumDefault2}
            onChange={this.showRangeLengthChanged}
            size="small"
          />
        </div>,
      ];
    }

    let tip = null;
    if (dataSource === SignType.LEAVE) {
      tip = (
        <div
          style={{
            color: '#BDBDBD',
            marginBottom: '16px',
          }}
        >
          {_l('时间段数据将作为请假数据同步到假勤信息')},
          <Support type={3} href="http://support.mingdao.com/hc/kb/article/1130765/" text={_l('了解详情')} />
        </div>
      );
    } else if (dataSource === SignType.OVERTIME) {
      tip = (
        <div
          style={{
            color: '#BDBDBD',
            marginBottom: '16px',
          }}
        >
          {_l('时间段数据将作为加班数据同步到假勤信息')},
          <Support type={3} href="http://support.mingdao.com/hc/kb/article/1130765/" text={_l('了解详情')} />
        </div>
      );
    } else if (dataSource === SignType.FIELDWORK) {
      tip = (
        <div
          style={{
            color: '#BDBDBD',
            marginBottom: '16px',
          }}
        >
          {_l('时间段数据将作为出差数据同步到假勤信息')},
          <Support type={3} href="http://support.mingdao.com/hc/kb/article/1130765/" text={_l('了解详情')} />
        </div>
      );
    }

    return (
      <div>
        {!config.isWorkSheet && (
          <div className="wsItem">
            <span className="wsLf">
              <span>{_l('关联假勤')}</span>
            </span>
            <Dropdown
              className="wsDropdown noBorder"
              data={this.controlTypeOptions}
              value={this.props.widget.data.dataSource || SignType.DATETIMERANGE}
              onChange={this.controlTypeChanged}
              width="140px"
            />
          </div>
        )}
        {items}
        {tip}
      </div>
    );
  }
}

export default {
  type: config.WIDGETS.DATE_TIME_RANGE.type,
  SettingsModel,
};
