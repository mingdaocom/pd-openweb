import React, { useState, useEffect, useRef, Fragment, useCallback, useMemo } from 'react';
import PropTypes from 'prop-types';
import cx from 'classnames';
import { Checkbox, Modal, LoadDiv, ScrollView, Dialog } from 'ming-ui';
import { removeTempRecordValueFromLocal } from 'worksheet/util';
import NewRecordContent from './NewRecordContent';
import AdvancedSettingHandler from './AdvancedSettingHandler';
import { browserIsMobile } from 'src/util';
import { BrowserRouter } from 'react-router-dom';

export const BUTTON_ACTION_TYPE = {
  CLOSE: 1,
  CONTINUE_ADD: 2,
  OPEN_RECORD: 3,
};
function NewRecord(props) {
  const {
    visible,
    appId,
    worksheetId,
    title,
    notDialog,
    className,
    showFillNext,
    showContinueAdd = true,
    hideNewRecord,
    onCloseDialog = () => {},
    showShare,
    advancedSetting = {},
  } = props;

  const newRecordContent = useRef(null);
  const cache = useRef({});
  const [shareVisible, setShareVisible] = useState();
  const [modalClassName] = useState(Math.random().toString().slice(2));
  const [abnormal, setAbnormal] = useState();
  const [autoFill, setAutoFill] = useState(advancedSetting.autoreserve === '1');
  const [loading, setLoading] = useState();
  const continueAddVisible = showContinueAdd && advancedSetting.continueBtnVisible;
  const isEmbed = /\/embed\/view\//.test(location.pathname);
  const needConfirm = advancedSetting.enableconfirm === '1';
  const doubleConfirm = useMemo(() => safeParse(advancedSetting.doubleconfirm), [advancedSetting.doubleconfirm]);
  const {
    confirmMsg = _l('您确认提交表单？'),
    confirmContent = _l('描述'),
    sureName = _l('确认'),
    cancelName = _l('取消'),
  } = doubleConfirm;
  const handleConfirm = useCallback(
    submit => {
      Dialog.confirm({
        title: <div className="breakAll">{confirmMsg}</div>,
        description: confirmContent,
        okText: (
          <div className="breakAll ellipsis" style={{ maxWidth: 100 }}>
            {sureName}
          </div>
        ),
        cancelText: (
          <div className="InlineBlock ellipsis" style={{ maxWidth: 100 }}>
            {cancelName}
          </div>
        ),
        onOk: () => {
          submit();
        },
      });
    },
    [advancedSetting.doubleconfirm],
  );
  const content = abnormal ? (
    <div className="Gray_9e TxtCenter mTop80 pTop100">{_l('该表已删除或没有权限')}</div>
  ) : (
    <NewRecordContent
      {...props}
      maskLoading={loading}
      registerFunc={funcs => (newRecordContent.current = funcs)}
      title={advancedSetting.title || title}
      notDialog={notDialog}
      autoFill={autoFill}
      showTitle
      onCancel={hideNewRecord}
      shareVisible={shareVisible}
      setShareVisible={setShareVisible}
      onWidgetChange={() => (cache.current.formChanged = true)}
      onSubmitBegin={() => setLoading(true)}
      onSubmitEnd={() => setLoading(false)}
      onError={() => setAbnormal(true)}
    />
  );
  const footer = !abnormal && (
    <div className="footerBox flexRow" onClick={e => e.stopPropagation()}>
      {loading && (
        <div className="loadingMask">
          <LoadDiv size="big" />
        </div>
      )}
      <span className="continue TxtMiddle clearfix InlineBlock Left Gray_9e">
        {continueAddVisible &&
          showFillNext &&
          advancedSetting.autoreserve !== '1' &&
          advancedSetting.autoFillVisible && (
            <Checkbox
              checked={autoFill}
              onClick={() => setAutoFill(!autoFill)}
              text={_l('继续创建时，保留本次提交内容')}
            />
          )}
      </span>
      <div className="flex" />
      {advancedSetting.closedrafts !== '1' && (
        <button
          type="button"
          className="ming Button--medium Button saveAndContinueBtn ellipsis mRight12"
          onClick={() => {
            if (window.isPublicApp) {
              alert(_l('预览模式下，不能操作'), 3);
              return;
            }
            newRecordContent.current.newRecord({
              autoFill,
              rowStatus: 21,
            });
          }}
        >
          {_l('存草稿')}
        </button>
      )}
      {continueAddVisible && (
        <button
          type="button"
          className="ming Button--medium Button saveAndContinueBtn ellipsis"
          onClick={() => {
            if (window.isPublicApp) {
              alert(_l('预览模式下，不能操作'), 3);
              return;
            }
            function submit() {
              newRecordContent.current.newRecord({
                isContinue: true,
                autoFill: autoFill && advancedSetting.autoFillVisible,
                actionType: advancedSetting.continueEndAction,
                rowStatus: 1,
              });
              if (notDialog) {
                $('.nano').nanoScroller({ scrollTop: 0 });
              } else {
                $(`.${modalClassName}`).find('.nano').nanoScroller({ scrollTop: 0 });
              }
            }
            if (needConfirm) {
              handleConfirm(submit);
            } else {
              submit();
            }
          }}
        >
          {advancedSetting.continueBtnText || _l('提交并继续创建')}
        </button>
      )}
      <button
        type="button"
        className="ming Button--medium Button--primary Button mLeft12 ellipsis"
        onClick={() => {
          if (window.isPublicApp) {
            alert(_l('预览模式下，不能操作'), 3);
            return;
          }
          function submit() {
            newRecordContent.current.newRecord({ autoFill, actionType: advancedSetting.submitEndAction, rowStatus: 1 });
          }
          if (needConfirm) {
            handleConfirm(submit);
          } else {
            submit();
          }
        }}
      >
        {advancedSetting.submitBtnText || _l('提交')}
      </button>
    </div>
  );
  const dialogProps = {
    className: cx('workSheetNewRecord', className, modalClassName),
    type: 'fixed',
    verticalAlign: 'bottom',
    width: browserIsMobile() ? window.innerWidth - 20 : 960,
    onCancel: e => {
      function handleClose() {
        onCloseDialog();
        hideNewRecord();
        removeTempRecordValueFromLocal('tempNewRecord', worksheetId);
      }
      if (e && e.key === 'Escape' && cache.current.formChanged) {
        Dialog.confirm({
          title: <span className="Red">{_l('您新建的记录尚未提交，确定要离开此页吗？')}</span>,
          description: _l('如果不提交，填写的内容将会丢失'),
          onOk: handleClose,
        });
      } else {
        handleClose();
      }
    },
    footer,
    visible,
    iconButtons:
      showShare && !isEmbed && !md.global.Account.isPortal
        ? [
            {
              icon: 'icon-share',
              tip: _l('分享'),
              onClick: () => {
                setShareVisible(true);
              },
            },
          ]
        : [],
  };
  useEffect(() => {
    setAutoFill(advancedSetting.autoreserve === '1');
  }, [advancedSetting.autoreserve]);
  return (
    <Fragment>
      {notDialog ? (
        <div className={cx('workSheetNewRecord', className, modalClassName)} onClick={e => e.stopPropagation()}>
          <ScrollView>{content}</ScrollView>
          {footer}
        </div>
      ) : (
        <BrowserRouter>
          <Modal
            {...dialogProps}
            allowScale
            bodyStyle={{ paddingBottom: 0 }}
            transitionName="none"
            maskTransitionName="none"
          >
            {content}
          </Modal>
        </BrowserRouter>
      )}
    </Fragment>
  );
}

NewRecord.propTypes = {
  notDialog: PropTypes.bool,
  showFillNext: PropTypes.bool,
};

export default AdvancedSettingHandler(NewRecord);
