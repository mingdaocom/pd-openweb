import React from 'react';
import PropTypes from 'prop-types';
import { Motion, spring } from 'react-motion';
import styled from 'styled-components';

const ConBox = styled.div`
  position: absolute;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  z-index: 11;
`;

const Con = styled.div`
  height: 48px;
  border-radius: 48px;
  color: #fff;
  background-color: #2196f3;
  line-height: 48px;
  padding: 0 10px 0 24px;
  z-index: 9;
  box-shadow: 0px 6px 24px rgba(0, 0, 0, 0.12), 0 2px 4px rgba(0, 0, 0, 0.08);
  display: flex;
  flex-direction: row;
  min-width: 400px;
`;

const Button = styled.div`
  cursor: pointer;
  display: inline-block;
  height: 28px;
  line-height: 28px;
  padding: 0 18px;
  border-radius: 28px;
`;
const OkButton = styled(Button)`
  color: #3ea4fc;
  background-color: #fff;
  font-weight: 600;
  &:hover {
    background-color: #e2f1fe;
  }
`;
const CancelButton = styled(Button)`
  color: #fff;
  &:hover {
    background-color: rgba(255, 255, 255, 0.16);
  }
`;

export default function EditingBar(props) {
  const {
    style = {},
    visible,
    defaultTop,
    visibleTop,
    title,
    updateText = _l('保存'),
    cancelText = _l('取消'),
    onUpdate = () => {},
    onCancel = () => {},
  } = props;

  return (
    <Motion
      defaultStyle={{ top: defaultTop }}
      style={{
        top: spring(visible ? visibleTop : defaultTop, {
          stiffness: 300,
          damping: 30,
          precision: 0.01,
        }),
      }}
    >
      {value => (
        <ConBox
          style={Object.assign(
            {
              overflow: visible ? undefined : 'hidden',
            },
            value,
            style,
          )}
        >
          <Con>
            <span className="flex bold">{title}</span>
            <CancelButton className="mLeft30 mTop10 mRight10" onClick={onCancel}>
              {cancelText}
            </CancelButton>
            <OkButton className="mTop10" onClick={onUpdate}>
              {updateText}
            </OkButton>
          </Con>
        </ConBox>
      )}
    </Motion>
  );
}

EditingBar.propTypes = {
  style: PropTypes.shape({}),
  visible: PropTypes.bool,
  title: PropTypes.string,
  defaultTop: PropTypes.number,
  visibleTop: PropTypes.number,
  updateText: PropTypes.string,
  cancelText: PropTypes.string,
  onUpdate: PropTypes.func,
  onCancel: PropTypes.func,
};
