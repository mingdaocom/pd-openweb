import React from 'react';
import styled from 'styled-components';
import cx from 'classnames';
const TextBox = styled.span`
  .hightLine {
    background: #dbf0ff;
    border-radius: 2px;
  }
`;

export default function TextHeightLine(props) {
  const { heightLineText, text, hightLineClass, className } = props;

  let list = text.split(heightLineText);
  return (
    <TextBox className={cx({ [className]: className })}>
      {list.map((it, index) => {
        if (index === 0) return it;
        return (
          <React.Fragment>
            <span className={cx('hightLine', hightLineClass)}>{heightLineText}</span>
            {it}
          </React.Fragment>
        );
      })}
    </TextBox>
  );
}
