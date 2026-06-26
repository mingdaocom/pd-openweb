import React, { useEffect, useRef, useState } from 'react';
import _ from 'lodash';
import Trigger from 'rc-trigger';
import styled from 'styled-components';
import { Tooltip } from 'ming-ui/antd-components';
import createDecoratedComponent from 'ming-ui/decorators/createDecoratedComponent';
import withClickAway from 'ming-ui/decorators/withClickAway';
import { FlexCenter } from 'worksheet/components/Basics';
import { emitter } from 'src/utils/common';
import Filters from './Filters';
import { formatForSave } from './model';
import { clearSheetFilterIdUrl, getSheetFilterIdFromUrl, saveSheetFilterIdToUrl } from './util';

const ClickAway = createDecoratedComponent(withClickAway);

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
  const { zIndex, actions, state, onChange, getPopupContainer, disableAdd, ...rest } = props;
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
    <Trigger
      zIndex={zIndex || 99}
      action={['click']}
      popup={
        <ClickAway
          specialFilter={target => {
            const $targetTarget = $(target).closest(
              [
                '.dropdownTrigger',
                '.addFilterPopup',
                '.filterControlOptionsList',
                '.mui-dialog-container',
                '.mui-datetimepicker',
                '.mui-datetimerangepicker',
                '.selectUserBox',
                '.worksheetFilterOperateList',
                '.ant-picker-dropdown',
                '.rc-trigger-popup',
                '.CityPicker',
                '.CityPicker-wrapper',
                '.selectRecordsDialog',
              ].join(','),
            )[0];
            return $targetTarget;
          }}
          onClickAwayExceptions={[
            '.ant-cascader-menus',
            '.ant-tree-select-dropdown',
            '#quickSelectDept',
            '.selectRoleDialog',
            '.worksheetFilterTextPopup',
          ]}
          onClickAway={() => setPopupVisible(false)}
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
        </ClickAway>
      }
      getPopupContainer={getPopupContainer || (() => document.body)}
      popupClassName="filterTrigger"
      popupVisible={popupVisible}
      popupAlign={{
        points: ['tr', 'br'],
        offset: [162, 6],
        overflow: {
          adjustX: true,
          adjustY: true,
        },
      }}
      onPopupVisibleChange={visible => {
        if (visible) {
          setPopupVisible(true);
        }
      }}
    >
      <div ref={btnRef} className="worksheetFilterTrigger">
        {!filteredText && (
          <Tooltip title={_l('筛选')} placement="bottom">
            <span className={className}>
              <i className="icon icon-worksheet_filter textTertiary Hand Font18 ThemeHoverColor3"></i>
            </span>
          </Tooltip>
        )}
        {filteredText && (
          <SelectedFilter className="selectedFilter">
            <i className="icon icon-worksheet_filter filterIcon"></i>
            <span className="text ellipsis">{filteredText}</span>
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
          </SelectedFilter>
        )}
      </div>
    </Trigger>
  );
}
