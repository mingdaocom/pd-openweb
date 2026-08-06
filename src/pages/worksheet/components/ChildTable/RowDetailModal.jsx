import React, { useEffect, useRef } from 'react';
import cx from 'classnames';
import PropTypes from 'prop-types';
import { Button, Modal, ScrollView } from 'ming-ui';
import { Tooltip } from 'ming-ui/antd-components';
import IconBtn from 'worksheet/common/recordInfo/RecordForm/IconBtn.jsx';
import { browserIsMobile } from 'src/utils/common';
import RowDetail from './RowDetail';

export default function RowDetailModal(props) {
  const {
    disabled,
    allowDelete,
    className,
    title,
    aglinBottom,
    data,
    switchDisabled = {},
    onClose,
    onDelete,
    onSwitch,
  } = props;
  const formContent = useRef(null);
  const isMobile = browserIsMobile();

  // 保存和恢复 window.activeTableId 以解决焦点问题
  useEffect(() => {
    const originalActiveTableId = window.activeTableId;
    // 清除 activeTableId，让子表弹窗内的输入框可以正常获得焦点
    window.activeTableId = undefined;

    return () => {
      // 恢复原始的 activeTableId
      window.activeTableId = originalActiveTableId;
    };
  }, []);
  const content = (
    <div className="rowDetailCon flexColumn">
      <div className="header flexRow">
        <Button
          size="mdbig"
          type="ghostgray"
          disabled={switchDisabled.prev}
          className="switchButton"
          onClick={() => !switchDisabled.prev && onSwitch({ prev: true })}
        >
          <i className="icon icon-arrow-up-border"></i>
          <span className="text">{_l('上一条')}</span>
        </Button>
        <Button
          size="mdbig"
          type="ghostgray"
          disabled={switchDisabled.next}
          className="switchButton"
          onClick={() => !switchDisabled.next && onSwitch({ next: true })}
        >
          <i className="icon icon-arrow-down-border"></i>
          <span className="text">{_l('下一条')}</span>
        </Button>
        <div className="flex" />
        {!disabled && allowDelete && (
          <Tooltip title={_l('删除')} placement="bottom" align={{ offset: [0, 0] }}>
            <IconBtn
              className="headerBtn Hand hoverColorPrimary delete"
              onClick={() => {
                onDelete(data.rowid);
                onClose();
              }}
            >
              <i className="icon icon-trash"></i>
            </IconBtn>
          </Tooltip>
        )}
        <Tooltip title={_l('关闭')} placement="bottom" align={{ offset: [0, 0] }}>
          <IconBtn
            className="headerBtn Hand hoverColorPrimary"
            onClick={() => {
              if (formContent.current) {
                formContent.current.handleClose();
              }
            }}
          >
            <i className="icon icon-close"></i>
          </IconBtn>
        </Tooltip>
      </div>

      <ScrollView className="flex">
        <div className="forCon">
          <div className="title">{title}</div>
          <RowDetail ref={formContent} {...props} />
        </div>
      </ScrollView>
    </div>
  );
  return (
    <Modal
      className={cx('childTableRowDetailDialog', className)}
      verticalAlign={aglinBottom && 'bottom'}
      type="fixed"
      visible
      width={isMobile ? window.innerWidth - 20 : window.innerWidth - 52 * 2 > 1600 ? 1600 : window.innerWidth - 52 * 2}
      bodyStyle={{ height: isMobile ? window.innerHeight - 20 * 2 : window.innerHeight - 32 * 2 }}
      onCancel={onClose}
    >
      {content}
    </Modal>
  );
}

RowDetailModal.propTypes = {
  disabled: PropTypes.bool,
  allowDelete: PropTypes.bool,
  visible: PropTypes.bool,
  className: PropTypes.string,
  onClose: PropTypes.func,
};
