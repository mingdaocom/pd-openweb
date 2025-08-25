import React, { useEffect } from 'react';
import { useSetState } from 'react-use';
import { Divider } from 'antd';
import _ from 'lodash';
import styled from 'styled-components';
import { Checkbox, Dropdown, Icon, Tooltip } from 'ming-ui';
import { SYSTEM_CONTROL_WITH_UAID } from 'src/pages/widgetConfig/config/widget.js';
import { getIconByType } from 'src/pages/widgetConfig/util';
import { CAN_NOT_AS_VIEW_SORT } from 'src/pages/worksheet/common/ViewConfig/enum';
import { getCanSelectColumnsForSort, getSortTypes } from 'src/pages/worksheet/common/ViewConfig/util.js';
import SortConditions from '../SortConditions';

const Wrap = styled.div`
  .custom {
    padding: 0 12px;
    height: 36px;
    line-height: 36px;
    background: #ffffff;
    border-radius: 3px 3px 3px 3px;
    border: 1px solid #dddddd;
    display: inline-block;
    &:hover {
      border: 1px solid #1677ff;
      color: #1677ff;
    }
  }
  .AddSortCon .Dropdown--input {
    padding: 0 !important;
  }
`;

export default function (props) {
  const { appId, columns, view = {}, updateCurrentView } = props;
  const canSortLIst = columns.filter(
    o =>
      !(
        CAN_NOT_AS_VIEW_SORT.includes(o.type === 30 ? o.sourceControlType : o.type) ||
        (o.type === 30 && o.strDefault === '10')
      ),
  );
  const [{ moreSort, defaultsort }, setState] = useSetState({
    moreSort: view.moreSort || [],
    defaultsort: _.get(view, 'advancedSetting.defaultsort')
      ? safeParse(_.get(view, 'advancedSetting.defaultsort'))
      : { controlId: 'ctime', isAsc: false },
  });

  useEffect(() => {
    setState({
      moreSort: view.moreSort || [],
      defaultsort: _.get(view, 'advancedSetting.defaultsort')
        ? safeParse(_.get(view, 'advancedSetting.defaultsort'))
        : { controlId: 'ctime', isAsc: false },
    });
  }, [view]);

  const handleAddCondition = value => {
    const newSortCondition = {
      controlId: value,
      isAsc: getSortTypes(value, columns)[0].value === 2,
    };

    updateCurrentView({
      ...view,
      editAttrs: ['moreSort', 'sortCid', 'sortType'],
      moreSort: [newSortCondition],
      sortCid: value,
      sortType: newSortCondition.value === 2 ? 2 : 1,
    });
  };

  const defaultColumns = SYSTEM_CONTROL_WITH_UAID.filter(o => ['ctime', 'utime'].includes(o.controlId));

  const changeAdvancedSettingForView = obj => {
    updateCurrentView({
      ...view,
      appId,
      advancedSetting: obj,
      editAttrs: ['advancedSetting'],
      editAdKeys: Object.keys(obj),
    });
  };

  return (
    <Wrap>
      <div className="commonConfigItem">
        <div className="Bold Font14 mTop24">{_l('自定义排序')}</div>
        {moreSort.length <= 0 ? (
          <Dropdown
            openSearch
            isAppendToBody
            menuStyle={{ width: 200 }}
            className="flex mRight10 AddSortCon"
            data={canSortLIst.map(c => ({
              text: c.controlName,
              value: c.controlId,
              itemContentStyle: { padding: '0 0 0 30px' },
              iconName: getIconByType(c.type),
            }))}
            renderPointer={() => {
              return (
                <span className={'custom mTop16 ThemeHoverColor3 TxtCenter Hand Gray'}>
                  <Icon type="add" className="" />
                  <span className="mLeft3">{_l('自定义排序')}</span>
                </span>
              );
            }}
            onChange={value => handleAddCondition(value)}
          />
        ) : (
          <SortConditions
            forViewControl
            columns={canSortLIst}
            sortConditions={moreSort || []}
            canClear
            onChange={value => {
              const first = value[0] || {};
              let param = {};
              if (!first.controlId) {
                param.advancedSetting = { closedefsort: '0' };
                param.editAttrs = ['moreSort', 'sortCid', 'sortType', 'advancedSetting'];
                param.editAdKeys = ['closedefsort'];
              }
              updateCurrentView({
                ...view,
                appId,
                editAttrs: ['moreSort', 'sortCid', 'sortType'],
                moreSort: value,
                sortCid: first.controlId || '',
                sortType: first.isAsc ? 2 : '',
                ...param,
              });
            }}
          />
        )}
        <Divider />
        <div className="Bold Font14 mTop24">{_l('默认排序')}</div>
        <div className="Gray_75 mTop10">
          {_l(
            '当未设自定义排序，或自定义排序后同顺序下有多条记录时，将追加使用默认排序。默认排序只能使用创建时间或最近更新时间，来确保数据最终有严格顺序。',
          )}
        </div>
        <div className="flexRow mTop16">
          <Dropdown
            border
            openSearch
            isAppendToBody
            disabled={_.get(view, 'advancedSetting.closedefsort') === '1'}
            menuStyle={{ width: 200 }}
            className="flex mRight10 filterColumns"
            value={defaultsort.controlId}
            data={getCanSelectColumnsForSort(defaultsort.controlId, defaultColumns)}
            onChange={value => {
              if (value !== defaultsort.controlId) {
                changeAdvancedSettingForView({
                  defaultsort: JSON.stringify({
                    controlId: value,
                    isAsc: defaultsort.isAsc,
                  }),
                });
              }
            }}
          />
          <Dropdown
            border
            isAppendToBody
            disabled={_.get(view, 'advancedSetting.closedefsort') === '1'}
            className="flex mRight6"
            value={defaultsort.isAsc ? 2 : 1}
            data={getSortTypes(defaultsort.controlId, defaultColumns)}
            onChange={value => {
              if (value !== (defaultsort.isAsc ? 2 : 1)) {
                changeAdvancedSettingForView({
                  defaultsort: JSON.stringify({
                    controlId: defaultsort.controlId,
                    isAsc: value === 2,
                  }),
                });
              }
            }}
          />
        </div>
        {moreSort.length > 0 && (
          <div className="mTop13 flowRow alignItemsCenter justifyContentCenter">
            <Checkbox
              disabled={moreSort.length <= 0}
              className="checkBox InlineFlex"
              text={_l('不追加默认排序')}
              checked={_.get(view, 'advancedSetting.closedefsort') === '1'}
              onClick={() => {
                changeAdvancedSettingForView({
                  closedefsort: _.get(view, 'advancedSetting.closedefsort') === '1' ? '0' : '1',
                });
              }}
            />
            <Tooltip
              autoCloseDelay={0}
              popupPlacement="bottom"
              tooltipStyle={{ 'max-width': 320 }}
              text={_l(
                '当可以保证配置的自定义排序严格有序，或已经为自定义排序创建了索引时，可以勾选不追加默认排序。注意：如果不满足以上条件就取消了追加的默认排序，可能会因为同顺序下有多条记录，而导致翻页时数据缺少或重复。',
              )}
            >
              <Icon icon="info" className="Gray_9e helpIcon Font18 mLeft8 " />
            </Tooltip>
          </div>
        )}
      </div>
    </Wrap>
  );
}
