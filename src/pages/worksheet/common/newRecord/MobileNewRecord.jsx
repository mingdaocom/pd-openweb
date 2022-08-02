import React, { Fragment, useRef, useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import cx from 'classnames';
import styled from 'styled-components';
import { Modal, WingBlank, Button, ActionSheet } from 'antd-mobile';
import { ScrollView, LoadDiv } from 'ming-ui';
import NewRecordContent from './NewRecordContent';
import AdvancedSettingHandler from './AdvancedSettingHandler';

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
  border-top: 1px solid #f5f5f5;
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

function NewRecord(props) {
  const { visible, className, hideNewRecord = _.noop, notDialog, advancedSetting = {}, ...rest } = props;
  const newRecordContent = useRef(null);
  const [loading, setLoading] = useState();
  const [autoFill, setAutoFill] = useState(null);

  useEffect(() => {
    if (!notDialog) {
      window.addEventListener('popstate', hideNewRecord, false);
    }
    return () => {
      if (!notDialog) {
        window.removeEventListener('popstate', hideNewRecord, false);
      }
    }
  }, []);

  const showActionSheetWithOptions = (retain, noretain) => {
    ActionSheet.showActionSheetWithOptions({
      options: [],
      message: (
        <Fragment>
          <div className="Font17 Gray bold mBottom5 TxtLeft">{_l('继续创建时，是否保留本次提交内容 ?')}</div>
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
      <i className="icon icon-closeelement-bg-circle Gray_9e Font22" onClick={hideNewRecord}></i>
    </div>
  );
  const content = (
    <NewRecordContent
      registerFunc={funcs => (newRecordContent.current = funcs)}
      {...rest}
      advancedSetting={advancedSetting}
      continueCheck={false}
      showTitle={false}
      autoFill={autoFill}
      onCancel={hideNewRecord}
      from={5}
      onSubmitBegin={() => setLoading(true)}
      onSubmitEnd={() => setLoading(false)}
    />
  );

  const footer = (
    <BtnsWrap className="footerBox valignWrapper flexRow">
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
          onClick={() => {
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
      <ModalWrap popup animationType="slide-up" className={className} onClose={hideNewRecord} visible={visible}>
        {contentWrap}
      </ModalWrap>
    );
  }
}

NewRecord.propTypes = {
  notDialog: PropTypes.bool,
};

export default AdvancedSettingHandler(NewRecord);
