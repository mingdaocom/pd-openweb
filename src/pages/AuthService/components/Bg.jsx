import React from 'react';
import styled from 'styled-components';

export const WrapBg = styled.div(
  ({ bgImg }) => `
    width: 100%;
    position: fixed;
    left: 0;
    right: 0;
    bottom: 0;
    top: 0;
    background-image: ${bgImg ? `url(${bgImg})` : 'none'};
    background-repeat: no-repeat;
    background-size: cover;
    background-position: center;
  `,
);
function Bg(props) {
  const { homeImage } = props;
  const isNetwork = location.href.indexOf('network') >= 0 || md.global.Config.IsLocal;

  return isNetwork && homeImage ? <WrapBg bgImg={isNetwork && homeImage ? homeImage : ''} /> : null;
}

export default Bg;
