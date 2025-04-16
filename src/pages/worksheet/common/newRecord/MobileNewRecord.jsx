import React, { Fragment, useEffect, useRef, useState } from 'react';
import { ActionSheet, Button, Popup } from 'antd-mobile';
import cx from 'classnames';
import _, { isArray } from 'lodash';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { LoadDiv, ScrollView } from 'ming-ui';
import { removeTempRecordValueFromLocal } from 'worksheet/util';
import MobileDraft from 'src/pages/Mobile/MobileDraft';
import { compatibleMDJS, getRequest, handleReplaceState } from 'src/util';
import AdvancedSettingHandler from './AdvancedSettingHandler';
import NewRecordContent from './NewRecordContent';

const ModalWrap = styled(Popup)`
  .mobileContainer {
    padding-top: 25px;
  }
  .mobileNewRecord {
    -webkit-overflow-scrolling: touch;
  }
`;

const BtnsWrap = styled.div`
  height: 50px;
  background-color: #fff;
  padding: 0 10px;
  box-sizing: border-box;
  z-index: 2;
  background-color: #fff;

  &.confirm {
    border: none;
    padding: 0;
    position: relative;
    bottom: -10px;
  }
`;

const LoadingMask = styled.div`
  position: absolute;
  left: 0;
  right: 0;
  top: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.8);
  z-index: 2;
  > div {
    position: relative;
    top: 50%;
    margin-top: -22px;
  }
`;

const CloseIcon = styled.div`
  width: 24px;
  line-height: 24px;
  border-radius: 12px;
  background-color: #e6e6e6;
  text-align: center;
  cursor: pointer;
`;

