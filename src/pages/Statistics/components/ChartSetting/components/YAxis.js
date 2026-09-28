import React, { Component } from 'react';
import _ from 'lodash';
import styled from 'styled-components';
import { Icon, SortableList } from 'ming-ui';
import { Checkbox, Dropdown, Tooltip } from 'ming-ui/antd-components';
import { isNumberControl, isOptionControl } from 'statistics/common/controlUtils';
import { addCalculateControlHighlight, emptyShowTypes } from 'statistics/common/reportConfigUtils';
import { WIDGETS_TO_API_TYPE_ENUM } from 'src/utils/domain/control/widgetTypes';
import { reportTypes } from 'src/utils/domain/statistics/reportTypes';
import { normTypes } from '../../../enum';
import RenameModal from './RenameModal';
import WithoutFidldItem from './WithoutFidldItem';

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

function arrayMove(array, oldIndex, newIndex) {
  if (oldIndex < 0 || oldIndex >= array.length || newIndex < 0 || newIndex >= array.length) {
    return array;
  }

  const newArray = [...array];
  const [movedItem] = newArray.splice(oldIndex, 1);
  newArray.splice(newIndex, 0, movedItem);
  return newArray;
}

const getMenuItems = props => {
  const { item, onNormType, onEmptyShowType, onChangeControlId, allControls, currentReport } = props;
  const { reportType, xaxes, yaxisList } = currentReport;
  const { controlId, controlType, normType } = item;
  const control = _.find(allControls, { controlId }) || {};
  const isNumberChart = reportTypes.NumberChart === reportType;
  const oneNumber = xaxes.controlId && yaxisList.length === 1;
  const hideVisible = isNumberChart ? oneNumber : true;
  const emptyShowType = isNumberChart && !oneNumber && item.emptyShowType === 0 ? 1 : item.emptyShowType;
  const { enumDefault } = control;
  const normTypeItems = isNumberControl(controlType, false)
    ? normTypes.map(item => ({
        key: item.value,
        style: { color: item.value === normType ? 'var(--color-primary)' : null },
        label: item.alias || item.text,
        onClick: () => {
          onNormType(controlId, item.value);
        },
      }))
    : (isOptionControl(controlType) && enumDefault === 1
        ? normTypes
        : [
            {
              text: _l('计数'),
              value: 5,
            },
            {
              text: _l('去重计数'),
              value: 6,
            },
          ]
      ).map(item => ({
        key: item.value,
        style: { color: item.value === normType ? 'var(--color-primary)' : null },
        label: item.text,
        onClick: () => {
          onNormType(controlId, item.value);
        },
      }));

  return [
    {
      key: 'rename',
      label: _l('重命名'),
      onClick: () => {
        onChangeControlId(controlId);
      },
    },
    {
      key: 'normType',
      label: _l('计算'),
      popupOffset: [0, -15],
      style: { minWidth: 120 },
      children: normTypeItems,
    },
    [
      reportTypes.BarChart,
      reportTypes.LineChart,
      reportTypes.DualAxes,
      reportTypes.RadarChart,
      reportTypes.FunnelChart,
      reportTypes.NumberChart,
      reportTypes.BidirectionalBarChart,
    ].includes(reportType) && {
      key: 'emptyShowType',
      label: (
        <div className="flexRow valignWrapper w100">
          <div className="flex">{_l('空值显示')}</div>
          <div className="Font12 textSecondary emptyTypeName">
            {_.get(_.find(emptyShowTypes, { value: emptyShowType }), 'text')}
          </div>
        </div>
      ),

      popupOffset: [0, -15],
      children: emptyShowTypes
        .filter(data => (data.value ? true : hideVisible))
        .map(item => ({
          key: item.value,
          style: { color: item.value === emptyShowType ? 'var(--color-primary)' : null },
          label: item.text,
          onClick: () => {
            onEmptyShowType(controlId, item.value);
          },
        })),
    },
  ].filter(Boolean);
};

