import React, { Fragment, useEffect, useRef, useState } from 'react';
import AntdModal from 'antd/es/modal';
import cx from 'classnames';
import _ from 'lodash';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { BgIconButton, Icon } from 'ming-ui';
import ErrorBoundary from '../../components/ErrorBoundary';
import { transformSemanticConfig } from '../utils';
import { getLegacyStaticModalZIndex } from '../zIndex';
import { registerModalEscClose } from './escClose';
import useContextualModal from './useModal';
import './index.less';

const ModalHeader = styled.div`
  display: flex;
  align-items: center;
  min-width: 0;
  padding-inline-end: ${({ $closable }) => ($closable === false ? 0 : '25px')};
`;

const ModalButtonCon = styled(BgIconButton.Group)`
  flex: none;
  margin-inline-start: auto;
  position: relative;
  top: ${({ $hasIconButtons }) => ($hasIconButtons ? '-8px' : 0)};
  pointer-events: auto;
  z-index: 10;
`;

const getModalMask = mask => {
  if (_.isPlainObject(mask)) {
    return {
      closable: false,
      ...mask,
    };
  }

  if (typeof mask === 'boolean') {
    return {
      enabled: mask,
      closable: false,
    };
  }

  return {
    closable: false,
  };
};

const getModalStyles = ({ styles, footerLeftElement }) => {
  if (!footerLeftElement) return styles;

  const mergeStyles = currentStyles => ({
    ...currentStyles,
    footer: {
      display: 'flex',
      alignItems: 'center',
      ...currentStyles?.footer,
    },
  });

  return transformSemanticConfig(styles, mergeStyles);
};

const getModalTitleContent = ({ title, hasHeaderActions = false, closable }) => {
  if (!_.isString(title)) return title;

  return (
    <div
      className={cx('flex minWidth0 ellipsis', {
        pRight25: !hasHeaderActions && closable !== false,
      })}
      title={title}
    >
      {title}
    </div>
  );
};

const getModalFooter = ({ footer, footerLeftElement, hasConfirmFooter }) => {
  const currentFooter = footer === undefined ? (hasConfirmFooter ? undefined : null) : footer;

  if (!footerLeftElement || currentFooter === null) return currentFooter;

  return (originNode, footerProps) => {
    const leftContent = _.isFunction(footerLeftElement) ? footerLeftElement() : footerLeftElement;
    const footerContent = _.isFunction(currentFooter)
      ? currentFooter(originNode, footerProps)
      : (currentFooter ?? originNode);

    return (
      <Fragment>
        <div className="flexRow flex">{leftContent}</div>
        {footerContent}
      </Fragment>
    );
  };
};

const getStaticModalStyles = styles => {
  const mergeStyles = currentStyles => ({
    ...currentStyles,
    body: {
      color: 'var(--color-text-secondary)',
      ...currentStyles?.body,
    },
  });

  return transformSemanticConfig(styles, mergeStyles);
};

const getStaticAction = (action, manualClose) => {
  if (!_.isFunction(action) || manualClose) return action;

  return close => {
    const result = action();

    if (result === false) return;
    if (_.isFunction(result?.then)) return result;

    close();
  };
};

const getStaticModalConfig = ({ manualClose, footer, footerLeftElement, ...restConfig } = {}) => {
  const config = _.omit(restConfig, ['headerRightElement']);
  const onOk = getStaticAction(config.onOk, manualClose);
  const onCancel = getStaticAction(config.onCancel);

  return {
    icon: null,
    closable: true,
    centered: true,
    ...config,
    className: cx(config.className, { 'hap-modal-confirm-with-footer-left': !!footerLeftElement }),
    title: getModalTitleContent({ title: config.title, closable: config.closable }),
    footer: getModalFooter({ footer, footerLeftElement, hasConfirmFooter: true }),
    focusable: {
      autoFocusButton: null,
      ...config.focusable,
    },
    onOk,
    onCancel,
    styles: getModalStyles({ styles: getStaticModalStyles(config.styles), footerLeftElement }),
    cancelButtonProps: {
      type: 'text',
      ...config.cancelButtonProps,
      className: cx({ textTertiary: !config.cancelButtonProps?.type }, config.cancelButtonProps?.className),
    },
  };
};

