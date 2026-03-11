import React from 'react';
import cx from 'classnames';
import { RadioGroup } from 'ming-ui';
import { COVER_FILL_TYPES } from '../../../../config/setting';
import { CoverWrap } from '../../../../styled';
import { getAdvanceSetting, handleAdvancedSettingChange } from '../../../../util/setting';

export default function DropdownCover(props) {
  const { data, filterControls = [], handleChange } = props;
  const { dataSource, coverCid } = data;
  const { covertype = '0' } = getAdvanceSetting(data);

  return (
    <CoverWrap>
      <div className="coverTitle">
        <span className="Bold">{_l('封面')}</span>
        {coverCid && (
          <span
            className="textTertiary hoverColorPrimary Hand"
            onClick={() => {
              handleChange({ ...handleAdvancedSettingChange(data, { covertype: '0' }), coverCid: '' });
            }}
          >
            {_l('清除')}
          </span>
        )}
      </div>
      <div className="textTertiary mTop10">{_l('选择作为封面图片的附件字段')}</div>
      <RadioGroup
        radioItemClassName="mTop10"
        disabled={!dataSource}
        checkedValue={coverCid}
        data={filterControls
          .filter(c => c.type === 14 || (c.type === 30 && c.sourceControl && c.sourceControl.type === 14))
          .map(c => ({
            text: c.controlName,
            value: c.controlId,
          }))}
        vertical={true}
        onChange={value => {
          handleChange({ ...data, coverCid: value });
        }}
      />
      <div className="flexCenter mTop20">
        <span className="textSecondary mRight20">{_l('填充方式')}</span>
        {COVER_FILL_TYPES.map(item => {
          return (
            <span
              className={cx('coverType Hand', { active: item.value === covertype })}
              onClick={() => handleChange(handleAdvancedSettingChange(data, { covertype: item.value }))}
            >
              {item.text}
            </span>
          );
        })}
      </div>
    </CoverWrap>
  );
}
