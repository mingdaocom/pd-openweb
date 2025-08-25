import React, { Component } from 'react';
import { Button, ConfigProvider, Modal, Select } from 'antd';
import cx from 'classnames';
import _ from 'lodash';
import styled from 'styled-components';
import { Icon, SortableList } from 'ming-ui';
import { relevanceImageSize } from 'statistics/common';
import { getIconByType } from 'src/pages/widgetConfig/util';

const SearchControlWrapper = styled.div`
  padding: 8px 5px;
  border-bottom: 1px solid #ddddddff;
  input {
    color: #202020;
    border: none;
  }
  .icon-close:hover {
    color: #1677ff !important;
  }
`;

const ButtonWrapper = styled.div`
  padding: 0 10px;
  height: 28px;
  line-height: 28px;
  color: #757575;
  margin-right: 8px;
  border-radius: 3px;
  background-color: #f5f5f5;
  cursor: pointer;
  &:hover {
    color: #1677ff;
    background-color: #f0f0f0;
  }
`;

const SelectWrapper = styled(Select)`
  width: 120px;
  margin-right: 10px !important;
  &.ant-select-sm {
    .ant-select-selector,
    .ant-select-selection-item {
      height: 28px !important;
      line-height: 26px !important;
      box-shadow: none !important;
    }
  }
`;

const defaultSize = 2;

const renderSortableItem = ({ DragHandle, item, otherProps }) => {
  const { selected, attribute = {}, handleItemClick, handleChangeSize } = otherProps;
  const isAttribute = attribute.controlId === item.controlId;
  const column = item;
  const control = _.find(selected, { controlId: column.controlId });
  return (
    <div className="showControlsColumnCheckItem flexRow Hand">
      <div className="flex overflow_ellipsis">
        <Icon
          onClick={() => {
            if (isAttribute) {
              return;
            }
            handleItemClick(column);
          }}
          icon={control ? 'ic_toggle_on' : 'ic_toggle_off'}
          style={{ cursor: isAttribute ? 'auto' : null }}
          className="switchIcon Font22 mRight12"
        />
        <i className={cx('icon Gray_9e mRight6 Font16', 'icon-' + getIconByType(column.type))}></i>
        <span className="Font14">{column.controlName}</span>
      </div>
      {column.type === 14 && control && (
        <SelectWrapper
          className="chartSelect"
          value={control.size}
          suffixIcon={<Icon icon="expand_more" className="Gray_9e Font20" />}
          size="small"
          onChange={value => {
            handleChangeSize(control.controlId, value);
          }}
        >
          {relevanceImageSize.map(item => (
            <Select.Option key={item.value} className="selectOptionWrapper" value={item.value}>
              {item.text}
            </Select.Option>
          ))}
        </SelectWrapper>
      )}
      <DragHandle>
        <Icon
          icon="drag"
          style={{ visibility: control ? null : 'hidden' }}
          className="Gray_9e Font16 Right ThemeHoverColor3 Hand dragHandle"
        />
      </DragHandle>
    </div>
  );
};

