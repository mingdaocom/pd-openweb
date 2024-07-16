import React, { useEffect, useRef, useState } from 'react';
import styled from 'styled-components';
import { bool, node, number, shape } from 'prop-types';

const Con = styled.div`
  ${({ animateOffset = 300, duration }) => `
  transform: translateX(${animateOffset}px);
  transition: transform ${duration}ms ease;
  &.active {
    transform: translateY(0px);
  }`}
`;

export default function DropMotion(props) {
  const { style = {}, visible, children, animateOffset, duration = 300 } = props;
  const cache = useRef({});
  const [childrenVisible, setChildrenVisible] = useState(props.visible);
  useEffect(() => {
    if (cache.current.timer) {
      clearInterval(cache.current.timer);
    }
    cache.current.timer = setInterval(
      () => {
        setChildrenVisible(props.visible);
      },
      props.visible ? 0 : duration,
    );
  }, [props.visible]);
  return (
    <Con className={visible ? 'active' : ''} style={style} animateOffset={animateOffset} duration={duration}>
      {childrenVisible && children}
    </Con>
  );
}

DropMotion.propTypes = {
  visible: bool,
  duration: number,
  animateOffset: number,
  children: node,
  style: shape({}),
};
