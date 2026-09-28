import React, { Component, Fragment } from 'react';
import { connect } from 'react-redux';
import _ from 'lodash';
import styled from 'styled-components';
import { Icon, SortableList } from 'ming-ui';
import { Dropdown, Tooltip } from 'ming-ui/antd-components';
import useFunctionWrapComponent, { withOpeners } from 'ming-ui/hooks/useFunctionWrapComponent';
import { isAreaControl, isDisplayModes, isNumberControl, isTimeControl } from 'statistics/common/controlUtils';
import {
  addCalculateControlHighlight,
  areaParticleSizeDropdownData,
  cascadeParticleSizeDropdownData,
  displayModes,
  emptyShowTypes,
  filterAreaParticleSizeDropdownData,
  filterDisableParticleSizeTypes,
  textNormTypes,
  xaxisEmptyShowTypes,
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
import { WIDGETS_TO_API_TYPE_ENUM } from 'src/utils/domain/control/widgetTypes';
import { normTypes } from '../../../enum';
import RenameModal from './RenameModal';
import ShowControlModal from './ShowControlModal';
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

const getShowFormatDialogProps = props => ({ ...props, closeFnName: 'onClose' });

export function useShowFormatDialog() {
  return useFunctionWrapComponent(ShowFormatDialog, getShowFormatDialogProps);
}

const getMenuItems = ({
  axis,
  control,
  type,
  item,
  disableParticleSizeTypes,
  onChangeData,
  onUpdateParticleSizeType,
  onSelectReNameId,
  onShowControl,
  openShowFormatDialog,
  verifyNumber,
}) => {
  const {
    normType,
    showFormat,
    particleSizeType,
    emptyShowType,
    xaxisEmpty,
    xaxisEmptyType,
    hide,
    displayMode = 'text',
  } = item;
  const isNumber = isNumberControl(axis.type, false);
  const isTime = isTimeControl(axis.type);
  const isArea = isAreaControl(axis.type);
  const isRelate = axis.type === 29;
  const newDisableParticleSizeTypes = filterDisableParticleSizeTypes(axis.controlId, disableParticleSizeTypes);
  const areaParticleSizeDropdownData = filterAreaParticleSizeDropdownData(axis);

  const showtype = _.get(axis, 'advancedSetting.showtype');

  const timeDataList = isTime
    ? filterTimeData(timeDataParticle, {
        showtype,
        controlType: axis.type,
      })
    : [];
  const timeGatherParticleList = filterTimeGatherParticle(timeGatherParticle, {
    showtype,
    controlType: axis.type,
  });

  const getParticleItem = particle => ({
    key: particle.value,
    className: 'valignWrapper',
    disabled: particle.value === particleSizeType ? true : newDisableParticleSizeTypes.includes(particle.value),
    style: { color: particle.value === particleSizeType ? 'var(--color-primary)' : null },
    label: particle.text,
    extra: particle.getTime && <div className="textSecondary Font12">{particle.getTime()}</div>,
    onClick: () => {
      onUpdateParticleSizeType(axis.controlId, particleSizeType, particle.value);
    },
  });

  return [
    {
      key: 'rename',
      label: _l('重命名'),
      onClick: () => {
        onSelectReNameId(axis.controlId, particleSizeType);
      },
    },
    type
      ? {
          key: 'xaxisEmpty',
          label: (
            <div className="flexRow valignWrapper w100">
              <div className="flex">{_l('统计空值')}</div>
              <div className="Font12 textSecondary emptyTypeName">
                {xaxisEmpty ? _.find(xaxisEmptyShowTypes, { value: xaxisEmptyType })?.text : _l('不显示')}
              </div>
            </div>
          ),

          popupOffset: [0, -15],
          popupStyle: { minWidth: 120 },
          children: [
            {
              key: 'hideXaxisEmpty',
              style: {
                color: !xaxisEmpty ? 'var(--color-primary)' : null,
              },
              label: _l('不显示'),
              onClick: () => {
                onChangeData(axis.controlId, {
                  xaxisEmpty: false,
                });
              },
            },
            ...xaxisEmptyShowTypes.map(item => ({
              key: item.value,
              style: {
                color: xaxisEmpty && item.value === xaxisEmptyType ? 'var(--color-primary)' : null,
              },
              label: item.text,
              onClick: () => {
                onChangeData(axis.controlId, {
                  xaxisEmpty: true,
                  xaxisEmptyType: item.value,
                });
              },
            })),
          ],
        }
      : (isNumber || [10000000, 10000001].includes(axis.type)) && {
          key: 'emptyShowType',
          label: (
            <div className="flexRow valignWrapper w100">
              <div className="flex">{_l('空值显示')}</div>
              <div className="Font12 textSecondary emptyTypeName">
                {_.find(emptyShowTypes, { value: emptyShowType })?.text}
              </div>
            </div>
          ),

          popupOffset: [0, -15],
          popupStyle: { minWidth: 120 },
          children: emptyShowTypes.map(item => ({
            key: item.value,
            style: {
              color: item.value === emptyShowType ? 'var(--color-primary)' : null,
            },
            label: item.text,
            onClick: () => {
              onChangeData(axis.controlId, {
                emptyShowType: item.value,
              });
            },
          })),
        },
    ['lines'].includes(type) &&
      isDisplayModes(axis.type) &&
      (type === WIDGETS_TO_API_TYPE_ENUM.SWITCH ? _.get(axis.advancedSetting, 'showtype') === '0' : true) && {
        key: 'displayMode',
        label: (
          <div className="flexRow valignWrapper w100">
            <div className="flex">{_l('显示方式')}</div>
            <div className="Font12 textSecondary emptyTypeName">
              {_.find(displayModes, { value: displayMode })?.text}
            </div>
          </div>
        ),

        popupOffset: [0, -15],
        children: displayModes.map(item => ({
          key: item.value,
          style: {
            color: item.value === displayMode ? 'var(--color-primary)' : null,
          },
          label: item.text,
          onClick: () => {
            onChangeData(axis.controlId, {
              displayMode: item.value,
            });
          },
        })),
      },
    isNumber &&
      verifyNumber && {
        key: 'normType',
        label: _l('计算'),
        popupOffset: [0, -15],
        popupStyle: { minWidth: 120 },
        children: normTypes.map(item => ({
          key: item.value,
          style: {
            color: item.value === normType ? 'var(--color-primary)' : null,
          },
          label: item.text,
          onClick: () => {
            onChangeData(axis.controlId, {
              normType: item.value,
            });
          },
        })),
      },
    !isNumberControl(axis.type) &&
      verifyNumber && {
        key: 'textNormType',
        label: _l('计算'),
        popupOffset: [0, -15],
        popupStyle: { minWidth: 120 },
        children: (control.enumDefault === 1 ? normTypes : textNormTypes).map(item => ({
          key: item.value,
          className: 'valignWrapper',
          style: {
            color: item.value === normType ? 'var(--color-primary)' : null,
          },
          label: item.text,
          extra: item.value === 7 && (
            <Tooltip title={_l('仅显示一个')}>
              <Icon icon="info" className="Font16 pointer textTertiary" />
            </Tooltip>
          ),

          onClick: () => {
            onChangeData(axis.controlId, {
              normType: item.value,
            });
          },
        })),
      },
    type &&
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
            children: timeDataList.map(item => getParticleItem(item)),
          },
          !!timeGatherParticleList.length && {
            key: 'timeGatherDivider',
            type: 'divider',
          },
          !!timeGatherParticleList.length && {
            key: 'timeGather',
            type: 'group',
            label: _l('集合'),
            children: timeGatherParticleList.map(item => getParticleItem(item)),
          },
        ].filter(Boolean),
      },
    type &&
      isTime &&
      _.find(timeDataParticle, {
        value: particleSizeType,
      }) && {
        key: 'showFormat',
        label: _l('日期格式'),
        popupOffset: [0, -15],
        popupStyle: { minWidth: 200 },
        children: [
          ...formatTimeFormats(particleSizeType).map(item => ({
            key: item.value,
            className: 'valignWrapper',
            style: {
              color: item.value === showFormat ? 'var(--color-primary)' : null,
            },
            label: <div className="flex">{item.getTime()}</div>,
            onClick: () => {
              onChangeData(axis.controlId, {
                showFormat: item.value,
              });
            },
          })),
          {
            key: 'customShowFormat',
            className: 'valignWrapper',
            style: {
              color: !_.find(timeFormats, {
                value: showFormat,
              })
                ? 'var(--color-primary)'
                : null,
            },
            label: <div className="flex">{_l('自定义')}</div>,
            onClick: () => {
              openShowFormatDialog({
                showformat: _.find(timeFormats, {
                  value: showFormat,
                })
                  ? ''
                  : showFormat,
                onOk: value => {
                  onChangeData(axis.controlId, {
                    showFormat: value,
                  });
                },
              });
            },
          },
        ],
      },
    type &&
      isArea && {
        key: 'areaParticleSizeType',
        label: _l('归组'),
        popupOffset: [0, -15],
        popupStyle: { minWidth: 120 },
        children: areaParticleSizeDropdownData.map(item => getParticleItem(item)),
      },
    axis.type === 35 && {
      key: 'cascadeParticleSizeType',
      label: _l('归组'),
      popupOffset: [0, -15],
      popupStyle: { minWidth: 120 },
      children: cascadeParticleSizeDropdownData.map(item => ({
        key: item.value,
        disabled: item.value === particleSizeType,
        style: {
          color: item.value === (particleSizeType || 1) ? 'var(--color-primary)' : null,
        },
        label: item.text,
        onClick: () => {
          onUpdateParticleSizeType(axis.controlId, particleSizeType, item.value);
        },
      })),
    },
    isRelate &&
      type === 'lines' && {
        key: 'showControl',
        label: _l('显示字段'),
        onClick: () => {
          onShowControl(axis.controlId);
        },
      },
    verifyNumber && {
      key: 'hideDivider',
      type: 'divider',
      className: 'mTop5 mBottom5',
    },
    verifyNumber && {
      key: 'hide',
      label: _l('在表格中%0', hide ? _l('显示') : _l('隐藏')),
      onClick: () => {
        onChangeData(axis.controlId, {
          hide: !hide,
        });
      },
    },
  ].filter(Boolean);
};

