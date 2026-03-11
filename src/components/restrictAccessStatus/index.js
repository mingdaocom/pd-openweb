import React from 'react';
import styled from 'styled-components';
import unauthorizedPic from 'src/components/UnusualContent/unauthorized.png';

const RestrictAccessStatusWrap = styled.div`
  width: 100%;
  height: 100%;
  background-color: var(--color-background-secondary);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background-color: var(--color-background-primary);
  padding: 0 24px;
  text-align: center;
  img {
    width: 100px;
    height: 100px;
  }
`;

export default function RestrictAccessStatus(props) {
  const { className } = props;
  return (
    <RestrictAccessStatusWrap className={className}>
      <div className="mBottom20">
        <img src={unauthorizedPic} alt="unauthorized" />
      </div>
      <div className="Font17">{_l('访问受限')}</div>
      <div className="Font15">{_l('您的访问环境（网络/客户端）不满足应用访问策略要求。')}</div>
      <div className="Font15">{_l('如有疑问，请联系组织管理员。')}</div>
    </RestrictAccessStatusWrap>
  );
}
