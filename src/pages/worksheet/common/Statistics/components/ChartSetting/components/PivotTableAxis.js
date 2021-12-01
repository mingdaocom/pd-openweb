import React, { Component } from 'react';
import styled from 'styled-components';
import { Icon } from 'ming-ui';
import { Menu, Dropdown, Tooltip } from 'antd';
import RenameModal from './RenameModal';
import { SortableContainer, SortableElement, arrayMove } from 'react-sortable-hoc';
import WithoutFidldItem from './WithoutFidldItem';
import {
  normTypes,
  timeParticleSizeDropdownData,
  areaParticleSizeDropdownData,
  isNumberControl,
  isTimeControl,
  isAreaControl,
  filterDisableParticleSizeTypes
} from 'src/pages/worksheet/common/Statistics/common';

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
  normType,
  particleSizeType,
  disableParticleSizeTypes,
  xaxisEmpty,
  onNormType,
  onUpdateParticleSizeType,
  onUpdateXaxisEmpty,
  onSelectReNameId,
  verifyNumber
}) => {
  const isNumber = isNumberControl(axis.type, false);
  const isTime = isTimeControl(axis.type);
  const isArea = isAreaControl(axis.type);
  const timeData = (isTime
  ? axis.type === 16
    ? timeParticleSizeDropdownData
    : timeParticleSizeDropdownData.filter(item => ![6, 7].includes(item.value))
  : []).filter(item => ![8, 9, 10, 11].includes(item.value));
  const timeGather = timeParticleSizeDropdownData.filter(item => [8, 9, 10, 11].includes(item.value));
  const newDisableParticleSizeTypes = filterDisableParticleSizeTypes(axis.controlId, disableParticleSizeTypes);
  return (
    <Menu className="chartControlMenu chartMenu">
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
            {timeData.map(item => (
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
          <Menu.Divider />
          <Menu.ItemGroup title={_l('集合')}>
            {timeGather.map(item => (
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
    </Menu>
  );
};

const SortableItem = SortableElement(props => {
  const { item, axisControls, onClear, onNormType, verifyNumber, disableParticleSizeTypes, onUpdateParticleSizeType, onUpdateXaxisEmpty, onSelectReNameId } = props;
  const axis = _.find(axisControls, { controlId: item.controlId }) || {};
  const isNumber = isNumberControl(axis.type, false);
  const isTime = isTimeControl(axis.type);
  const isArea = isAreaControl(axis.type);
  const overlayProps = {
    axis,
    normType: item.normType,
    particleSizeType: item.particleSizeType,
    xaxisEmpty: item.xaxisEmpty,
    onNormType,
    disableParticleSizeTypes,
    onUpdateParticleSizeType,
    onUpdateXaxisEmpty,
    onSelectReNameId,
    verifyNumber
  };
  const tip = item.rename && item.rename !== axis.controlName ? axis.controlName : null;
  return (
    <SortableItemContent className="mBottom12">
      <Icon className="sortableDrag Font20 pointer Gray_bd ThemeHoverColor3" icon="drag_indicator" />
      <div className="flexRow valignWrapper fidldItem mBottom0" key={item.controlId}>
        <Tooltip title={tip}>
          <span className="Gray flex ellipsis">
            {(isNumber && verifyNumber) && `${_.find(normTypes, { value: item.normType }).text}: `}
            {item.rename || axis.controlName || _l('该控件不存在')}
            {isTime && ` (${_.find(timeParticleSizeDropdownData, { value: item.particleSizeType || 1 }).text})`}
            {isArea && ` (${_.find(areaParticleSizeDropdownData, { value: item.particleSizeType || 1 }).text})`}
          </span>
        </Tooltip>
        <Dropdown trigger={['click']} overlay={renderOverlay(overlayProps)}>
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

export default class PivotTableAxis extends Component {
  constructor(props) {
    super(props);
    this.state = {
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
      if (isNumberControl(data.type)) {
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
  };
  handleAddControl = data => {
    const { list, verifyNumber, disableParticleSizeTypes } = this.props;

    if (!this.handleVerification(data, true)) {
      return;
    }

    if (verifyNumber) {
      const axis = {
        controlId: data.controlId,
        controlName: data.controlName,
        controlType: data.type,
        normType: 1,
        dot: data.dot,
        magnitude: 1,
        suffix: '',
        ydot: '',
      };
      this.props.onUpdateList(list.concat(axis));
    } else {
      const isTime = isTimeControl(data.type);
      const isArea = isAreaControl(data.type);
      const axis = {
        controlId: data.controlId,
        controlName: data.controlName,
        controlType: data.type,
      };
      if (isTime || isArea) {
        const dropdownData = isTime ? timeParticleSizeDropdownData : areaParticleSizeDropdownData;
        const newDisableParticleSizeTypes = filterDisableParticleSizeTypes(data.controlId, disableParticleSizeTypes);
        const allowTypes = dropdownData.map(item => item.value).filter(item => !newDisableParticleSizeTypes.includes(item));
        if (allowTypes.length) {
          axis.particleSizeType = allowTypes[0];
        } else {
          alert(_l('不允许添加重复粒度'), 2);
          return;
        }
      }
      this.props.onUpdateList(list.concat(axis));
    }
  };
  handleSelectReNameId = (id, particleSizeType) => {
    const { verifyNumber } = this.props;
    const data = verifyNumber ? { controlId: id } : { controlId: id, particleSizeType };
    const currentControl = _.find(this.props.list, data) || {};
    this.setState({
      currentControl,
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
  handleClear = ({ controlId, controlType, particleSizeType }) => {
    const { list } = this.props;
    const id = particleSizeType ? `${controlId}-${particleSizeType}` : controlId;
    this.props.onUpdateList(list.filter(item => {
      if (item.particleSizeType) {
        return item.controlId == controlId ? item.particleSizeType !== particleSizeType : true;
      } else {
        return item.controlId !== controlId
      }
    }), id);
  };
  handleNormType = (controlId, value) => {
    const { list } = this.props;
    const newList = list.map(item => {
      if (item.controlId === controlId) {
        item.normType = value;
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
      }
      return item;
    });
    this.props.onUpdateList(newList, id);
  };
  handleUpdateXaxisEmpty = (controlId, value) => {
    const { list } = this.props;
    const newList = list.map(item => {
      if (item.controlId === controlId) {
        item.xaxisEmpty = value;
      }
      return item;
    });
    this.props.onUpdateList(newList);
  };
  handleSortEnd = ({ oldIndex, newIndex }) => {
    if (oldIndex === newIndex) return;
    const newList = arrayMove(_.cloneDeep(this.props.list), oldIndex, newIndex);
    this.props.onUpdateList(newList);
  };
  renderModal() {
    const { currentControl } = this.state;
    return (
      <RenameModal
        dialogVisible={!_.isEmpty(currentControl)}
        rename={currentControl.rename || currentControl.controlName}
        onChangeRename={this.handleChangeRename}
        onHideDialogVisible={() => {
          this.setState({
            currentControl: {},
          });
        }}
      />
    );
  }
  render() {
    const { name, list, axisControls, disableParticleSizeTypes, verifyNumber } = this.props;
    return (
      <div className="fieldWrapper mBottom20">
        <div className="Bold mBottom12">{name}</div>
        <SortableList
          axis="xy"
          helperClass="sortableNumberField"
          list={list}
          axisControls={axisControls}
          verifyNumber={verifyNumber}
          disableParticleSizeTypes={disableParticleSizeTypes}
          onClear={this.handleClear}
          onNormType={this.handleNormType}
          onUpdateParticleSizeType={this.handleUpdateParticleSizeType}
          onUpdateXaxisEmpty={this.handleUpdateXaxisEmpty}
          onSelectReNameId={this.handleSelectReNameId}
          shouldCancelStart={({ target }) => !target.classList.contains('icon-drag_indicator')}
          onSortEnd={this.handleSortEnd}
        />
        {<WithoutFidldItem onVerification={this.handleVerification} onAddControl={this.handleAddControl} />}
        {this.renderModal()}
      </div>
    );
  }
}