const renderSortableItem = props => {
  const {
    DragHandle,
    type,
    item,
    axisControls,
    allControls,
    onClear,
    verifyNumber,
    disableParticleSizeTypes,
    onUpdateParticleSizeType,
    onChangeData,
    onShowControl,
    onSelectReNameId,
    openShowFormatDialog,
  } = props;

  if (!item) return null;

  const axis =
    _.find(axisControls, {
      controlId: item.controlId,
    }) || {};
  const control =
    _.find(allControls, {
      controlId: item.controlId,
    }) || {};

  const isTime = isTimeControl(axis.type);
  const isArea = isAreaControl(axis.type);
  const overlayProps = {
    axis,
    control,
    type,
    item,
    disableParticleSizeTypes,
    onUpdateParticleSizeType,
    onChangeData,
    onShowControl,
    onSelectReNameId,
    openShowFormatDialog,
    verifyNumber,
  };
  const tip = item.rename && item.rename !== axis.controlName ? axis.controlName : null;
  return (
    <SortableItemContent className="mBottom12">
      <DragHandle>
        <Icon className="sortableDrag Font20 pointer textDisabled hoverColorPrimary" icon="drag" />
      </DragHandle>
      <div className="flexRow valignWrapper fidldItem mBottom0" key={item.controlId}>
        {axis.controlId ? (
          <Tooltip title={tip}>
            <span className="textPrimary flex ellipsis">
              {verifyNumber &&
                ![10000000, 10000001].includes(axis.type) &&
                `${_.get(
                  _.find(normTypes.concat(textNormTypes), {
                    value: item.normType,
                  }),
                  'text',
                )}: `}
              {item.rename || axis.controlName}
              {!verifyNumber && (
                <Fragment>
                  {isTime &&
                    ` (${
                      _.find(timeParticleSizeDropdownData, {
                        value: item.particleSizeType || 1,
                      }).text
                    })`}
                  {isArea &&
                    ` (${
                      _.find(areaParticleSizeDropdownData, {
                        value: item.particleSizeType || 1,
                      }).text
                    })`}
                </Fragment>
              )}
            </span>
          </Tooltip>
        ) : control.strDefault === '10' ? (
          <span className="Red flex ellipsis">{`${control.controlName} (${_l('无效类型')})`}</span>
        ) : (
          <Tooltip title={`ID: ${item.controlId}`}>
            <span className="Red flex ellipsis">{_l('字段已删除')}</span>
          </Tooltip>
        )}
        {item.hide && <Icon className="textTertiary Font18 mRight10" icon="workflow_hide" />}
        <Dropdown
          trigger={['click']}
          menu={{
            style: { minWidth: 200 },
            subMenuOpenDelay: 0.2,
            items: getMenuItems(overlayProps),
          }}
          placement="bottomRight"
        >
          <Icon className="textTertiary Font18 pointer" icon="arrow-down-border" />
        </Dropdown>
        <Icon
          className="textTertiary Font18 pointer mLeft10"
          icon="close"
          onClick={() => {
            onClear(item);
          }}
        />
      </div>
    </SortableItemContent>
  );
};