const renderSortableItem = props => {
  const { DragHandle, item, onClear, axisControls, allControls } = props;
  const tip = item.rename && item.rename !== item.controlName ? item.controlName : null;
  const isNumber = isNumberControl(item.controlType, false);
  const axis = _.find(axisControls, { controlId: item.controlId });
  const control = _.find(allControls, { controlId: item.controlId }) || {};
  const normType = _.find(normTypes, { value: item.normType }) || {};
  return (
    <SortableItemContent>
      <DragHandle>
        <Icon className="sortableDrag Font20 pointer textDisabled hoverColorPrimary" icon="drag" />
      </DragHandle>
      <div className="flexRow valignWrapper fidldItem" key={item.controlId}>
        {axis ? (
          <Tooltip title={tip}>
            <span className="textPrimary flex ellipsis">
              {isNumber && normType && `${normType.text}: `}
              {item.rename || item.controlName}
            </span>
          </Tooltip>
        ) : control.strDefault === '10' ? (
          <span className="Red flex ellipsis">{`${control.controlName} (${_l('无效类型')})`}</span>
        ) : (
          <Tooltip title={`ID: ${item.controlId}`}>
            <span className="Red flex ellipsis">{_l('字段已删除')}</span>
          </Tooltip>
        )}
        <Dropdown
          menu={{
            style: { minWidth: 200 },
            subMenuOpenDelay: 0.2,
            items: getMenuItems(props),
          }}
          trigger={['click']}
          placement="bottomRight"
        >
          <Icon className="textTertiary Font18 pointer" icon="arrow-down-border" />
        </Dropdown>
        <Icon
          className="textTertiary Font18 pointer mLeft10"
          icon="close"
          onClick={() => {
            onClear(item.controlId);
          }}
        />
      </div>
    </SortableItemContent>
  );
};

