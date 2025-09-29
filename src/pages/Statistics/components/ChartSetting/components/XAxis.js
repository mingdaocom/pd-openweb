import React, { Component, Fragment } from 'react';
import { Dropdown, Menu, Tooltip } from 'antd';
import _ from 'lodash';
import { Icon } from 'ming-ui';
import { reportTypes } from 'statistics/Charts/common';
import {
  areaParticleSizeDropdownData,
  cascadeParticleSizeDropdownData,
  filterAreaParticleSizeDropdownData,
  filterTimeData,
  filterTimeGatherParticle,
  formatTimeFormats,
  isAreaControl,
  isOptionControl,
  isTimeControl,
  isXAxisControl,
  timeDataParticle,
  timeFormats,
  timeGatherParticle,
  timeParticleSizeDropdownData,
} from 'statistics/common';
import { ShowFormatDialog } from 'src/pages/widgetConfig/widgetSetting/components/WidgetHighSetting/ControlSetting/DateConfig';
import RenameModal from './RenameModal';
import WithoutFidldItem from './WithoutFidldItem';

const emptyTypes = [
  {
    value: 0,
    name: _l('隐藏'),
  },
  {
    value: 1,
    name: _l('显示为 0'),
  },
  {
    value: 2,
    name: _l('显示为 --'),
  },
];

const numberChartEmptyTypes = [
  {
    value: 0,
    name: _l('隐藏'),
  },
  {
    value: 1,
    name: _l('显示'),
  },
];

const lineChartEmptyTypes = [
  {
    value: 0,
    name: _l('隐藏'),
  },
  {
    value: 1,
    name: _l('显示为 0'),
  },
  {
    value: 2,
    name: _l('显示为 -- (连续)'),
  },
  {
    value: 3,
    name: _l('显示为 -- (中断)'),
  },
];

const getEmptyTypes = reportType => {
  if (reportType === reportTypes.LineChart) {
    return lineChartEmptyTypes;
  }
  if (reportType === reportTypes.NumberChart) {
    return numberChartEmptyTypes;
  }
  return emptyTypes;
};

const getIsEmptyType = (reportType, { isTime, isOption }) => {
  if (
    [
      reportTypes.BarChart,
      reportTypes.LineChart,
      reportTypes.DualAxes,
      reportTypes.RadarChart,
      reportTypes.NumberChart,
    ].includes(reportType) &&
    (isTime || isOption)
  ) {
    return true;
  }
  if ([reportTypes.NumberChart, reportTypes.FunnelChart].includes(reportType) && isOption) {
    return true;
  }
  return false;
};

