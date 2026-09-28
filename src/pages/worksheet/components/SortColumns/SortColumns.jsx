import React from 'react';
import _ from 'lodash';
import PropTypes from 'prop-types';
import { Popover, Select } from 'ming-ui/antd-components';
import ChangeColumn from 'worksheet/common/ChangeColumn';
import './index.less';

const SELECT_OPTIONS = [{ value: 'sortColumns' }];

export default class SortColumns extends React.Component {
  static propTypes = {
    // 无显示字段时展示内容
    placeholder: PropTypes.string,
    layout: PropTypes.number, // 呈现方式 1 dropdown 2 平铺
    empty: PropTypes.node,
    noShowCount: PropTypes.bool,
    noempty: PropTypes.bool, // 至少显示1个  默认 true
    dragable: PropTypes.bool,
    advance: PropTypes.bool,
    min1msg: PropTypes.string,
    maxSelectedNum: PropTypes.number,
    ghostControlIds: PropTypes.arrayOf(PropTypes.string), // 幽灵字段，一直选中但列表内不显示
    columns: PropTypes.arrayOf(PropTypes.shape({})).isRequired,
    showControls: PropTypes.arrayOf(PropTypes.string).isRequired,
    controlsSorts: PropTypes.arrayOf(PropTypes.string).isRequired,
    children: PropTypes.element,
    onChange: PropTypes.func.isRequired,
    showTabs: PropTypes.bool,
    disabled: PropTypes.bool, // 能否点击弹出操作项
    columnTexts: PropTypes.shape({}), // 单个场景覆盖字段列表文案，默认保持显示列原文案
  };

  static defaultProps = {
    layout: 1,
    noempty: true,
    dragable: true,
    advance: true,
    disabled: false,
    ghostControlIds: [],
    showControls: [],
    controlsSorts: [],
    columns: [],
    onChange: () => {},
  };

  state = {
    open: false,
    popupWidth: undefined,
  };

  triggerRef = React.createRef();

  handleOpenChange = open => {
    if (this.props.disableDropdown) return;

    this.setState({
      open,
      popupWidth: open ? this.triggerRef.current?.offsetWidth : this.state.popupWidth,
    });
  };

  hidePopup = () => {
    this.setState({ open: false });
  };

  render() {
    const {
      placeholder,
      layout,
      empty,
      noShowCount,
      noempty,
      dragable,
      advance,
      min1msg,
      ghostControlIds,
      maxSelectedNum,
      showControls,
      controlsSorts,
      children,
      onChange,
      maxHeight,
      isShowColumns = false,
      sortAutoChange = false,
      showTabs = false,
      disabled = false,
      showOperate = true,
      forbiddenScroll = false,
      disableDropdown = false,
      columnTexts,
    } = this.props;
    const columns = this.props.columns.filter(c => !_.find(ghostControlIds, gcid => gcid === c.controlId));
    const displayControls = showControls.filter(dcid => _.find(columns, fc => fc.controlId === dcid));

    if (layout === 1) {
      const popupContent = this.props.downElement || (
        <ChangeColumn
          forbiddenScroll={forbiddenScroll}
          placeholder={placeholder}
          noShowCount={noShowCount}
          noempty={noempty}
          dragable={dragable}
          advance={advance}
          min1msg={min1msg}
          maxSelectedNum={maxSelectedNum}
          selected={showControls}
          columns={columns}
          controlsSorts={controlsSorts}
          onChange={({ selected, newControlSorts }) => {
            onChange({
              newShowControls: _.uniqBy(ghostControlIds.concat(selected)),
              newControlSorts: _.uniqBy(ghostControlIds.concat(newControlSorts)),
            });
          }}
          isShowColumns={isShowColumns}
          sortAutoChange={sortAutoChange}
          showTabs={showTabs}
          showOperate={showOperate}
          columnTexts={columnTexts}
          hideReset
          disabled={disabled}
        />
      );

      return (
        <div className="sortColumnWrap">
          <Popover
            trigger={disableDropdown ? [] : 'click'}
            content={React.cloneElement(popupContent, { hide: this.hidePopup })}
            open={!disableDropdown && this.state.open}
            onOpenChange={this.handleOpenChange}
            placement="bottomLeft"
            noPadding
            styles={{ container: { width: this.state.popupWidth } }}
          >
            <div ref={this.triggerRef} aria-disabled={disableDropdown} className="sortColumnTrigger targetEle">
              <Select
                className="w100"
                disabled={disableDropdown}
                value="sortColumns"
                options={SELECT_OPTIONS}
                open={false}
                showSearch={false}
                labelRender={() =>
                  children ||
                  (displayControls.length < 1 && empty ? (
                    empty
                  ) : (
                    <span>{_l('显示 %0 个', displayControls.length)}</span>
                  ))
                }
              />
            </div>
          </Popover>
        </div>
      );
    } else if (layout === 2) {
      return (
        <div className="sortColumnWrap mTop10 layout2">
          <ChangeColumn
            placeholder={placeholder}
            layout={layout}
            showColumnLength={displayControls.length}
            noempty={noempty}
            dragable={dragable}
            advance={advance}
            min1msg={min1msg}
            maxSelectedNum={maxSelectedNum}
            selected={showControls}
            columns={columns}
            controlsSorts={controlsSorts}
            onChange={({ selected, newControlSorts }) => {
              onChange({
                newShowControls: _.uniqBy(ghostControlIds.concat(selected)),
                newControlSorts: _.uniqBy(ghostControlIds.concat(newControlSorts)),
              });
            }}
            maxHeight={maxHeight}
            isShowColumns={isShowColumns}
            sortAutoChange={sortAutoChange}
            showTabs={showTabs}
            columnTexts={columnTexts}
            disabled={disabled}
          />
        </div>
      );
    }
  }
}
