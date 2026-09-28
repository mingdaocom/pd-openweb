import React from 'react';
import { Radio, Segmented } from 'ming-ui/antd-components';
import { getAdvanceSetting, handleAdvancedSettingChange } from 'src/utils/domain/control/advancedSetting';
import { COVER_FILL_TYPES } from 'src/utils/domain/control/setting';
import { CoverWrap } from '../../../../styled';

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
      <div className="textTertiary mTop10 mBottom8">{_l('选择作为封面图片的附件字段')}</div>
      <Radio.Group
        disabled={!dataSource}
        value={coverCid}
        options={(
          filterControls
            .filter(c => c.type === 14 || (c.type === 30 && c.sourceControl && c.sourceControl.type === 14))
            .map(c => ({
              text: c.controlName,
              value: c.controlId,
            })) || []
        ).map(({ text, ...option }) => ({ ...option, label: text }))}
        vertical={true}
        onChange={event => {
          const value = event.target.value;

          handleChange({
            ...data,
            coverCid: value,
          });
        }}
      />
      <div className="flexCenter mTop20">
        <span className="textSecondary mRight20">{_l('填充方式')}</span>
        <Segmented
          block
          className="flex"
          value={covertype}
          options={COVER_FILL_TYPES.map(({ text, ...option }) => ({ ...option, label: text }))}
          onChange={value => handleChange(handleAdvancedSettingChange(data, { covertype: value }))}
        />
      </div>
    </CoverWrap>
  );
}
