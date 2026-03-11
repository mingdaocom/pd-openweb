import React, { useCallback, useEffect, useRef, useState } from 'react';
import _ from 'lodash';
import PropTypes from 'prop-types';
import Trigger from 'rc-trigger';
import styled from 'styled-components';
import { Icon } from 'ming-ui';
import { Tooltip } from 'ming-ui/antd-components';
import ChangeColumn from 'worksheet/common/ChangeColumn';
import { getAdvanceSetting } from 'src/utils/control';

const IconWrapper = styled.div`
  position: absolute;
  top: 0;
  right: 2px;
  z-index: 1;
  width: 34px;
  height: ${props => props.height || 34}px;
  background: var(--color-background-tertiary);
  display: flex;
  align-items: ${props => (props.headTitleCenter || props.height === 34 ? 'center' : 'flex-start')};
  justify-content: center;
  padding-top: ${props => (props.headTitleCenter || props.height === 34 ? '0' : '7px')};
  border-radius: 4px;
  cursor: pointer;
  &:hover {
    background: var(--color-background-hover);
  }
`;

const PopupWrapper = styled.div`
  min-width: 320px;
  max-width: 320px;
  background: var(--color-background-primary);
  box-shadow: var(--shadow-lg);
  border-radius: 4px;
  overflow: hidden;
`;

