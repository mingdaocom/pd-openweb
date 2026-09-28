import React from 'react';
import styled from 'styled-components';
import { Popover } from 'ming-ui/antd-components';
import { CUSTOM_ILLUSTRATION } from '../../config';

const GuildWrap = styled.div`
  width: 280px;
  justify-content: space-between;
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
    <Popover
      content={
        <GuildWrap>
          <div className="top">
            <div className="Font14 Bold">{CUSTOM_ILLUSTRATION[type].title}</div>
            <div className="mTop8 textSecondary LineHeight20 Font13">{CUSTOM_ILLUSTRATION[type].desc}</div>
          </div>
          <div className="bottom">
            <img className="w100" src={CUSTOM_ILLUSTRATION[type].image} />
          </div>
        </GuildWrap>
      }
      trigger="hover"
      placement="rightTop"
    >
      {children}
    </Popover>
  );
}

export default IllustrationTrigger;
