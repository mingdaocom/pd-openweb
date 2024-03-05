import React from 'react';
import PropTypes from 'prop-types';
import DropdownWrapper from 'worksheet/components/DropdownWrapper';
import ChangeColumn from 'worksheet/common/ChangeColumn';
import './index.less';
import _ from 'lodash';

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
    } = this.props;
    const columns = this.props.columns.filter(c => !_.find(ghostControlIds, gcid => gcid === c.controlId));
    const displayControls = showControls.filter(dcid => _.find(columns, fc => fc.controlId === dcid));
    if (layout === 1) {
      return (
        <DropdownWrapper
          className="sortColumnWrap"
          disabled={disabled}
          downElement={
            this.props.downElement || (
              <ChangeColumn
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
              />
            )
          }
        >
          {children || (
            <div className="Dropdown--input Dropdown--border Hand">
              {displayControls.length < 1 && empty ? empty : <span>{_l('显示 %0 个', displayControls.length)}</span>}
              <div className="ming Icon icon icon-arrow-down-border mLeft8 Gray_9e" />
            </div>
          )}
        </DropdownWrapper>
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
          />
        </div>
      );
    }
  }
}
