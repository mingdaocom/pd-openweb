import React, { useEffect, useRef, useState } from 'react';
import _ from 'lodash';
import styled from 'styled-components';
import { Popover, Tooltip } from 'ming-ui/antd-components';
import ClickAway from 'ming-ui/components/ClickAway';
import { FlexCenter } from 'worksheet/components/Basics';
import { formatOriginFilterGroupValue } from 'src/utils/domain/worksheet/filterCondition';
import { emitter } from 'src/utils/platform/browser/dom';
import Filters from './Filters';
import { formatForSave } from './model';
import { clearSheetFilterIdUrl, getSheetFilterIdFromUrl, saveSheetFilterIdToUrl } from './urlState';

const MODAL_WRAP_SELECTOR = '.hap-modal-wrap';
const CLICK_AWAY_SPECIAL_SELECTORS = [
  '.addFilterPopup',
  '.filterControlOptionsList',
  '.selectUserBox',
  '.worksheetFilterOperateList',
  '.hap-picker-dropdown',
  '.CityPicker',
  '.CityPicker-wrapper',
  '.selectRecordsDialog',
  // 人员条件里 hover 头像弹出的用户卡片（复制 ID、发消息等操作）挂在 body 上
  '.userCardSite',
  // 级联条件下拉（ming-ui/antd-components/Cascader 基于 Popover 实现）挂在 body 上
  '.cascader-trigger-popup',
].join(',');
const getDefaultPopupContainer = () => document.body;

function isClickAwayException(target, trigger) {
  const $target = $(target);
  const triggerModalWrap = $(trigger).closest(MODAL_WRAP_SELECTOR)[0];
  const targetModalWrap = $target.closest(MODAL_WRAP_SELECTOR)[0];

  return Boolean(
    (targetModalWrap && targetModalWrap !== triggerModalWrap) || $target.closest(CLICK_AWAY_SPECIAL_SELECTORS).length,
  );
}

const SelectedFilter = styled(FlexCenter)`
  display: inline-flex;
  border-radius: 4px;
  cursor: pointer;
  font-size: 13px;
  line-height: 29px;
  margin-right: 16px;
  vertical-align: middle;
  color: var(--color-primary);
  background-color: var(--color-primary-transparent);
  padding: 0 10px;
  .text {
    max-width: 160px;
  }
  .filterIcon {
    font-size: 18px;
    margin-right: 6px;
  }
  .closeIcon {
    font-size: 16px;
    margin-left: 6px;
    &:hover {
      color: var(--color-link-hover);
    }
  }
`;