let PivotTableAxis = class PivotTableAxis extends Component {
  constructor(props) {
    super(props);
    this.state = {
      resetNameVisible: false,
      showControlVisible: false,
      currentControl: {},
    };
  }

  handleVerification = (data, isAlert = false) => {
    const { type, list, axisList, verifyNumber } = this.props;
    const isAxis = ['lines', 'columns'].includes(type);

    if (
      !isTimeControl(data.type) &&
      _.find(isAxis ? axisList : list, {
        controlId: data.controlId,
      })
    ) {
      isAlert && alert(_l('字段不可重复添加，如需使用，请使用“计算字段”添加'), 2);
      isAlert && addCalculateControlHighlight();
      return false;
    }

    if (!verifyNumber && [10000000, 10000001].includes(data.type)) {
      isAlert && alert(_l('不允许添加计算字段'), 2);
      return false;
    }

    return true;
  };
  handleAddControl = data => {
    if (!this.handleVerification(data, true)) {
      return;
    }

    this.props.onAdd(data);
  };
  handleSelectReNameId = (id, particleSizeType) => {
    const { verifyNumber } = this.props;
    const data = verifyNumber
      ? {
          controlId: id,
        }
      : {
          controlId: id,
          particleSizeType,
        };
    const currentControl = _.find(this.props.list, data) || {};
    this.setState({
      resetNameVisible: true,
      currentControl,
    });
  };
  handleShowControl = id => {
    const { worksheetInfo, list } = this.props;
    const { columns } = worksheetInfo;
    const column =
      _.find(columns, {
        controlId: id,
      }) || {};
    const currentControl =
      _.find(list, {
        controlId: id,
      }) || {};
    this.setState({
      showControlVisible: true,
      currentControl: { ...currentControl, relationControls: column.relationControls },
    });
  };
  handleChangeRename = name => {
    const { list } = this.props;
    const { currentControl } = this.state;
    const newList = list.map(item => {
      if (item.controlId === currentControl.controlId && currentControl.particleSizeType === item.particleSizeType) {
        item.rename = name;
      }

      return item;
    });
    this.props.onUpdateList(newList);
  };
  handleUpdateParticleSizeType = (controlId, particleSizeType, value) => {
    const { list } = this.props;
    const id = particleSizeType ? `${controlId}-${particleSizeType}` : controlId;
    const newList = list.map(item => {
      if (item.controlId === controlId && item.particleSizeType === particleSizeType) {
        item.particleSizeType = value;
        item.showFormat = '0';
      }

      return item;
    });
    this.props.onUpdateList(newList, id);
  };
  handleChangeData = (controlId, data) => {
    const { list } = this.props;
    const newList = list.map(item => {
      if (item.controlId === controlId) {
        return { ...item, ...data };
      }

      return item;
    });
    this.props.onUpdateList(newList);
  };
  handleSortEnd = newList => {
    this.props.onUpdateList(newList);
  };

  renderModal() {
    const { resetNameVisible, showControlVisible, currentControl } = this.state;
    return (
      <Fragment>
        <RenameModal
          dialogVisible={resetNameVisible}
          rename={currentControl.rename || currentControl.controlName}
          onChangeRename={this.handleChangeRename}
          onHideDialogVisible={() => {
            this.setState({
              resetNameVisible: false,
              currentControl: {},
            });
          }}
        />

        <ShowControlModal
          dialogVisible={showControlVisible}
          relationControls={currentControl.relationControls || []}
          fields={currentControl.fields || []}
          onUpdateXaxisFields={fields => {
            this.handleChangeData(currentControl.controlId, {
              fields,
            });
          }}
          onHideDialogVisible={() => {
            this.setState({
              showControlVisible: false,
            });
          }}
        />
      </Fragment>
    );
  }

  render() {
    const { type, name, list, axisControls, allControls, disableParticleSizeTypes, verifyNumber } = this.props;
    const otherProps = {
      type,
      axisControls,
      allControls,
      verifyNumber,
      disableParticleSizeTypes,
      onClear: this.props.onRemove,
      onChangeData: this.handleChangeData,
      onUpdateParticleSizeType: this.handleUpdateParticleSizeType,
      onSelectReNameId: this.handleSelectReNameId,
      onShowControl: this.handleShowControl,
      openShowFormatDialog: this.props.openShowFormatDialog,
    };
    return (
      <div className="fieldWrapper mBottom20">
        <div className="Bold mBottom12">{name}</div>
        <SortableList
          renderBody
          useDragHandle
          items={list}
          itemKey="controlId"
          renderItem={options => renderSortableItem({ ...options, ...otherProps })}
          onSortEnd={this.handleSortEnd}
        />

        {<WithoutFidldItem onVerification={this.handleVerification} onAddControl={this.handleAddControl} />}
        {this.renderModal()}
      </div>
    );
  }
};
PivotTableAxis = connect(state => ({ ..._.pick(state.statistics, ['worksheetInfo']) }))(PivotTableAxis);
export default withOpeners(PivotTableAxis, {
  openShowFormatDialog: useShowFormatDialog,
});