function NewRecord(props) {
  const {
    visible,
    className,
    hideNewRecord = _.noop,
    notDialog,
    advancedSetting = {},
    showDraftsEntry,
    sheetSwitchPermit,
    customButtonConfirm,
    isDraft,
    ...rest
  } = props;
  const { appId, viewId, worksheetInfo } = rest;
  const newRecordContent = useRef(null);
  const cache = useRef({});
  const [loading, setLoading] = useState();
  const [autoFill, setAutoFill] = useState(null);
  const [sessionId, setSessionId] = useState(Date.now().toString());
  const doubleConfirm = safeParse(_.get(worksheetInfo, 'advancedSetting.doubleconfirm'));
  const promptCancelAddRecord = localStorage.getItem('promptCancelAddRecord') === 'true';
  const allowDraft =
    !window.isPublicApp &&
    !isDraft &&
    (advancedSetting.closedrafts !== '1' || _.get(worksheetInfo, 'advancedSetting.closedrafts') !== '1') &&
    showDraftsEntry;
  const showDraftList = !window.isPublicApp && !_.isEmpty(worksheetInfo);
  const { offlineUpload, page } = getRequest();

  const handOverNavigation = () => {
    compatibleMDJS('handOverNavigation', { sessionId });
    setSessionId('');
  };

  useEffect(() => {
    const cancel = () => {
      if (_.isArray(page) && page[page.length - 1] !== 'newRecord') {
        return;
      }

      handleReplaceState('page', isArray(page) ? page[page.length - 1] : page, () => {
        const setRestoreVisible = _.get(newRecordContent.current, 'setRestoreVisible');
        hideNewRecord();
        setRestoreVisible && setRestoreVisible(false);
      });
    };
    if (!notDialog) {
      window.addEventListener('popstate', cancel, false);
    }
    return () => {
      if (!notDialog) {
        window.removeEventListener('popstate', cancel, false);
      }
    };
  }, []);

  useEffect(() => {
    compatibleMDJS('takeOverNavigation', {
      sessionId, // 随机ID
      appWillGoBack: data => {
        var sessionId = data.sessionId;
        var url = data.url;
        // sessionId: 传入的sessionId
        // url: App 将返回的页面, 为空则是关闭当前浏览器
        // 若App执行失败, 将夺回控制权

        // H5决定

        // 1: 允许App执行, 通常伴随交还控制权
        // 建议在return 1前调用handOverNavigation, 避免上下文丢失
        // 2: 取消原生返回, H5执行返回
        // return 1/2;
        setSessionId(sessionId);
        // const { page } = getRequest();
        // if (page && _.isArray(page)) {
        //   if (page[page.length - 1] !== 'newRecord') {
        //     history.back();
        //   } else {
        //     onCancel();
        //     history.back();
        //     return 1;
        //   }
        // } else {
        //   onCancel();
        //   history.back();
        //   return 1;
        // }
        const { page } = getRequest();
        if (page && _.isArray(page)) {
          history.back();
        }
        return page && _.isArray(page) ? 2 : 1;
      },
    });

    return () => {
      if (page && _.isArray(page)) return;
      handOverNavigation();
    };
  }, []);

  const showActionSheetWithOptions = (isRetainFunc = () => {}) => {
    let actionHandler = ActionSheet.show({
      actions: [],
      extra: (
        <div className="flexColumn w100">
          <div className="Font17 Gray bold pTop10 mBottom16 TxtLeft">{_l('继续创建时，是否保留本次提交内容 ?')}</div>
          <BtnsWrap className="valignWrapper flexRow confirm">
            <Button
              className="flex mLeft6 mRight6 Font13 bold Gray_75"
              onClick={() => {
                setAutoFill(false);
                isRetainFunc(false);
                actionHandler.close();
              }}
            >
              {_l('不保留')}
            </Button>
            <Button
              className="flex mLeft6 mRight6 Font13 bold"
              color="primary"
              onClick={() => {
                setAutoFill(true);
                isRetainFunc(true);
                actionHandler.close();
              }}
            >
              {_l('保留')}
            </Button>
          </BtnsWrap>
        </div>
      ),
      onAction: (action, index) => {
        actionHandler.close();
      },
    });
  };

  const doubleConfirmSubmit = (isContinue, endAction, isAutoFill) => {
    let actionHandler = ActionSheet.show({
      actions: [],
      extra: (
        <div className="flexColumn w100">
          <div className="Font17 Gray bold pTop10 mBottom16 TxtLeft breakAll">{doubleConfirm.confirmMsg}</div>
          <div className="Gray_9e breakAll">{doubleConfirm.confirmContent}</div>
          <BtnsWrap className="valignWrapper flexRow confirm">
            <Button
              className="flex mLeft6 mRight6 Font13 bold Gray_75 ellipsis"
              onClick={() => {
                actionHandler.close();
              }}
            >
              {doubleConfirm.cancelName}
            </Button>
            <Button
              className="flex mLeft6 mRight6 Font13 bold ellipsis"
              color="primary"
              onClick={() => {
                newRecordContent.current.newRecord({
                  isContinue,
                  autoFill: isAutoFill,
                  actionType: endAction,
                });
                actionHandler.close();
              }}
            >
              {doubleConfirm.sureName}
            </Button>
          </BtnsWrap>
        </div>
      ),
    });
  };

  const handleAdd = async isContinue => {
    if (window.isPublicApp) {
      alert(_l('预览模式下，不能操作'), 3);
      return;
    }
    if (!isContinue && customButtonConfirm) {
      try {
        await customButtonConfirm();
      } catch (err) {
        return;
      }
    }

    const endAction = isContinue ? advancedSetting.continueEndAction : advancedSetting.submitEndAction;

    // 继续创建时是否保留本次提交的内容
    const isRetainFunc = isAutoFill => {
      if (_.get(worksheetInfo, 'advancedSetting.enableconfirm') === '1') {
        // 开启提交二次确认配置
        doubleConfirmSubmit(isContinue, endAction, isAutoFill);
        return;
      }
      newRecordContent.current.newRecord({
        isContinue,
        autoFill: isAutoFill,
        actionType: endAction,
      });
    };

    if (advancedSetting.autoFillVisible && endAction === 2 && _.isNull(autoFill) && offlineUpload !== '1') {
      if (isContinue && advancedSetting.autoreserve === '1') {
        setAutoFill(true);
        isRetainFunc(true);
        return;
      }
      showActionSheetWithOptions(isRetainFunc);
    } else if (_.get(worksheetInfo, 'advancedSetting.enableconfirm') === '1') {
      // 开启提交二次确认配置
      doubleConfirmSubmit(isContinue, endAction, autoFill);
    } else {
      newRecordContent.current.newRecord({
        isContinue,
        autoFill,
        actionType: endAction,
      });
    }
  };

  const submitDraft = () => {
    if (window.isPublicApp) {
      alert(_l('预览模式下，不能操作'), 3);
      return;
    }
    newRecordContent.current.newRecord({
      autoFill,
      rowStatus: 21,
    });
  };

  const hideNewRecordModal = () => {
    const handleClose = () => {
      hideNewRecord();
      removeTempRecordValueFromLocal('tempNewRecord', props.worksheetId);
    };
    if (cache.current.formChanged && !promptCancelAddRecord && allowDraft) {
      let actionHandler = ActionSheet.show({
        actions: [],
        extra: (
          <div className="flexColumn w100">
            <div className="flexRow alignItemsCenter">
              <div className="Font17 Gray bold pTop10 mBottom10 TxtLeft breakAll flex">
                {_l('是否将本次已填写内容保存为草稿？')}
              </div>
              <CloseIcon
                onClick={() => {
                  actionHandler.close();
                  handleClose();
                }}
              >
                <i className="icon icon-close Gray_9e" />
              </CloseIcon>
            </div>
            <div className="Gray_9e breakAll mBottom16">{_l('如果不提交，填写的内容将会丢失')}</div>
            <BtnsWrap className="valignWrapper flexRow confirm">
              {allowDraft && (
                <Button
                  className="flex mRight12 Font13 bold Gray_75 ellipsis"
                  onClick={() => {
                    actionHandler.close();
                    handleClose();
                    localStorage.setItem('promptCancelAddRecord', true);
                  }}
                >
                  {_l('不再提示')}
                </Button>
              )}
              <Button
                className="flex Font13 bold ellipsis"
                color="primary"
                onClick={() => {
                  submitDraft();
                  actionHandler.close();
                  handleClose();
                }}
              >
                {_l('保存到草稿')}
              </Button>
            </BtnsWrap>
          </div>
        ),
      });
    } else {
      handleClose();
    }
  };

  const header = (
    <div className="flexRow valignWrapper pTop15 pLeft20 pRight20 pBottom8">
      <div className="title Font18 Gray flex bold leftAlign ellipsis">
        {advancedSetting.title || props.title || (props.entityName && _l('创建%0', props.entityName))}
      </div>
      {showDraftList && (
        <MobileDraft
          appId={appId}
          worksheetId={props.worksheetId || worksheetInfo.worksheetId}
          controls={_.get(worksheetInfo, 'template.controls')}
          worksheetInfo={worksheetInfo}
          sheetSwitchPermit={sheetSwitchPermit}
          addNewRecord={props.onAdd}
        />
      )}
      <i
        className="icon icon-closeelement-bg-circle Gray_9e Font22"
        onClick={() => {
          hideNewRecordModal();
          if (location.search) {
            history.back();
          }
        }}
      ></i>
    </div>
  );
  const content = (
    <NewRecordContent
      registerFunc={funcs => (newRecordContent.current = funcs)}
      {...rest}
      isDraft={isDraft}
      notDialog={notDialog}
      advancedSetting={advancedSetting}
      continueCheck={false}
      showTitle={false}
      autoFill={autoFill}
      onCancel={hideNewRecord}
      from={5}
      onManualWidgetChange={() => (cache.current.formChanged = true)}
      onSubmitBegin={() => setLoading(true)}
      onSubmitEnd={() => setLoading(false)}
      viewId=""
      handleAdd={handleAdd}
      handOverNavigation={handOverNavigation}
    />
  );

  const footer = (
    <BtnsWrap className="footerBox valignWrapper flexRow">
      {allowDraft && (
        <div className="flexColumn TxtCenter mLeft6 mRight6">
          <div onClick={submitDraft}>
            <i className="icon-drafts_approval Font20 Gray_9e "></i>
            <div className="Font12 bold Gray_9e">{_l('存草稿')}</div>
          </div>
        </div>
      )}
      {advancedSetting.continueBtnVisible && offlineUpload !== '1' && (
        <Button className="flex mLeft6 mRight6 Font13 bold Gray_75" onClick={() => handleAdd(true)}>
          {advancedSetting.continueBtnText || _l('提交并继续创建')}
        </Button>
      )}
      <Button className="flex mLeft6 mRight6 Font13 bold" color="primary" onClick={() => handleAdd(false)}>
        {advancedSetting.submitBtnText || _l('提交')}
      </Button>
    </BtnsWrap>
  );
  const contentWrap = (
    <Fragment>
      {loading && (
        <LoadingMask>
          <LoadDiv size="small" />
        </LoadingMask>
      )}
      <div className="flexColumn leftAlign h100">
        {notDialog ? null : header}
        <ScrollView>
          <div
            className={cx('h100', {
              'pAll20 pTop0': localStorage.getItem('LOAD_MOBILE_FORM') === 'old',
            })}
          >
            {content}
          </div>
        </ScrollView>
        {footer}
      </div>
    </Fragment>
  );

  if (notDialog) {
    return contentWrap;
  } else {
    return (
      <ModalWrap
        className={cx('MobileNewRecordModal mobileModal full', className)}
        onClose={hideNewRecord}
        visible={visible}
      >
        {contentWrap}
      </ModalWrap>
    );
  }
}

NewRecord.propTypes = {
  notDialog: PropTypes.bool,
};

export default AdvancedSettingHandler(NewRecord);
