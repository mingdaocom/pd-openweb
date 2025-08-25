import React, { Fragment, useEffect, useRef } from 'react';
import { useSetState } from 'react-use';
import { Select } from 'antd';
import cx from 'classnames';
import _ from 'lodash';
import styled from 'styled-components';
import { Dialog, Icon, Menu, MenuItem, Textarea, VerifyPasswordInput } from 'ming-ui';
import verifyPassword from 'src/components/verifyPassword';

const SectionName = styled.div`
  font-size: 13px;
  color: #151515;
  font-weight: 500;
  margin: 18px 0 8px;
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
`;
const RemarkTextArea = styled(Textarea)`
  &::placeholder {
    color: #bfbfbf;
  }
`;
const SelectBox = styled(Select)`
  width: 100%;
  &.ant-select-focused {
    .ant-select-selector {
      border-color: #1e88e5 !important;
      box-shadow: none !important;
    }
  }
  .ant-select-selector {
    height: 36px !important;
    border-color: #ccc !important;
    border-radius: 4px !important;
    padding: 3px 10px !important;
    transition: none !important;
    .ant-select-selection-item {
      line-height: 28px !important;
    }
  }
  input {
    height: 34px !important;
  }
`;
const MenuBox = styled(Menu)`
  right: 0 !important;
  width: auto !important;
  margin-top: -1px;
  max-height: 250px;
  overflow-x: hidden;
  overflow-y: auto;
  .ming.Item {
    min-height: 36px !important;
    height: auto !important;
  }
  .Item-content {
    overflow: inherit !important;
    word-break: break-all !important;
    white-space: inherit !important;
    line-height: 20px !important;
    min-height: 36px;
    padding-top: 8px !important;
    padding-bottom: 8px !important;
    white-space: break-spaces !important;
  }
`;

export default function CustomButtonConfirm(props) {
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
    onOk,
    onClose,
    remarkoptions,
    remarktype,
    projectId,
  } = props;

  const getInit = () => {
    let remark = '';
    let list = (_.get(safeParse(remarkoptions), 'template') || []).filter(item => item.selected);
    if (list.length) {
      remark = list[0].value;
    }
    return remark;
  };
  const [
    { noVerify, needPassWord, checkIsPending, remark, showTemplateList, removeNoneVerification, password },
    setState,
  ] = useSetState({
    noVerify: false,
    needPassWord: false,
    checkIsPending: false,
    remark: getInit(),
    showTemplateList: false,
    removeNoneVerification: false,
  });
  const remarkRef = useRef();
  useEffect(() => {
    setState({ checkIsPending: true });
    verifyPassword({
      projectId,
      checkNeedAuth: true,
      success: () => {
        setState({ checkIsPending: false });
      },
      fail: result => {
        setState({ checkIsPending: false, needPassWord: true, removeNoneVerification: result === 'showPassword' });
      },
    });
    if (_.get(remarkRef, 'current.textarea') && !remarkoptions) {
      _.get(remarkRef, 'current.textarea').focus();
    }
  }, []);
  /**
   * 意见只能选择模板
   */
  const renderSelectTemplate = () => {
    const options = (_.get(safeParse(remarkoptions), 'template') || []).map(item => {
      return {
        value: item.value,
        label: item.value,
      };
    });
    let param = {
      placeholder: remarkHint,
    };
    if (remark) {
      param.defaultValue = remark;
    }
    return (
      <SelectBox
        showSearch
        allowClear
        suffixIcon={<Icon icon="arrow-down-border Font14" />}
        notFoundContent={<span className="Gray_9e">{_l('无匹配结果')}</span>}
        dropdownClassName="templateListSelect"
        onChange={value => setState({ remark: value })}
        onClear={() => setState({ remark: '' })}
        filterOption={(input, option) => option.label.toLowerCase().includes(input.toLowerCase())}
        options={options}
        {...param}
      />
    );
  };
  /**
   * 渲染审批意见列表
   */
  const renderTemplateList = () => {
    let list = (_.get(safeParse(remarkoptions), 'template') || []).filter(item => item.value.indexOf(remark) > -1);
    if (!showTemplateList || !list.length) {
      return null;
    }
    return (
      <MenuBox
        onClickAwayExceptions={['.customButtonConfirmDialog .Textarea']}
        onClickAway={() => setState({ showTemplateList: false })}
      >
        {list.map((item, index) => (
          <MenuItem key={index} onClick={() => setState({ remark: item.value, showTemplateList: false })}>
            {item.value}
          </MenuItem>
        ))}
      </MenuBox>
    );
  };
  return (
    <Dialog
      visible
      className="customButtonConfirm customButtonConfirmDialog"
      title={<b>{title}</b>}
      okText={okText}
      cancelText={cancelText}
      okDisabled={checkIsPending}
      onOk={() => {
        if (enableRemark && remarkRequired && !(remark || '').trim()) {
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
            isNoneVerification: noVerify,
            closeImageValidation: true,
            success: () => {
              onOk({ remark });
              onClose();
            },
          });
        } else {
          onOk({ remark });
          onClose();
        }
      }}
      onCancel={onClose}
    >
      {description && (
        <div className="Font14 Gray_75 mBottom10" style={{ marginTop: -10 }}>
          {description}
        </div>
      )}
      {verifyPwd && needPassWord && (
        <VerifyPasswordInput
          isRequired={true}
          allowNoVerify={!removeNoneVerification}
          onChange={({ password, isNoneVerification }) => setState({ password, noVerify: isNoneVerification })}
        />
      )}
      {enableRemark && (
        <Fragment>
          <SectionName className={cx({ required: remarkRequired })}>{remarkName || _l('备注')}</SectionName>
          <div className="Relative">
            {remarktype === '1' && !!safeParse(remarkoptions).template ? (
              renderSelectTemplate()
            ) : (
              <RemarkTextArea
                ref={remarkRef}
                minHeight={0}
                style={{ paddingTop: 9, paddingBottom: 9 }}
                maxHeight={240}
                value={remark}
                onChange={remark => setState({ remark })}
                onFocus={() => setState({ showTemplateList: true })}
                onBlue={() => setState({ showTemplateList: false })}
                placeholder={remarkHint}
              />
            )}
            {remarktype !== '1' && renderTemplateList()}
          </div>
        </Fragment>
      )}
    </Dialog>
  );
}
