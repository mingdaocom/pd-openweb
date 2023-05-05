import React, { Component } from 'react';
import styled from 'styled-components';
import { Icon } from 'ming-ui';
import { Menu, Dropdown, Tooltip } from 'antd';
import WithoutFidldItem from './WithoutFidldItem';
import RenameModal from './RenameModal';
import { SortableContainer, SortableElement, arrayMove } from 'react-sortable-hoc';
import { isNumberControl, normTypes, emptyShowTypes } from 'statistics/common';
import { reportTypes } from 'statistics/Charts/common';
import { WIDGETS_TO_API_TYPE_ENUM } from 'src/pages/widgetConfig/config/widget';
import _ from 'lodash';

const SortableItemContent = styled.div`
  position: relative;
  &:hover {
    .sortableDrag {
      opacity: 1;
    }
  }
  .sortableDrag {
    position: absolute;
    top: 7px;
    left: -18px;
    opacity: 0;
    &:hover {
      opacity: 1;
    }
  }
`;

const renderOverlay = (props) => {
  const { item, onNormType, onEmptyShowType, onChangeControlId, onChangeCurrentReport, currentReport, sortIndex } = props;
  const { reportType, sorts } = currentReport;
  const { controlId, controlType, normType, emptyShowType } = item;
  return (
    <Menu className="chartControlMenu chartMenu" expandIcon={<Icon icon="arrow-right-tip" />}>
      <Menu.Item
        onClick={() => {
          onChangeControlId(controlId);
        }}
      >
        {_l('重命名')}
      </Menu.Item>
      {isNumberControl(controlType, false) && (
        <Menu.SubMenu popupClassName="chartMenu" title={_l('计算')} popupOffset={[0, -15]}>
          {normTypes.map(item => (
            <Menu.Item
              style={{ width: 120, color: item.value === normType ? '#1e88e5' : null }}
              key={item.value}
              onClick={() => {
                onNormType(controlId, item.value);
              }}
            >
              {item.text}
            </Menu.Item>
          ))}
        </Menu.SubMenu>
      )}
      {!isNumberControl(controlType) && (
        <Menu.SubMenu popupClassName="chartMenu" title={_l('计算')} popupOffset={[0, -15]}>
          {[
            {
              text: _l('计数'),
              value: 5,
            },
            {
              text: _l('去重计数'),
              value: 6,
            }
          ].map(item => (
            <Menu.Item
              style={{ width: 120, color: item.value === normType ? '#1e88e5' : null }}
              key={item.value}
              onClick={() => {
                onNormType(controlId, item.value);
              }}
            >
              {item.text}
            </Menu.Item>
          ))}
        </Menu.SubMenu>
      )}
      {[reportTypes.BarChart, reportTypes.LineChart, reportTypes.DualAxes, reportTypes.RadarChart, reportTypes.BidirectionalBarChart].includes(reportType) && (
        <Menu.SubMenu
          popupClassName="chartMenu"
          title={(
            <div className="flexRow valignWrapper w100">
              <div className="flex">{_l('空值显示')}</div>
              <div className="Font12 Gray_75 emptyTypeName">{_.find(emptyShowTypes, { value: emptyShowType }).text}</div>
            </div>
          )}
          popupOffset={[0, -15]}
        >
          {emptyShowTypes.map(item => (
            <Menu.Item
              style={{ width: 120, color: item.value === emptyShowType ? '#1e88e5' : null }}
              key={item.value}
              onClick={() => {
                onEmptyShowType(controlId, item.value);
              }}
            >
              {item.text}
            </Menu.Item>
          ))}
        </Menu.SubMenu>
      )}
    </Menu>
  );
}

const SortableItem = SortableElement(props => {
  const { item, sortIndex, onClear, axisControls, allControls } = props;
  const tip = item.rename && item.rename !== item.controlName ? item.controlName : null;
  const isNumber = isNumberControl(item.controlType, false);
  const axis = _.find(axisControls, { controlId: item.controlId });
  const control = _.find(allControls, { controlId: item.controlId }) || {};
  const normType = _.find(normTypes, { value: item.normType });
  return (
    <SortableItemContent>
      <Icon className="sortableDrag Font20 pointer Gray_bd ThemeHoverColor3" icon="drag_indicator" />
      <div className="flexRow valignWrapper fidldItem" key={item.controlId}>
        {axis ? (
          <Tooltip title={tip}>
            <span className="Gray flex ellipsis">
              {isNumber && normType && `${normType.text}: `}
              {item.rename || item.controlName}
            </span>
          </Tooltip>
        ) : (
          control.strDefault === '10' ? (
            <span className="Red flex ellipsis">
              {`${control.controlName} (${_l('无效类型')})`}
            </span>
          ) : (
            <Tooltip title={`ID: ${item.controlId}`}>
              <span className="Red flex ellipsis">
                {_l('字段已删除')}
              </span>
            </Tooltip>
          )
        )}
        <Dropdown overlay={renderOverlay(props)} trigger={['click']} placement="bottomRight">
          <Icon className="Gray_9e Font18 pointer" icon="arrow-down-border" />
        </Dropdown>
        <Icon
          className="Gray_9e Font18 pointer mLeft10"
          icon="close"
          onClick={() => {
            onClear(item.controlId);
          }}
        />
      </div>
    </SortableItemContent>
  );
});

