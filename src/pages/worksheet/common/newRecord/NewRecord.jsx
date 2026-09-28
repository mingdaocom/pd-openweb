import React, { Fragment, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { BrowserRouter } from 'react-router-dom';
import { useKey } from 'react-use';
import cx from 'classnames';
import _, { get } from 'lodash';
import PropTypes from 'prop-types';
import { BgIconButton, LoadDiv, ScrollView } from 'ming-ui';
import { Button, Checkbox, Modal, Tooltip } from 'ming-ui/antd-components';
import mingoCreateIcon from 'src/components/Mingo/assets/ai_create_date.svg';
import { MINGO_TASK_TYPE } from 'src/components/Mingo/ChatBot/enum';
import { canUseMingoOtherAssistant } from 'src/components/Mingo/permission';
import WorksheetDraft, { useWorkSheetDraftModal } from 'src/pages/worksheet/common/WorksheetDraft';
import { browserIsMobile } from 'src/utils/platform/browser/device';
import { getLatestCreateTimestampOfWithSaveShortcut } from 'src/utils/platform/browser/dom';
import { emitter } from 'src/utils/platform/browser/dom';
import { removeTempRecordValueFromLocal } from 'src/utils/services/cache/record';
import AdvancedSettingHandler from './AdvancedSettingHandler';
import NewRecordContent from './NewRecordContent';

function NewRecord(props) {
  const {
    visible,
    isMingoCreate,
    noDisableClick,
    allowShowMingoCreate = true,
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
  const didMountTimestamp = useRef(props.didMountTimestamp || Date.now());
  const newRecordContent = useRef(null);
  const cache = useRef({});
  const scrollViewRef = useRef(null);
  const recordContentRef = useRef(null);
  const promptCancelModalRef = useRef(null);
  const [shareVisible, setShareVisible] = useState();
  const [newTitle, setNewTitle] = useState(title);
  const [modalClassName] = useState(Math.random().toString().slice(2));
  const [abnormal, setAbnormal] = useState();
  const [autoFill, setAutoFill] = useState(advancedSetting.autoreserve === '1');
  const [loading, setLoading] = useState();
  const [draftTotal, setDraftTotal] = useState(() => Number(_.get(window, `draftTotalNumInfo[${worksheetId}]`)) || 0);
  const [promptCancelAddRecord, setPromptCancelAddRecord] = useState(
    localStorage.getItem('promptCancelAddRecord') === 'true',
  );
  const [modal, modalContextHolder] = Modal.useModal();
  const { open: openWorkSheetDraft, holder: workSheetDraftHolder } = useWorkSheetDraftModal();
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
    window.isWorksheet &&
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
      modal.confirm({
        title: <div className="breakAll">{confirmMsg}</div>,
        content: confirmContent,
        okText: (
          <div
            className="breakAll ellipsis"
            style={{
              maxWidth: 100,
            }}
          >
            {sureName}
          </div>
        ),
        cancelText: (
          <div
            className="InlineBlock ellipsis"
            style={{
              maxWidth: 100,
            }}
          >
            {cancelName}
          </div>
        ),
        onOk: () => {
          submit();
        },
      });
    },
    [cancelName, confirmContent, confirmMsg, modal, sureName],
  );

  const closePromptCancelAddRecordDialog = () => {
    promptCancelModalRef.current?.destroy();
    promptCancelModalRef.current = null;
  };

  const submitDraft = () => {
    if (window.isPublicApp) {
      alert(_l('预览模式下，不能操作'), 3);
      return;
    }

    closePromptCancelAddRecordDialog();
    newRecordContent.current.newRecord({
      autoFill,
      rowStatus: 21,
    });
  };

  const content = abnormal ? (
    <div className="textTertiary TxtCenter mTop80 pTop100">{_l('该表已删除或没有权限')}</div>
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
      <span className="continue TxtMiddle clearfix InlineBlock Left textTertiary">
        {continueAddVisible &&
          showFillNext &&
          advancedSetting.autoreserve !== '1' &&
          advancedSetting.autoFillVisible && (
            <Checkbox checked={autoFill} onChange={() => setAutoFill(!autoFill)}>
              {_l('继续创建时，保留本次提交内容')}
            </Checkbox>
          )}
      </span>
      <div className="flex" />
      {allowDraft && (
        <Button variant="outlined" className="ellipsis mRight12" loading={loading} onClick={submitDraft}>
          {_l('存草稿')}
        </Button>
      )}
      {continueAddVisible && (
        <Tooltip title={_l('提交后继续创建')} shortcut={window.isMacOs ? '⌘⇧↵' : 'Ctrl+Shift+Enter'}>
          <Button variant="outlined" className="ellipsis" loading={loading} onClick={submitNextCreate}>
            {advancedSetting.continueBtnText || _l('提交并继续创建')}
          </Button>
        </Tooltip>
      )}
      <Tooltip title={_l('提交')} shortcut={window.isMacOs ? '⌘S' : 'Ctrl+S'}>
        <Button color="var(--app-primary-color)" className="mLeft12 ellipsis" loading={loading} onClick={submitRecord}>
          {advancedSetting.submitBtnText || _l('提交')}
        </Button>
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
  const mingoCreateButton =
    showMingoCreate && canUseMingoOtherAssistant(worksheetInfo.projectId) ? (
      <BgIconButton
        className="mingoCreate"
        text={_l('AI 填写')}
        iconComponent={<img src={mingoCreateIcon} />}
        onClick={() => {
          hideNewRecord();
          window.mingoPendingStartTask = {
            type: MINGO_TASK_TYPE.CREATE_RECORD_ASSIGNMENT,
            base: {
              appId,
              worksheetId,
              projectId: worksheetInfo.projectId,
              worksheetInfo,
              defaultFormData: _.get(props, 'defaultFormData', {}),
              defaultFormDataEditable: _.get(props, 'defaultFormDataEditable', false),
              onAdd: props.onAdd,
            },
          };
          emitter.emit('SET_MINGO_VISIBLE');
        }}
      />
    ) : null;
  const iconButtons = [
    {
      type: 'draft',
      ele: (
        <BgIconButton
          style={{ width: draftTotal ? 48 : 32 }}
          iconComponent={
            <WorksheetDraft {...draftProps} openWorkSheetDraft={openWorkSheetDraft} onTotalChange={setDraftTotal} />
          }
        />
      ),
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

    if (showDraftList) {
      allowedTypes.push('draft');
    }

    if (showShare && !isEmbed && !md.global.Account.isPortal) {
      allowedTypes.push('share');
    }

    return iconButtons.filter(button => allowedTypes.includes(button.type));
  };

  const dialogProps = {
    title: <span className="Font20">{newTitle}</span>,
    styles: {
      header: { paddingBottom: 5, zIndex: 2 },
    },
    className: cx('workSheetNewRecord', className, modalClassName),
    wrapClassName: 'workSheetNewRecordWrap withSaveShortcut' + ` createTimestamp-${didMountTimestamp.current}`,
    type: 'fixed',
    verticalAlign: 'bottom',
    animated: false,
    width: browserIsMobile() ? window.innerWidth - 20 : 960,
    onCancel: event => {
      function handleClose() {
        closePromptCancelAddRecordDialog();
        onCloseDialog();
        hideNewRecord();
        removeTempRecordValueFromLocal('tempNewRecord', worksheetId);
      }

      if (promptCancelModalRef.current) {
        return;
      }

      if (cache.current.formChanged && !promptCancelAddRecord && allowDraft) {
        // 避免 Ant Design 的 Esc 监听继续处理同一次 keydown，关闭刚创建的确认框
        if (event?.key === 'Escape') {
          event.stopImmediatePropagation?.();
        }

        promptCancelModalRef.current = modal.confirm({
          width: 520,
          wrapClassName: 'promptCancelAddRecord',
          title: _l('是否将本次已填写内容保存为草稿？'),
          okText: _l('放弃'),
          onOk: handleClose,
          onCancel: () => {
            promptCancelModalRef.current = null;
          },
          footerLeftElement: (
            <Checkbox
              className="textSecondary hoverColorPrimary"
              value={promptCancelAddRecord}
              onChange={event => {
                const checked = event.target.checked;
                setPromptCancelAddRecord(checked);
                safeLocalStorageSetItem('promptCancelAddRecord', checked);
              }}
            >
              {_l('不再提示')}
            </Checkbox>
          ),
          footer: (_, { OkBtn }) => (
            <Fragment>
              {allowDraft && <Button onClick={submitDraft}>{_l('保存到草稿')}</Button>}
              <OkBtn />
            </Fragment>
          ),
        });
      } else {
        handleClose();
      }
    },
    footer,
    open: visible,
    headerRightElement: mingoCreateButton,
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
      if (window.richTextDialogIsActive) {
        return;
      }

      e.preventDefault();
      e.stopPropagation();
      const latestCreateTimestamp = getLatestCreateTimestampOfWithSaveShortcut();

      if (latestCreateTimestamp === didMountTimestamp.current) {
        !abnormal && setTimeout(() => submitRecord(), 50);
      }
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
          {modalContextHolder}
          {workSheetDraftHolder}
        </div>
      ) : (
        <BrowserRouter>
          <Modal {...dialogProps} allowScale>
            {content}
            {modalContextHolder}
            {workSheetDraftHolder}
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