export default class ShowControlModal extends Component {
  constructor(props) {
    super(props);
    this.state = {
      searchValue: '',
      selected: [],
      columns: [],
    };
  }
  componentWillReceiveProps(nextProps) {
    if (nextProps.dialogVisible && !this.props.dialogVisible) {
      const columns = nextProps.relationControls
        .filter(item => {
          return (
            ![10010, 21, 22, 25, 29, 30, 41, 42, 43, 45, 47, 49, 51, 52, 54].includes(item.type) &&
            !_.find(nextProps.fields, { controlId: item.controlId })
          );
        })
        .sort((a, b) => {
          if (a.row === b.row) {
            return a.col - b.col;
          } else {
            return a.row - b.row;
          }
        });
      const fieldsColumns = nextProps.fields.map(item => {
        return _.find(nextProps.relationControls, { controlId: item.controlId });
      });
      const titleControl = _.find(nextProps.relationControls, { attribute: 1 }) || {};
      const titleField = {
        controlId: titleControl.controlId,
        controlName: titleControl.controlName,
        controlType: titleControl.controlType,
      };
      const isTitleField = _.find(nextProps.fields, { controlId: titleControl.controlId });
      this.setState({
        columns: fieldsColumns.concat(columns),
        selected: isTitleField ? nextProps.fields : [titleField].concat(nextProps.fields),
      });
    }
  }
  handleSave = () => {
    const { columns, selected } = this.state;
    const { relationControls } = this.props;
    const attribute = _.find(relationControls, { attribute: 1 }) || {};
    const filterColumns = columns.filter(item => _.find(selected, { controlId: item.controlId }));
    const fields = filterColumns.map(item => {
      return _.find(selected, { controlId: item.controlId });
    });
    const only = fields.length === 1 && _.find(fields, { controlId: attribute.controlId });
    this.props.onUpdateXaxisFields(only ? [] : fields);
    this.props.onHideDialogVisible(false);
  };
  handleSortEnd = newColumns => {
    this.setState({
      columns: newColumns,
    });
  };
  handleShowAll = () => {
    const { columns } = this.state;
    this.setState({
      selected: columns.map(item => {
        return {
          controlId: item.controlId,
          size: defaultSize,
        };
      }),
    });
  };
  handleHideAll = () => {
    const { relationControls } = this.props;
    const { selected } = this.state;
    const attribute = _.find(relationControls, { attribute: 1 }) || {};
    this.setState({ selected: selected.filter(item => item.controlId == attribute.controlId) });
  };
  handleItemClick = column => {
    const { selected } = this.state;
    if (_.find(selected, { controlId: column.controlId })) {
      this.setState({
        selected: selected.filter(item => item.controlId !== column.controlId),
      });
    } else {
      this.setState({
        selected: selected.concat({ controlId: column.controlId, size: defaultSize }),
      });
    }
  };
  handleChangeSize = (id, value) => {
    const { selected } = this.state;
    this.setState({
      selected: selected.map(item => {
        if (item.controlId === id) {
          return {
            ...item,
            size: value,
          };
        } else {
          return item;
        }
      }),
    });
  };
  renderFooter() {
    return (
      <div className="mTop20 mBottom10 pRight8">
        <ConfigProvider autoInsertSpaceInButton={false}>
          <Button
            type="link"
            onClick={() => {
              this.props.onHideDialogVisible(false);
            }}
          >
            {_l('取消')}
          </Button>
          <Button type="primary" onClick={this.handleSave}>
            {_l('确认')}
          </Button>
        </ConfigProvider>
      </div>
    );
  }
  render() {
    const { dialogVisible, relationControls } = this.props;
    const { searchValue, columns, selected } = this.state;
    const filteredColumns = columns.filter(column =>
      (column.controlName || '').toLocaleLowerCase().includes(searchValue.toLocaleLowerCase()),
    );
    const otherProps = {
      attribute: _.find(relationControls, { attribute: 1 }) || {},
      selected,
      handleItemClick: this.handleItemClick,
      handleChangeSize: this.handleChangeSize,
    };
    return (
      <Modal
        title={_l('显示字段')}
        width={580}
        className="chartModal"
        visible={dialogVisible}
        destroyOnClose={true}
        centered={true}
        closeIcon={<Icon icon="close" className="Font20 pointer Gray_9e" />}
        footer={this.renderFooter()}
        onCancel={() => {
          this.props.onHideDialogVisible(false);
        }}
      >
        <SearchControlWrapper className="flexRow valignWrapper Gray_9e">
          <Icon icon="search" className="Font18 mRight3" />
          <input
            value={searchValue}
            className="flex"
            placeholder={_l('搜索字段')}
            onChange={e => {
              this.setState({ searchValue: e.target.value.trim() });
            }}
          />
        </SearchControlWrapper>
        <div className="flexRow mTop10 mBottom6">
          <div className="flexRow flex">
            <ButtonWrapper onClick={this.handleShowAll}>{_l('显示全部')}</ButtonWrapper>
            <ButtonWrapper onClick={this.handleHideAll}>{_l('隐藏全部')}</ButtonWrapper>
          </div>
          {!_.isEmpty(selected) && <div className="Gray_75">{_l('显示%0列', selected.length)}</div>}
        </div>
        <div className="sortableList flex" style={{ overflow: 'auto', height: 360 }}>
          <div className="columnCheckList">
            {!filteredColumns.length && <div className="emptyTip TxtCenter">{_l('没有搜索结果')}</div>}
            <SortableList
              useDragHandle
              dragPreviewImage
              items={filteredColumns}
              itemKey="controlId"
              renderItem={options => renderSortableItem({ ...options, otherProps })}
              onSortEnd={this.handleSortEnd}
            />
          </div>
        </div>
      </Modal>
    );
  }
}
