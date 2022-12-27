import React, { Component, Fragment } from 'react';
import { Icon } from 'ming-ui';
import { Menu, Dropdown, Tooltip } from 'antd';
import WithoutFidldItem from './WithoutFidldItem';
import RenameModal from './RenameModal';
import {
  timeParticleSizeDropdownData,
  areaParticleSizeDropdownData,
  timeDataParticle,
  timeGatherParticle,
  filterTimeData,
  filterTimeGatherParticle,
  isXAxisControl,
  isAreaControl,
  isTimeControl,
  isOptionControl
} from 'statistics/common';
import { reportTypes } from 'statistics/Charts/common';
import _ from 'lodash';

const emptyTypes = [{
  value: 0,
  name: _l('隐藏')
}, {
  value: 1,
  name: _l('显示为 0')
}, {
  value: 2,
  name: _l('显示为 --')
}];

const lineChartEmptyTypes = [{
  value: 0,
  name: _l('隐藏')
}, {
  value: 1,
  name: _l('显示为 0')
}, {
  value: 2,
  name: _l('显示为 -- (连续)')
}, {
  value: 3,
  name: _l('显示为 -- (中断)')
}];

export default class XAxis extends Component {
  constructor(props) {
    super(props);
    this.state = {
      dialogVisible: false,
    };
  }
  getAreaParticleSizeDropdownData(type) {
    if (type === 19) {
      return areaParticleSizeDropdownData.filter(a => ![2, 3].includes(a.value));
    }
    if (type === 23) {
      return areaParticleSizeDropdownData.filter(a => ![3].includes(a.value));
    }
    return areaParticleSizeDropdownData;
  }
  handleUpdateTimeParticleSizeType = value => {
    const { xaxes, sorts } = this.props.currentReport;
    const id = xaxes.particleSizeType ? `${xaxes.controlId}-${xaxes.particleSizeType}` : xaxes.controlId;
    this.props.onChangeCurrentReport(
      {
        xaxes: {
          ...xaxes,
          particleSizeType: value,
        },
        sorts: sorts.filter(item => _.findKey(item) !== id)
      },
      true,
    );
  }
  handleVerification = (data, isAlert = false) => {
    const { reportType } = this.props.currentReport;
    if ([reportTypes.CountryLayer].includes(reportType) && !isAreaControl(data.type)) {
      isAlert && alert(_l('行政区域图仅支持地区字段可作为x轴维度'), 2);
      return false;
    }
    if ([reportTypes.RadarChart, reportTypes.FunnelChart].includes(reportType) && isTimeControl(data.type)) {
      isAlert && alert(_l('时间类型不能作为x轴维度'), 2);
      return false;
    }
    if (isXAxisControl(data.type)) {
      return true;
    } else {
      isAlert && alert(_l('该字段不能作为x轴维度'), 2);
      return false;
    }
  }
  handleAddControl = data => {
    const { reportType, xaxes, displaySetup } = this.props.currentReport;
    if (this.handleVerification(data, true)) {
      this.props.addXaxes(data);
    }
  }
  handleChangeRename = rename => {
    const { xaxes } = this.props.currentReport;
    this.props.onChangeCurrentReport(
      {
        xaxes: {
          ...xaxes,
          rename,
        },
      },
      true,
    );
    this.setState({ dialogVisible: false });
  }
  handleUpdateEmptyType = (emptyType) => {
    const { xaxes } = this.props.currentReport;
    this.props.onChangeCurrentReport(
      {
        xaxes: {
          ...xaxes,
          emptyType
        },
      },
      true,
    );
  }
  handleUpdateXaxisEmpty = (xaxisEmpty) => {
    const { xaxes } = this.props.currentReport;
    this.props.onChangeCurrentReport(
      {
        xaxes: {
          ...xaxes,
          xaxisEmpty
        },
      },
      true,
    );
  }
  renderModal() {
    const { dialogVisible } = this.state;
    const { xaxes } = this.props.currentReport;
    return (
      <RenameModal
        dialogVisible={dialogVisible}
        rename={xaxes.rename || xaxes.controlName}
        onChangeRename={this.handleChangeRename}
        onHideDialogVisible={() => {
          this.setState({
            dialogVisible: false,
          });
        }}
      />
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
    const timeGatherParticleList = filterTimeGatherParticle(timeGatherParticle, { showtype, controlType: xaxes.controlType });
    const areaParticleSizeDropdownData = this.getAreaParticleSizeDropdownData(axis.type);

    if (!isLineChart && xaxes.emptyType === 3) {
      xaxes.emptyType = 2;
    }

    return (
      <Menu className="chartControlMenu chartMenu" expandIcon={<Icon icon="arrow-right-tip" />}>
        <Menu.Item
          onClick={() => {
            this.setState({ dialogVisible: true });
          }}
        >
          {_l('重命名')}
        </Menu.Item>
        {isTime && (
          <Menu.SubMenu popupClassName="chartMenu" title={_l('归组')} popupOffset={[0, -15]}>
            <Menu.ItemGroup title={_l('时间')}>
              {timeDataList.map(item => (
                <Menu.Item
                  className="valignWrapper"
                  disabled={item.value === xaxes.particleSizeType ? true : disableParticleSizeTypes.includes(item.value)}
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
            {!!timeGatherParticleList.length && (
              <Fragment>
                <Menu.Divider />
                <Menu.ItemGroup title={_l('集合')}>
                  {timeGatherParticleList.map(item => (
                    <Menu.Item
                      className="valignWrapper"
                      disabled={item.value === xaxes.particleSizeType ? true : disableParticleSizeTypes.includes(item.value)}
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
        {[reportTypes.BarChart, reportTypes.LineChart, reportTypes.DualAxes, reportTypes.RadarChart].includes(
          reportType,
        ) && (isTime || isOption) && (
          <Menu.SubMenu
            popupClassName="chartMenu"
            title={(
              <div className="flexRow valignWrapper w100">
                <div className="flex">{_l('无记录的项目')}</div>
                <div className="Font12 Gray_75 emptyTypeName">{xaxes.emptyType ? _l('显示') : _l('隐藏')}</div>
              </div>
            )}
            popupOffset={[0, -15]}
          >
            {
              (isLineChart ? lineChartEmptyTypes : emptyTypes).map(item => (
                <Menu.Item
                  key={item.value}
                  style={{ color: item.value === xaxes.emptyType ? '#1e88e5' : null }}
                  onClick={() => { this.handleUpdateEmptyType(item.value) }}
                >
                  {item.name}
                </Menu.Item>
              ))
            }
          </Menu.SubMenu>
        )}
        {!isTime && (
          <Menu.Item
            className="flexRow valignWrapper"
            onClick={() => {
              this.handleUpdateXaxisEmpty(!xaxes.xaxisEmpty);
            }}
          >
            <div className="flex">{_l('统计空值')}</div>
            {xaxes.xaxisEmpty && <Icon icon="done" className="Font17"/>}
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
        ) : (
          control.strDefault === '10' ? (
            <span className="Red flex ellipsis">
              {`${control.controlName} (${_l('无效类型')})`}
            </span>
          ) : (
            <Tooltip title={`ID: ${xaxes.controlId}`}>
              <span className="Red flex ellipsis">
                {_l('字段已删除')}
              </span>
            </Tooltip>
          )
        )}
        <Dropdown overlay={this.renderOverlay(axis)} trigger={['click']} placement="bottomRight">
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
