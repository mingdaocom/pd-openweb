import React, { useState, useRef, useEffect } from 'react';
import { useSetState } from 'react-use';
import styled from 'styled-components';
import { Checkbox, Icon, Dialog, Button, Input, Textarea, Tooltip } from 'ming-ui';
import { Select } from 'antd';
import copy from 'copy-to-clipboard';
import cx from 'classnames';
import _ from 'lodash';
import sshConfigApi from 'src/pages/integration/api/sshConfig';

const SSHCheckbox = styled(Checkbox)`
  margin-top: 12px;
  span {
    font-weight: bold;
    color: #757575;
  }
`;
const SaveButton = styled(Button)`
  margin-left: 16px;
  &.ming.Button--disabled,
  .ming.Button--disabled:hover {
    background: #93c4f1;
  }
`;
const CrackTextarea = styled(Textarea)`
  color: #9e9e9e;
  max-height: 100px !important;
`;

const CommonSelect = styled(Select)`
  width: 100%;
  font-size: 13px;
  .ant-select-selector {
    height: 36px !important;
    padding: 2px 11px !important;
    border-radius: 3px !important;
    border-color: #ccc !important;
    transition: 0;
    box-shadow: none !important;
    &:hover {
      border-color: #1e88e5 !important;
    }
  }
  &.ant-select-focused {
    .ant-select-selector {
      border-color: #1e88e5 !important;
    }
  }
  &.ant-select-disabled {
    .ant-select-selector {
      &:hover {
        border-color: #d9d9d9 !important;
      }
    }
  }
`;

const Wrapper = styled.div`
  padding-bottom: 24px;

  .ant-select-dropdown {
    .addItem {
      height: 32px;
      line-height: 32px;
      padding: 0 12px;
      cursor: pointer;
      color: rgba(0, 0, 0, 0.85);
      &:hover {
        color: #2196f3;
      }
    }
    .ant-select-item-empty {
      min-height: 0;
      padding: 0;
    }
  }

  .copyIcon {
    width: 50px;
    padding-top: 12px;
    text-align: center;
    .icon-copy {
      color: #757575;
      font-size: 16px;
      cursor: pointer;

      &:hover {
        color: #2196f3;
      }
    }
    &.isHide {
      display: none;
    }
  }
`;

const OptionItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;

  .itemWrapper {
    width: calc(100% - 60px);
  }

  .icon-delete1 {
    display: none;
    color: #757575;
    font-size: 16px;
    cursor: pointer;
    :hover {
      color: #f00;
    }
  }

  &:hover {
    .icon-delete1 {
      display: block;
    }
  }
`;

const EmptyMargin = styled.div`
  width: 16px;
`;

const DialogWrapper = styled.div`
  .fieldLabel,
  p {
    margin-bottom: 4px;
  }
  input {
    width: 100%;
  }

  .copyButton {
    color: #2196f3;
    cursor: pointer;
    margin-right: 8px;
    &.isHide {
      display: none;
    }
  }

  .errorInfo {
    background-color: rgba(244, 67, 54, 0.05);
    border-radius: 3px;
    padding: 8px 16px;
  }
