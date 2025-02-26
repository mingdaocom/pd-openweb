import React from 'react';
import Trigger from 'rc-trigger';
import styled from 'styled-components';
import { CUSTOM_ILLUSTRATION } from '../../config';

const GuildWrap = styled.div`
  width: 280px;
  background: #ffffff;
  box-shadow: 0px 2px 16px 1px rgba(0, 0, 0, 0.16);
  border-radius: 3px;
  left: 100%;
  justify-content: space-between;
  padding-top: 20px;
  box-sizing: border-box;
  overflow: hidden;
  .top {
    text-align: left;
    padding: 0 16px;
    .guildTitle {
      line-height: 14px;
    }
  }
`;

function IllustrationTrigger(props) {
  const { type, children } = props;

  return (
    <Trigger
      popup={
        <GuildWrap>
          <div className="top">
            <div className="Font14 Bold">{CUSTOM_ILLUSTRATION[type].title}</div>
            <div className="mTop8 Gray_75 LineHeight20 Font13">{CUSTOM_ILLUSTRATION[type].desc}</div>
          </div>
          <div className="bottom">
            <img className="w100" src={CUSTOM_ILLUSTRATION[type].image} />
          </div>
        </GuildWrap>
      }
      popupTransitionName="Tooltip-move-top"
      destroyPopupOnHide
      action={['hover']}
      popupAlign={{
        points: ['tl', 'tr'],
        offset: [5, 0],
        overflow: { adjustX: true, adjustY: true },
      }}
    >
      {children}
    </Trigger>
  );
}

export default IllustrationTrigger;
