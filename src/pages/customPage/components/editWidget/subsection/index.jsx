import React, { useEffect, useRef } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import cx from 'classnames';
import styled from 'styled-components';
import { updateWidget } from 'src/pages/customPage/redux/action';

const Wrap = styled.div`
  padding: 0 10px;
  border-radius: 6px;
  border: 1px dashed transparent;
  position: relative;
  &::after {
    content: '';
    position: absolute;
    top: 50%;
    left: 0px;
    border-radius: 6px;
    width: 6px;
    height: 40%;
    transform: translateY(-50%);
    background: var(--app-primary-color);
  }
  &.editWrap {
    border-color: var(--color-primary);
  }
  input {
    width: 100%;
    border: none;
  }
`;

const Subsection = props => {
  const { widget, updateWidget } = props;
  const { edit, componentConfig } = widget;
  const { name } = componentConfig || {};
  const elementRef = useRef(null);

  useEffect(() => {
    if (edit) {
      const input = document.querySelector('.editWrap input');

      if (input) {
        input.focus();
      }
    }
  }, [edit]);

  return (
    <Wrap className={cx('flexRow alignItemsCenter h100 Font20', { editWrap: edit })} ref={elementRef}>
      {edit ? (
        <input
          className="disableDrag childrenDisableDrag"
          value={name}
          placeholder={_l('分段名称')}
          onChange={event => {
            const { value } = event.target;
            updateWidget({
              widget,
              componentConfig: {
                ...componentConfig,
                name: value,
              },
            });
          }}
          onBlur={() => {
            updateWidget({
              widget,
              edit: false,
            });
          }}
        />
      ) : (
        <span className="ellipsis bold">{name}</span>
      )}
    </Wrap>
  );
};

export default connect(
  () => ({}),
  dispatch => bindActionCreators({ updateWidget }, dispatch),
)(Subsection);
