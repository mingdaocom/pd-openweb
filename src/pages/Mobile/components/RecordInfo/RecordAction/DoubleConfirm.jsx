import React, { useEffect, useState } from 'react';
import { Popup } from 'antd-mobile';
import cx from 'classnames';
import _ from 'lodash';
import styled from 'styled-components';
import { Icon, VerifyPasswordInput } from 'ming-ui';
import { Button, Input } from 'ming-ui/antd-components';
import functionWrap from 'ming-ui/components/FunctionWrap';
import verifyPassword from 'ming-ui/functions/verifyPassword';
import { getVerifyValueError } from 'src/utils/domain/security/verification';

const REMARK_TEXTAREA_AUTO_SIZE = { minRows: 1 };

const ConfirmDialogWrap = styled(Popup)`
  .adm-popup-body {
    padding: 10px 20px 10px;
  }
  .remarkButton {
    box-sizing: border-box;
    border-radius: 3px;
    padding: 8px;
    font-size: 14px;
    width: 100%;
    border: 1px solid var(--color-border-secondary);
    min-height: 38px;
    max-height: 10000px;
  }
  .hap-input-affix-wrapper:focus,
  .hap-input-affix-wrapper-focused,
  .hap-input-affix-wrapper:not(.hap-input-affix-wrapper-disabled):hover {
    border: 1px solid var(--color-primary);
    box-shadow: none !important;
  }
  .hap-input-password-icon,
  .hap-input-password-icon:hover {
    color: var(--color-text-tertiary) !important;
  }
  .actionsWrap {
    margin-bottom: 10px;
    button {
      flex: 1;
    }
  }
`;
const SectionName = styled.div`
  font-size: 13px;
  color: var(--color-text-title);
  font-weight: 500;
  margin: 0px 0 10px;
  position: relative;
  &.required {
    &:before {
      position: absolute;
      left: -10px;
      top: 3px;
      color: var(--color-error);
      content: '*';
    }
  }
  .userMode {
    position: absolute;
    right: 0;
    top: 0;
    font-weight: 400;
    color: var(--color-primary);
  }
`;

const RemarkModeModal = styled(Popup)`
  .adm-popup-body {
    padding: 10px;
  }
  .searchWrap {
    background-color: var(--color-background-primary);
    border-radius: 3px;
    padding: 0 10px;
    height: 36px;
    border-radius: 18px;
    background-color: var(--color-background-secondary);
    input {
      height: 100%;
      background-color: var(--color-background-secondary);
      border: none;
      &:hover {
        border: none;
      }
    }
  }
  .modeItem {
    border-bottom: 1px solid var(--color-background-secondary);
    padding: 16px 8px 16px 0;
    margin-left: 6px;
    text-align: left;
  }
`;

function RemarkMode(props) {
  const { isFreeInput, remarkoptions, onClose, visible, setRemarkValue = () => {}, setIsInput = () => {} } = props;
  const list = _.get(safeParse(remarkoptions), 'template') || [];
  const [listData, setListData] = useState(list);

  return (
    <RemarkModeModal className="mobileModal full" onClose={onClose} visible={visible}>
      <div className="h100 flexColumn">
        <div className="searchWrap flexRow valignWrapper">
          <Icon icon="h5_search" className="textTertiary Font17" />
          <Input
            className="search"
            placeholder={_l('搜索')}
            onChange={e => {
              const temp = list.filter(it => _.includes(it.value, e.target.value));
              setListData(temp);
            }}
          />
        </div>
        {!isFreeInput && (
          <span
            className="Font13 colorPrimary modeItem"
            onClick={() => {
              setRemarkValue('');
              onClose();
            }}
          >
            {_l('清除选择')}
          </span>
        )}
        <div className="flex">
          {listData.map((item, index) => (
            <div
              key={index}
              className="modeItem textPrimary"
              onClick={() => {
                setRemarkValue(item.value);
                isFreeInput && setIsInput(true);
                onClose();
              }}
            >
              {item.value}
            </div>
          ))}
        </div>
        {isFreeInput && (
          <Button
            onClick={() => {
              setIsInput(true);
              onClose();
            }}
            type="primary"
            shape="round"
            block
          >
            {_l('自由输入')}
          </Button>
        )}
        {!isFreeInput && (
          <Button color="primary" variant="link" shape="round" block onClick={onClose}>
            {_l('取消')}
          </Button>
        )}
      </div>
    </RemarkModeModal>
  );
}

const getInitRemark = remarkoptions => {
  const list = _.get(safeParse(remarkoptions), 'template') || [];
  return _.get(_.filter(list, item => item.selected)[0], 'value');
};

