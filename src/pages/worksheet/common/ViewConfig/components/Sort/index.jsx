import React, { useEffect } from 'react';
import { useSetState } from 'react-use';
import _ from 'lodash';
import styled from 'styled-components';
import { Icon } from 'ming-ui';
import { Checkbox, Divider, Select, Tooltip } from 'ming-ui/antd-components';
import { getCanSelectColumnsForSort, getSortTypes } from 'src/pages/worksheet/common/ViewConfig/util.js';
import { getIconByType } from 'src/utils/domain/control/metadata';
import { SYSTEM_CONTROL_WITH_UAID } from 'src/utils/domain/control/widget';
import { CAN_NOT_AS_VIEW_SORT } from 'src/utils/domain/worksheet/view';
import SortConditions from '../SortConditions';

const SELECT_FIELD_NAMES = { label: 'text', value: 'value' };

const Wrap = styled.div``;

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
  }, [view, setState]);

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
          <Select
            showPopupSearch
            optionFilterProp="label"
            style={{ width: 150 }}
            className="mTop16 mRight10"
            value={undefined}
            placeholder={
              <span className="textPrimary">
                <Icon type="add" />
                <span className="mLeft3">{_l('自定义排序')}</span>
              </span>
            }
            options={canSortLIst.map(c => ({
              label: c.controlName,
              value: c.controlId,
              iconName: getIconByType(c.type),
            }))}
            optionRender={option => {
              const { iconName, label } = option.data || {};
              return (
                <div className="flexRow alignItemsCenter">
                  <Icon icon={iconName} className="Font16 textTertiary" />
                  <span className="mLeft10">{label}</span>
                </div>
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
        <div className="textSecondary mTop10">
          {_l(
            '当未设自定义排序，或自定义排序后同顺序下有多条记录时，将追加使用默认排序。默认排序只能使用创建时间或最近更新时间，来确保数据最终有严格顺序。',
          )}
        </div>
        <div className="flexRow mTop16">
          <Select
            showPopupSearch
            optionFilterProp="text"
            disabled={_.get(view, 'advancedSetting.closedefsort') === '1'}
            popupMatchSelectWidth={200}
            className="flex mRight10 filterColumns"
            value={defaultsort.controlId}
            options={getCanSelectColumnsForSort(defaultsort.controlId, defaultColumns)}
            fieldNames={SELECT_FIELD_NAMES}
            optionRender={option => {
              const item = option.data || {};
              return (
                <div className="flexRow alignItemsCenter">
                  <Icon icon={item.iconName} className="Font16 textTertiary" />
                  <span className="mLeft10">{item.text}</span>
                </div>
              );
            }}
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
          <Select
            disabled={_.get(view, 'advancedSetting.closedefsort') === '1'}
            className="flex mRight6"
            value={defaultsort.isAsc ? 2 : 1}
            options={getSortTypes(defaultsort.controlId, defaultColumns)}
            fieldNames={SELECT_FIELD_NAMES}
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
          <div className="mTop13 flexRow alignItemsCenter">
            <Checkbox
              disabled={moreSort.length <= 0}
              className="checkBox InlineFlex"
              checked={_.get(view, 'advancedSetting.closedefsort') === '1'}
              onChange={() => {
                changeAdvancedSettingForView({
                  closedefsort: _.get(view, 'advancedSetting.closedefsort') === '1' ? '0' : '1',
                });
              }}
            >
              {_l('不追加默认排序')}
            </Checkbox>
            <Tooltip
              placement="bottom"
              title={_l(
                '当可以保证配置的自定义排序严格有序，或已经为自定义排序创建了索引时，可以勾选不追加默认排序。注意：如果不满足以上条件就取消了追加的默认排序，可能会因为同顺序下有多条记录，而导致翻页时数据缺少或重复。',
              )}
            >
              <Icon icon="help" className="textTertiary helpIcon Font18" />
            </Tooltip>
          </div>
        )}
      </div>
    </Wrap>
  );
}
