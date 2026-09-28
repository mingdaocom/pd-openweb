import React from 'react';
import { ReactSVG } from 'react-svg';
import cx from 'classnames';
import styled from 'styled-components';
import { bgImages } from './shapes';

const Wrap = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 10px;
  .item {
    height: 78px;
    border: 1px solid transparent;
    border-radius: 4px;
    overflow: hidden;
    &.active {
      border-color: var(--color-primary);
    }
    > div,
    svg {
      width: 100%;
      height: 100%;
    }
  }
`;

export function ShapePreview({ backgroundColor, color, name }) {
  const shape = bgImages.find(item => item.name === name);

  if (!shape) {
    return null;
  }

  return (
    <ReactSVG
      className="w100 h100"
      style={{ backgroundColor }}
      src={shape.value}
      beforeInjection={svg => {
        svg.setAttribute('fill', color);
        svg.setAttribute('preserveAspectRatio', 'none');
      }}
    />
  );
}

export default function Shape(props) {
  const { backgroundColor, color, config, onChange, value } = props;
  const { pageBgImage } = config;

  return (
    <Wrap>
      {bgImages.map(item => (
        <div
          key={item.name}
          className={cx('item pointer', { active: pageBgImage === item.name })}
          onClick={() => {
            onChange({
              bgStyleValue: value,
              pageBgImage: item.name,
            });
          }}
        >
          <ShapePreview backgroundColor={backgroundColor} color={color} name={item.name} />
        </div>
      ))}
    </Wrap>
  );
}
