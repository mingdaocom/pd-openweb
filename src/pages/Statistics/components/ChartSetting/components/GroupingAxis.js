import React, { Component } from 'react';
import { Dropdown, Menu } from 'antd';
import _ from 'lodash';
import { Icon } from 'ming-ui';
import { Tooltip } from 'ming-ui/antd-components';
import { reportTypes } from 'statistics/Charts/common';
import {
  areaParticleSizeDropdownData,
  filterAreaParticleSizeDropdownData,
  filterDisableParticleSizeTypes,
  isAreaControl,
  isNumberControl,
  isOptionControl,
  isTimeControl,
  timeGatherParticle,
  timeParticleSizeDropdownData,
} from 'statistics/common';
import { WIDGETS_TO_API_TYPE_ENUM } from 'src/pages/widgetConfig/config/widget';
import WithoutFidldItem from './WithoutFidldItem';

const emptyTypes = [
  {
    value: 0,
    name: _l('隐藏'),
  },
  {
    value: 1,
    name: _l('显示'),
  },
];

const timeGather = timeParticleSizeDropdownData.filter(item => [5, 8, 9, 10, 11].includes(item.value));
const timeParticle = timeGatherParticle.filter(item => [11, 12, 14].includes(item.value));

export default class GroupingAxis extends Component {
  constructor(props) {
    super(props);
  }
  handleVerification = (data, isAlert = false) => {
    const { reportType, xaxes, yaxisList } = this.props;

    if (
      [reportTypes.ScatterChart, reportTypes.WorldMap].includes(reportType) &&
      _.find(yaxisList, { controlId: data.controlId })
    ) {
      isAlert && alert(_l('数值和颜色不允许重复'), 2);
      return false;
    }

    if (reportTypes.WorldMap === reportType && data.type === 40) {
      isAlert && alert(_l('不支持定位字段'), 2);
      return false;
    }

    if (
      [reportTypes.BarChart, reportTypes.RadarChart].includes(reportType) &&
      xaxes.controlId &&
      yaxisList.length > 1
    ) {
      isAlert && alert(_l('多数值时不能同时配置维度和分组'), 2);
      return false;
    }

    if (isNumberControl(data.type)) {
      isAlert && alert('数值和公式字段不能分组', 2);
      return false;
    } else {
      return true;
    }
  };
  handleAddControl = data => {
    if (this.handleVerification(data, true)) {
      const { disableParticleSizeTypes } = this.props;
      const isTime = isTimeControl(data.type);
      const isArea = isAreaControl(data.type);
      const dropdownData = isTime ? timeGather : areaParticleSizeDropdownData;
      const newDisableParticleSizeTypes = filterDisableParticleSizeTypes(data.controlId, disableParticleSizeTypes);
      const allowTypes = dropdownData
        .map(item => item.value)
        .filter(item => !newDisableParticleSizeTypes.includes(item));
      this.props.onChangeCurrentReport({
        controlId: data.controlId,
        particleSizeType: isTime || isArea ? allowTypes[0] : 0,
        ...data,
      });
    }
  };
  handleClear = () => {
    this.props.onChangeCurrentReport({
      controlId: null,
      particleSizeType: 0,
    });
  };
  handleChangeTimeParticleSizeType = value => {
    this.props.onChangeCurrentReport({
      particleSizeType: value,
    });
  };
  handleChangeEmptyType = value => {
    this.props.onChangeCurrentReport({
      emptyType: value,
    });
  };
  getName = () => {
    const { reportType } = this.props;
    if (reportType === reportTypes.DualAxes) {
      return _l('分组(Y轴)');
    }
    if (reportType === reportTypes.BidirectionalBarChart) {
      return _l('分组(数值1)');
    }
    if ([reportTypes.ScatterChart, reportTypes.WorldMap].includes(reportType)) {
      return _l('颜色(维度)');
    }
    return _l('分组');
  };
  renderTimeOverlay() {
    const { split, disableParticleSizeTypes } = this.props;
    const newDisableParticleSizeTypes = filterDisableParticleSizeTypes(split.controlId, disableParticleSizeTypes);
    const timeDataList = split.controlType === WIDGETS_TO_API_TYPE_ENUM.TIME ? timeParticle : timeGather;
    return (
      <Menu className="chartControlMenu chartMenu">
        {timeDataList.map(item => (
          <Menu.Item
            className="valignWrapper"
            disabled={item.value === split.particleSizeType ? true : newDisableParticleSizeTypes.includes(item.value)}
            style={{ color: item.value === split.particleSizeType ? '#1e88e5' : null }}
            key={item.value}
            onClick={() => {
              this.handleChangeTimeParticleSizeType(item.value);
            }}
          >
            <div className="flex">{item.text}</div>
            <div className="Gray_75 Font12">{item.getTime()}</div>
          </Menu.Item>
        ))}
      </Menu>
    );
  }
  renderAreaOverlay(axis) {
    const { split, disableParticleSizeTypes } = this.props;
    const newDisableParticleSizeTypes = filterDisableParticleSizeTypes(split.controlId, disableParticleSizeTypes);
    const areaParticleSizeDropdownData = filterAreaParticleSizeDropdownData(axis);
    return (
      <Menu className="chartControlMenu chartMenu">
        {areaParticleSizeDropdownData.map(item => (
          <Menu.Item
            className="valignWrapper"
            disabled={item.value === split.particleSizeType ? true : newDisableParticleSizeTypes.includes(item.value)}
            style={{ color: item.value === split.particleSizeType ? '#1e88e5' : null }}
            key={item.value}
            onClick={() => {
              this.handleChangeTimeParticleSizeType(item.value);
            }}
          >
            <div className="flex">{item.text}</div>
          </Menu.Item>
        ))}
      </Menu>
    );
  }
  renderOptionOverlay() {
    const { split } = this.props;
    return (
      <Menu className="chartControlMenu chartMenu" expandIcon={<Icon icon="arrow-right-tip" />}>
        <Menu.SubMenu
          popupClassName="chartMenu"
          title={
            <div className="flexRow valignWrapper w100">
              <div className="flex">{_l('无记录的项目')}</div>
              <div className="Font12 Gray_75 emptyTypeName">{split.emptyType ? _l('显示') : _l('隐藏')}</div>
            </div>
          }
          popupOffset={[0, -15]}
        >
          {emptyTypes.map(item => (
            <Menu.Item
              key={item.value}
              style={{ color: item.value === split.emptyType ? '#1e88e5' : null }}
              onClick={() => {
                this.handleChangeEmptyType(item.value);
              }}
            >
              {item.name}
            </Menu.Item>
          ))}
        </Menu.SubMenu>
      </Menu>
    );
  }
  renderAxis() {
    const { split, axisControls, allControls, reportType } = this.props;
    const axis = _.find(axisControls, { controlId: split.controlId });
    const control = _.find(allControls, { controlId: split.controlId }) || {};
    const isTime = isTimeControl(split.controlType);
    const isArea = isAreaControl(split.controlType);
    const isOption = isOptionControl(split.controlType) && reportTypes.ScatterChart !== reportType;
    return (
      <div className="flexRow valignWrapper fidldItem">
        {axis ? (
          <span className="Gray flex ellipsis">
            {axis.controlName}
            {isTime && ` (${_.find(timeParticleSizeDropdownData, { value: split.particleSizeType || 1 }).text})`}
            {isArea &&
              ` (${_.get(_.find(areaParticleSizeDropdownData, { value: split.particleSizeType || 1 }), 'text')})`}
          </span>
        ) : control.strDefault === '10' ? (
          <span className="Red flex ellipsis">{`${control.controlName} (${_l('无效类型')})`}</span>
        ) : (
          <Tooltip title={`ID: ${split.controlId}`}>
            <span className="Red flex ellipsis">{_l('字段已删除')}</span>
          </Tooltip>
        )}
        {isTime && (
          <Dropdown
            overlay={this.renderTimeOverlay(axis)}
            trigger={['click']}
            placement="bottomRight"
            getPopupContainer={() => document.querySelector('.ChartDialogContainer .setting')}
          >
            <Icon className="Gray_9e Font18 pointer" icon="arrow-down-border" />
          </Dropdown>
        )}
        {isArea && (
          <Dropdown overlay={this.renderAreaOverlay(axis)} trigger={['click']} placement="bottomRight">
            <Icon className="Gray_9e Font18 pointer" icon="arrow-down-border" />
          </Dropdown>
        )}
        {isOption && (
          <Dropdown overlay={this.renderOptionOverlay(axis)} trigger={['click']} placement="bottomRight">
            <Icon className="Gray_9e Font18 pointer" icon="arrow-down-border" />
          </Dropdown>
        )}
        <Icon className="Gray_9e Font18 pointer mLeft10" icon="close" onClick={this.handleClear} />
      </div>
    );
  }
  render() {
    const { name, split, yaxisList, reportType } = this.props;
    const visible = [
      reportTypes.BarChart,
      reportTypes.RadarChart,
      reportTypes.ScatterChart,
      reportTypes.WorldMap,
    ].includes(reportType)
      ? true
      : yaxisList.length === 1;
    return visible ? (
      <div className="fieldWrapper mBottom20">
        <div className="Bold mBottom12">{name || this.getName()}</div>
        {split.controlId ? (
          this.renderAxis()
        ) : (
          <WithoutFidldItem onVerification={this.handleVerification} onAddControl={this.handleAddControl} />
        )}
      </div>
    ) : null;
  }
}
