import React, { useEffect, useRef, useState } from 'react';
import { Modal } from 'antd';
import _ from 'lodash';
import PropTypes, { string } from 'prop-types';
import styled from 'styled-components';
import { BgIconButton, Button } from 'ming-ui';
import ErrorWrapper from './ErrorWrapper';
import './less/Modal.less';

const ModalButtonCon = styled(BgIconButton.Group)`
  z-index: 2;
  position: absolute;
  right: 42px;
  margin-top: 10px;
  top: 0;
`;

const ConfirmCon = styled.div`
  margin-top: 20px;
  text-align: right;
`;

export default function MdModal(props) {
  const {
    allowScale,
    fullScreen,
    visible,
    dislocate,
    closeSize = 40,
    verticalAlign,
    iconButtons = [],
    closeIcon,
    okDisabled,
    onCancel,
    headerComp = null,
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
      } catch (err) {
        console.log(err);
      }
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
  if (fullScreen) {
    modalProps.className = modalProps.className + ' fullScreen';
    modalProps.style.height = '100%';
    modalProps.style.width = '100%';
    modalProps.style.maxWidth = 'unset';
    modalProps.style.verticalAlign = 'middle';
    modalProps.width = '100%';
  }
  return (
    <Modal
      {...modalProps}
      onCancel={e => {
        onCancel(e, 'click');
      }}
    >
      <div ref={locateRef}></div>
      {headerComp}
      <ModalButtonCon gap={8}>
        {iconButtons.map(
          (btn, i) =>
            btn.ele || (
              <BgIconButton style={{ width: 32 }} key={i} icon={btn.icon} tooltip={btn.tip} onClick={btn.onClick} />
            ),
        )}
        {allowScale && (
          <BgIconButton
            style={{ width: 32 }}
            icon={isLarge ? 'worksheet_narrow' : 'worksheet_enlarge'}
            tooltip={isLarge ? _l('缩小') : _l('放大')}
            onClick={() => {
              safeLocalStorageSetItem('NEW_RECORD_IS_LARGE', !isLarge);
              setIsLarge(!isLarge);
            }}
          />
        )}
      </ModalButtonCon>
      <ErrorWrapper>{props.children}</ErrorWrapper>
    </Modal>
  );
}

MdModal.propTypes = {
  allowScale: PropTypes.bool,
  fullScreen: PropTypes.bool,
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
