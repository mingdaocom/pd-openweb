import React, { Component, Fragment } from 'react';
import _ from 'lodash';
import { Icon } from 'ming-ui';
import { Dropdown, Tooltip } from 'ming-ui/antd-components';
import { isAreaControl, isOptionControl, isTimeControl } from 'statistics/common/controlUtils';
import {
  areaParticleSizeDropdownData,
  cascadeParticleSizeDropdownData,
  displayModes,
  filterAreaParticleSizeDropdownData,
  isXAxisControl,
} from 'statistics/common/reportConfigUtils';
import {
  filterTimeData,
  filterTimeGatherParticle,
  formatTimeFormats,
  timeDataParticle,
  timeFormats,
  timeGatherParticle,
  timeParticleSizeDropdownData,
} from 'statistics/common/timeUtils';
import { ShowFormatDialog } from 'src/pages/widgetConfig/widgetSetting/components/WidgetHighSetting/ControlSetting/DateConfig';
import { reportTypes } from 'src/utils/domain/statistics/reportTypes';
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

    if ([reportTypes.WorldMap].includes(reportType) && !(isAreaControl(data.type) || data.type === 40)) {
      isAlert && alert(_l('地图仅支持地区和定位字段可作为x轴维度'), 2);
      return false;
    }

    if ([reportTypes.FunnelChart].includes(reportType)) {
      if (isTimeControl(data.type)) {
        isAlert && alert(_l('时间类型不能作为x轴维度'), 2);
        return false;
      }

      if (data.controlId === _.get(yaxisList[0], 'controlId')) {
        isAlert && alert(_l('维度和数值不能相同'), 2);
        return false;
      }
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
  getMenuItems(axis) {
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

    const getParticleItem = (item, getTime) => ({
      key: item.value,
      className: 'valignWrapper',
      disabled: item.value === xaxes.particleSizeType ? true : disableParticleSizeTypes.includes(item.value),
      style: {
        color: item.value === (xaxes.particleSizeType || 1) ? 'var(--color-primary)' : null,
      },
      label: item.text,
      extra: getTime && <div className="textSecondary Font12">{getTime(item)}</div>,
      onClick: () => {
        this.handleUpdateTimeParticleSizeType(item.value);
      },
    });

    return [
      {
        key: 'rename',
        label: _l('重命名'),
        onClick: () => {
          this.setState({ dialogVisible: true });
        },
      },
      isTime && {
        key: 'particleSizeType',
        label: _l('归组'),
        popupOffset: [0, -15],
        popupStyle: { minWidth: 200 },
        children: [
          {
            key: 'time',
            type: 'group',
            label: _l('时间'),
            children: timeDataList.map(item => getParticleItem(item, data => data.getTime(xaxes.showFormat))),
          },
          !!timeGatherParticleList.length && {
            key: 'timeGatherDivider',
            type: 'divider',
          },
          !!timeGatherParticleList.length && {
            key: 'timeGather',
            type: 'group',
            label: _l('集合'),
            children: timeGatherParticleList.map(item => getParticleItem(item, data => data.getTime())),
          },
        ].filter(Boolean),
      },
      isTime &&
        _.find(timeDataParticle, { value: xaxes.particleSizeType }) && {
          key: 'showFormat',
          label: _l('日期格式'),
          popupOffset: [0, -15],
          popupStyle: { minWidth: 200 },
          children: [
            ...formatTimeFormats(xaxes.particleSizeType).map(item => ({
              key: item.value,
              className: 'valignWrapper',
              style: {
                color: item.value === xaxes.showFormat ? 'var(--color-primary)' : null,
              },
              label: <div className="flex">{item.getTime()}</div>,
              onClick: () => {
                this.handleChangeXaxes({ showFormat: item.value });
              },
            })),
            {
              key: 'customShowFormat',
              className: 'valignWrapper',
              style: {
                color: !_.find(timeFormats, { value: xaxes.showFormat }) ? 'var(--color-primary)' : null,
              },
              label: <div className="flex">{_l('自定义')}</div>,
              onClick: () => {
                this.setState({ showFormatDialogVisible: true });
              },
            },
          ],
        },
      isArea && {
        key: 'areaParticleSizeType',
        label: _l('归组'),
        popupOffset: [0, -15],
        popupStyle: { minWidth: 120 },
        children: areaParticleSizeDropdownData.map(item => getParticleItem(item)),
      },
      xaxes.controlType === 35 && {
        key: 'cascadeParticleSizeType',
        label: _l('归组'),
        popupOffset: [0, -15],
        popupStyle: { minWidth: 120 },
        children: cascadeParticleSizeDropdownData.map(item => ({
          key: item.value,
          disabled: item.value === xaxes.particleSizeType,
          style: {
            color: item.value === (xaxes.particleSizeType || 1) ? 'var(--color-primary)' : null,
          },
          label: item.text,
          onClick: () => {
            this.handleUpdateTimeParticleSizeType(item.value);
          },
        })),
      },
      getIsEmptyType(reportType, { isTime, isOption }) && {
        key: 'emptyType',
        label: (
          <div className="flexRow valignWrapper w100">
            <div className="flex">{_l('无记录的项目')}</div>
            <div className="Font12 textSecondary emptyTypeName">{xaxes.emptyType ? _l('显示') : _l('隐藏')}</div>
          </div>
        ),
        popupOffset: [0, -15],
        children: getEmptyTypes(reportType).map(item => ({
          key: item.value,
          style: { color: item.value === xaxes.emptyType ? 'var(--color-primary)' : null },
          label: item.name,
          onClick: () => {
            this.handleChangeXaxes({ emptyType: item.value });
          },
        })),
      },
      !isTime &&
        xaxes.controlType !== 40 && {
          key: 'xaxisEmpty',
          label: _l('统计空值'),
          extra: xaxes.xaxisEmpty && <Icon icon="done" className="Font17 colorPrimary" />,
          onClick: () => {
            this.handleChangeXaxes({ xaxisEmpty: !xaxes.xaxisEmpty });
          },
        },
      reportType === reportTypes.TopChart &&
        xaxes.controlType === 26 && {
          key: 'displayMode',
          label: (
            <div className="flexRow valignWrapper w100">
              <div className="flex">{_l('显示方式')}</div>
              <div className="Font12 textSecondary emptyTypeName">
                {_.get(_.find(displayModes, { value: xaxes.displayMode }), 'text')}
              </div>
            </div>
          ),
          popupOffset: [0, -15],
          children: displayModes.map(item => ({
            key: item.value,
            style: { color: item.value === xaxes.displayMode ? 'var(--color-primary)' : null },
            label: item.text,
            onClick: () => {
              this.handleChangeXaxes({ displayMode: item.value });
            },
          })),
        },
    ].filter(Boolean);
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
            <span className="textPrimary flex ellipsis">
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
        <Dropdown
          menu={{
            style: { minWidth: 200 },
            subMenuOpenDelay: 0.2,
            items: this.getMenuItems(axis || {}),
          }}
          trigger={['click']}
          placement="bottomRight"
        >
          <Icon className="textTertiary Font18 pointer" icon="arrow-down-border" />
        </Dropdown>
        <Icon className="textTertiary Font18 pointer mLeft10" icon="close" onClick={this.props.removeXaxes} />
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
