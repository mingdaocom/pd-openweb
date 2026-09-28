import React from 'react';
import { Icon } from 'ming-ui';
import { Select } from 'ming-ui/antd-components';
import { DefaultEmpty, SectionItemWrap } from './style';

const THEME_COLORS = {
  0: 'var(--color-warning)',
  1: 'var(--color-primary)',
  2: 'var(--color-success)',
};

const renderItem = value => {
  let iconContent = null;

  if (value === '1') {
    iconContent = <div className="rangeIcon" />;
  } else if (value === '2') {
    iconContent = <Icon icon="play_circle_filled" className="headerArrowIcon Font20" />;
  }

  return (
    <div className="mTop5 w100 mBottom5 flexColumn pLeft12 pRight12 bgPrimary">
      <SectionItemWrap $theme={THEME_COLORS[value]} $color="var(--color-text-primary)">
        <div className="titleBox">
          {iconContent}
          <div className="titleText">{_l('标题')}</div>
        </div>
      </SectionItemWrap>
      <DefaultEmpty />
    </div>
  );
};

const OPTIONS = Array.from({ length: 3 }, (_, index) => {
  const value = String(index);
  return { value, label: renderItem(value) };
});

export default function StyleSetting({ sectionstyle, onChange }) {
  return (
    <Select
      className="w100"
      style={{ height: 'auto' }}
      value={sectionstyle}
      options={OPTIONS}
      virtual={false}
      onChange={onChange}
    />
  );
}
