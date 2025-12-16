import React from 'react';
import styled, { keyframes } from 'styled-components';

const borderBeamAnimation = keyframes`
  100% {
    offset-distance: 100%;
  }
`;

const LoadingBox = styled.div`
  position: absolute;
  inset: 0;
  pointer-events: none;
  border: 1.5px solid transparent;
  border-radius: inherit;
  -webkit-mask-clip: padding-box, border-box !important;
  mask-clip: padding-box, border-box !important;
  -webkit-mask-composite: source-in, xor !important;
  mask-composite: intersect !important;
  -webkit-mask: linear-gradient(transparent, transparent), linear-gradient(white, white);
  mask: linear-gradient(transparent, transparent), linear-gradient(white, white);
  will-change: auto;
  &::after {
    content: '';
    position: absolute;
    aspect-ratio: 1/1;
    width: 80px;
    background: linear-gradient(to left, #6e09f920, #6e09f9, transparent);
    offset-anchor: 90 50%;
    offset-path: rect(0 auto auto 0 round 80px);
    animation: ${borderBeamAnimation} 6s infinite linear;
    animation-delay: 0s;
    will-change: auto;
  }
`;

export default function AILoading() {
  return <LoadingBox />;
}