`;

export default function SSHConnect(props) {
  const { data = {}, onChange, projectId, setSubmitDisabled, disabled } = props;
  const [sshOptions, setSshOptions] = useState([]);
  const sshSelectRef = useRef();
  const authTypeRef = useRef();
  const [addDialogVisible, setAddDialogVisible] = useState(false);
  const [errorInfo, setErrorInfo] = useState([]);
  const [sshFormData, setSshFormData] = useSetState({ authType: 0 });
  const [submitLoading, setSubmitLoading] = useState(false);

  useEffect(() => {
    sshConfigApi.list({ projectId }).then(res => {
      if (res) {
        setSshOptions(res.content);
      }
    });
  }, []);

  const onGenerateCrack = () => {
    sshConfigApi.genKeyPair({ projectId }).then(res => {
      if (res) {
        setSshFormData({ sshKeyPairId: res.id, sshPublicKey: res.publicKey });
      }
    });
  };

  const getSaveDisabled = () => {
    const requiredNotComplete = !sshFormData.sshHost || !sshFormData.sshPort || !sshFormData.sshUser;
    return sshFormData.authType === 0 ? requiredNotComplete || !sshFormData.sshPwd : requiredNotComplete;
  };

  const clearData = () => {
    setSshFormData({
      sshHost: null,
      sshPort: null,
      sshUser: null,
      sshPwd: null,
      remark: null,
      sshKeyPairId: null,
      sshPublicKey: null,
      authType: 0,
    });
    setErrorInfo([]);
    setSubmitLoading(false);
  };

  const onTestAndSave = () => {
    if (submitLoading) {
      return;
    }
    setSubmitLoading(true);

    sshConfigApi
      .addSshConfig({ projectId, ..._.omit(sshFormData, ['sshPublicKey']) })
      .then(res => {
        if (res.isSucceeded) {
          const newOption = [
            {
              id: res.id,
              ...sshFormData,
            },
          ];
          setSshOptions(newOption.concat(sshOptions));
          setAddDialogVisible(false);
          alert(_l('添加SSH连接成功'));
          clearData();
        } else {
          setErrorInfo(res.errorMsgList);
          setSubmitLoading(false);
        }
      })
      .fail(() => setSubmitLoading(false));
  };

  const onDelete = (e, option) => {
    e.stopPropagation();
    Dialog.confirm({
      title: _l('删除SSH连接'),
      description: _l('确认要删除该SSH连接吗？'),
      buttonType: 'danger',
      okText: _l('删除'),
      onOk: () => {
        sshConfigApi.deleteSshConfig({ projectId, sshConfigId: option.id }).then(res => {
          if (res.isSucceeded) {
            alert(_l('删除成功'));
            setSshOptions(sshOptions.filter(item => item.id !== option.id));
          } else {
            alert(res.errorMsg, 2);
          }
        });
      },
    });
  };

  const renderOptionItem = option => {
    return (
      <Select.Option value={option.id} label={`${option.sshUser}@${option.sshHost}:${option.sshPort}`}>
        <OptionItem>
          <div className="itemWrapper">
            <div className="overflow_ellipsis">{`${option.sshUser}@${option.sshHost}:${option.sshPort}`}</div>
            {option.remark && <div className="Gray_9e overflow_ellipsis">{option.remark}</div>}
          </div>
          <Tooltip text={_l('删除')}>
            <Icon icon="delete1" onClick={e => onDelete(e, option)} />
          </Tooltip>
        </OptionItem>
      </Select.Option>
    );
  };

  return (
    <Wrapper>
      <SSHCheckbox
        text={_l('使用SSH进行连接')}
        disabled={disabled}
        checked={!!data.enableSsh}
        onClick={() => {
          if (!!data.enableSsh) {
            onChange({ enableSsh: 0, sshConfigId: null });
          } else {
            onChange({ enableSsh: 1 });
          }
          setSubmitDisabled(true);
        }}
      />

      {!!data.enableSsh && (
        <div className="relative flexRow alignItemsCenter" ref={sshSelectRef}>
          <CommonSelect
            className="mTop12 flex"
            getPopupContainer={() => sshSelectRef.current}
            placeholder={_l('请选择')}
            notFoundContent={<div></div>}
            dropdownRender={menu => (
              <React.Fragment>
                <div className="addItem" onClick={() => setAddDialogVisible(true)}>
                  <Icon icon="add" />
                  <span>{_l('新建SSH连接')}</span>
                </div>
                {menu}
              </React.Fragment>
            )}
            optionLabelProp="label"
            value={data.sshConfigId}
            onChange={value => {
              onChange({ sshConfigId: value });
              setSubmitDisabled(true);
            }}
            disabled={disabled}
          >
            {sshOptions.map(option => renderOptionItem(option))}
          </CommonSelect>
          <div
            className={cx('copyIcon', {
              isHide: !(sshOptions.filter(o => o.id === data.sshConfigId)[0] || {}).sshPublicKey,
            })}
          >
            <Tooltip text={_l('复制公钥')}>
              <Icon
                icon="copy"
                onClick={e => {
                  const option = sshOptions.filter(o => o.id === data.sshConfigId)[0];
                  e.stopPropagation();
                  copy(option.sshPublicKey);
                  alert(_l('复制成功'));
                }}
              />
            </Tooltip>
          </div>
        </div>
      )}

      {addDialogVisible && (
        <Dialog
          visible
          width={640}
          title={_l('新增SSH连接')}
          footer={
            <SaveButton type="primary" disabled={getSaveDisabled()} loading={submitLoading} onClick={onTestAndSave}>
              {_l('测试并保存')}
            </SaveButton>
          }
          onCancel={() => {
            setAddDialogVisible(false);
            clearData();
          }}
        >
          <DialogWrapper>
            <div className="flexRow mBottom20 mTop20">
              <div className="flex">
                <div className="fieldLabel">
                  <span className="Red">*</span>
                  <span>{_l('SSH IP')}</span>
                </div>
                <Input value={sshFormData.sshHost || ''} onChange={value => setSshFormData({ sshHost: value })} />
              </div>
              <EmptyMargin />
              <div className="flex">
                <div className="fieldLabel">
                  <span className="Red">*</span>
                  <span>{_l('SSH 端口')}</span>
                </div>
                <Input value={sshFormData.sshPort || ''} onChange={value => setSshFormData({ sshPort: value })} />
              </div>
            </div>

            <div className="mBottom20">
              <div className="fieldLabel">
                <span className="Red">*</span>
                <span>{_l('SSH 账号')}</span>
              </div>
              <Input value={sshFormData.sshUser || ''} onChange={value => setSshFormData({ sshUser: value })} />
            </div>

            <div className="mBottom20" ref={authTypeRef}>
              <p>{_l('认证方式')}</p>
              <CommonSelect
                getPopupContainer={() => authTypeRef.current}
                placeholder={_l('请选择')}
                options={[
                  { label: _l('密码'), value: 0 },
                  { label: _l('公钥'), value: 1 },
                ]}
                value={sshFormData.authType}
                onChange={value => {
                  if (value === 1 && !sshFormData.sshPublicKey) {
                    onGenerateCrack();
                  }
                  setSshFormData({ authType: value });
                }}
              />
            </div>

            {sshFormData.authType === 0 ? (
              <div className="mBottom20">
                <p>{_l('SSH 密码')}</p>
                <Input value={sshFormData.sshPwd || ''} onChange={value => setSshFormData({ sshPwd: value })} />
              </div>
            ) : (
              <div className="mBottom20">
                <CrackTextarea disabled={true} value={sshFormData.sshPublicKey} />
                <p className="Gray_9e TxtRight">
                  <span
                    className={cx('copyButton', { isHide: !sshFormData.sshPublicKey })}
                    onClick={() => {
                      copy(sshFormData.sshPublicKey);
                      alert(_l('复制成功'));
                    }}
                  >
                    {_l('复制公钥')}
                  </span>
                  {_l('添加到SSH服务器的 authorized_keys 文件内')}
                </p>
              </div>
            )}

            <p>{_l('备注')}</p>
            <Input value={sshFormData.remark || ''} onChange={value => setSshFormData({ remark: value })} />

            {errorInfo.length > 0 && (
              <div className="errorInfo mTop15">
                {errorInfo.map((error, index) => {
                  return <div key={index} className="LineHeight24">{`${index + 1}. ${error}`}</div>;
                })}
              </div>
            )}
          </DialogWrapper>
        </Dialog>
      )}
    </Wrapper>
  );
}
