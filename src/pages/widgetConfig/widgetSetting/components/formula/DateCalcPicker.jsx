import React, { Component } from 'react';
import _ from 'lodash';
import moment from 'moment';
import PropTypes from 'prop-types';
import Trigger from 'rc-trigger';
import { DatePicker, Menu, MenuItem } from 'ming-ui';
import { Tooltip } from 'ming-ui/antd-components';
import { getIconByType } from 'src/pages/widgetConfig/util';
import './DateCalcPicker.less';

export default class DateCalcPicker extends Component {
  static propTypes = {
    value: PropTypes.string, // 选中值 可以为 日期字符串 id 或 $id$
    widgets: PropTypes.arrayOf(PropTypes.shape({})).isRequired, // widgets editWidgets 或 control 数组
    onChange: PropTypes.func.isRequired, //  返回 value
    emptyText: PropTypes.string, // 空提示
    hidedIds: PropTypes.arrayOf(PropTypes.string), // 需要隐藏的字段
    worksheetData: PropTypes.shape({}), // 记录对象
  };

  static defaultProps = {
    widgets: [],
    hidedIds: [],
    worksheetData: {},
    onChange: () => {},
  };

  constructor(props) {
    super(props);
    this.state = {
      showMenu: false,
    };
  }

  formatDate(control, worksheetData) {
    let dateStr;
    let type = control.type;
    if (type === 15 || type === 16) {
      dateStr = worksheetData[control.controlId];
    }
    if (!dateStr) {
      return _l('空');
    }
    return type === 15 ? moment(dateStr).format('YYYY-MM-DD') : moment(dateStr).format('YYYY-MM-DD HH:mm');
  }

  handleChange(value) {
    const { onChange } = this.props;
    this.setState({ value, showMenu: false });
    onChange(value ? `$${value}$` : '');
  }

  renderSelected(selected) {
    return selected.deleted ? <div className="controlItem error">{_l('字段已删除')}</div> : selected.element;
  }

  renderDatePicker(value) {
    const { onChange } = this.props;
    return (
      <DatePicker
        timePicker
        offset={{ left: -1, top: 1 }}
        selectedValue={value ? moment(value) : moment()}
        defaultVisible={false}
        onOk={newDate => {
          const newValue = newDate.format('YYYY-MM-DD HH:mm');
          this.setState({ value: newValue, showMenu: false });
          onChange(newValue);
        }}
        onClear={() => {
          this.handleChange();
        }}
      >
        <div className="selectedDate">{value && moment(value).format('YYYY-MM-DD HH:mm')}</div>
      </DatePicker>
    );
  }

  getList() {
    let { widgets, hidedIds, worksheetData } = this.props;
    widgets = _.flatten(widgets).map(widget => (widget.data ? widget : { id: widget.controlId, data: widget }));
    return _.flatten(widgets)
      .filter(
        w =>
          w &&
          (w.data.type === 15 || // 日期
            w.data.type === 16 || // 日期和时间
            w.data.enumDefault2 === 15 || // 汇总日期
            w.data.enumDefault2 === 16 || // 汇总日期和时间
            (w.data.type === 29 &&
              w.data.sourceControl &&
              (w.data.sourceControl.type === 15 || w.data.sourceControl.type === 16)) ||
            (w.data.type === 30 &&
              w.data.sourceControl &&
              (w.data.sourceControl.type === 15 || w.data.sourceControl.type === 16))),
      )
      .concat([
        {
          id: 'ctime',
          data: {
            type: 16,
            controlId: 'ctime',
            controlName: _l('创建时间'),
          },
        },
        {
          id: 'utime',
          data: {
            type: 16,
            controlId: 'utime',
            controlName: _l('最近修改时间'),
          },
        },
      ])
      .map(widget => ({
        value: widget.data.controlId || widget.id,
        element: (
          <span className="controlItem">
            <i className={`controlIcon icon-${getIconByType(widget.data.type)}`}></i>
            <span className="controlName ellipsis">{widget.data.controlName}</span>
            <span className="controlValue ellipsis">{this.formatDate(widget.data, worksheetData)}</span>
          </span>
        ),
        hide: _.includes(hidedIds.filter(_.identity), `$${widget.data.controlId || widget.id}$`),
      }));
  }

  render() {
    const { emptyText } = this.props;
    let { value } = this.props;
    const { showMenu } = this.state;
    value = value && value[0] === '$' ? value.slice(1, -1) : value;
    const list = this.getList();
    const visibleList = list.filter(item => !item.hide);
    const selected = _.find(list, item => item.value === value) || { deleted: true };
    const pickDate = !value || !/^([a-z0-9]{24}|-[0-9]+\.[0-9]+|ctime|utime)$/.test(value);
    const popup = (
      <Menu
        className="dateCalcDropdown"
        style={{ width: 310 }}
        onClickAwayExceptions={[this.btn]}
        onClickAway={() => {
          this.setState({ showMenu: false });
        }}
      >
        {visibleList.map((item, i) => (
          <MenuItem
            key={i}
            onClick={() => {
              this.handleChange(item.value);
            }}
          >
            {item.element}
          </MenuItem>
        ))}
        {!visibleList.length && <div className="empty">{emptyText || _l('没有可选的字段')}</div>}
      </Menu>
    );
    return (
      <Trigger
        className="columnSelectDropdown"
        popupAlign={{
          points: ['tl', 'bl'],
        }}
        popup={popup}
        popupVisible={showMenu}
      >
        <div className="dropdownHead">
          {pickDate && this.renderDatePicker(value)}
          {!pickDate && value && this.renderSelected(selected)}
          <Tooltip title={_l('选择字段')} placement="bottom">
            <span
              className="rightIcon Right Hand ThemeHoverColor3"
              ref={btn => (this.btn = btn)}
              onClick={() => {
                this.setState({ showMenu: true });
              }}
            >
              <i className="icon icon-workflow_other"></i>
            </span>
          </Tooltip>
          {value && (
            <i
              className="icon icon-close remove Hand Right"
              onClick={() => {
                this.handleChange();
              }}
            ></i>
          )}
        </div>
      </Trigger>
    );
  }
}
