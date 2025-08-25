import React from 'react';
import cx from 'classnames';
import styled from 'styled-components';

const Wrap = styled.div`
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  justify-content: space-between;
  margin-bottom: -10px;
  .item {
    width: 106px;
    height: 54px;
    margin: 0 0 10px 0;
    position: relative;
  }
  .image {
    border-radius: 4px;
    background-size: cover;
    background-repeat: no-repeat;
    background-position: center;
  }
  .active {
    &::before {
      content: '';
      position: absolute;
      top: -2px;
      left: -2px;
      width: calc(100% + 4px);
      height: calc(100% + 4px);
      border: 1px solid #1677ff;
      border-radius: 3px;
    }
  }
`;

export const images = require.context('./images', false, /\.jpg$/);

const LoadImage = props => {
  const { index } = props;
  const src = images(`./${index}.jpg`);
  return <div className="w100 h100 image" style={{ backgroundImage: `url(${src})` }} />;
};

export default props => {
  const { value, config, onChange } = props;
  const { bgImageIndex } = config;
  return (
    <Wrap>
      {Array.from({ length: 16 }).map((_, index) => (
        <div
          key={index}
          className={cx('item pointer', { active: index + 1 === bgImageIndex })}
          onClick={() => {
            onChange({
              bgStyleValue: value,
              bgImageIndex: index + 1,
            });
          }}
        >
          <LoadImage index={index + 1} />
        </div>
      ))}
    </Wrap>
  );
};
