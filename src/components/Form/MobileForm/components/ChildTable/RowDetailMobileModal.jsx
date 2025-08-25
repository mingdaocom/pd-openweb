import React, { useRef } from 'react';
import { ActionSheet, Button, Popup } from 'antd-mobile';
import cx from 'classnames';
import _ from 'lodash';
import PropTypes from 'prop-types';
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
    allowCopy,
    isExceed,
    isEditCurrentRow,
    copyRow,
    widgetStyle,
    deleteRow = () => {},
  } = props;
  const formContent = useRef(null);
  const rowId = data.rowid || '';
  const type = mobileIsEdit
    ? (rowId.includes('temp') || rowId.includes('default')) && !isEditCurrentRow
      ? 'new'
      : 'edit'
    : 'edit';
  const disabled = mobileIsEdit ? props.disabled : true;
  let closeConfirmFunc = null;

  // 切换上一条/下一条
  const handleSwitch = type => {
    if ($('.mobileChildTableRowDetailDialog').find('.fileUpdateLoading').length) {
      alert(_l('附件正在上传，请稍后'), 3);
      return;
    }

    if (!switchDisabled[type]) {
      const hasError = formContent.current.handleSave(false, true);

      if (disabled || !(!_.isUndefined(hasError) && !hasError)) {
        onSwitch({ [type]: true });
      }
    }
  };

  const handleClose = rowid => {
    if (!mobileIsEdit || disabled) {
      onClose();
      return;
    }

    closeConfirmFunc = ActionSheet.show({
      popupClassName: 'md-adm-actionSheet',
      actions: [],
      extra: (
        <div className="flexColumn w100">
          <div className="bold Gray Font17 pTop10">{_l('是否保存当前记录?')}</div>
          <div className="valignWrapper flexRow confirm mTop24">
            <Button
              className="flex mRight6 bold Gray_75 flex ellipsis Font13"
              onClick={() => {
                closeConfirmFunc.close();
                onClose();
                deleteRow(rowid);
              }}
            >
              {_l('放弃')}
            </Button>
            <Button
              className="flex mLeft6 bold flex ellipsis Font13"
              color="primary"
              onClick={() => {
                closeConfirmFunc.close();
                const hasError = formContent.current.handleSave(false, false, false);
                if (!(!_.isUndefined(hasError) && !hasError)) {
                  onClose();
                }
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
        {isEditCurrentRow && !props.disabled && allowDelete && (
          <i className="headerBtn icon icon-trash Font18 Red" onClick={() => onDelete(data.rowid, onClose)}></i>
        )}
        {allowCopy && (
          <i
            className="icon icon-copy Font18 ThemeColor mLeft10"
            onClick={() => {
              const rowData = formContent.current.isVerified();
              rowData && copyRow(rowData);
            }}
          />
        )}
        <div className="flex"></div>
        {type === 'edit' && !disabled ? (
          <span
            className="ThemeColor Font16 bold"
            onClick={() => {
              if ($('.mobileChildTableRowDetailDialog').find('.fileUpdateLoading').length) {
                alert(_l('附件正在上传，请稍后'), 3);
                return;
              }
              const hasError = formContent.current.handleSave(false, false, false);
              if (!(!_.isUndefined(hasError) && !hasError)) {
                onClose();
              }
            }}
          >
            {_l('保存')}
          </span>
        ) : (
          <i className="headerBtn icon icon-cancel Gray_9e Font20" onClick={() => handleClose(data.rowid)}></i>
        )}
      </div>
      <div className="forCon flex leftAlign">
        <div className="flexRow Font18 Gray bold leftAlign mBottom10 pLeft20 pRight20">{title}</div>
        <RowDetail
          isMobile
          from={5}
          ref={formContent}
          {...props}
          disabled={type === 'new' ? false : disabled}
          widgetStyle={widgetStyle ? widgetStyle : !mobileIsEdit ? { titlelayout_app: '2', titlewidth_app: '80' } : {}}
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
      className={cx('mobileChildTableRowDetailDialog mobileModal minFull topRadius', className)}
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
