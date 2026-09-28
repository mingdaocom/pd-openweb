import React, { Fragment } from 'react';
import _ from 'lodash';
import { Radio } from 'ming-ui/antd-components';
import SortConditions from 'src/pages/worksheet/common/ViewConfig/components/SortConditions';
import { getAdvanceSetting, handleAdvancedSettingChange } from 'src/utils/domain/control/advancedSetting';
import { UN_SORT_WIDGET } from 'src/utils/domain/control/config';
import { RELATE_SORT_DISPLAY } from 'src/utils/domain/control/setting';
import { SettingItem } from '../../../../styled';

const DISPLAY_OPTIONS = [
  { text: _l('与关联记录的排序保持一致'), value: '0' },
  { text: _l('自定义'), value: '1' },
];

export default function SortConfig(props) {
  const { data, controls = [], handleChange } = props;
  const { rcsorttype } = getAdvanceSetting(data);
  const sorts = getAdvanceSetting(data, 'sorts') || [];
  const isRelateView = Boolean(data.viewId);
  const sorttype = rcsorttype || (sorts.length > 0 ? '2' : isRelateView ? '3' : '1');
  const choosesorts = getAdvanceSetting(data, 'choosesorts') || [];
  const isDefault = !choosesorts.length;

  return (
    <Fragment>
      <SettingItem>
        <div className="settingItemTitle">{_l('显示规则')}</div>
        <Radio.Group
          size="middle"
          className="fixedWidth"
          value={isDefault ? '0' : '1'}
          options={(DISPLAY_OPTIONS || []).map(({ text, ...option }) => ({ ...option, label: text }))}
          onChange={event => {
            const value = event.target.value;

            handleChange(
              handleAdvancedSettingChange(data, {
                choosesorts:
                  value === '0'
                    ? ''
                    : JSON.stringify([
                        {
                          controlId: 'ctime',
                          isAsc: true,
                        },
                      ]),
              }),
            );
          }}
        />
      </SettingItem>
      {isDefault ? (
        <div className="textTertiary mTop10">
          {_.get(
            _.find(RELATE_SORT_DISPLAY, r => r.value === sorttype),
            'text',
          ) || ''}
        </div>
      ) : (
        <SortConditions
          className="subListSortCondition"
          columns={controls.filter(o => !_.includes(UN_SORT_WIDGET, o.type))}
          sortConditions={choosesorts}
          showSystemControls
          onChange={newSorts =>
            handleChange(
              handleAdvancedSettingChange(data, {
                choosesorts: JSON.stringify(newSorts),
              }),
            )
          }
          isSubList={true}
          fromRelate={true}
        />
      )}
    </Fragment>
  );
}
