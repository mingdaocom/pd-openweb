import React from 'react';
import config from '../../../config';
import RadioGroup from '../../common/radioGroup';
import Dropdown from '../../common/dropdown';
import 'bootstrap-daterangepicker';
import 'bootstrap-daterangepicker/daterangepicker.css';
import '@mdfe/date-picker-tpl/datePickerTpl.css';
import 'src/components/tooltip/tooltip';
import datePickerTpl from '@mdfe/date-picker-tpl';
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

    $(that.refs.date).on('mousedown', function () {
      let $this = $(this);
      if ($this.data('hasdatepicker')) {
        return;
      }
      $this
        .daterangepicker({
          parentEl: '#customFildsEvents_container',
          template: datePickerTpl.single(that.props.widget.data.type === 16),
          showDropdowns: true,
          autoUpdateInput: false,
          singleDatePicker: true,
          timePicker: true,
          timePicker24Hour: true,
          startDate: moment().format('YYYY-MM-DD HH:mm'),
          opens: 'left',
          drops: config.isWorkSheet ? 'down' : 'up',
          locale: {
            format: 'YYYY-MM-DD HH:mm',
            applyLabel: _l('确定'),
            cancelLabel: _l('清空'),
            daysOfWeek: [0, 1, 2, 3, 4, 5, 6].map(function (item) {
              return moment()
                .day(item)
                .format('dd');
            }),
            monthNames: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].map(function (item) {
              return moment()
                .month(item)
                .format('MMM');
            }),
            firstDay: 1,
          },
        })
        .on({
          'apply.daterangepicker': (event, picker) => {
            var time = picker.startDate.format(that.props.widget.data.type === 16 ? 'YYYY-MM-DD HH:mm' : 'YYYY-MM-DD');
            that.props.changeWidgetData(
              that.props.widget.id,
              {
                default: time,
              },
              true
            );
          },
          'cancel.daterangepicker': (event, picker) => {
            that.props.changeWidgetData(
              that.props.widget.id,
              {
                default: '',
              },
              true
            );
          },
        });

      $this.data('hasdatepicker', true);
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
          <input
            type="text"
            ref="date"
            style={{
              display: widget.data.enumDefault === 4 ? 'inline-block' : 'none',
              height: '32px',
              border: '1px solid #ccc',
              width: '131px',
              borderRadius: '3px',
              marginLeft: '25px',
              cursor: 'pointer',
              lineHeight: '32px',
              paddingLeft: '10px',
              verticalAlign: 'top',
              boxSizing: 'border-box',
            }}
            placeholder={_l('选择日期')}
            value={this.props.widget.data.default}
            readOnly="true"
          />
        </div>
      </div>
    );
  }
}

export default {
  type: config.WIDGETS.DATE_INPUT.type,
  SettingsModel,
};
