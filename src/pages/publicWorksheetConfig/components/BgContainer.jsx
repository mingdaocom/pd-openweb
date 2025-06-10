import React from 'react';
import { Tooltip } from 'antd';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { browserIsMobile } from 'src/utils/common';

const Bg = styled.div`
  overflow: hidden;
  position: relative;
  .bgHeader {
    position: absolute;
    width: 100%;
    background-size: cover !important;
    background-position: center !important;
  }
  .userAvatar {
    z-index: 100;
    position: absolute;
    top: 20px;
    right: 20px;
    width: 40px;
    height: 40px;
    border-radius: 50%;
  }
`;
const Mask = styled.div`position: absolute; width: 100%; height: 300px; background-color: rgba(0, 0, 0, .05);}`;

export default function FormContainer(props) {
  const { className, children, theme, mask, coverUrl = '', isDisplayAvatar } = props;

  return (
    <Bg className={className}>
      {isDisplayAvatar &&
        md.global.Account.avatar &&
        (browserIsMobile() ? (
          <img src={md.global.Account.avatar} className="userAvatar" />
        ) : (
          <Tooltip title={md.global.Account.fullname} placement="bottom">
            <img src={md.global.Account.avatar} className="userAvatar" />
          </Tooltip>
        ))}
      <div
        className="bgHeader"
        style={{
          height: 300,
          background: `${theme} url(${coverUrl})`,
        }}
      ></div>
      {mask && <Mask />}
      {children}
    </Bg>
  );
}

FormContainer.propTypes = {
  className: PropTypes.string,
  children: PropTypes.oneOfType([PropTypes.element, PropTypes.arrayOf(PropTypes.element)]),
  themeIndex: PropTypes.number,
  coverUrl: PropTypes.string,
};
