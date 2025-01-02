import React, { useState, useEffect } from 'react';
import projectSettingController from 'src/api/projectSetting';
import styled from 'styled-components';
import mdImg from 'staticfiles/images/mingdao.png';

const PayHeaderWrap = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  padding-left: 32px;
  height: 60px;
  background-color: #fff;
  z-index: 10;
  box-shadow: 0 0 2px 2px rgba(0, 0, 0, 0.15);
  &::before {
    content: '';
    line-height: 60px;
    height: 60px;
    display: inline-block;
    vertical-align: middle;
  }
  .netManageTitle {
    height: 32px;
    line-height: 32px;
    color: #151515;
    padding-left: 20px;
    margin-left: 20px;
    font-size: 17px;
    border-left: 1px solid #ddd;
  }
`;

export default function PayHeader(props) {
  const { projectId, title } = props;
  const [logo, setLogo] = useState();

  // 获取组织logo
  const getLogo = () => {
    projectSettingController
      .getSysColor({
        projectId,
      })
      .then(res => {
        if (res) {
          setLogo(res.logo);
        }
      });
  };

  useEffect(() => {
    if (!projectId) return;
    getLogo();
  }, [projectId]);

  return (
    <PayHeaderWrap>
      <a href="/" className="TxtMiddle InlineBlock">
        <img
          src={logo && !logo.includes('emptylogo.png') ? logo : mdImg}
          className="TxtMiddle"
          style={{ height: 32 }}
        />
      </a>
      <div className="netManageTitle TxtMiddle InlineBlock">{title || _l('购买续费')}</div>
    </PayHeaderWrap>
  );
}
