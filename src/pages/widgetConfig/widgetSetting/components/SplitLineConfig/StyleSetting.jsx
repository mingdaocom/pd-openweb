import React from 'react';
import styled from 'styled-components';
import { Icon } from 'ming-ui';
import DropComponent from 'src/pages/widgetConfig/components/Dropdown';
import { DefaultEmpty, SectionItemWrap } from './style';
import './index.less';

const THEME_COLORS = {
  0: '#FF982D',
  1: '#1677ff',
  2: '#4CAF50',
};

const DropComponentWrap = styled(DropComponent)`
  padding: 0 8px 0 12px;
  & > i {
    font-size: 16px !important;
  }
`;

const renderItem = newVal => {
  let iconContent = null;
  if (newVal === '1') {
    iconContent = <div className="rangeIcon"></div>;
  } else if (newVal === '2') {
    iconContent = <Icon icon="play_circle_filled" className="headerArrowIcon Font20" />;
  }

  return (
    <div
      className="mTop5 w100 mBottom5 flexColumn"
      style={{ background: '#fff', padding: '0 12px', borderRadius: '3px' }}
    >
      <SectionItemWrap theme={THEME_COLORS[newVal]} color="#151515" sectionstyle={newVal}>
        <div className="titleBox">
          {iconContent}
          <div className="titleText">{_l('标题')}</div>
        </div>
      </SectionItemWrap>
      <DefaultEmpty />
    </div>
  );
};

const getDropData = () => {
  return Array.from({ length: 3 }).map((item, index) => {
    const newVal = String(index);
    return {
      value: newVal,
      children: renderItem(newVal),
    };
  });
};

export default function StyleSetting({ sectionstyle, onChange }) {
  return (
    <DropComponentWrap
      overlayClassName="sectionStyleDrop"
      value={sectionstyle}
      data={getDropData()}
      renderDisplay={() => renderItem(sectionstyle)}
      onChange={value => onChange(value)}
    />
  );
}
