import React, { useRef } from 'react';
import PropTypes from 'prop-types';
import cx from 'classnames';
import { Modal, Button, WingBlank } from 'antd-mobile';
import RowDetail from './RowDetail';

const alert = Modal.alert;

export default function RowDetailModal(props) {
  const {
    disabled,
    className,
    data,
    title,
    visible,
    switchDisabled = {},
    onClose,
    onDelete,
    onSwitch,
    allowDelete
  } = props;
  const formContent = useRef(null);
  const type = (!_.isEmpty(data.updatedControlIds) || !data.rowid.includes('temp')) ? 'edit' : 'new';
  const content = (
    <div className="rowDetailCon flexColumn" style={{ height: '100%' }}>
      <div className={cx('header flexRow valignWrapper', type)}>
        {type === 'new' && <div className="title Font18 Gray flex bold leftAlign ellipsis">{title}</div>}
        {type === 'edit' && (
          <div className="flex leftAlign">
            <i
              className={cx('headerBtn icon icon-arrow-up-border mRight8 Font18', { Gray_df: switchDisabled.prev })}
              onClick={() => !switchDisabled.prev && onSwitch({ prev: true })}
            ></i>
            <i
              className={cx('headerBtn icon icon-arrow-down-border Font18', { Gray_df: switchDisabled.next })}
              onClick={() => !switchDisabled.next && onSwitch({ next: true })}
            ></i>
          </div>
        )}
        {type === 'edit' && !disabled && allowDelete && (
          <i
            className="headerBtn icon icon-task-new-delete mRight10 Font18"
            onClick={() => {
              alert(_l('确定删除此记录 ?'), '', [
                { text: _l('取消') },
                {
                  text: <span className="Red">{_l('确定')}</span>,
                  onPress: () => {
                    onDelete(data.rowid);
                    onClose();
                  },
                },
              ]);
            }}
          ></i>
        )}
        <i className="headerBtn icon icon-close Gray_9e Font20" onClick={onClose}></i>
      </div>
      <div className="forCon flex leftAlign">
        {type === 'edit' && <div className="title Font18 Gray flex bold leftAlign ellipsis mBottom10">{title}</div>}
        <RowDetail isMobile from={5} ref={formContent} {...props} disabled={type === 'new' ? false : disabled} />
      </div>
      {!(type === 'new' ? false : disabled) && (
        <div className="footer btnsWrapper valignWrapper flexRow">
          <WingBlank className="flex" size="sm">
            <Button type="primary" className="bold" onClick={() => formContent.current.handleSave()}>
              {_l('保存')}
            </Button>
          </WingBlank>
        </div>
      )}
    </div>
  );
  return (
    <Modal
      popup
      animationType="slide-up"
      className={cx('childTableRowDetailMobileDialog', className)}
      onCancel={onClose}
      visible={visible}
    >
      {content}
    </Modal>
  );
}

RowDetailModal.propTypes = {
  disabled: PropTypes.bool,
  visible: PropTypes.bool,
  className: PropTypes.string,
  onClose: PropTypes.func,
};
