import React, { Fragment } from 'react';
import cx from 'classnames';
import _ from 'lodash';
import styled from 'styled-components';
import { Dropdown, Icon, RadioGroup } from 'ming-ui';
import { Tooltip } from 'ming-ui/antd-components';
import { ALL_SYS } from 'src/pages/widgetConfig/config/widget';
import { canSetAsTitle, formatControlsToDropdown } from 'src/pages/widgetConfig/util';
import SortColumns from 'src/pages/worksheet/components/SortColumns/SortColumns';
import { DisplayMode, SettingItem } from '../../../styled';
import { getAdvanceSetting, getControlsSorts, handleAdvancedSettingChange } from '../../../util/setting';

const MobileSubListWrap = styled.div`
  .targetEle .Dropdown--input {
    display: flex;
    align-items: center;
    justify-content: space-between;
    border: 1px solid var(--color-border-tertiary);
    line-height: 34px;
    padding: 0 12px;
    border-radius: 3px;
  }
`;

const DISPLAY_OPTIONS = [
  {
    text: _l('列表'),
    img: 'list',
    size: 'Font32',
    value: '1',
    tips: _l('列表中仅显示设置的摘要字段，点击单条明细后查看详情'),
  },
  {
    text: _l('平铺'),
    img: 'tile',
    size: 'Font40',
    value: '2',
    tips: _l('竖向平铺展示子表明细所有字段，可展开/折叠；折叠时展示设置的摘要字段'),
  },
  {
    text: _l('表格'),
    img: 'table',
    size: 'Font30',
    value: '3',
    tips: _l('以表格形式横向滚动查看所有明细'),
  },
];

const ROW_HEIGHT_DISPLAY = [
  { text: _l('紧凑'), value: '0' },
  { text: _l('中等'), value: '1' },
  { text: _l('高'), value: '2' },
  { text: _l('自适应'), value: '3' },
];

const FIELD_DISPLAY_OPTIONS = [
  {
    text: _l('一行一个'),
    value: '1',
  },
  {
    text: _l('一行两个'),
    value: '2',
  },
];

// 移动端设置
export default function MobileSubList({ data, onChange }) {
  const { showControls = [], relationControls = [] } = data;
  let { h5showtype = '1', h5abstractids, h5height, columnnum, showtitleid } = getAdvanceSetting(data);
  const columnNum = columnnum || '1';
  const abstractIds = safeParse(h5abstractids || '[]').filter(i => _.find(relationControls, r => r.controlId === i));

  const filterControls = relationControls.filter(i => _.includes(showControls, i.controlId));
  const setTitleControls = relationControls.filter(i => !_.includes(ALL_SYS, i.controlId)).filter(canSetAsTitle);
  const showTitleDelete = showtitleid && !_.find(setTitleControls, s => s.controlId === showtitleid);

  return (
    <MobileSubListWrap>
      <SettingItem className="mTop0">
        <div className="settingItemTitle">{_l('显示样式')}</div>
        <DisplayMode>
          {DISPLAY_OPTIONS.map(i => {
            const active = h5showtype === i.value;
            return (
              <div
                className={cx('displayItem', { active: active })}
                onClick={() => {
                  if (active) return;
                  onChange(
                    handleAdvancedSettingChange(data, {
                      h5showtype: i.value,
                      h5height: h5height || '0',
                      ...(i.value !== '2' ? { columnnum: '', showtitleid: '' } : {}),
                    }),
                  );
                }}
              >
                <Tooltip title={i.tips} placement="bottom">
                  <div className="mBottom4">
                    <Icon icon={i.img} className={cx(i.size)} />
                  </div>
                </Tooltip>
                <span className="text">{i.text}</span>
              </div>
            );
          })}
        </DisplayMode>
      </SettingItem>
      {h5showtype === '3' ? (
        <SettingItem>
          <div className="settingItemTitle">{_l('行高')}</div>
          <Dropdown
            border
            isAppendToBody
            data={ROW_HEIGHT_DISPLAY}
            value={h5height || '0'}
            onChange={value => onChange(handleAdvancedSettingChange(data, { h5height: value }))}
          />
        </SettingItem>
      ) : (
        <Fragment>
          {h5showtype === '2' && (
            <Fragment>
              <SettingItem>
                <div className="settingItemTitle">{_l('字段显示')}</div>
                <RadioGroup
                  size="middle"
                  checkedValue={columnNum}
                  data={FIELD_DISPLAY_OPTIONS}
                  onChange={value => onChange(handleAdvancedSettingChange(data, { columnnum: value }))}
                />
              </SettingItem>
              <SettingItem>
                <div className="settingItemTitle">{_l('标题')}</div>
                <Dropdown
                  border
                  isAppendToBody
                  cancelAble
                  data={formatControlsToDropdown(setTitleControls)}
                  value={showTitleDelete ? undefined : showtitleid || undefined}
                  placeholder={showTitleDelete ? <span className="Red">{_l('已删除')}</span> : _l('请选择')}
                  onChange={value => onChange(handleAdvancedSettingChange(data, { showtitleid: value }))}
                />
              </SettingItem>
            </Fragment>
          )}
          <SettingItem>
            <div className="settingItemTitle">{_l('摘要字段（最多3个）')}</div>
            <SortColumns
              sortAutoChange
              isShowColumns
              empty={<span className="textSecondary">{_l('显示前3列')}</span>}
              noempty={false}
              showControls={abstractIds}
              columns={filterControls}
              maxSelectedNum={3}
              controlsSorts={getControlsSorts(data, filterControls, 'h5abstractids')}
              showOperate={false}
              dragable={true}
              onChange={({ newShowControls, newControlSorts }) => {
                const nextSortControls = newControlSorts.filter(item => _.includes(newShowControls, item));
                onChange(handleAdvancedSettingChange(data, { h5abstractids: JSON.stringify(nextSortControls) }));
              }}
            />
          </SettingItem>
        </Fragment>
      )}
    </MobileSubListWrap>
  );
}
