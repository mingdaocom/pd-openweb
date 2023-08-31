import React from 'react';
import Trigger from 'rc-trigger';
import styled from 'styled-components';
import SvgIcon from 'src/components/SvgIcon';
import IconTabs from 'src/pages/AppHomepage/components/SelectIcon/IconTabs';

const ColorBox = styled.div`
  width: 52px;
  height: 32px;
  background: #ffffff;
  border: 1px solid #e0e0e0;
  border-radius: 3px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  box-sizing: border-box;
  .emptyLine {
    display: inline-block;
    width: 80px;
    height: 1px;
    background: #e0e0e0;
    transform: rotateZ(-30deg);
  }
`;

export default function IconSetting(props) {
  const { icon = '', iconUrl = '' } = safeParse(props.icon || '{}');

  return (
    <Trigger
      popup={() => {
        return (
          <div className="selectIconWrap" style={{ width: '350px' }}>
            <IconTabs {..._.pick(props, ['projectId', 'iconColor', 'handleClick'])} icon={icon} />
          </div>
        );
      }}
      action={['click']}
      popupAlign={{
        points: ['tl', 'bl'],
        offset: [-80, 3],
      }}
      getPopupContainer={() => document.body}
    >
      <ColorBox>
        {iconUrl ? <SvgIcon url={iconUrl} fill="#9E9E9E" size={24} /> : <span className="emptyLine">-</span>}
      </ColorBox>
    </Trigger>
  );
}