const getLegacyStaticModalConfig = config => {
  const modalConfig = getStaticModalConfig(config);

  return {
    ...modalConfig,
    zIndex: getLegacyStaticModalZIndex(modalConfig.zIndex),
  };
};

const useModal = () => useContextualModal(getStaticModalConfig);

export default function Modal(props) {
  const {
    allowScale,
    fullScreen,
    animated = true,
    open,
    dislocate,
    verticalAlign,
    iconButtons = [],
    headerRightElement,
    closeIcon,
    okDisabled,
    okButtonProps,
    cancelButtonProps,
    showConfirm,
    onCancel,
    needRenderRight,
    renderModalRightComp,
    styles,
    destroyOnHidden,
    mask,
    focusable,
    footer,
    footerLeftElement,
    ...restProps
  } = props;
  let { width } = props;
  const hasConfirmFooter = showConfirm ?? !!(props.onOk || props.okText || props.cancelText);
  const hasHeaderActions = !!(headerRightElement || iconButtons.length || allowScale);
  const [left, setLeft] = useState(0);
  const [isLarge, setIsLarge] = useState(localStorage.getItem('NEW_RECORD_IS_LARGE') === 'true');
  const escCloseConfigRef = useRef({ className: props.className, onCancel });

  if (allowScale && isLarge) {
    width = window.innerWidth > 1600 ? 1600 : window.innerWidth - 32 * 2;
  }

  const isStringTitle = _.isString(props.title);
  const titleContent = getModalTitleContent({
    title: props.title,
    hasHeaderActions,
    closable: props.closable,
  });
  const modalTitle = hasHeaderActions ? (
    <ModalHeader $closable={props.closable}>
      {isStringTitle ? titleContent : <div className="flex minWidth0 ellipsis">{titleContent}</div>}
      <ModalButtonCon
        className="flexRow alignItemsCenter"
        gap={8}
        $hasIconButtons={iconButtons.length > 0 || allowScale}
      >
        {headerRightElement}
        {iconButtons.map((btn, i) => (
          <React.Fragment key={btn.type || i}>
            {btn.ele || (
              <BgIconButton
                iconClassName="textTertiary"
                style={{ width: 32, height: 32 }}
                icon={btn.icon}
                tooltip={btn.tip}
                shortcut={btn.shortcut}
                onClick={btn.onClick}
              />
            )}
          </React.Fragment>
        ))}
        {allowScale && (
          <BgIconButton
            style={{ width: 32, height: 32 }}
            iconClassName="textTertiary"
            icon={isLarge ? 'worksheet_narrow' : 'worksheet_enlarge'}
            tooltip={isLarge ? _l('缩小') : _l('放大')}
            onClick={() => {
              safeLocalStorageSetItem('NEW_RECORD_IS_LARGE', !isLarge);
              setIsLarge(!isLarge);
            }}
          />
        )}
      </ModalButtonCon>
    </ModalHeader>
  ) : (
    titleContent
  );

  const modalProps = {
    centered: true,
    keyboard: false,
    footer: getModalFooter({ footer, footerLeftElement, hasConfirmFooter }),
    mask: getModalMask(mask),
    okButtonProps: {
      ...okButtonProps,
      disabled: okDisabled ?? okButtonProps?.disabled,
    },
    cancelButtonProps: {
      type: 'text',
      ...cancelButtonProps,
      className: cx('textTertiary', cancelButtonProps?.className),
    },
    ...restProps,
    title: modalTitle,
    transitionName: animated ? undefined : '',
    maskTransitionName: animated ? undefined : '',
    onCancel,
    open,
    width,
    destroyOnHidden: destroyOnHidden ?? true,
    focusable,
  };
  modalProps.closeIcon = !_.isUndefined(closeIcon) ? closeIcon : <Icon icon="close" className="textTertiary Font22" />;
  modalProps.style = Object.assign(props.style || {}, {
    transform: `translate(${left}px, 0px)`,
    transition: 'width 0.4s ease',
  });
  modalProps.styles = getModalStyles({ styles, footerLeftElement });
  useEffect(() => {
    window.dislocateCount = window.dislocateCount || 0;
    if (window.dislocateCount > 0 && !document.querySelectorAll('.hap-modal').length) {
      window.dislocateCount = 0;
    }

    if (dislocate && open) {
      let newLeft = window.dislocateCount * 10;
      const maxLeft = width < 1600 ? 32 : (window.innerWidth - width) / 2;

      if (newLeft > maxLeft) {
        newLeft = maxLeft;
      }

      setLeft(newLeft);
      window.dislocateCount = window.dislocateCount + 1;
    }
  }, [open]);
  useEffect(
    () => () => {
      if (dislocate) {
        window.dislocateCount = window.dislocateCount - 1;
      }
    },
    [],
  );
  useEffect(() => {
    escCloseConfigRef.current = { className: props.className, onCancel };
  }, [props.className, onCancel]);
  useEffect(() => {
    return registerModalEscClose({
      open,
      className: escCloseConfigRef.current.className,
      fn: e => {
        const currentOnCancel = escCloseConfigRef.current.onCancel;

        if (_.isFunction(currentOnCancel)) {
          currentOnCancel(e);
        }
      },
    });
  }, [open]);

  if (props.type === 'fixed') {
    modalProps.style.height = window.innerHeight - 32 * 2;
    modalProps.className = cx(modalProps.className, 'fixed');
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

  if (fullScreen) {
    modalProps.className = cx(modalProps.className, 'fullScreen');
    modalProps.style.height = '100%';
    modalProps.style.width = '100%';
    modalProps.style.maxWidth = 'unset';
    modalProps.style.verticalAlign = 'middle';
    modalProps.width = '100%';
  }

  return (
    <AntdModal
      {...modalProps}
      onCancel={e => {
        if (_.isFunction(onCancel)) {
          onCancel(e, 'click');
        }
      }}
    >
      {needRenderRight ? (
        <ErrorBoundary>
          <div className="flexRow h100">
            {props.children}
            {renderModalRightComp ? renderModalRightComp() : null}
          </div>
        </ErrorBoundary>
      ) : (
        <ErrorBoundary>{props.children}</ErrorBoundary>
      )}
    </AntdModal>
  );
}

Object.assign(Modal, {
  useModal,
  info: config => AntdModal.info(getLegacyStaticModalConfig(config)),
  success: config => AntdModal.success(getLegacyStaticModalConfig(config)),
  error: config => AntdModal.error(getLegacyStaticModalConfig(config)),
  warning: config => AntdModal.warning(getLegacyStaticModalConfig(config)),
  confirm: config => AntdModal.confirm(getLegacyStaticModalConfig(config)),
  destroyAll: AntdModal.destroyAll,
  config: AntdModal.config,
});

Modal.propTypes = {
  allowScale: PropTypes.bool,
  animated: PropTypes.bool,
  fullScreen: PropTypes.bool,
  verticalAlign: PropTypes.string,
  open: PropTypes.bool,
  okDisabled: PropTypes.bool,
  okButtonProps: PropTypes.shape({}),
  cancelButtonProps: PropTypes.shape({}),
  showConfirm: PropTypes.bool,
  width: PropTypes.number,
  dislocate: PropTypes.bool,
  type: PropTypes.string,
  className: PropTypes.string,
  style: PropTypes.shape({}),
  styles: PropTypes.shape({}),
  mask: PropTypes.oneOfType([PropTypes.bool, PropTypes.shape({})]),
  destroyOnHidden: PropTypes.bool,
  focusable: PropTypes.shape({}),
  footer: PropTypes.oneOfType([PropTypes.node, PropTypes.func]),
  footerLeftElement: PropTypes.oneOfType([PropTypes.node, PropTypes.func]),
  headerRightElement: PropTypes.node,
  children: PropTypes.node,
  cancelText: PropTypes.string,
  okText: PropTypes.string,
  onCancel: PropTypes.func,
  onOk: PropTypes.func,
};