function DoubleConfirm(props) {
  const {
    title,
    description,
    okText,
    cancelText,
    enableRemark,
    remarkName,
    remarkHint,
    remarkRequired,
    verifyPwd,
    enableConfirm,
    remarktype,
    remarkoptions,
    onOk,
    onClose,
    className,
    visible,
    projectId,
  } = props;

  const [remarkValue, setRemarkValue] = useState(getInitRemark(remarkoptions) || '');
  const [verifyInfo, setVerifyInfo] = useState({});
  const [isInput, setIsInput] = useState(false);
  const [remarkModeVisible, setRemarkModeVisible] = useState(false);
  const [showModeText, setShowModeText] = useState(false);
  const [needPassWord, setNeedPassWord] = useState(false);
  const [checkIsPending, setCheckIsPending] = useState(!!verifyPwd);
  const [removeNoneVerification, setRemoveNoneVerification] = useState(false);
  const template = _.get(safeParse(remarkoptions), 'template') || [];

  useEffect(() => {
    if (verifyPwd) {
      verifyPassword({
        projectId,
        checkNeedAuth: true,
        success: () => {
          setCheckIsPending(false);
        },
        fail: result => {
          setCheckIsPending(false);
          setNeedPassWord(true);
          setRemoveNoneVerification(result === 'showPassword');
        },
      });
    }
  }, [projectId, verifyPwd]);
  const isFreeInput = remarktype !== '1';

  return (
    <ConfirmDialogWrap className={cx('mobileModal topRadius', className)} onClose={onClose} visible={visible}>
      <div
        className={cx('textPrimary Font17 mBottom12 bold', { mBottom24: !description && !enableRemark && !verifyPwd })}
      >
        {enableConfirm ? title : _l('安全验证')}
      </div>
      {description && (
        <div className="textTertiary Font14 mBottom12" style={{ marginTop: -10 }}>
          {description}
        </div>
      )}
      {verifyPwd && needPassWord && (
        <VerifyPasswordInput
          className="mBottom20"
          showSubTitle={false}
          autoFocus={false}
          isRequired={false}
          showVerifyType={true}
          allowNoVerify={!removeNoneVerification}
          onChange={setVerifyInfo}
        />
      )}
      {enableRemark && (
        <div className="remarkWrap">
          <SectionName className={cx({ required: remarkRequired })}>
            {remarkName || _l('备注')}
            {isFreeInput && showModeText && !_.isEmpty(template) && (
              <div className="userMode" onClick={() => setRemarkModeVisible(true)}>
                {_l('使用模板')}
              </div>
            )}
          </SectionName>
          {isInput || !remarkoptions || (isFreeInput && _.isEmpty(template)) ? (
            <Input.TextArea
              autoSize={REMARK_TEXTAREA_AUTO_SIZE}
              size="large"
              placeholder={remarkHint || ''}
              className="mBottom24 textPrimary"
              onChange={event => setRemarkValue(event.target.value)}
              value={remarkValue}
            />
          ) : (
            <div className="remarkButton mBottom24 flexRow" onClick={() => setRemarkModeVisible(true)}>
              <div className={cx('flex ellipsis', { textDisabled: !remarkValue, textPrimary: remarkValue })}>
                {remarkValue ? remarkValue : remarkHint}
              </div>
              {(!isFreeInput || (isFreeInput && !remarkValue)) && <Icon icon="arrow-right-border" className="mTop3" />}
            </div>
          )}
        </div>
      )}

      <div className="actionsWrap flexRow">
        <Button
          color="default"
          variant="outlined"
          shape="round"
          onClick={onClose}
          className="textSecondary Font14 mRight10"
        >
          {cancelText || _l('取消')}
        </Button>
        <Button
          type="primary"
          shape="round"
          loading={checkIsPending}
          onClick={() => {
            if (enableRemark && remarkRequired && !remarkValue.trim()) {
              alert(_l('%0不能为空', remarkName), 3);
              return;
            }

            if (verifyPwd && needPassWord) {
              const error = getVerifyValueError(verifyInfo);

              if (error) {
                alert(error, 3);
                return;
              }

              verifyPassword({
                projectId,
                ...verifyInfo,
                showVerifyType: true,
                closeImageValidation: true,
                success: () => {
                  onOk(enableRemark ? { remark: remarkValue } : {});
                  onClose();
                },
              });
            } else {
              onOk(enableRemark ? { remark: remarkValue } : {});
              onClose();
            }
          }}
          className="Font14"
        >
          {okText || _l('确认')}
        </Button>
      </div>
      {remarkModeVisible && (
        <RemarkMode
          visible={remarkModeVisible}
          onClose={() => setRemarkModeVisible(false)}
          remarkoptions={remarkoptions}
          setRemarkValue={val => {
            setRemarkValue(val);
            setShowModeText(true);
          }}
          setIsInput={val => {
            setIsInput(val);
            setShowModeText(true);
          }}
          isFreeInput={isFreeInput}
        />
      )}
    </ConfirmDialogWrap>
  );
}

export const doubleConfirmFunc = props => functionWrap(DoubleConfirm, props);
