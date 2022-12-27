import React, { Component, Fragment } from 'react';
import styled from 'styled-components';
import { Icon } from 'ming-ui';
import { Menu, Dropdown, Tooltip } from 'antd';
import RenameModal from './RenameModal';
import ShowControlModal from './ShowControlModal';
import { SortableContainer, SortableElement, arrayMove } from 'react-sortable-hoc';
import WithoutFidldItem from './WithoutFidldItem';
import { WIDGETS_TO_API_TYPE_ENUM } from 'src/pages/widgetConfig/config/widget';
import {
  normTypes,
  timeParticleSizeDropdownData,
  areaParticleSizeDropdownData,
  timeDataParticle,
  timeGatherParticle,
  filterTimeData,
  filterTimeGatherParticle,
  isNumberControl,
  isTimeControl,
  isAreaControl,
  filterDisableParticleSizeTypes
} from 'statistics/common';
import { connect } from 'react-redux';
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

const renderOverlay = ({
  axis,
  type,
  normType,
  particleSizeType,
  disableParticleSizeTypes,
  xaxisEmpty,
  onNormType,
  onUpdateParticleSizeType,
  onUpdateXaxisEmpty,
  onSelectReNameId,
  onShowControl,
  verifyNumber
}) => {
  const isNumber = isNumberControl(axis.type, false);
  const isTime = isTimeControl(axis.type);
  const isArea = isAreaControl(axis.type);
  const isRelate = axis.type === 29;
  const newDisableParticleSizeTypes = filterDisableParticleSizeTypes(axis.controlId, disableParticleSizeTypes);
  const showtype = _.get(axis, 'advancedSetting.showtype');
  const timeDataList = isTime ? filterTimeData(timeDataParticle, { showtype, controlType: axis.type }) : [];
  const timeGatherParticleList = filterTimeGatherParticle(timeGatherParticle, { showtype, controlType: axis.type });

  return (
    <Menu className="chartControlMenu chartMenu" expandIcon={<Icon icon="arrow-right-tip" />}>
      <Menu.Item
        onClick={() => {
          onSelectReNameId(axis.controlId, particleSizeType);
        }}
      >
        {_l('重命名')}
      </Menu.Item>
      <Menu.Item
        className="flexRow valignWrapper"
        onClick={() => {
          onUpdateXaxisEmpty(axis.controlId, !xaxisEmpty);
        }}
      >
        <div className="flex">{_l('统计空值')}</div>
        {xaxisEmpty && <Icon icon="done" className="Font17"/>}
      </Menu.Item>
      {isNumber && verifyNumber && (
        <Menu.SubMenu popupClassName="chartMenu" title={_l('计算')} popupOffset={[0, -15]}>
          {normTypes.map(item => (
            <Menu.Item
              style={{ width: 120, color: item.value === normType ? '#1e88e5' : null }}
              key={item.value}
              onClick={() => {
                onNormType(axis.controlId, item.value);
              }}
            >
              {item.text}
            </Menu.Item>
          ))}
        </Menu.SubMenu>
      )}
      {isTime && (
        <Menu.SubMenu popupClassName="chartMenu" title={_l('归组')} popupOffset={[0, -15]}>
          <Menu.ItemGroup title={_l('时间')}>
            {timeDataList.map(item => (
              <Menu.Item
                className="valignWrapper"
                disabled={item.value === particleSizeType ? true : newDisableParticleSizeTypes.includes(item.value)}
                style={{
                  width: 200,
                  color: item.value === particleSizeType ? '#1e88e5' : null,
                }}
                key={item.value}
                onClick={() => {
                  onUpdateParticleSizeType(axis.controlId, particleSizeType, item.value);
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
                    disabled={item.value === particleSizeType ? true : newDisableParticleSizeTypes.includes(item.value)}
                    style={{
                      width: 200,
                      color: item.value === particleSizeType ? '#1e88e5' : null,
                    }}
                    key={item.value}
                    onClick={() => {
                      onUpdateParticleSizeType(axis.controlId, particleSizeType, item.value);
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
              disabled={item.value === particleSizeType ? true : newDisableParticleSizeTypes.includes(item.value)}
              style={{ width: 120, color: item.value === particleSizeType ? '#1e88e5' : null }}
              key={item.value}
              onClick={() => {
                onUpdateParticleSizeType(axis.controlId, particleSizeType, item.value);
              }}
            >
              {item.text}
            </Menu.Item>
          ))}
        </Menu.SubMenu>
      )}
      {isRelate && type === 'lines' && (
        <Menu.Item
          onClick={() => {
            onShowControl(axis.controlId);
          }}
        >
          {_l('显示字段')}
        </Menu.Item>
      )}
    </Menu>
  );
};

const SortableItem = SortableElement(props => {
  const { type, item, axisControls, allControls, onClear, onNormType, verifyNumber, disableParticleSizeTypes, onUpdateParticleSizeType, onUpdateXaxisEmpty, onShowControl, onSelectReNameId } = props;
  const axis = _.find(axisControls, { controlId: item.controlId }) || {};
  const control = _.find(allControls, { controlId: item.controlId }) || {};
  const isNumber = isNumberControl(axis.type, false);
  const isTime = isTimeControl(axis.type);
  const isArea = isAreaControl(axis.type);
  const overlayProps = {
    axis,
    type,
    normType: item.normType,
    particleSizeType: item.particleSizeType,
    xaxisEmpty: item.xaxisEmpty,
    onNormType,
    disableParticleSizeTypes,
    onUpdateParticleSizeType,
    onUpdateXaxisEmpty,
    onShowControl,
    onSelectReNameId,
    verifyNumber
  };
  const tip = item.rename && item.rename !== axis.controlName ? axis.controlName : null;
  return (
    <SortableItemContent className="mBottom12">
      <Icon className="sortableDrag Font20 pointer Gray_bd ThemeHoverColor3" icon="drag_indicator" />
      <div className="flexRow valignWrapper fidldItem mBottom0" key={item.controlId}>
        {axis.controlId ? (
          <Tooltip title={tip}>
            <span className="Gray flex ellipsis">
              {(isNumber && verifyNumber) && `${_.find(normTypes, { value: item.normType }).text}: `}
              {item.rename || axis.controlName}
              {isTime && ` (${_.find(timeParticleSizeDropdownData, { value: item.particleSizeType || 1 }).text})`}
              {isArea && ` (${_.find(areaParticleSizeDropdownData, { value: item.particleSizeType || 1 }).text})`}
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
        <Dropdown trigger={['click']} overlay={renderOverlay(overlayProps)} placement="bottomRight">
          <Icon className="Gray_9e Font18 pointer" icon="arrow-down-border" />
        </Dropdown>
        <Icon
          className="Gray_9e Font18 pointer mLeft10"
          icon="close"
          onClick={() => {
            onClear(item);
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

@connect(
  state => ({
    ..._.pick(state.statistics, ['worksheetInfo'])
  })
)
export default class PivotTableAxis extends Component {
  constructor(props) {
    super(props);
    this.state = {
      resetNameVisible: false,
      showControlVisible: false,
      currentControl: {},
    };
  }
  handleVerification = (data, isAlert = false) => {
    const { list, verifyNumber } = this.props;

    if (!isTimeControl(data.type) && _.find(list, { controlId: data.controlId })) {
      isAlert && alert(_l('不允许添加重复字段'), 2);
      return false;
    }

    if (verifyNumber) {
      if (isNumberControl(data.type) || data.type === WIDGETS_TO_API_TYPE_ENUM.SCORE) {
        return true;
      } else {
        isAlert && alert(_l('只允许添加数值和公式字段'), 2);
        return false;
      }
    } else {
      if ([10000000, 10000001].includes(data.type)) {
        isAlert && alert(_l('不允许添加记录数量和计算字段'), 2);
        return false;
      } else {
        return true;
      }
    }

    return true;
  }
  handleAddControl = data => {
    const { list, verifyNumber, disableParticleSizeTypes } = this.props;

    if (!this.handleVerification(data, true)) {
      return;
    }

    this.props.onAdd(data);
  }
  handleSelectReNameId = (id, particleSizeType) => {
    const { verifyNumber } = this.props;
    const data = verifyNumber ? { controlId: id } : { controlId: id, particleSizeType };
    const currentControl = _.find(this.props.list, data) || {};
    this.setState({
      resetNameVisible: true,
      currentControl,
    });
  }
  handleShowControl = (id) => {
    const { worksheetInfo, list } = this.props;
    const { columns } = worksheetInfo;
    const column = _.find(columns, { controlId: id }) || {};
    const currentControl = _.find(list, { controlId: id }) || {};
    this.setState({
      showControlVisible: true,
      currentControl: {
        ...currentControl,
        relationControls: column.relationControls
      }
    });
  }
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
  }
  handleNormType = (controlId, value) => {
    const { list } = this.props;
    const newList = list.map(item => {
      if (item.controlId === controlId) {
        item.normType = value;
      }
      return item;
    });
    this.props.onUpdateList(newList);
  }
  handleUpdateParticleSizeType = (controlId, particleSizeType, value) => {
    const { list } = this.props;
    const id = particleSizeType ? `${controlId}-${particleSizeType}` : controlId;
    const newList = list.map(item => {
      if (item.controlId === controlId && item.particleSizeType === particleSizeType) {
        item.particleSizeType = value;
      }
      return item;
    });
    this.props.onUpdateList(newList, id);
  }
  handleUpdateXaxisEmpty = (controlId, value) => {
    const { list } = this.props;
    const newList = list.map(item => {
      if (item.controlId === controlId) {
        item.xaxisEmpty = value;
      }
      return item;
    });
    this.props.onUpdateList(newList);
  }
  handleUpdateXaxisFields = (controlId, value) => {
    const { list } = this.props;
    const newList = list.map(item => {
      if (item.controlId === controlId) {
        item.fields = value;
      }
      return item;
    });
    this.props.onUpdateList(newList);
  }
  handleSortEnd = ({ oldIndex, newIndex }) => {
    if (oldIndex === newIndex) return;
    const newList = arrayMove(_.cloneDeep(this.props.list), oldIndex, newIndex);
    this.props.onUpdateList(newList);
  }
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
          onUpdateXaxisFields={(fields) => {
            this.handleUpdateXaxisFields(currentControl.controlId, fields);
          }}
          onHideDialogVisible={() => {
            this.setState({
              showControlVisible: false
            });
          }}
        />
      </Fragment>
    );
  }
  render() {
    const { type, name, list, axisControls, allControls, disableParticleSizeTypes, verifyNumber } = this.props;
    return (
      <div className="fieldWrapper mBottom20">
        <div className="Bold mBottom12">{name}</div>
        <SortableList
          axis="xy"
          helperClass="sortableNumberField"
          type={type}
          list={list}
          axisControls={axisControls}
          allControls={allControls}
          verifyNumber={verifyNumber}
          disableParticleSizeTypes={disableParticleSizeTypes}
          onClear={this.props.onRemove}
          onNormType={this.handleNormType}
          onUpdateParticleSizeType={this.handleUpdateParticleSizeType}
          onUpdateXaxisEmpty={this.handleUpdateXaxisEmpty}
          onSelectReNameId={this.handleSelectReNameId}
          onShowControl={this.handleShowControl}
          shouldCancelStart={({ target }) => !target.classList.contains('icon-drag_indicator')}
          onSortEnd={this.handleSortEnd}
        />
        {<WithoutFidldItem onVerification={this.handleVerification} onAddControl={this.handleAddControl} />}
        {this.renderModal()}
      </div>
    );
  }
}
