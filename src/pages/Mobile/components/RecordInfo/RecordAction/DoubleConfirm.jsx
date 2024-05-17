import React, { useState, useEffect } from 'react';
import { Modal } from 'antd-mobile';
import { Input } from 'antd';
import { Button, Textarea, Icon, Checkbox, VerifyPasswordInput } from 'ming-ui';

import functionWrap from 'ming-ui/components/FunctionWrap';
import { verifyPassword } from 'src/util';
import styled from 'styled-components';
import cx from 'classnames';

const ConfirmDialogWrap = styled(Modal)`
  .am-modal-content {
    border-top-right-radius: 15px;
    border-top-left-radius: 15px;
    padding: 0;
    padding-top: 10px;
  }
  .am-modal-body {
    text-align: left;
    overflow: auto;
    max-height: calc(100vh - 30px);
    padding: 10px 20px 10px;
  }
  .remarkButton {
    box-sizing: border-box;
    border-radius: 3px;
    padding: 8px;
    font-size: 14px;
    width: 100%;
    border: 1px solid #e6e6e6;
    min-height: 38px;
    max-height: 10000px;
  }
  .ming.Textarea {
    padding: 8px;
    border: 1px solid #e6e6e6;
    min-height: 39px !important;
  }
  .ming.Textarea:hover:not(:disabled),
  .ming.Textarea:focus,
  .ant-input-affix-wrapper:focus,
  .ant-input-affix-wrapper-focused,
  .ant-input-affix-wrapper:not(.ant-input-affix-wrapper-disabled):hover {
    border: 1px solid #e6e6e6;
    box-shadow: none !important;
  }
  .ant-input-password-icon,
  .ant-input-password-icon:hover {
    color: #9e9e9e !important;
  }
  .ming.Textarea::-webkit-input-placeholder {
    color: #bdbdbd;
  }
  .actionsWrap {
    margin-bottom: 10px;
    .ming.Button {
      height: 36px;
      line-height: 36px;
      flex: 1;
      border-radius: 18px;
    }
    .ming.Button--link {
      border: 1px solid #ddd;
    }
    .ming.Button--primary {
      background: #2196f3;
    }
    .ming.Button--primary:hover {
      background: #2196f3;
    }
  }
`;
const SectionName = styled.div`
  font-size: 13px;
  color: #333;
  font-weight: 500;
  margin: 0px 0 10px;
  position: relative;
  &.required {
    &:before {
      position: absolute;
      left: -10px;
      top: 3px;
      color: red;
      content: '*';
    }
  }
  .userMode {
    position: absolute;
    right: 0;
    top: 0;
    font-weight: 400;
    color: #2196f3;
  }
`;

const RemarkModeModal = styled(Modal)`
  height: 100%;
  border-top-right-radius: 0;
  border-top-left-radius: 0;
  .am-modal-body {
    padding: 10px;
  }
  .searchWrap {
    background-color: #fff;
    border-radius: 3px;
    padding: 0 10px;
    height: 36px;
    border-radius: 18px;
    background-color: #f5f5f5;
    input {
      height: 100%;
      background-color: #f5f5f5;
      border: none;
      &:hover {
        border: none;
      }
    }
    .ant-input:focus,
    .ant-input-focused {
      border: none;
      box-shadow: unset !important;
    }
  }
  .modeItem {
    border-bottom: 1px solid #f5f5f5;
    padding: 16px 8px 16px 0;
    margin-left: 6px;
    text-align: left;
  }
  .ming.Button {
    width: 100%;
    height: 36px;
    line-height: 36px;
    border-radius: 18px;
  }
  .ming.Button--link {
    border: 1px solid #ddd;
  }
  .ming.Button--primary {
    background: #2196f3;
  }
  .ming.Button--primary:hover {
    background: #2196f3;
  }
`;

const User = styled.div`
  height: 36px;
  background: #f5f5f5;
  border-radius: 3px;
  border: 1px solid #ddd;
  padding: 0 10px;
`;

function RemarkMode(props) {
  const {
    className,
    isFreeInput,
    remarkoptions,
    onClose,
    visible,
    setRemarkValue = () => {},
    setIsInput = () => {},
  } = props;
  const list = _.get(safeParse(remarkoptions), 'template') || [];
  const [listData, setListData] = useState(list);

  return (
    <RemarkModeModal className="full" popup animationType="slide-up" onClose={onClose} visible={visible}>
      <div className="h100 flexColumn">
        <div className="searchWrap flexRow valignWrapper">
          <Icon icon="h5_search" className="Gray_9e Font17" />
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
            className="Font13 ThemeColor modeItem"
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
              className="modeItem Gray"
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
            className="w100"
          >
            {_l('自由输入')}
          </Button>
        )}
        {!isFreeInput && (
          <Button onClick={onClose} type="link" className="w100">
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
  const [password, setPassword] = useState('');
  const [isInput, setIsInput] = useState(false);
  const [remarkModeVisible, setRemarkModeVisible] = useState(false);
  const [showModeText, setShowModeText] = useState(false);
  const [isNoneVerification, setIsNoneVerification] = useState(false);
  const [needPassWord, setNeedPassWord] = useState(false);
  const [checkIsPending, setCheckIsPending] = useState(false);
  const [removeNoneVerification, setRemoveNoneVerification] = useState(false);
  const template = _.get(safeParse(remarkoptions), 'template') || [];

  useEffect(() => {
    setCheckIsPending(true);
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
  }, []);
  const isFreeInput = remarktype !== '1';

  return (
    <ConfirmDialogWrap popup animationType="slide-up" className={className} onClose={onClose} visible={visible}>
      <div className={cx('Gray Font17 mBottom12 bold', { mBottom24: !description && !enableRemark && !verifyPwd })}>
        {enableConfirm ? title : _l('安全验证')}
      </div>

      {verifyPwd && needPassWord && (
        <VerifyPasswordInput
          className="mBottom25"
          showSubTitle={false}
          autoFocus={false}
          isRequired={false}
          allowNoVerify={!removeNoneVerification}
          onChange={({ password, isNoneVerification }) => {
            setPassword(password);
            setIsNoneVerification(isNoneVerification);
          }}
        />
      )}

      {description && <div className="Gray_9e Font14 mBottom12">{description}</div>}
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
            <Textarea
              placeholder={remarkHint || ''}
              className="mBottom24 Gray"
              onChange={val => setRemarkValue(val)}
              value={remarkValue}
            />
          ) : (
            <div className="remarkButton mBottom24 flexRow" onClick={() => setRemarkModeVisible(true)}>
              <div className={cx('flex ellipsis', { Gray_bd: !remarkValue, Gray: remarkValue })}>
                {remarkValue ? remarkValue : remarkHint}
              </div>
              {(!isFreeInput || (isFreeInput && !remarkValue)) && <Icon icon="arrow-right-border" className="mTop3" />}
            </div>
          )}
        </div>
      )}

      <div className="actionsWrap flexRow">
        <Button type="link" onClick={onClose} className="Gray_75 Font14 mRight10">
          {cancelText || _l('取消')}
        </Button>
        <Button
          type="primary"
          disabled={checkIsPending}
          onClick={() => {
            if (enableRemark && remarkRequired && !remarkValue.trim()) {
              alert(_l('%0不能为空', remarkName), 3);
              return;
            }
            if (verifyPwd && needPassWord) {
              if (!password || !password.trim()) {
                alert(_l('请输入密码'), 3);
                return;
              }
              verifyPassword({
                projectId,
                password,
                isNoneVerification,
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