function ColumnVisibilityControl(props) {
  const {
    columns,
    viewId,
    saveView,
    view,
    ghostControlIds = [],
    disabled = false,
    tableId,
    columnHeadHeight: columnHeadHeightProp,
  } = props;
  const [visible, setVisible] = useState(false);
  const [showControls, setShowControls] = useState([]);
  const [controlsSorts, setControlsSorts] = useState([]);
  const [columnHeadHeight, setColumnHeadHeight] = useState(columnHeadHeightProp || 34);
  const [tableVisibleHeight, setTableVisibleHeight] = useState(0);
  const triggerRef = useRef(null);
  const resizeObserverRef = useRef(null);

  // 判断对齐方式（rctitlestyle === '1' 表示垂直居中对齐）
  const headTitleCenter = (_.get(view, 'advancedSetting.rctitlestyle') || '0') === '1';
  // 获取 titlewrap 配置
  const titlewrap = _.get(view, 'advancedSetting.titlewrap') || '0';

  useEffect(() => {
    if (columnHeadHeightProp && columnHeadHeightProp !== columnHeadHeight) {
      setColumnHeadHeight(columnHeadHeightProp);
    }
  }, [columnHeadHeightProp]);

  // 直接从 DOM 获取当前表的 baseColumnHead 的高度
  useEffect(() => {
    if (!tableId) return;
    if (resizeObserverRef.current) {
      resizeObserverRef.current.disconnect();
      resizeObserverRef.current = null;
    }
    const timer = setTimeout(() => {
      const baseColumnHead = document.querySelector(`.sheetViewTable.id-${tableId}-id .topFixedtop-left`);
      const updateHeight = () => {
        if (!baseColumnHead) return;
        setColumnHeadHeight(baseColumnHead.offsetHeight);
      };
      updateHeight();
      resizeObserverRef.current = new ResizeObserver(() => {
        updateHeight();
      });
      resizeObserverRef.current.observe(baseColumnHead);
    }, 200);

    return () => {
      clearTimeout(timer);
      if (resizeObserverRef.current) {
        resizeObserverRef.current.disconnect();
        resizeObserverRef.current = null;
      }
    };
  }, [tableId, columnHeadHeightProp, titlewrap, showControls]);

  useEffect(() => {
    const { personal_setting = {} } = getAdvanceSetting(view);
    const personalSetting = safeParse(personal_setting || '{}');
    const allControlIds = columns.map(c => c.controlId);
    // 从 controls 计算 showControls
    const controls = personalSetting?.controls || [];
    const showControls = allControlIds.filter(id => !controls.includes(id));
    // 从 controlsSorts 读取排序，如果没有则使用全部字段的顺序
    let controlsSorts = allControlIds;
    if (typeof personalSetting?.controlsSorts !== 'undefined' && personalSetting?.controlsSorts?.length > 0) {
      controlsSorts = personalSetting?.controlsSorts;
    }
    setShowControls(showControls);
    setControlsSorts(controlsSorts);
  }, [view, columns]);

  const handleVisibleChange = useCallback(newVisible => {
    setVisible(newVisible);
  }, []);

  // 当 popup 显示时，重新计算
  useEffect(() => {
    if (visible && tableId) {
      requestAnimationFrame(() => {
        const mainCenter = document.querySelector(`.sheetViewTable.id-${tableId}-id .main-center`);
        if (mainCenter) {
          const height = mainCenter.style.height ? parseInt(mainCenter.style.height, 10) : mainCenter.offsetHeight;
          setTableVisibleHeight(height - 80); //减去搜索栏和操作栏的高度
        }
        window.dispatchEvent(new Event('resize'));
      });
    }
  }, [visible, tableId]);

  const onChange = useCallback(
    ({ newShowControls, newControlSorts }) => {
      // 计算 controls：全部字段 - 显示的字段
      const allControlIds = columns.map(c => c.controlId);
      const controls = allControlIds.filter(id => !newShowControls.includes(id));
      // 按照 newControlSorts 的顺序来设置 showControls
      const sortedShowControls = newControlSorts.filter(id => newShowControls.includes(id));
      saveView(viewId, {
        controls,
        controlsSorts: newControlSorts,
        editAttrs: ['personal_setting', 'advancedSetting', 'controls', 'controlsSorts'],
      });
      setShowControls(sortedShowControls);
      setControlsSorts(newControlSorts);
    },
    [viewId, saveView, columns],
  );

  // 检查是否有隐藏的列（columns 中有 controlId 不在 showControls 中）
  const hasHiddenColumns = columns.some(col => !showControls.includes(col.controlId));

  // 重置处理函数：清空 personalSetting 的 controls 和 controlsSorts
  const handleReset = useCallback(() => {
    const allControlIds = columns.map(c => c.controlId);
    // 清空 controls 和 controlsSorts，即所有字段都显示，使用默认顺序
    saveView(viewId, {
      controls: [],
      controlsSorts: [],
      editAttrs: ['personal_setting', 'advancedSetting', 'controls', 'controlsSorts'],
    });
    // 更新本地状态：所有字段都显示，使用默认顺序
    setShowControls(allControlIds);
    setControlsSorts(allControlIds);
  }, [viewId, saveView, columns]);

  return (
    <Trigger
      ref={triggerRef}
      action={['click']}
      popup={
        <PopupWrapper>
          <ChangeColumn
            placeholder={_l('搜索字段')}
            noempty={false}
            dragable={true}
            advance={true}
            selected={showControls}
            columns={columns}
            controlsSorts={controlsSorts}
            maxHeight={tableVisibleHeight > 0 ? tableVisibleHeight : undefined}
            onChange={({ selected, newControlSorts }) => {
              const uniqueSelected = _.uniqBy(ghostControlIds.concat(selected));
              const uniqueSorts = _.uniqBy(ghostControlIds.concat(newControlSorts));
              onChange({
                newShowControls: uniqueSelected,
                newControlSorts: uniqueSorts,
              });
            }}
            isShowColumns={true}
            sortAutoChange={true}
            showOperate={true}
            disabled={disabled}
            onReset={handleReset}
          />
        </PopupWrapper>
      }
      popupVisible={visible}
      onPopupVisibleChange={handleVisibleChange}
      popupAlign={{
        points: ['tr', 'br'],
        overflow: { adjustX: true, adjustY: true },
      }}
      getPopupContainer={() => document.body}
      destroyPopupOnHide
      zIndex={1000}
    >
      <Tooltip title={_l('显示列设置')} placement="top">
        <IconWrapper height={columnHeadHeight} headTitleCenter={headTitleCenter}>
          <Icon icon="table_eye" className={`${hasHiddenColumns ? 'ThemeColor3' : 'textSecondary'} Font18 Hand`} />
        </IconWrapper>
      </Tooltip>
    </Trigger>
  );
}

ColumnVisibilityControl.propTypes = {
  columns: PropTypes.arrayOf(PropTypes.shape({})).isRequired,
  viewId: PropTypes.string.isRequired,
  saveView: PropTypes.func.isRequired,
  view: PropTypes.shape({}).isRequired,
  ghostControlIds: PropTypes.arrayOf(PropTypes.string),
  disabled: PropTypes.bool,
  tableId: PropTypes.string,
  columnHeadHeight: PropTypes.number,
};

export default ColumnVisibilityControl;
