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
  onNormType,
  onUpdateParticleSizeType,
  onSelectReNameId,
  verifyNumber
}) => {
  const isNumber = isNumberControl(axis.type, false);
  const isTime = isTimeControl(axis.type);
  const isArea = isAreaControl(axis.type);
  return (
    <Menu className="chartControlMenu chartMenu">
      <Menu.Item
        onClick={() => {
          onSelectReNameId(axis.controlId);
        }}
      >
        {_l('重命名')}
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
          {(axis.type === 16
            ? timeParticleSizeDropdownData
            : timeParticleSizeDropdownData.filter(item => ![6, 7].includes(item.value))
          ).map(item => (
            <Menu.Item
              style={{ width: 120, color: item.value === particleSizeType ? '#1e88e5' : null }}
              key={item.value}
              onClick={() => {
                onUpdateParticleSizeType(axis.controlId, item.value);
              }}
            >
              {item.text}
            </Menu.Item>
          ))}
        </Menu.SubMenu>
      )}
      {isArea && (
        <Menu.SubMenu popupClassName="chartMenu" title={_l('归组')} popupOffset={[0, -15]}>
          {areaParticleSizeDropdownData.map(item => (
            <Menu.Item
              style={{ width: 120, color: item.value === particleSizeType ? '#1e88e5' : null }}
              key={item.value}
              onClick={() => {
                onUpdateParticleSizeType(axis.controlId, item.value);
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
  const { item, axisControls, onClear, onNormType, verifyNumber, onUpdateParticleSizeType, onSelectReNameId } = props;
  const axis = _.find(axisControls, { controlId: item.controlId }) || {};
  const isNumber = isNumberControl(axis.type, false);
  const isTime = isTimeControl(axis.type);
  const isArea = isAreaControl(axis.type);
  const overlayProps = {
    axis,
    normType: item.normType,
    particleSizeType: item.particleSizeType,
    onNormType,
    onUpdateParticleSizeType,
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

export default class PivotTableAxis extends Component {
  constructor(props) {
    super(props);
    this.state = {
      currentControlId: null,
    };
  }
  handleVerification = (data, isAlert = false) => {
    const { list, verifyNumber } = this.props;

    if (_.find(list, { controlId: data.controlId })) {
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
      if (data.type === 10000001) {
        isAlert && alert(_l('不允许添加计算字段'), 2);
        return false;
      } else {
        return true;
      }
    }

    return true;
  };
  handleAddControl = data => {
    const { list, verifyNumber } = this.props;

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
        axis.particleSizeType = isTime || isArea ? 1 : 0;
      }
      // if (isNumberControl(data.type)) {
      //   Object.assign(axis, {
      //     normType: 1,
      //     dot: data.dot,
      //     magnitude: 1,
      //     suffix: '',
      //     ydot: '',
      //   });
      // }
      this.props.onUpdateList(list.concat(axis));
    }
  };
  handleSelectReNameId = id => {
    this.setState({
      currentControlId: id,
    });
  };
  handleChangeRename = name => {
    const { list } = this.props;
    const { currentControlId } = this.state;
    const newList = list.map(item => {
      if (item.controlId === currentControlId) {
        item.rename = name;
      }
      return item;
    });
    this.props.onUpdateList(newList);
  };
  handleClear = id => {
    const { list } = this.props;
    this.props.onUpdateList(list.filter(item => item.controlId !== id), id);
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
  handleUpdateParticleSizeType = (controlId, value) => {
    const { list } = this.props;
    const newList = list.map(item => {
      if (item.controlId === controlId) {
        item.particleSizeType = value;
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
    const { currentControlId } = this.state;
    const currentControl = _.find(this.props.list, { controlId: currentControlId }) || {};
    return (
      <RenameModal
        dialogVisible={!!currentControlId}
        rename={currentControl.rename || currentControl.controlName}
        onChangeRename={this.handleChangeRename}
        onHideDialogVisible={() => {
          this.setState({
            currentControlId: null,
          });
        }}
      />
    );
  }
  render() {
    const { name, list, axisControls, verifyNumber } = this.props;
    return (
      <div className="fieldWrapper mBottom20">
        <div className="Bold mBottom12">{name}</div>
        <SortableList
          axis="xy"
          helperClass="sortablePivotTableField"
          list={list}
          axisControls={axisControls}
          verifyNumber={verifyNumber}
          onClear={this.handleClear}
          onNormType={this.handleNormType}
          onUpdateParticleSizeType={this.handleUpdateParticleSizeType}
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
