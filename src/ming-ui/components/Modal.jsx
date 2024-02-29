import React, { useEffect, useState, useRef } from 'react';
import PropTypes, { string } from 'prop-types';
import styled from 'styled-components';
import { Modal } from 'antd';
import { Button } from 'ming-ui';
import ErrorWrapper from './ErrorWrapper';
import './less/Modal.less';
import _ from 'lodash';

const ModalButtonCon = styled.div`
  z-index: 2;
  position: absolute;
  right: 40px;
  top: 0;
`;

const ModalButton = styled.div`
  cursor: pointer;
  font-size: 20px;
  line-height: 40px;
  text-align: center;
  color: #9e9e9e;
  &:hover {
    color: #2196f3;
  }
`;

const TipCon = styled.div`
  height: 30px;
  width: 40px;
  text-align: center;
`;

const ConfirmCon = styled.div`
  margin-top: 20px;
  text-align: right;
`;

export default function MdModal(props) {
  const {
    allowScale,
    visible,
    dislocate,
    closeSize = 40,
    verticalAlign,
    iconButtons = [],
    closeIcon,
    okDisabled,
    onCancel,
  } = props;
  const locateRef = useRef();
  let { width } = props;
  const showConfirm = props.onOk || props.okText || props.cancelText;
  const [left, setLeft] = useState(0);
  const [isLarge, setIsLarge] = useState(localStorage.getItem('NEW_RECORD_IS_LARGE') === 'true');
  if (allowScale && isLarge) {
    width = window.innerWidth > 1600 ? 1600 : window.innerWidth - 32 * 2;
  }
  const defaultProps = {
    footer: null,
  };
  const modalProps = {
    ...defaultProps,
    ...{
      className: 'mdModal',
      wrapClassName: 'mdModalWrap',
      transitionName: 'none',
      maskTransitionName: 'none',
      centered: true,
      keyboard: false,
      maskClosable: false,
      ...props,
      width,
    },
  };
  modalProps.closeIcon = !_.isUndefined(closeIcon) ? (
    closeIcon
  ) : (
    <i
      style={_.assign(
        { display: 'inline-block', width: closeSize, height: closeSize, lineHeight: closeSize + 'px' },
        props.closeStyle,
      )}
      className="ming Icon icon-default icon icon-close Gray_9e Font22"
    />
  );
  modalProps.className = `mdModal ${props.className || ''}`;
  modalProps.style = Object.assign(props.style || {}, {
    transform: `translate(${left}px, 0px)`,
    transition: 'width 0.4s ease',
  });
  modalProps.maskStyle = { backgroundColor: 'rgba(0, 0, 0, .7)' };
  modalProps.bodyStyle = Object.assign(props.bodyStyle || {}, {});
  useEffect(() => {
    window.dislocateCount = window.dislocateCount || 0;
    if (window.dislocateCount > 0 && !document.querySelectorAll('.mdModal').length) {
      window.dislocateCount = 0;
    }
    if (dislocate && visible) {
      let newLeft = window.dislocateCount * 10;
      const maxLeft = width < 1600 ? 32 : (window.innerWidth - width) / 2;
      if (newLeft > maxLeft) {
        newLeft = maxLeft;
      }
      setLeft(newLeft);
      window.dislocateCount = window.dislocateCount + 1;
    }
  }, [visible]);
  useEffect(() => {
    if (locateRef.current) {
      try {
        locateRef.current.parentElement.parentElement.style.maxHeight = window.innerHeight - 32 + 'px';
      } catch (err) {}
    }
    const id = Math.random() * Math.random();
    if (window.closeFns) {
      window.closeindex = (window.closeindex || 0) + 1;
      window.closeFns[id] = {
        id,
        className: props.className,
        index: window.closeindex,
        fn: modalProps.onCancel,
      };
    }
    return () => {
      if (dislocate) {
        window.dislocateCount = window.dislocateCount - 1;
      }
      if (window.closeFns) {
        delete window.closeFns[id];
      }
    };
  }, []);
  if (props.type === 'fixed') {
    modalProps.style.height = window.innerHeight - 32 * 2;
    modalProps.className = modalProps.className + ' fixed';
    if (verticalAlign) {
      modalProps.style.verticalAlign = verticalAlign;
      if (verticalAlign !== 'middle') {
        modalProps.style.height = window.innerHeight - 32;
      }
    }
    if (allowScale && isLarge) {
      modalProps.style.height = window.innerHeight - 32;
    }
  }
  if (showConfirm && !modalProps.footer) {
    modalProps.footer = (
      <ConfirmCon>
        <Button type="link" onClick={props.onCancel || _.noop}>
          {props.cancelText || _l('取消')}
        </Button>
        <Button type="primary" disabled={okDisabled} onClick={props.onOk || _.noop}>
          {props.okText || _l('确定')}
        </Button>
      </ConfirmCon>
    );
  }
  return (
    <Modal
      {...modalProps}
      onCancel={e => {
        onCancel(e, 'click');
      }}
    >
      <div ref={locateRef}></div>
      <ModalButtonCon className="flexRow">
        {iconButtons.map((btn, i) => (
          <ModalButton key={i} onClick={btn.onClick}>
            <TipCon data-tip={btn.tip}>
              <i className={`icon ${btn.icon}`}></i>
            </TipCon>
          </ModalButton>
        ))}
        {allowScale && (
          <ModalButton
            onClick={() => {
              safeLocalStorageSetItem('NEW_RECORD_IS_LARGE', !isLarge);
              setIsLarge(!isLarge);
            }}
          >
            <TipCon data-tip={isLarge ? _l('缩小') : _l('放大')}>
              <i className={`icon icon-${isLarge ? 'worksheet_narrow' : 'worksheet_enlarge'}`}></i>
            </TipCon>
          </ModalButton>
        )}
      </ModalButtonCon>
      <ErrorWrapper>{props.children}</ErrorWrapper>
    </Modal>
  );
}

MdModal.propTypes = {
  allowScale: PropTypes.bool,
  verticalAlign: PropTypes.string,
  visible: PropTypes.bool,
  okDisabled: PropTypes.bool,
  width: PropTypes.number,
  dislocate: PropTypes.bool,
  type: PropTypes.string,
  className: PropTypes.string,
  style: PropTypes.shape({}),
  closeStyle: PropTypes.shape({}),
  closeSize: PropTypes.number,
  bodyStyle: PropTypes.shape({}),
  children: PropTypes.node,
  cancelText: string,
  okText: string,
  onCancel: PropTypes.func,
  onOk: PropTypes.func,
};