export default class XAxis extends Component {
  constructor(props) {
    super(props);
    const { xaxes } = props.currentReport;
    this.state = {
      dialogVisible: false,
      showFormat: _.find(timeFormats, { value: xaxes.showFormat }) ? '' : xaxes.showFormat,
      showFormatDialogVisible: false,
    };
  }
  handleUpdateTimeParticleSizeType = value => {
    const { xaxes, sorts } = this.props.currentReport;
    const id = xaxes.particleSizeType ? `${xaxes.controlId}-${xaxes.particleSizeType}` : xaxes.controlId;
    this.props.onChangeCurrentReport(
      {
        xaxes: {
          ...xaxes,
          particleSizeType: value,
          showFormat: '0',
        },
        sorts: sorts.filter(item => _.findKey(item) !== id),
      },
      true,
    );
  };
  handleChangeXaxes = data => {
    const { xaxes } = this.props.currentReport;
    this.props.onChangeCurrentReport(
      {
        xaxes: {
          ...xaxes,
          ...data,
        },
      },
      true,
    );
  };
  handleVerification = (data, isAlert = false) => {
    const { reportType, split, yaxisList } = this.props.currentReport;
    if ([reportTypes.CountryLayer].includes(reportType) && !isAreaControl(data.type)) {
      isAlert && alert(_l('行政区域图仅支持地区字段可作为x轴维度'), 2);
      return false;
    }
    if ([reportTypes.FunnelChart].includes(reportType) && isTimeControl(data.type)) {
      isAlert && alert(_l('时间类型不能作为x轴维度'), 2);
      return false;
    }
    if ([reportTypes.PieChart].includes(reportType) && yaxisList.length > 1) {
      isAlert && alert(_l('多数值时不能同时配置维度'), 2);
      return false;
    }
    if (
      [reportTypes.BarChart, reportTypes.RadarChart].includes(reportType) &&
      split.controlId &&
      yaxisList.length > 1
    ) {
      isAlert && alert(_l('多数值时不能同时配置维度和分组'), 2);
      return false;
    }
    if (isXAxisControl(data.type)) {
      return true;
    } else {
      isAlert && alert(_l('该字段不能作为x轴维度'), 2);
      return false;
    }
  };
  handleAddControl = data => {
    if (this.handleVerification(data, true)) {
      this.props.addXaxes(data);
    }
  };
  renderModal() {
    const { dialogVisible, showFormat, showFormatDialogVisible } = this.state;
    const { xaxes } = this.props.currentReport;
    return (
      <Fragment>
        <RenameModal
          dialogVisible={dialogVisible}
          rename={xaxes.rename || xaxes.controlName}
          onChangeRename={rename => {
            this.handleChangeXaxes({ rename });
            this.setState({ dialogVisible: false });
          }}
          onHideDialogVisible={() => {
            this.setState({
              dialogVisible: false,
            });
          }}
        />
        {showFormatDialogVisible && (
          <ShowFormatDialog
            showformat={showFormat}
            onClose={() => this.setState({ showFormatDialogVisible: false })}
            onOk={value => {
              this.handleChangeXaxes({ showFormat: value });
              this.setState({ showFormatDialogVisible: false });
            }}
          />
        )}
      </Fragment>
    );
  }
  renderOverlay(axis) {
    const { disableParticleSizeTypes } = this.props;
    const { xaxes, reportType } = this.props.currentReport;
    const isOption = isOptionControl(xaxes.controlType);
    const isTime = isTimeControl(xaxes.controlType);
    const isArea = reportType !== reportTypes.CountryLayer && isAreaControl(xaxes.controlType);
    const isLineChart = reportType === reportTypes.LineChart;
    const showtype = _.get(axis, 'advancedSetting.showtype');
    const timeDataList = isTime ? filterTimeData(timeDataParticle, { showtype, controlType: xaxes.controlType }) : [];
    const timeGatherParticleList = filterTimeGatherParticle(timeGatherParticle, {
      showtype,
      controlType: xaxes.controlType,
    });
    const areaParticleSizeDropdownData = filterAreaParticleSizeDropdownData(axis);

    if (!isLineChart && xaxes.emptyType === 3) {
      xaxes.emptyType = 2;
    }

    return (
      <Menu className="chartControlMenu chartMenu" expandIcon={<Icon icon="arrow-right-tip" />} subMenuOpenDelay={0.2}>
        <Menu.Item
          onClick={() => {
            this.setState({ dialogVisible: true });
          }}
        >
          {_l('重命名')}
        </Menu.Item>
        {isTime && (
          <Fragment>
            <Menu.SubMenu popupClassName="chartMenu" title={_l('归组')} popupOffset={[0, -15]}>
              <Menu.ItemGroup title={_l('时间')}>
                {timeDataList.map(item => (
                  <Menu.Item
                    className="valignWrapper"
                    disabled={
                      item.value === xaxes.particleSizeType ? true : disableParticleSizeTypes.includes(item.value)
                    }
                    style={{ width: 200, color: item.value === (xaxes.particleSizeType || 1) ? '#1e88e5' : null }}
                    key={item.value}
                    onClick={() => {
                      this.handleUpdateTimeParticleSizeType(item.value);
                    }}
                  >
                    <div className="flex">{item.text}</div>
                    <div className="Gray_75 Font12">{item.getTime(xaxes.showFormat)}</div>
                  </Menu.Item>
                ))}
              </Menu.ItemGroup>
              {!!timeGatherParticleList.length && (
                <Fragment>
                  <Menu.Divider />
                  <Menu.ItemGroup title={_l('集合')}>
                    {timeGatherParticleList.map(item => (
                      <Menu.Item
                        className="valignWrapper"
                        disabled={
                          item.value === xaxes.particleSizeType ? true : disableParticleSizeTypes.includes(item.value)
                        }
                        style={{ width: 200, color: item.value === (xaxes.particleSizeType || 1) ? '#1e88e5' : null }}
                        key={item.value}
                        onClick={() => {
                          this.handleUpdateTimeParticleSizeType(item.value);
                        }}
                      >
                        <div className="flex">{item.text}</div>
                        <div className="Gray_75 Font12">{item.getTime()}</div>
                      </Menu.Item>
                    ))}
                  </Menu.ItemGroup>
                </Fragment>
              )}
            </Menu.SubMenu>
            {_.find(timeDataParticle, { value: xaxes.particleSizeType }) && (
              <Menu.SubMenu popupClassName="chartMenu" title={_l('日期格式')} popupOffset={[0, -15]}>
                {formatTimeFormats(xaxes.particleSizeType).map(item => (
                  <Menu.Item
                    className="valignWrapper"
                    style={{ width: 200, color: item.value === xaxes.showFormat ? '#1e88e5' : null }}
                    key={item.value}
                    onClick={() => {
                      this.handleChangeXaxes({ showFormat: item.value });
                    }}
                  >
                    <div className="flex">{item.getTime()}</div>
                  </Menu.Item>
                ))}
                <Menu.Item
                  className="valignWrapper"
                  style={{ width: 200, color: !_.find(timeFormats, { value: xaxes.showFormat }) ? '#1e88e5' : null }}
                  key="customShowFormat"
                  onClick={() => {
                    this.setState({ showFormatDialogVisible: true });
                  }}
                >
                  <div className="flex">{_l('自定义')}</div>
                </Menu.Item>
              </Menu.SubMenu>
            )}
          </Fragment>
        )}
        {isArea && (
          <Menu.SubMenu popupClassName="chartMenu" title={_l('归组')} popupOffset={[0, -15]}>
            {areaParticleSizeDropdownData.map(item => (
              <Menu.Item
                disabled={item.value === xaxes.particleSizeType ? true : disableParticleSizeTypes.includes(item.value)}
                style={{ width: 120, color: item.value === (xaxes.particleSizeType || 1) ? '#1e88e5' : null }}
                key={item.value}
                onClick={() => {
                  this.handleUpdateTimeParticleSizeType(item.value);
                }}
              >
                {item.text}
              </Menu.Item>
            ))}
          </Menu.SubMenu>
        )}
        {xaxes.controlType === 35 && (
          <Menu.SubMenu popupClassName="chartMenu" title={_l('归组')} popupOffset={[0, -15]}>
            {cascadeParticleSizeDropdownData.map(item => (
              <Menu.Item
                disabled={item.value === xaxes.particleSizeType}
                style={{ width: 120, color: item.value === (xaxes.particleSizeType || 1) ? '#1e88e5' : null }}
                key={item.value}
                onClick={() => {
                  this.handleUpdateTimeParticleSizeType(item.value);
                }}
              >
                {item.text}
              </Menu.Item>
            ))}
          </Menu.SubMenu>
        )}
        {getIsEmptyType(reportType, { isTime, isOption }) && (
          <Menu.SubMenu
            popupClassName="chartMenu"
            title={
              <div className="flexRow valignWrapper w100">
                <div className="flex">{_l('无记录的项目')}</div>
                <div className="Font12 Gray_75 emptyTypeName">{xaxes.emptyType ? _l('显示') : _l('隐藏')}</div>
              </div>
            }
            popupOffset={[0, -15]}
          >
            {getEmptyTypes(reportType).map(item => (
              <Menu.Item
                key={item.value}
                style={{ color: item.value === xaxes.emptyType ? '#1e88e5' : null }}
                onClick={() => {
                  this.handleChangeXaxes({ emptyType: item.value });
                }}
              >
                {item.name}
              </Menu.Item>
            ))}
          </Menu.SubMenu>
        )}
        {!isTime && (
          <Menu.Item
            className="flexRow valignWrapper"
            onClick={() => {
              this.handleChangeXaxes({ xaxisEmpty: !xaxes.xaxisEmpty });
            }}
          >
            <div className="flex">{_l('统计空值')}</div>
            {xaxes.xaxisEmpty && <Icon icon="done" className="Font17" />}
          </Menu.Item>
        )}
      </Menu>
    );
  }
  renderAxis() {
    const { allControls, axisControls, currentReport } = this.props;
    const { xaxes, reportType } = currentReport;
    const tip = xaxes.rename && xaxes.rename !== xaxes.controlName ? xaxes.controlName : null;
    const isTime = isTimeControl(xaxes.controlType);
    const isArea = reportType !== reportTypes.CountryLayer && isAreaControl(xaxes.controlType);
    const axis = _.find(axisControls, { controlId: xaxes.controlId });
    const control = _.find(allControls, { controlId: xaxes.controlId }) || {};
    return (
      <div className="flexRow valignWrapper fidldItem">
        {axis ? (
          <Tooltip title={tip}>
            <span className="Gray flex ellipsis">
              {xaxes.rename || xaxes.controlName}
              {isTime && ` (${_.find(timeParticleSizeDropdownData, { value: xaxes.particleSizeType || 1 }).text})`}
              {isArea && ` (${_.find(areaParticleSizeDropdownData, { value: xaxes.particleSizeType || 1 }).text})`}
            </span>
          </Tooltip>
        ) : control.strDefault === '10' ? (
          <span className="Red flex ellipsis">{`${control.controlName} (${_l('无效类型')})`}</span>
        ) : (
          <Tooltip title={`ID: ${xaxes.controlId}`}>
            <span className="Red flex ellipsis">{_l('字段已删除')}</span>
          </Tooltip>
        )}
        <Dropdown overlay={this.renderOverlay(axis || {})} trigger={['click']} placement="bottomRight">
          <Icon className="Gray_9e Font18 pointer" icon="arrow-down-border" />
        </Dropdown>
        <Icon className="Gray_9e Font18 pointer mLeft10" icon="close" onClick={this.props.removeXaxes} />
      </div>
    );
  }
  render() {
    const { name, currentReport } = this.props;
    return (
      <div className="fieldWrapper mBottom20">
        <div className="Bold mBottom12">{name}</div>
        {currentReport.xaxes.controlId ? (
          this.renderAxis()
        ) : (
          <WithoutFidldItem onVerification={this.handleVerification} onAddControl={this.handleAddControl} />
        )}
        {this.renderModal()}
      </div>
    );
  }
}
