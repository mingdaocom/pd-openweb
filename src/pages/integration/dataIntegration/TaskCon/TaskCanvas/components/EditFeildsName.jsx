import React, { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';
import { useSetState } from 'react-use';
import { Input } from 'ming-ui';

const Wrap = styled.div`
  .ming.Input {
    height: 30px;
  }
`;
export default function EditFeildsName(props) {
  const [{ showInput, title }, setState] = useSetState({
    showInput: false,
    title: props.title,
  });
  useEffect(() => {
    setState({
      title: props.title,
    });
  }, [props]);
  return (
    <Wrap className="alignItemsCenter flexRow">
      <div className="flex flexRow alignItemsCenter">
        {showInput ? (
          <Input
            autoFocus
            className="flex mTop3"
            defaultValue={title}
            onBlur={e => {
              props.onChangeName(e.target.value.trim());
              setState({
                showInput: false,
              });
            }}
            onKeyDown={event => {
              if (event.which === 13) {
                setState({
                  title: event.target.value,
                });
              }
            }}
          />
        ) : (
          <span
            className="title ellipsis flex Hand"
            onClick={() => {
              props.canEdit &&
                setState({
                  showInput: true,
                });
            }}
          >
            {title}
          </span>
        )}
      </div>
    </Wrap>
  );
}
