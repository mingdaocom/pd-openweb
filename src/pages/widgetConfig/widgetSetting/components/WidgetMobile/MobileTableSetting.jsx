import React, { Fragment, useEffect } from 'react';
import cx from 'classnames';
import _ from 'lodash';
import { Icon } from 'ming-ui';
import { Radio, Select, Tooltip } from 'ming-ui/antd-components';
import SortColumns from 'src/pages/worksheet/components/SortColumns/SortColumns';
import { getAdvanceSetting, handleAdvancedSettingChange } from 'src/utils/domain/control/advancedSetting';
import { getControlsSorts } from 'src/utils/domain/control/editorSetting';
import { formatControlsToDropdown } from 'src/utils/domain/control/filters';
import { canSetAsTitle } from 'src/utils/domain/control/metadata';
import { ALL_SYS } from 'src/utils/domain/control/widget';
import { DisplayMode, SettingItem } from '../../../styled';

const SELECT_FIELD_NAMES = { label: 'text', value: 'value' };

const SUB_LIST_DISPLAY_OPTIONS = [
  {
    text: _l('列表'),
    img: 'list',
    size: 'Font32',
    value: '1',
    tips: _l('列表中仅显示设置的摘要字段，点击单条明细后查看详情'),
  },
  {
    text: _l('卡片'),
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

const RELATION_SEARCH_DISPLAY_OPTIONS = [
  {
    text: _l('列表'),
    img: 'list',
    size: 'Font32',
    value: '1',
    tips: _l('以紧凑行展示多条记录，适合快速浏览少量关键字段。'),
  },
  {
    text: _l('卡片'),
    img: 'tile',
    size: 'Font40',
    value: '2',
    tips: _l('以卡片展示每条记录，突出标题和摘要，适合移动端阅读和识别记录。'),
  },
  {
    text: _l('表格'),
    img: 'table',
    size: 'Font30',
    value: '3',
    tips: _l('以表格形式展示多字段数据，适合字段较多、需要按列查看或对比的场景。'),
  },
];

const ROW_HEIGHT_DISPLAY = [
  { label: _l('紧凑'), value: '0' },
  { label: _l('中等'), value: '1' },
  { label: _l('高'), value: '2' },
  { label: _l('自适应'), value: '3' },
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
export default function MobileTableSetting({ data, onChange }) {
  const { showControls = [], relationControls = [] } = data;
  const defaultH5ShowType = data.type === 34 ? '1' : '2';
  let {
    h5showtype = defaultH5ShowType,
    h5abstractids,
    h5height,
    columnnum,
    showtitleid,
    layercontrolid,
  } = getAdvanceSetting(data);
  const columnNum = columnnum || '1';
  const abstractIds = safeParse(h5abstractids || '[]').filter(i => _.find(relationControls, r => r.controlId === i));
  const displayOptions = data.type === 34 ? SUB_LIST_DISPLAY_OPTIONS : RELATION_SEARCH_DISPLAY_OPTIONS;

  const filterControls = relationControls.filter(i => _.includes(showControls, i.controlId));
  const setTitleControls = relationControls.filter(i => !_.includes(ALL_SYS, i.controlId)).filter(canSetAsTitle);
  const showTitleDelete = showtitleid && !_.find(setTitleControls, s => s.controlId === showtitleid);

  useEffect(() => {
    if (layercontrolid && h5showtype !== '2') {
      onChange(
        handleAdvancedSettingChange(data, {
          h5showtype: '2',
          h5height: h5height || '0',
        }),
      );
    }
  }, [data, h5height, h5showtype, layercontrolid, onChange]);

  return (
    <Fragment>
      {!layercontrolid && (
        <SettingItem className="mTop0">
          <div className="settingItemTitle">{_l('显示样式')}</div>
          <DisplayMode>
            {displayOptions.map(i => {
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
      )}
      {h5showtype === '3' ? (
        <SettingItem>
          <div className="settingItemTitle">{_l('行高')}</div>
          <Select
            className="w100"
            options={ROW_HEIGHT_DISPLAY}
            value={h5height || '0'}
            onChange={value => onChange(handleAdvancedSettingChange(data, { h5height: value }))}
          />
        </SettingItem>
      ) : (
        <Fragment>
          {!layercontrolid && h5showtype === '2' && (
            <Fragment>
              <SettingItem>
                <div className="settingItemTitle">{_l('字段显示')}</div>
                <Radio.Group
                  size="middle"
                  value={columnNum}
                  options={(FIELD_DISPLAY_OPTIONS || []).map(({ text, ...option }) => ({ ...option, label: text }))}
                  onChange={event =>
                    onChange(
                      handleAdvancedSettingChange(data, {
                        columnnum: event.target.value,
                      }),
                    )
                  }
                />
              </SettingItem>
              <SettingItem>
                <div className="settingItemTitle">{_l('标题')}</div>
                <Select
                  className="w100"
                  allowClear
                  options={formatControlsToDropdown(setTitleControls)}
                  fieldNames={SELECT_FIELD_NAMES}
                  value={showTitleDelete ? undefined : showtitleid || undefined}
                  placeholder={
                    showTitleDelete ? (
                      <span className="Red">{_l('已删除')}</span>
                    ) : data.type === 34 ? (
                      _l('请选择')
                    ) : (
                      _l('默认显示标题字段')
                    )
                  }
                  onChange={value => onChange(handleAdvancedSettingChange(data, { showtitleid: value }))}
                />
              </SettingItem>
            </Fragment>
          )}
          <SettingItem className={cx(layercontrolid ? 'mTop0' : '')}>
            <div className="settingItemTitle">{layercontrolid ? _l('显示字段') : _l('摘要字段')}</div>
            {(layercontrolid || !['2', '3'].includes(h5showtype)) && (
              <div className="textSecondary mBottom8 ">
                {_l('最多可设置 3 个字段，排在第 1 位的字段会优先展示，并显示更多内容。')}
                {layercontrolid && _l('如未配置，则默认取标题字段。')}
              </div>
            )}
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
    </Fragment>
  );
}
