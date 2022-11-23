import React from 'react';
import config from '../../../config';
import RadioGroup from '../../common/radioGroup';
import Dropdown from '../../common/dropdown';
import locale from 'antd/es/date-picker/locale/zh_CN';
import { DatePicker } from 'antd';
import 'src/components/tooltip/tooltip';
import moment from 'moment';
import firstInputSelect from '../../common/firstInputSelect';

@firstInputSelect
class SettingsModel extends React.Component {
  constructor(props) {
    super(props);
  }

  handleChange() {
    let data = {
      controlName: this.refs.controlName.value,
    };
    this.props.changeWidgetData(this.props.widget.id, data);
  }

  changeRadioValue(value) {
    $(this.refs.date).data('hasdatepicker', false);
    this.props.changeWidgetData(
      this.props.widget.id,
      {
        type: value,
      },
      true
    );
  }

  changeDateType(value) {
    this.props.changeWidgetData(this.props.widget.id, {
      enumDefault: parseInt(value, 10),
      default: '',
      value: '',
    });
  }

  componentDidMount() {
    let that = this;
    $('.iconDateMessage').MD_UI_Tooltip({
      text: _l('默认项的指定日期是指默认显示任务创建的日期'),
      arrowLeft: 120,
      offsetLeft: -130,
      offsetTop: -50,
      location: 'up',
    });
  }

  componentWillReceiveProps(nextProps, nextState) {
    if (nextProps.widget.id !== this.props.widget.id) {
      $(this.refs.date).data('hasdatepicker', false);
    }
  }

  render() {
    let { widget } = this.props;
    let radios = this.props.widget.typeArr.map(item => {
      return {
        name: item.name,
        value: item.type,
      };
    });
    let defaultDateTimeTypes = widget.defaultArr;
    if ((config.isWorkSheet || config.isTask) && this.props.widget.data.type === 16) {
      defaultDateTimeTypes = [
        {
          value: 1,
          name: _l('不设置'),
        },
        {
          value: 2,
          name: _l('当前时间'),
        },
        {
          value: 3,
          name: _l('24小时后'),
        },
        {
          value: 4,
          name: _l('指定时间'),
        },
      ];
    }

    return (
      <div className="">
        <div className="wsItem">
          <span className="wsLf">{_l('类型')}</span>
          <RadioGroup data={radios} checkedValue={this.props.widget.data.type} changeRadioValue={this.changeRadioValue.bind(this)} size="small" />
        </div>
        <div className="wsItem">
          <span className="wsLf">{_l('名称')}</span>
          <input
            className="ThemeBorderColor3"
            data-editcomfirm="true"
            type="text"
            ref="controlName"
            value={this.props.widget.data.controlName}
            onChange={this.handleChange.bind(this)}
            maxLength="100"
          />
        </div>
        <div className="wsItem">
          <span className="wsLf">
            <span>{_l('默认项')}</span>
            <span
              className="tip-top-right"
              data-tip={_l('默认项是指默认显示填写的时间')}
              style={{
                verticalAlign: 'middle',
                marginTop: '-5px',
                marginLeft: '4px',
                display: 'inline-block',
                opacity: 1,
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
          <Dropdown data={defaultDateTimeTypes} value={widget.data.enumDefault} onChange={this.changeDateType.bind(this)} width="140px" />
          {widget.data.enumDefault === 4 && (
            <span className="mLeft10">
              <DatePicker
                showTime={widget.data.type === 16 ? { format: 'HH:mm' } : null}
                locale={locale}
                value={moment(widget.data.default)}
                placeholder={_l('选择日期')}
                onChange={(value) => {
                  const time = value ? value.format(widget.data.type === 16 ? 'YYYY-MM-DD HH:mm' : 'YYYY-MM-DD') : '';
                  this.props.changeWidgetData(
                    widget.id,
                    {
                      default: time,
                    },
                    true
                  );
                }}
              />
            </span>
          )}
        </div>
      </div>
    );
  }
}

export default {
  type: config.WIDGETS.DATE_INPUT.type,
  SettingsModel,
};
