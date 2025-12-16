import React, { Fragment, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { BrowserRouter } from 'react-router-dom';
import { useKey } from 'react-use';
import cx from 'classnames';
import _, { get } from 'lodash';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { BgIconButton, Button, Checkbox, Dialog, LoadDiv, Modal, ScrollView } from 'ming-ui';
import { Tooltip } from 'ming-ui/antd-components';
import mingoCreateIcon from 'src/components/Mingo/assets/ai_create_date.svg';
import { MINGO_TASK_TYPE } from 'src/components/Mingo/ChatBot/enum';
import WorksheetDraft from 'src/pages/worksheet/common/WorksheetDraft';
import { browserIsMobile } from 'src/utils/common';
import { removeTempRecordValueFromLocal } from 'src/utils/common';
import { emitter } from 'src/utils/common';
import AdvancedSettingHandler from './AdvancedSettingHandler';
import NewRecordContent from './NewRecordContent';

const HeaderComp = styled.div`
  position: absolute;
  top: 0;
  z-index: 2;
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 50px;
  width: 100%;
  background: #fff;
  .title {
    font-size: 20px;
    font-weight: bold;
  }
`;

function NewRecord(props) {
  const {
    visible,
    isMingoCreate,
    noDisableClick,
    allowShowMingoCreate,
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
    isDraft,
    viewId,
    sheetSwitchPermit,
    worksheetInfo,
    isCharge,
  } = props;

  const newRecordContent = useRef(null);
  const cache = useRef({});
  const scrollViewRef = useRef(null);
  const recordContentRef = useRef(null);
  const [shareVisible, setShareVisible] = useState();
  const [newTitle, setNewTitle] = useState(title);
  const [modalClassName] = useState(Math.random().toString().slice(2));
  const [abnormal, setAbnormal] = useState();
  const [autoFill, setAutoFill] = useState(advancedSetting.autoreserve === '1');
  const [loading, setLoading] = useState();
  const [promptCancelAddRecord, setPromptCancelAddRecord] = useState(
    localStorage.getItem('promptCancelAddRecord') === 'true',
  );
  const continueAddVisible = showContinueAdd && advancedSetting.continueBtnVisible;
  const isEmbed = /\/embed\/view\//.test(location.pathname);
  const needConfirm = advancedSetting.enableconfirm === '1';
  const doubleConfirm = useMemo(() => safeParse(advancedSetting.doubleconfirm), [advancedSetting.doubleconfirm]);
  const allowDraft =
    !window.isPublicApp &&
    !isDraft &&
    (advancedSetting.closedrafts !== '1' || _.get(worksheetInfo, 'advancedSetting.closedrafts') !== '1');
  const showDraftList = !window.isPublicApp && !_.isEmpty(worksheetInfo);
  const showMingoCreate =
    allowShowMingoCreate &&
    !isMingoCreate &&
    !window.isPublicApp &&
    !md.global.Account.isPortal &&
    !_.isEmpty(worksheetInfo) &&
    String(get(worksheetInfo, 'advancedSetting.aifillin')) !== '1';

  const {
    confirmMsg = _l('您确认提交表单？'),
    confirmContent = '',
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

  const submitDraft = () => {
    if (window.isPublicApp) {
      alert(_l('预览模式下，不能操作'), 3);
      return;
    }
    removePromptCancelAddRecordDialog();
    newRecordContent.current.newRecord({
      autoFill,
      rowStatus: 21,
    });
  };

  const removePromptCancelAddRecordDialog = () => {
    if ($('.promptCancelAddRecord')) {
      $('.promptCancelAddRecord').parent().remove();
    }
  };

  const content = abnormal ? (
    <div className="Gray_9e TxtCenter mTop80 pTop100">{_l('该表已删除或没有权限')}</div>
  ) : (
    <NewRecordContent
      {...props}
      ref={recordContentRef}
      maskLoading={loading}
      registerFunc={funcs => (newRecordContent.current = funcs)}
      title={advancedSetting.title || title}
      notDialog={notDialog}
      autoFill={autoFill}
      showTitle={notDialog}
      onCancel={hideNewRecord}
      shareVisible={shareVisible}
      updateTitle={setNewTitle}
      setShareVisible={setShareVisible}
      onManualWidgetChange={() => (cache.current.formChanged = true)}
      onSubmitBegin={() => setLoading(true)}
      onSubmitEnd={() => setLoading(false)}
      onError={() => setAbnormal(true)}
    />
  );
  const submitNextCreate = () => {
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
        scrollViewRef.current?.scrollTo({ top: 0 });
      } else {
        $(`.${modalClassName}`).find('.scrollViewContainer .scroll-viewport')[0]?.scrollTo({ top: 0 });
      }
    }
    if (needConfirm) {
      handleConfirm(submit);
    } else {
      submit();
    }
  };
  const submitRecord = () => {
    if (window.isPublicApp) {
      alert(_l('预览模式下，不能操作'), 3);
      return;
    }
    function submit() {
      newRecordContent.current.newRecord({
        autoFill,
        actionType: advancedSetting.submitEndAction,
        rowStatus: 1,
      });
    }
    if (needConfirm) {
      handleConfirm(submit);
    } else {
      submit();
    }
  };
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
      {allowDraft && (
        <button
          type="button"
          className="ming Button--medium Button saveAndContinueBtn ellipsis mRight12"
          onClick={submitDraft}
        >
          {_l('存草稿')}
        </button>
      )}
      {continueAddVisible && (
        <Tooltip title={_l('提交后继续创建')} shortcut={window.isMacOs ? '⌘⇧↵' : 'Ctrl+Shift+Enter'}>
          <button
            type="button"
            className="ming Button--medium Button saveAndContinueBtn ellipsis"
            onClick={submitNextCreate}
          >
            {advancedSetting.continueBtnText || _l('提交并继续创建')}
          </button>
        </Tooltip>
      )}
      <Tooltip title={_l('提交')} shortcut={window.isMacOs ? '⌘S' : 'Ctrl+S'}>
        <button
          type="button"
          className="ming Button--medium Button--primary Button mLeft12 ellipsis"
          onClick={submitRecord}
        >
          {advancedSetting.submitBtnText || _l('提交')}
        </button>
      </Tooltip>
    </div>
  );
  const draftProps = {
    view: _.find(worksheetInfo.views, v => v.viewId === viewId),
    appId,
    worksheetInfo,
    sheetSwitchPermit,
    isCharge,
    addNewRecord: props.addNewRecord,
  };
  const iconButtons = [
    {
      type: 'mingoCreate',
      ele: (
        <BgIconButton
          className="mingoCreate"
          text={_l('AI 填写')}
          iconComponent={<img src={mingoCreateIcon} />}
          onClick={() => {
            hideNewRecord();
            window.mingoPendingStartTask = { type: MINGO_TASK_TYPE.CREATE_RECORD_ASSIGNMENT };
            emitter.emit('SET_MINGO_VISIBLE');
          }}
        />
      ),
    },
    {
      type: 'draft',
      ele: <BgIconButton iconComponent={<WorksheetDraft {...draftProps} />} />,
      onClick: () => {},
    },
    {
      type: 'share',
      icon: 'share',
      tip: _l('分享'),
      onClick: () => {
        setShareVisible(true);
      },
    },
  ];

  // 根据条件获取要显示的图标按钮
  const getVisibleIconButtons = () => {
    const allowedTypes = [];
    if (showMingoCreate && !md.global.SysSettings.hideAIBasicFun) {
      allowedTypes.push('mingoCreate');
    }

    if (showDraftList) {
      allowedTypes.push('draft');
    }

    if (showShare && !isEmbed && !md.global.Account.isPortal) {
      allowedTypes.push('share');
    }

    return iconButtons.filter(button => allowedTypes.includes(button.type));
  };
  const dialogProps = {
    headerComp: (
      <HeaderComp>
        <div className="title">{newTitle}</div>
      </HeaderComp>
    ),
    closeStyle: { marginTop: 5 },
    className: cx('workSheetNewRecord', className, modalClassName),
    type: 'fixed',
    verticalAlign: 'bottom',
    width: browserIsMobile() ? window.innerWidth - 20 : 960,
    onCancel: () => {
      function handleClose() {
        removePromptCancelAddRecordDialog();
        onCloseDialog();
        hideNewRecord();
        removeTempRecordValueFromLocal('tempNewRecord', worksheetId);
      }
      if (cache.current.formChanged && !promptCancelAddRecord && allowDraft) {
        Dialog.confirm({
          dialogClasses: 'promptCancelAddRecord',
          title: <span>{_l('是否将本次已填写内容保存为草稿？')}</span>,
          footer: (
            <div className="mui-dialog-footer flexRow">
              <div className="LineHeight36">
                <Checkbox
                  className="Gray_75 Hover_21"
                  value={promptCancelAddRecord}
                  text={_l('不再提示')}
                  onClick={checked => {
                    setPromptCancelAddRecord(checked);
                    localStorage.setItem('promptCancelAddRecord', checked);
                  }}
                />
              </div>
              <div className="flex"></div>
              <div className="Dialog-footer-btns">
                {allowDraft && (
                  <Button className="ming Button--medium Button saveAndContinueBtn" onClick={submitDraft}>
                    {_l('保存到草稿')}
                  </Button>
                )}
                <Button type="primary" onClick={handleClose}>
                  {_l('放弃')}
                </Button>
              </div>
            </div>
          ),
        });
      } else {
        handleClose();
      }
    },
    footer,
    visible,
    iconButtons: getVisibleIconButtons(),
  };
  useEffect(() => {
    setAutoFill(advancedSetting.autoreserve === '1');
  }, [advancedSetting.autoreserve]);

  // 使用 useKey Hook 处理快捷键
  // 延时处理，文本框类先失焦校验完
  useKey(
    e => {
      // Mac: Command+Shift+Enter, Windows: Ctrl+Shift+Enter
      return (window.isMacOs ? e.metaKey : e.ctrlKey) && e.shiftKey && e.key === 'Enter';
    },
    e => {
      e.preventDefault();
      !abnormal && continueAddVisible && setTimeout(() => submitNextCreate(), 50);
    },
    { event: 'keydown' },
    [abnormal, continueAddVisible],
  );

  useKey(
    e => {
      // Mac: Command+S, Windows: Ctrl+S
      return (window.isMacOs ? e.metaKey : e.ctrlKey) && ['s', 'S'].includes(e.key);
    },
    e => {
      e.preventDefault();
      !abnormal && setTimeout(() => submitRecord(), 50);
    },
    { event: 'keydown' },
    [abnormal],
  );

  return (
    <Fragment>
      {notDialog ? (
        <div
          className={cx('workSheetNewRecord', className, modalClassName)}
          onClick={noDisableClick ? _.noop : e => e.stopPropagation()}
        >
          <ScrollView options={{ overflow: { x: 'hidden' } }}>{content}</ScrollView>
          {footer}
        </div>
      ) : (
        <BrowserRouter>
          <Modal
            {...dialogProps}
            allowScale
            bodyStyle={{ paddingBottom: 0, paddingTop: 50 }}
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
