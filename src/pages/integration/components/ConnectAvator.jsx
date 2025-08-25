import React from 'react';
import styled from 'styled-components';
import { Icon } from 'ming-ui';

const Wrap = styled.div(
  ({ width, size }) => `
  width: ${width || 32}px;
  height: ${width || 32}px;
  .logo {
    width: ${width || 32}px;
    height: ${width || 32}px;
    // background: rgb(221, 221, 221);
    border-radius: 50%;
    border: 1px solid rgb(239,239,239);
  }
  .iconLogo{
  }
  i {
    display: inline;
    font-size: ${size ? size : width ? width / 2 : 16}px;
    line-height: ${width || 32}px;
  }
`,
);
export default function ConnectAvator(props) {
  return (
    <Wrap className={props.className} width={props.width} height={props.width} size={props.size}>
      {props.iconName ? (
        <img src={props.iconName} alt="" width={props.width} height={props.width} srcset="" className="logo" />
      ) : (
        <span className="logo iconLogo mRight12 InlineBlock TxtCenter">
          <Icon icon="connect" className={'Gray_9e TxtMiddle'} onClick={() => {}} />
        </span>
      )}
    </Wrap>
  );
}