export default class YAxis extends Component {
  constructor(props) {
    super(props);
    this.state = {
      currentControlId: null,
    };
  }
  handleVerification = (data, isAlert = false) => {
    const { currentReport } = this.props;
    const { reportType, xaxes, split, yaxisList, rightY } = currentReport;

    if (reportTypes.DualAxes === reportType) {
      const yList = yaxisList.concat(rightY.yaxisList);

      if (_.find(yList, { controlId: data.controlId })) {
        isAlert && alert(_l('字段不可重复添加，如需使用，请使用“计算字段”添加'), 2);
        isAlert && addCalculateControlHighlight();
        return false;
      }
    }

    if (reportTypes.WorldMap === reportType && data.type === 40) {
      isAlert && alert(_l('不支持定位字段'), 2);
      return false;
    }

    if (_.find(yaxisList, { controlId: data.controlId })) {
      isAlert && alert(_l('字段不可重复添加，如需使用，请使用“计算字段”添加'), 2);
      isAlert && addCalculateControlHighlight();
      return false;
    }

    if ([reportTypes.FunnelChart].includes(reportType) && data.controlId === xaxes.controlId) {
      isAlert && alert(_l('维度和数值不能相同'), 2);
      return false;
    }

    if ([reportTypes.ScatterChart, reportTypes.WorldMap].includes(reportType) && data.controlId === split.controlId) {
      isAlert && alert(_l('数值和颜色不允许重复'), 2);
      return false;
    }

    if (
      [reportTypes.BarChart, reportTypes.RadarChart].includes(reportType) &&
      split.controlId &&
      xaxes.controlId &&
      yaxisList.length >= 1
    ) {
      isAlert && alert(_l('多数值时不能同时配置维度和分组'), 2);
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
  };
  handleAddControl = data => {
    if (this.handleVerification(data, true)) {
      this.props.onAddAxis(data);
    }
  };
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
  };
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
  };
  handleChangeControlId = controlId => {
    this.setState({ currentControlId: controlId });
  };
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
  };
  handleSortEnd = (list, newIndex, oldIndex) => {
    const { currentReport, onChangeCurrentReport } = this.props;
    const { reportType, config } = currentReport;
    const data = { yaxisList: list };

    if (reportType === reportTypes.ProgressChart) {
      const targetList = config.targetList || [];
      data.config = {
        ...config,
        targetList: arrayMove(targetList, oldIndex, newIndex),
      };
    }

    onChangeCurrentReport(data);
  };
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
    const { currentReport, yaxisList, inheritLastYaxis } = this.props;
    const { reportType, xaxes, style } = currentReport;
    const Content = <WithoutFidldItem onVerification={this.handleVerification} onAddControl={this.handleAddControl} />;

    if ([reportTypes.PieChart, reportTypes.FunnelChart].includes(reportType)) {
      return (xaxes.controlId ? _.isEmpty(yaxisList) : true) && Content;
    }

    if (
      inheritLastYaxis &&
      style.inheritLastYaxis &&
      [reportTypes.WorldMap, reportTypes.ScatterChart].includes(reportType)
    ) {
      return null;
    }

    if (
      [
        reportTypes.CountryLayer,
        reportTypes.WordCloudChart,
        reportTypes.GaugeChart,
        reportTypes.ScatterChart,
        reportTypes.BidirectionalBarChart,
        reportTypes.WorldMap,
      ].includes(reportType)
    ) {
      return _.isEmpty(yaxisList) && Content;
    }

    return Content;
  }
  render() {
    const { name, currentReport, axisControls, allControls, yaxisList, inheritLastYaxis } = this.props;
    const { reportType, yaxisList: allYaxisList, style = {} } = currentReport;
    const otherProps = {
      allControls,
      axisControls,
      currentReport,
      onClear: this.props.onRemoveAxis,
      onNormType: this.handleNormType,
      onEmptyShowType: this.handleEmptyShowType,
      onChangeControlId: this.handleChangeControlId,
      onChangeCurrentReport: this.props.onChangeCurrentReport,
    };

    const renderInheritLastYaxis = () => {
      const isScatterChart = reportTypes.ScatterChart === reportType;
      const { inheritLastYaxisIndex = 0 } = style;
      const yaxis = allYaxisList[isScatterChart ? inheritLastYaxisIndex : 0];
      const isNumber = isNumberControl(yaxis.controlType, false);
      const normType = _.find(normTypes, { value: yaxis.normType }) || {};
      return (
        <div className="fieldWrapper mBottom20">
          <div className="flexRow valignWrapper fidldItem disabled">
            <span className="textPrimary flex ellipsis">
              {isNumber && normType && `${normType.text}: `}
              {yaxis.rename || yaxis.controlName}
            </span>
            {isScatterChart && (
              <Dropdown
                menu={{
                  style: { minWidth: 200 },
                  subMenuOpenDelay: 0.2,
                  items: allYaxisList.map((item, index) => ({
                    key: item.controlId || index,
                    style: { color: index === inheritLastYaxisIndex ? 'var(--color-primary)' : null },
                    label: item.rename || item.controlName,
                    extra: index === inheritLastYaxisIndex && <Icon className="colorPrimary" icon="done" />,

                    onClick: () => {
                      this.props.onChangeStyle({
                        inheritLastYaxisIndex: index,
                      });
                    },
                  })),
                }}
                trigger={['click']}
                placement="bottomRight"
              >
                <Icon className="textTertiary Font18 pointer" icon="arrow-down-border" />
              </Dropdown>
            )}
          </div>
        </div>
      );
    };

    return (
      <div className="fieldWrapper mBottom20">
        <div className="flexRow valignWrapper mBottom12">
          <div className="Bold flex">{name}</div>
          {inheritLastYaxis && (
            <Checkbox
              className="flexRow"
              checked={style.inheritLastYaxis}
              onChange={e => {
                const { checked } = e.target;
                const data = {
                  inheritLastYaxis: checked,
                };

                if (!checked) {
                  data.inheritLastYaxisIndex = undefined;
                }

                this.props.onChangeStyle(data);
              }}
            >
              {_l('使用已统计值')}
            </Checkbox>
          )}
        </div>
        {inheritLastYaxis && style.inheritLastYaxis && allYaxisList[0] ? (
          renderInheritLastYaxis()
        ) : (
          <SortableList
            renderBody
            useDragHandle
            items={yaxisList || []}
            itemKey="controlId"
            renderItem={options => renderSortableItem({ ...options, ...otherProps })}
            onSortEnd={this.handleSortEnd}
          />
        )}
        {this.renderWithoutFidldItem()}
        {this.renderModal()}
      </div>
    );
  }
}