const SortableList = SortableContainer(({ list, ...otherProps }) => {
  return (
    <div>
      {list.map((item, index) => (
        <SortableItem key={index} sortIndex={index} index={index} item={item} {...otherProps} />
      ))}
    </div>
  );
});

export default class YAxis extends Component {
  constructor(props) {
    super(props);
    this.state = {
      currentControlId: null,
    };
  }
  handleVerification = (data, isAlert = false) => {
    const { currentReport, yaxisList } = this.props;
    const { reportType } = currentReport;

    if (_.find(yaxisList, { controlId: data.controlId })) {
      isAlert && alert(_l('不允许添加重复字段'), 2);
      return false;
    }

    if ([reportTypes.ProgressChart, reportTypes.GaugeChart].includes(reportType)) {
      if (isNumberControl(data.type) || data.type === WIDGETS_TO_API_TYPE_ENUM.SCORE) {
        return true;
      } else {
        isAlert && alert(_l('只允许添加数值和公式字段'), 2);
        return false;
      }
    } else {
      return true;
    }
  }
  handleAddControl = data => {
    const { yaxisList, currentReport, onChangeCurrentReport } = this.props;
    if (this.handleVerification(data, true)) {
      this.props.onAddAxis(data);
    }
  }
  handleNormType = (id, value) => {
    const { yaxisList, onChangeCurrentReport } = this.props;
    const newYaxisList = yaxisList.map(item => {
      if (item.controlId === id) {
        item.normType = value;
      }
      return item;
    });
    onChangeCurrentReport({
      yaxisList: newYaxisList,
    });
  }
  handleEmptyShowType = (id, value) => {
    const { yaxisList, onChangeCurrentReport } = this.props;
    const newYaxisList = yaxisList.map(item => {
      if (item.controlId === id) {
        item.emptyShowType = value;
      }
      return item;
    });
    onChangeCurrentReport({
      yaxisList: newYaxisList,
    });
  }
  handleChangeControlId = (controlId) => {
    this.setState({ currentControlId: controlId });
  }
  handleChangeRename = name => {
    const { currentControlId } = this.state;
    const { yaxisList, onChangeCurrentReport } = this.props;
    const newYaxisList = yaxisList.map(item => {
      if (item.controlId === currentControlId) {
        item.rename = name;
      }
      return item;
    });
    onChangeCurrentReport({
      yaxisList: newYaxisList,
    });
  }
  handleSortEnd = ({ oldIndex, newIndex }) => {
    if (oldIndex === newIndex) return;
    const { currentReport, yaxisList, onChangeCurrentReport } = this.props;
    const { reportType, config } = currentReport;
    const newYaxisList = arrayMove(yaxisList, oldIndex, newIndex);
    const data = { yaxisList: newYaxisList };
    if (reportType === reportTypes.ProgressChart) {
      const targetList = config.targetList || [];
      data.config = {
        ...config,
        targetList: arrayMove(targetList, oldIndex, newIndex)
      }
    }
    onChangeCurrentReport(data);
  }
  renderModal() {
    const { yaxisList } = this.props;
    const { currentControlId } = this.state;
    const control = _.find(yaxisList, { controlId: currentControlId }) || {};
    return (
      <RenameModal
        dialogVisible={!!currentControlId}
        rename={control.rename || control.controlName}
        onChangeRename={this.handleChangeRename}
        onHideDialogVisible={() => {
          this.setState({
            currentControlId: null,
          });
        }}
      />
    );
  }
  renderWithoutFidldItem() {
    const { currentReport, yaxisList, split } = this.props;
    const { reportType, xaxes } = currentReport;
    const Content = <WithoutFidldItem onVerification={this.handleVerification} onAddControl={this.handleAddControl} />

    if ([reportTypes.PieChart, reportTypes.FunnelChart].includes(reportType)) {
      return (
        (xaxes.controlId ? _.isEmpty(yaxisList) : true) && Content
      )
    }

    if ([reportTypes.CountryLayer, reportTypes.WordCloudChart, reportTypes.GaugeChart, reportTypes.ScatterChart, reportTypes.BidirectionalBarChart].includes(reportType)) {
      return _.isEmpty(yaxisList) && Content;
    }

    return _.isEmpty(split.controlId) && Content;
  }
  render() {
    const { name, currentReport, axisControls, allControls, yaxisList } = this.props;
    const { reportType } = currentReport;
    return (
      <div className="fieldWrapper mBottom20">
        <div className="Bold mBottom12">{name}</div>
        <SortableList
          axis="xy"
          helperClass="sortableNumberField"
          list={yaxisList}
          allControls={allControls}
          axisControls={axisControls}
          currentReport={currentReport}
          shouldCancelStart={({ target }) => !target.classList.contains('icon-drag_indicator')}
          onClear={this.props.onRemoveAxis}
          onNormType={this.handleNormType}
          onEmptyShowType={this.handleEmptyShowType}
          onChangeControlId={this.handleChangeControlId}
          onChangeCurrentReport={this.props.onChangeCurrentReport}
          onSortEnd={this.handleSortEnd}
        />
        {this.renderWithoutFidldItem()}
        {this.renderModal()}
      </div>
    );
  }
}
