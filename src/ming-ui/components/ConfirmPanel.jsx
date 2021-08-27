import React from 'react';
import PropTypes from 'prop-types';
import Trigger from 'rc-trigger';
import { Button } from 'ming-ui';
import styled from 'styled-components';

const Angle = styled.div(
  ({ left }) => `
position: absolute;
left: ${left || 0}px;
top: -16px;
height: 0px;
width: 0px;
border: 8px solid transparent;
border-bottom-color: #fff;
> span {
  position: absolute;
  z-index: -1;
  top: -9px;
  left: -8px;
  width: 0px;
  height: 0px;
  border: 8px solid transparent;
  border-bottom-color: rgba(0, 0, 0, 0.12);
}
`,
);
const Popup = styled.div`
  width: 280px;
  border-radius: 3px;
  padding: 20px;
  box-shadow: 0px 4px 16px rgba(0, 0, 0, 0.24);
  background-color: #fff;
`;
const Title = styled.div`
  font-size: 14px;
  color: #333;
`;
const Footer = styled.div`
  overflow: hidden;
  margin-top: 30px;
`;

export default function ConfirmPanel(props) {
  const {
    visible,
    className,
    content,
    angleLeft,
    okText,
    cancelText,
    style,
    offset,
    children,
    points,
    onOk,
    onPopupVisibleChange,
  } = props;
  return (
    <Trigger
      popupStyle={style}
      action={['click']}
      popupVisible={visible}
      onPopupVisibleChange={onPopupVisibleChange}
      popup={
        <Popup className={className}>
          <Angle left={angleLeft || 0}>
            <span />
          </Angle>
          <Title>{content}</Title>
          <Footer>
            <Button
              className="Right"
              size="small"
              type="danger"
              onClick={e => {
                onOk(e);
                onPopupVisibleChange(false);
              }}
            >
              {okText || _l('确定')}
            </Button>
            <Button className="Right" size="small" type="link" onClick={() => onPopupVisibleChange(false)}>
              {cancelText || _l('取消')}
            </Button>
          </Footer>
        </Popup>
      }
      popupAlign={{
        points: points || ['tl', 'bl'],
        offset: offset || [],
        overflow: {
          adjustY: true,
        },
      }}
    >
      {children}
    </Trigger>
  );
}

ConfirmPanel.propTypes = {
  className: PropTypes.string,
  content: PropTypes.string,
  angleLeft: PropTypes.number,
  offset: PropTypes.arrayOf(PropTypes.number),
  style: PropTypes.shape({}),
  points: PropTypes.arrayOf(PropTypes.string),
  okText: PropTypes.string,
  cancelText: PropTypes.string,
  onOk: PropTypes.func,
  children: PropTypes.node,
};
