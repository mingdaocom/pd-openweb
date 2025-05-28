import React, { useRef, useState } from 'react';
import PropTypes from 'prop-types';
import cx from 'classnames';
import { Popup, Button, ActionSheet } from 'antd-mobile';
import RowDetail from './RowDetail';

export default function RowDetailModal(props) {
  const {
    mobileIsEdit,
    className,
    data,
    title,
    visible,
    switchDisabled = {},
    onClose,
    onDelete,
    onSwitch,
    allowDelete,
    isExceed,
    isEditCurrentRow,
  } = props;
  const formContent = useRef(null);
  const rowId = data.rowid || '';
  const type = mobileIsEdit
    ? (rowId.includes('temp') || rowId.includes('default')) && !isEditCurrentRow
      ? 'new'
      : 'edit'
    : 'edit';
  const disabled = mobileIsEdit ? props.disabled : true;
  let deleteConformAction = null;

  // 切换上一条/下一条
  const handleSwitch = type => {

    if ($('.childTableRowDetailMobileDialog').find('.fileUpdateLoading').length) {
      alert(_l('附件正在上传，请稍后'), 3);
      return
    }

    if (!switchDisabled[type]) {
      const hasError = formContent.current.handleSave(false, true);

      if (disabled || !(!_.isUndefined(hasError) && !hasError)) {
        onSwitch({ [type]: true });
      }
    }
  };

  // 删除记录
  const deleteRecord = rowid => {
    deleteConformAction = ActionSheet.show({
      popupClassName: 'md-adm-actionSheet',
      actions: [],
      extra: (
        <div className="flexColumn w100">
          <div className="bold Gray Font17 pTop10">{_l('确定删除此记录 ?')}</div>
          <div className="valignWrapper flexRow confirm mTop24">
            <Button
              className="flex mRight6 bold Gray_75 flex ellipsis Font13"
              onClick={() => deleteConformAction.close()}
            >
              {_l('取消')}
            </Button>
            <Button
              className="flex mLeft6 bold flex ellipsis Font13"
              color="danger"
              onClick={() => {
                deleteConformAction.close();
                onDelete(rowid);
                onClose();
              }}
            >
              {_l('确定')}
            </Button>
          </div>
        </div>
      ),
    });
  };

  const content = (
    <div className="rowDetailCon flexColumn" style={{ height: '100%' }}>
      <div className={cx('header flexRow valignWrapper', type)}>
        {!props.disabled && allowDelete && (
          <i className="headerBtn icon icon-task-new-delete Font18 Red" onClick={() => deleteRecord(data.rowid)}></i>
        )}
        <div className="flex"></div>
        <i
          className="headerBtn icon icon-delete_out Gray_9e Font20"
          onClick={() => {
            if (type === 'edit' && !disabled) {
              formContent.current.handleSave(false, false, true);
            }
            onClose();
          }}
        ></i>
      </div>
      <div className="forCon flex leftAlign">
        <div className="flexRow Font18 Gray bold leftAlign mBottom10">{title}</div>
        <RowDetail
          isMobile
          from={5}
          ref={formContent}
          {...props}
          disabled={type === 'new' ? false : disabled}
          widgetStyle={!mobileIsEdit ? { titlelayout_app: '2', titlewidth_app: '80' } : {}}
        />
      </div>
      {type === 'new' ? (
        <div className="footer btnsWrapper valignWrapper flexRow">
          {!isExceed && (
            <Button className="flex mRight6 bold Gray_75 Font13" onClick={() => formContent.current.handleSave(true)}>
              {_l('继续创建')}
            </Button>
          )}
          <Button
            color="primary"
            className="flex mLeft6 mRight6 bold Font13"
            onClick={() => formContent.current.handleSave()}
          >
            {_l('确认')}
          </Button>
        </div>
      ) : (
        <div className="footer btnsWrapper switchWrapper valignWrapper flexRow">
          <Button
            className={`flex mRight6 bold Font13 ${switchDisabled.prev ? 'Gray_df' : 'Gray_75'}`}
            onClick={() => handleSwitch('prev')}
          >
            {_l('上一条')}
          </Button>
          <Button
            className={`flex mLeft6 mRight6 Font13 bold ${switchDisabled.next ? 'Gray_df' : 'Gray_75'}`}
            onClick={() => handleSwitch('next')}
          >
            {_l('下一条')}
          </Button>
        </div>
      )}
    </div>
  );
  return (
    <Popup
      className={cx('childTableRowDetailMobileDialog mobileModal minFull topRadius', className)}
      onCancel={onClose}
      visible={visible}
    >
      {content}
    </Popup>
  );
}

RowDetailModal.propTypes = {
  disabled: PropTypes.bool,
  visible: PropTypes.bool,
  className: PropTypes.string,
  onClose: PropTypes.func,
};
