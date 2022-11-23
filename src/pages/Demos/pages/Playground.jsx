import React, { useRef, useState } from 'react';
import { useEffect } from 'react';
import styled from 'styled-components';
import { Motion, spring } from 'react-motion';

const Card = styled.div`
  position: absolute;
  border: ${({ active }) => (active ? 2 : 1)}px solid #ddd;
  border-radius: 4px;
  padding: 10px;
  ${({ active }) => (active ? 'border-color: green;' : '')}
`;

const Drag = styled.div`
  cursor: nwse-resize;
  position: absolute;
  width: 10px;
  height: 10px;
  bottom: 0px;
  right: 0px;
  border-bottom: 2px solid #ccc;
  border-right: 2px solid #ccc;
  margin: 1px;
  &:hover {
    border-color: #333;
  }
`;

export default function Playground(props) {
  const { minWidth = 80, minHeight = 80, maxWidth = 300, maxHeight = 300 } = props;
  const [size, setSize] = useState({ width: 100, height: 100 });
  const [active, setActive] = useState(false);
  const conRef = useRef();
  const dragRef = useRef();
  const cache = useRef({});
  function handleMouseMove(e) {
    if (cache.current.active) {
      const offsetX = e.clientX - cache.current.lastClientX;
      const offsetY = e.clientY - cache.current.lastClientY;
      let newWidth = cache.current.width + offsetX;
      let newHeight = cache.current.height + offsetY;
      if (newWidth > maxWidth) {
        newWidth = maxWidth;
      }
      if (newWidth < minWidth) {
        newWidth = minWidth;
      }
      if (newHeight > maxHeight) {
        newHeight = maxHeight;
      }
      if (newHeight < minHeight) {
        newHeight = minHeight;
      }
      conRef.current.style.width = newWidth + 'px';
      conRef.current.style.height = newHeight + 'px';
      cache.current.newWidth = newWidth;
      cache.current.newHeight = newHeight;
    }
  }
  function handleMouseDown(e) {
    setActive(true);
    cache.current.active = true;
    cache.current.lastClientX = e.clientX;
    cache.current.lastClientY = e.clientY;
  }
  function handleMouseUp() {
    setActive(false);
    cache.current.active = false;
    if (cache.current.newWidth && cache.current.newHeight) {
      setSize({
        width: cache.current.newWidth,
        height: cache.current.newHeight,
      });
      cache.current.newWidth = undefined;
      cache.current.newHeight = undefined;
    }
  }
  useEffect(
    () => {
      dragRef.current.addEventListener('mousedown', handleMouseDown);
      window.addEventListener('mouseup', handleMouseUp);
      window.addEventListener('mousemove', handleMouseMove);
    },
    () => {
      dragRef.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('mousemove', handleMouseMove);
    },
  );
  useEffect(() => {
    cache.current.width = size.width;
    cache.current.height = size.height;
  }, [size]);
  return (
    <Motion
      defaultStyle={{ width: size.width, height: size.height }}
      style={{
        width: spring(size.width),
        height: spring(size.height),
      }}
    >
      {value => (
        <Card
          style={{
            width: size.width,
            height: size.height,
            left: `calc(50% - ${value.width / 2}px)`,
            top: `calc(50% - ${value.height / 2}px)`,
          }}
          active={active}
          ref={conRef}
        >
          <Drag ref={dragRef} />
        </Card>
      )}
    </Motion>
  );
}
