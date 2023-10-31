import React, { Fragment, useRef, useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import cx from 'classnames';
import styled from 'styled-components';
import { Flex, Modal, WingBlank, Button, ActionSheet } from 'antd-mobile';
import { ScrollView, LoadDiv } from 'ming-ui';
import { removeTempRecordValueFromLocal } from 'worksheet/util';
import NewRecordContent from './NewRecordContent';
import AdvancedSettingHandler from './AdvancedSettingHandler';
import MobileDraft from 'src/pages/Mobile/MobileDraft';

const ModalWrap = styled(Modal)`
  height: 95%;
  overflow: hidden;
  border-top-right-radius: 15px;
  border-top-left-radius: 15px;
  &.full {
    height: 100%;
    border-top-right-radius: 0;
    border-top-left-radius: 0;
  }
  .mobileContainer {
    padding-top: 25px;
  }
`;

const BtnsWrap = styled.div`
  height: 50px;
  background-color: #fff;
  padding: 0 10px;
  box-sizing: border-box;

  &.confirm {
    border: none;
    padding: 0;
    position: relative;
    bottom: -10px;
  }
  .flexRow {
    justify-content: flex-end;
  }
  .am-wingblank {
    overflow: hidden;
  }
  .am-button {
    height: 36px;
    line-height: 36px;
    padding: 0 10px;
  }
  .am-button-primary:hover {
    color: #fff;
  }
  .am-button,
  .am-button::before,
  .am-button-active::before {
    border-radius: 50px !important;
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

export function MobileRecordRecoverConfirm(props) {
  const { title, cancelText, updateText, visible, onCancel, onUpdate } = props;
  return (
    <ModalWrap popup animationType="slide-up" onClose={onUpdate} visible={visible} style={{ height: 130 }}>
      <div className="flexColumn h100">
        <Flex align="center" className="Font17 Gray bold pLeft15 pRight15 mTop24 mBottom32">
          {title}
        </Flex>
        <BtnsWrap className="footerBox valignWrapper flexRow" style={{ border: 'none' }}>
          <WingBlank className="flex" size="sm">
            <Button className="Font13 bold Gray_75" onClick={onCancel}>
              {cancelText}
            </Button>
          </WingBlank>
          <WingBlank className="flex" size="sm">
            <Button className="Font13 bold" type="primary" onClick={onUpdate}>
              {updateText}
            </Button>
          </WingBlank>
        </BtnsWrap>
      </div>
    </ModalWrap>
  );
}

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
    ...rest
  } = props;
  const { appId, viewId, worksheetInfo } = rest;
  const newRecordContent = useRef(null);
  const [loading, setLoading] = useState();
  const [autoFill, setAutoFill] = useState(null);

  useEffect(() => {
    const cancel = () => {
      const setRestoreVisible = _.get(newRecordContent.current, 'setRestoreVisible');
      hideNewRecord();
      setRestoreVisible && setRestoreVisible(false);
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

  const showActionSheetWithOptions = (retain, noretain) => {
    ActionSheet.showActionSheetWithOptions({
      options: [],
      message: (
        <Fragment>
          <div className="Font17 Gray bold pTop10 mBottom32 TxtLeft">{_l('继续创建时，是否保留本次提交内容 ?')}</div>
          <BtnsWrap className="valignWrapper flexRow confirm">
            <WingBlank className="flex" size="sm">
              <Button
                className="Font13 bold Gray_75"
                onClick={() => {
                  setAutoFill(false);
                  noretain();
                  ActionSheet.close();
                }}
              >
                {_l('不保留')}
              </Button>
            </WingBlank>
            <WingBlank className="flex" size="sm">
              <Button
                className="Font13 bold"
                type="primary"
                onClick={() => {
                  setAutoFill(true);
                  retain();
                  ActionSheet.close();
                }}
              >
                {_l('保留')}
              </Button>
            </WingBlank>
          </BtnsWrap>
        </Fragment>
      ),
    });
  };
  const header = (
    <div className="flexRow valignWrapper pTop15 pLeft20 pRight20 pBottom8">
      <div className="title Font18 Gray flex bold leftAlign ellipsis">
        {advancedSetting.title || props.title || (props.entityName && _l('创建%0', props.entityName))}
      </div>
      {visible && advancedSetting.closedrafts !== '1' && showDraftsEntry && (
        <MobileDraft
          appId={appId}
          worksheetId={props.worksheetId || worksheetInfo.worksheetId}
          controls={_.get(worksheetInfo, 'template.controls')}
          worksheetInfo={worksheetInfo}
          sheetSwitchPermit={sheetSwitchPermit}
        />
      )}
      <i
        className="icon icon-closeelement-bg-circle Gray_9e Font22"
        onClick={() => {
          hideNewRecord();
          removeTempRecordValueFromLocal('tempNewRecord', props.worksheetId);
        }}
      ></i>
    </div>
  );
  const content = (
    <NewRecordContent
      registerFunc={funcs => (newRecordContent.current = funcs)}
      {...rest}
      notDialog={notDialog}
      advancedSetting={advancedSetting}
      continueCheck={false}
      showTitle={false}
      autoFill={autoFill}
      onCancel={hideNewRecord}
      from={5}
      onSubmitBegin={() => setLoading(true)}
      onSubmitEnd={() => setLoading(false)}
      viewId=""
    />
  );

  const footer = (
    <BtnsWrap className="footerBox valignWrapper flexRow">
      {advancedSetting.closedrafts !== '1' && (
        <WingBlank className="flexColumn TxtCenter" size="sm">
          <div
            onClick={() => {
              newRecordContent.current.newRecord({
                autoFill,
                rowStatus: 21,
              });
            }}
          >
            <i className="icon-drafts_approval Font20 Gray_9e "></i>
            <div className="Font12 bold Gray_9e">{_l('存草稿')}</div>
          </div>
        </WingBlank>
      )}
      {advancedSetting.continueBtnVisible && (
        <WingBlank className="flex" size="sm">
          <Button
            className="Font13 bold Gray_75"
            onClick={() => {
              if (advancedSetting.autoFillVisible && advancedSetting.continueEndAction === 2 && _.isNull(autoFill)) {
                const retain = () => {
                  newRecordContent.current.newRecord({
                    isContinue: true,
                    autoFill: true,
                    actionType: advancedSetting.continueEndAction,
                  });
                };
                const noretain = () => {
                  newRecordContent.current.newRecord({
                    isContinue: true,
                    autoFill: false,
                    actionType: advancedSetting.continueEndAction,
                  });
                };
                showActionSheetWithOptions(retain, noretain);
              } else {
                newRecordContent.current.newRecord({
                  isContinue: true,
                  autoFill,
                  actionType: advancedSetting.continueEndAction,
                });
              }
            }}
          >
            {advancedSetting.continueBtnText || _l('提交并继续创建')}
          </Button>
        </WingBlank>
      )}
      <WingBlank className="flex" size="sm">
        <Button
          className="Font13 bold"
          type="primary"
          onClick={async () => {
            if (customButtonConfirm) {
              try {
                await customButtonConfirm();
              } catch (err) {
                return;
              }
            }
            if (advancedSetting.autoFillVisible && advancedSetting.submitEndAction === 2 && _.isNull(autoFill)) {
              const retain = () => {
                newRecordContent.current.newRecord({
                  autoFill: true,
                  actionType: advancedSetting.submitEndAction,
                });
              };
              const noretain = () => {
                newRecordContent.current.newRecord({
                  autoFill: true,
                  actionType: advancedSetting.submitEndAction,
                });
              };
              showActionSheetWithOptions(retain, noretain);
            } else {
              newRecordContent.current.newRecord({
                autoFill,
                actionType: advancedSetting.submitEndAction,
              });
            }
          }}
        >
          {advancedSetting.submitBtnText || _l('提交')}
        </Button>
      </WingBlank>
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
        <ScrollView className="flex">
          <div className="pAll20 pTop0 h100">{content}</div>
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
        popup
        animationType="slide-up"
        className={cx('MobileNewRecordModal', className)}
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
