import React, { Fragment } from 'react';
import { Tooltip } from 'antd';
import cx from 'classnames';
import WidgetRowHeight from '../WidgetRowHeight';
import AttachmentConfig from '../AttachmentConfig';
import { SettingItem, AnimationWrap } from 'src/pages/widgetConfig/styled';
import { getAdvanceSetting, handleAdvancedSettingChange } from '../../../util/setting';

const DISPLAY_LIST = [
  {
    text: _l('滚动'),
    value: '1',
  },
  {
    text: _l('分页'),
    value: '2',
  },
];

export default function SubListStyle(props) {
  const { data, onChange } = props;
  const { showtype = '1', blankrow = '1', rownum = '15' } = getAdvanceSetting(data);

  return (
    <Fragment>
      <SettingItem>
        <div className="settingItemTitle">{_l('表格样式')}</div>
      </SettingItem>
      <WidgetRowHeight {...props} />
      <SettingItem>
        <div className="settingItemTitle Normal">{_l('显示方式')}</div>
        <AnimationWrap>
          {DISPLAY_LIST.map(({ text, value }) => {
            return (
              <div
                className={cx('animaItem overflow_ellipsis', { active: showtype === value })}
                onClick={() => onChange(handleAdvancedSettingChange(data, { showtype: value }))}
              >
                {text}
              </div>
            );
          })}
        </AnimationWrap>
      </SettingItem>
      <SettingItem>
        <div className="settingItemTitle Normal">
          {_l('默认空行')}
          <Tooltip
            placement={'bottom'}
            title={_l('开启后无论子表中是否存在记录，都会显示固定数量的行数。当子表没有记录时，将显示空白行。')}
          >
            <i className="icon-help tipsIcon Gray_9e Font16 pointer"></i>
          </Tooltip>
        </div>
        <div className="flexCenter">
          <AttachmentConfig
            data={handleAdvancedSettingChange(data, { blankrow })}
            attr="blankrow"
            maxNum={Number(rownum) || 15}
            minCount={0}
            onChange={value => {
              let tempRow = getAdvanceSetting(value, 'blankrow');
              if (tempRow > Number(rownum)) {
                tempRow = Number(rownum) || 0;
              }
              onChange(handleAdvancedSettingChange(data, { blankrow: tempRow.toString() }));
            }}
          />
          <span className="mLeft12">{_l('行')}</span>
        </div>
      </SettingItem>
      <SettingItem>
        <div className="settingItemTitle Normal">
          {_l('最大高度（%0）', showtype === '1' ? '滚动方式' : '每页行数')}
        </div>
        <div className="flexCenter">
          <AttachmentConfig
            data={handleAdvancedSettingChange(data, { rownum })}
            attr="rownum"
            maxNum={200}
            onChange={value => {
              let tempRowNum = getAdvanceSetting(value, 'rownum');
              if (tempRowNum < Number(blankrow)) {
                tempRowNum = Number(blankrow) || 15;
              }
              onChange(handleAdvancedSettingChange(data, { rownum: tempRowNum.toString() }));
            }}
          />
          <span className="mLeft12">{_l('行')}</span>
        </div>
      </SettingItem>
    </Fragment>
  );
}
