import React, { useState, useRef } from 'react';
import PropTypes from 'prop-types';
import cx from 'classnames';
import { Checkbox, Modal, LoadDiv, ScrollView } from 'ming-ui';
import { removeFromLocal } from 'worksheet/util';
import NewRecordContent from './NewRecordContent';
import { browserIsMobile } from 'src/util';

export default function NewRecord(props) {
  const { visible, notDialog, className, showFillNext, showContinueAdd = true, hideNewRecord, ...rest } = props;
  const newRecordContent = useRef(null);
  const [modalClassName] = useState(Math.random().toString().slice(2));
  const [abnormal, setAbnormal] = useState();
  const [autoFill, setAutoFill] = useState();
  const [loading, setLoading] = useState();
  const content = abnormal ? (
    <div className="Gray_9e TxtCenter mTop80 pTop100">{_l('该表已删除或没有权限')}</div>
  ) : (
    <NewRecordContent
      registeFunc={funcs => (newRecordContent.current = funcs)}
      {...rest}
      notDialog={notDialog}
      autoFill={autoFill}
      showTitle
      onCancel={hideNewRecord}
      onSubmitBegin={() => setLoading(true)}
      onSubmitEnd={() => setLoading(false)}
      onError={() => setAbnormal(true)}
    />
  );
  const footer = !abnormal && (
    <div className="footerBox">
      {loading && (
        <div className="loadingMask">
          <LoadDiv size="big" />
        </div>
      )}
      <span className="continue TxtMiddle clearfix InlineBlock Left Gray_9e">
        {showContinueAdd && showFillNext && (
          <Checkbox
            checked={autoFill}
            onClick={() => setAutoFill(!autoFill)}
            text={_l('继续创建时，保留本次提交内容')}
          />
        )}
      </span>
      {showContinueAdd && (
        <button
          type="button"
          className="ming Button--medium Button saveAndContinueBtn"
          onClick={() => {
            if (window.isPublicApp) {
              alert(_l('预览模式下，不能操作'), 3);
              return;
            }
            newRecordContent.current.newRecord({ continueAdd: true, autoFill });
            if (notDialog) {
              $('.nano').nanoScroller({ scrollTop: 0 });
            } else {
              $(`.${modalClassName}`).find('.nano').nanoScroller({ scrollTop: 0 });
            }
          }}
        >
          {_l('提交并继续创建')}
        </button>
      )}
      <button
        type="button"
        className="ming Button--medium Button--primary Button mLeft12"
        onClick={() => {
          if (window.isPublicApp) {
            alert(_l('预览模式下，不能操作'), 3);
            return;
          }
          newRecordContent.current.newRecord();
        }}
      >
        {_l('提交')}
      </button>
    </div>
  );
  const dialogProps = {
    className: cx('workSheetNewRecord', className, modalClassName),
    type: 'fixed',
    verticalAlign: 'bottom',
    width: browserIsMobile() ? window.innerWidth - 20 : 900,
    onCancel: (e, type) => {
      if (type === 'click' && rest.viewId) {
        removeFromLocal('tempNewRecord', rest.viewId);
      }
      hideNewRecord();
    },
    footer,
    visible,
  };
  return notDialog ? (
    <div className={cx('workSheetNewRecord', className, modalClassName)}>
      <ScrollView>{content}</ScrollView>
      {footer}
    </div>
  ) : (
    <Modal {...dialogProps} allowScale bodyStyle={{ paddingBottom: 0 }} transitionName="none" maskTransitionName="none">
      {content}
    </Modal>
  );
}

NewRecord.propTypes = {
  notDialog: PropTypes.bool,
  showFillNext: PropTypes.bool,
};