export default function FiltersPopup(props) {
  const { actions, state, onChange, getPopupContainer, disableAdd, readOnly, controlledFilterControls, ...rest } =
    props;
  const {
    worksheetId = '',
    viewId = '',
    type = '',
    filterCompId,
    className,
    isSingleView = false,
    persistFilterToUrl = false,
  } = rest;
  const filtersRef = useRef();
  const btnRef = useRef();
  const didMountRef = useRef(false);
  const [popupVisible, setPopupVisible] = useState();
  const { needSave, editingFilter, activeFilter } = state;
  // 受控同步用：保存最新 editingFilter / actions 引用，供同步 effect 读取，
  // 避免把不稳定的 actions、频繁变动的 editingFilter 放进依赖导致 effect 反复执行。
  const latestRef = useRef({});

  useEffect(() => {
    latestRef.current = { editingFilter, actions };
  });

  // 受控同步（子表内嵌表与放大弹层共用同一份 filterControls 时启用）：
  // 当外部 filterControls 变化、且不是本实例正在编辑（popup 打开）/不是本实例自己刚触发的回写时，
  // 把外部条件回填成面板状态，使两处筛选器显示与数据保持一致。
  // 仅当传入 controlledFilterControls（数组）时启用，不影响其它调用方。
  useEffect(() => {
    if (!_.isArray(controlledFilterControls) || popupVisible) return;
    const { editingFilter: curFilter, actions: curActions } = latestRef.current;
    const ownControls = curFilter ? formatForSave(curFilter) : [];
    // 与本实例当前条件一致：说明变化来自自己（或本就同步），跳过，避免回环与打断编辑
    if (_.isEqual(controlledFilterControls, ownControls)) return;
    if (_.isEmpty(controlledFilterControls)) {
      curActions.setActiveFilter(undefined);
      curActions.editFilter(undefined);
    } else {
      curActions.editFilter(
        formatOriginFilterGroupValue({
          filterId: `new-${Date.now().toString(16)}`,
          name: _l('自定义筛选'),
          type: 1,
          items: controlledFilterControls,
        }),
      );
    }
  }, [controlledFilterControls, popupVisible]);

  // 仅在调用方显式开启时（主视图工具栏）才把选中的筛选器落 url，其它复用场景（单视图、关联记录表、回收站等）一律不参与；
  // 公开分享/公开应用下接口受限，关闭该能力，避免还原失败
  const canPersistFilterToUrl =
    persistFilterToUrl === true &&
    !!viewId &&
    !!worksheetId &&
    !_.get(window, 'shareState.shareId') &&
    !window.isPublicApp;

  // 刷新/分享链接进入时，按 url 里的筛选器 id 还原选中并应用（Filters 弹层未打开时也需生效，故放在常驻的 FiltersPopup 上）
  useEffect(() => {
    if (!canPersistFilterToUrl) {
      return;
    }

    const urlFilterId = getSheetFilterIdFromUrl();

    if (!urlFilterId) {
      return;
    }

    actions.loadFilters(worksheetId, data => {
      const found = _.find(data, { id: urlFilterId });

      if (found) {
        actions.setActiveFilter(found);
        onChange({ filterControls: formatForSave(found) });
      } else {
        // 筛选器已被删除：清除 url，并触发一次空筛选加载（视图首次加载已被跳过，避免空白）
        clearSheetFilterIdUrl();
        onChange({ filterControls: [] });
      }
    });
  }, []);

  // 选中/切换/清除筛选器时，保持 url 与当前选中状态同步（首次挂载跳过，避免覆盖待还原的 url）
  useEffect(() => {
    if (!didMountRef.current) {
      didMountRef.current = true;
      return;
    }

    if (!canPersistFilterToUrl) {
      return;
    }

    const activeId = activeFilter && activeFilter.id;

    if (activeId && !/^new/.test(activeId)) {
      saveSheetFilterIdToUrl(activeId);
    } else {
      clearSheetFilterIdUrl();
    }
  }, [activeFilter && activeFilter.id]);

  function handleWorksheetHeadAddFilter(control) {
    setPopupVisible(true);
    setTimeout(() => {
      if (_.get(filtersRef, 'current.addFilterByControl')) {
        filtersRef.current.addFilterByControl(control);
      }
    }, 100);
  }

  useEffect(() => {
    emitter.addListener(
      filterCompId || 'FILTER_ADD_FROM_COLUMNHEAD' + worksheetId + type + (isSingleView ? viewId : ''),
      handleWorksheetHeadAddFilter,
    );
    return () => {
      emitter.removeListener(
        filterCompId || 'FILTER_ADD_FROM_COLUMNHEAD' + worksheetId + type + (isSingleView ? viewId : ''),
        handleWorksheetHeadAddFilter,
      );
    };
  }, []);
  let filteredText;

  if (editingFilter && /^new/.test(editingFilter.id)) {
    const filterControls = formatForSave(editingFilter);
    const count = _.sum(filterControls.map(c => _.get(c, 'groupFilters.length')));

    if (count > 0) {
      filteredText = _l('%0 项', count);
    }
  } else if (activeFilter) {
    filteredText = activeFilter.name + (needSave ? ' *' : '');
  }

  let maxHeight = btnRef.current
    ? window.innerHeight - btnRef.current.getBoundingClientRect().y - 120 - 29 - 6
    : undefined;

  if (maxHeight < 300) {
    maxHeight = 300;
  }

  if (!editingFilter && disableAdd) {
    return null;
  }

  return (
    <Popover
      trigger="click"
      content={
        <ClickAway
          specialFilter={target => isClickAwayException(target, btnRef.current)}
          onClickAwayExceptions={[
            '.hap-cascader-menus',
            '.hap-select-dropdown',
            '.hap-tree-select-dropdown',
            '#quickSelectDept',
            '.selectRoleDialog',
            '.worksheetFilterTextPopup',
          ]}
          onClickAway={() => setPopupVisible(false)}
        >
          <div
            onMouseDownCapture={readOnly ? e => e.stopPropagation() : undefined}
            onClickCapture={readOnly ? e => e.stopPropagation() : undefined}
            style={readOnly ? { cursor: 'not-allowed' } : undefined}
          >
            <Filters
              popupVisible={popupVisible}
              actions={actions}
              ref={filtersRef}
              state={state}
              onHideFilterPopup={() => setPopupVisible(false)}
              onChange={onChange}
              maxHeight={maxHeight}
              {...rest}
            />
          </div>
        </ClickAway>
      }
      getPopupContainer={getPopupContainer || getDefaultPopupContainer}
      noPadding
      open={popupVisible}
      placement="bottom"
      // rc-trigger 以打开时的点击坐标为锚点，trigger 宽度变化后不会重新横向定位。
      // alignPoint
      destroyOnHidden={false}
      onOpenChange={visible => {
        if (visible) {
          setPopupVisible(true);
        }
      }}
    >
      <div ref={btnRef} className="worksheetFilterTrigger" style={readOnly ? { opacity: 0.5 } : undefined}>
        {!filteredText && (
          <Tooltip title={readOnly ? '' : _l('筛选')} placement="bottom">
            <span className={className}>
              <i
                className={
                  readOnly
                    ? 'icon icon-worksheet_filter textTertiary Hand Font18'
                    : 'icon icon-worksheet_filter textTertiary Hand Font18 hoverColorPrimary'
                }
              ></i>
            </span>
          </Tooltip>
        )}
        {filteredText && (
          <SelectedFilter className="selectedFilter">
            <i className="icon icon-worksheet_filter filterIcon"></i>
            <span className="text ellipsis">{filteredText}</span>
            {!readOnly && (
              <i
                className="icon icon-close closeIcon"
                onClick={e => {
                  e.stopPropagation();
                  actions.setActiveFilter(undefined);
                  actions.editFilter(undefined);
                  onChange({
                    filterControls: [],
                  });
                }}
              ></i>
            )}
          </SelectedFilter>
        )}
      </div>
    </Popover>
  );
}
