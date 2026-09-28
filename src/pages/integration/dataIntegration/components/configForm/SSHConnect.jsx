import React, { useEffect, useRef, useState } from 'react';
import { useSetState } from 'react-use';
import cx from 'classnames';
import copy from 'copy-to-clipboard';
import _ from 'lodash';
import styled from 'styled-components';
import { Icon } from 'ming-ui';
import { Checkbox, Input, Modal, Select, Tooltip } from 'ming-ui/antd-components';
import { getSensitiveRequestErrorMessages } from '../../services/sensitiveRequest';
import sshConfigApi from '../../services/sshConfig';

const PUBLIC_KEY_TEXTAREA_AUTO_SIZE = { minRows: 4, maxRows: 4 };

const SSHCheckbox = styled(Checkbox)`
  margin-top: 12px;
  span {
    font-weight: bold;
    color: var(--color-text-secondary);
  }
`;
const SSH_CHECKBOX_STYLES = { label: { paddingInlineEnd: 0 } };

const CommonSelect = styled(Select)`
  width: 100%;
  font-size: 13px;
`;

const Wrapper = styled.div`
  padding-bottom: 24px;

  .hap-select-dropdown {
    .addItem {
      height: 32px;
      line-height: 32px;
      padding: 0 12px;
      cursor: pointer;
      color: rgba(0, 0, 0, 0.85);
      &:hover {
        color: var(--color-primary);
      }
    }
    .hap-select-item-empty {
      min-height: 0;
      padding: 0;
    }
  }

  .copyIcon {
    width: 50px;
    padding-top: 12px;
    text-align: center;
    .icon-copy {
      color: var(--color-text-secondary);
      font-size: 16px;
      cursor: pointer;

      &:hover {
        color: var(--color-primary);
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

  .icon-trash {
    display: none;
    color: var(--color-text-secondary);
    font-size: 16px;
    cursor: pointer;
    &:hover {
      color: #f00;
    }
  }

  &:hover {
    .icon-trash {
      display: block;
    }
  }
`;

const EmptyMargin = styled.div`
  width: 16px;
`;

const DialogWrapper = styled.div`
  border: 0;
  margin: 0;
  padding: 0;
  min-width: 0;
  .fieldLabel,
  p {
    margin-bottom: 4px;
  }
  input {
    width: 100%;
  }

  .copyButton {
    color: var(--color-primary);
    cursor: pointer;
    margin-right: 8px;
    &.isHide {
      display: none;
    }
  }

  .errorInfo {
    background-color: var(--color-error-bg);
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
  const saveRequest = useRef(null);

  useEffect(
    () => () => {
      saveRequest.current?.abort();
      saveRequest.current = null;
    },
    [],
  );

  useEffect(() => {
    sshConfigApi.list({ projectId }).then(res => {
      if (res) {
        setSshOptions(res.content);
      }
    });
  }, [projectId]);

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
    saveRequest.current?.abort();
    saveRequest.current = null;
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

  const onTestAndSave = async () => {
    if (saveRequest.current) {
      return;
    }

    const controller = new AbortController();
    saveRequest.current = controller;
    setSubmitLoading(true);
    setErrorInfo([]);

    try {
      const res = await sshConfigApi.addSshConfig(
        { projectId, ..._.omit(sshFormData, ['sshPublicKey']) },
        { abortController: controller },
      );
      if (controller.signal.aborted) return;
      if (res.isSucceeded) {
        const newOption = [
          {
            id: res.id,
            ..._.omit(sshFormData, ['sshPwd']),
          },
        ];
        setSshOptions(options => newOption.concat(options));
        setAddDialogVisible(false);
        alert(_l('添加SSH连接成功'));
        clearData();
      } else {
        setErrorInfo(res.errorMsgList || [_l('添加SSH连接失败')]);
      }
    } catch (error) {
      if (!controller.signal.aborted) {
        setErrorInfo(getSensitiveRequestErrorMessages(error, _l('添加SSH连接失败')));
      }
    } finally {
      if (saveRequest.current === controller) {
        saveRequest.current = null;
        setSubmitLoading(false);
      }
    }
  };

  const onDelete = (e, option) => {
    e.stopPropagation();
    Modal.confirm({
      title: <span className="textError">{_l('删除SSH连接')}</span>,
      content: _l('确认要删除该SSH连接吗？'),
      okButtonProps: {
        danger: true,
      },
      okText: _l('删除'),
      onOk: () => {
        sshConfigApi
          .deleteSshConfig({
            projectId,
            sshConfigId: option.id,
          })
          .then(res => {
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

  const getOptionLabel = option => `${option.sshUser}@${option.sshHost}:${option.sshPort}`;

  const renderOptionItem = option => {
    return (
      <OptionItem>
        <div className="itemWrapper">
          <div className="overflow_ellipsis">{getOptionLabel(option)}</div>
          {option.remark && <div className="textTertiary overflow_ellipsis">{option.remark}</div>}
        </div>
        <Tooltip title={_l('删除')}>
          <Icon icon="trash" onClick={e => onDelete(e, option)} />
        </Tooltip>
      </OptionItem>
    );
  };

  return (
    <Wrapper>
      <SSHCheckbox
        disabled={disabled}
        checked={!!data.enableSsh}
        styles={SSH_CHECKBOX_STYLES}
        onChange={event => {
          if (event.target.checked) {
            onChange({ enableSsh: 1 });
          } else {
            onChange({ enableSsh: 0, sshConfigId: null });
          }

          setSubmitDisabled(true);
        }}
      >
        {_l('使用SSH进行连接')}
      </SSHCheckbox>

      {!!data.enableSsh && (
        <div className="relative flexRow alignItemsCenter" ref={sshSelectRef}>
          <CommonSelect
            className="mTop12 flex"
            getPopupContainer={() => sshSelectRef.current}
            placeholder={_l('请选择')}
            notFoundContent={<div></div>}
            popupRender={menu => (
              <React.Fragment>
                <div className="addItem" onClick={() => setAddDialogVisible(true)}>
                  <Icon icon="add" />
                  <span>{_l('新建SSH连接')}</span>
                </div>
                {menu}
              </React.Fragment>
            )}
            optionLabelProp="label"
            options={sshOptions.map(option => ({
              value: option.id,
              label: getOptionLabel(option),
              option,
            }))}
            optionRender={({ data }) => renderOptionItem(data.option)}
            value={data.sshConfigId}
            onChange={value => {
              onChange({ sshConfigId: value });
              setSubmitDisabled(true);
            }}
            disabled={disabled}
          />
          <div
            className={cx('copyIcon', {
              isHide: !(sshOptions.filter(o => o.id === data.sshConfigId)[0] || {}).sshPublicKey,
            })}
          >
            <Tooltip title={_l('复制公钥')}>
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
        <Modal
          open
          mask={{ closable: true }}
          keyboard
          width={640}
          title={_l('新增SSH连接')}
          cancelButtonProps={{ style: { display: 'none' } }}
          okText={_l('测试并保存')}
          okDisabled={getSaveDisabled()}
          okButtonProps={{ loading: submitLoading }}
          onOk={onTestAndSave}
          onCancel={() => {
            setAddDialogVisible(false);
            clearData();
          }}
        >
          <DialogWrapper as="fieldset" disabled={submitLoading}>
            <div className="flexRow mBottom20 mTop20">
              <div className="flex">
                <div className="fieldLabel">
                  <span className="Red">*</span>
                  <span>{_l('SSH IP')}</span>
                </div>
                <Input
                  value={sshFormData.sshHost || ''}
                  onChange={event => setSshFormData({ sshHost: event.target.value })}
                />
              </div>
              <EmptyMargin />
              <div className="flex">
                <div className="fieldLabel">
                  <span className="Red">*</span>
                  <span>{_l('SSH 端口')}</span>
                </div>
                <Input
                  value={sshFormData.sshPort || ''}
                  onChange={event => setSshFormData({ sshPort: event.target.value })}
                />
              </div>
            </div>

            <div className="mBottom20">
              <div className="fieldLabel">
                <span className="Red">*</span>
                <span>{_l('SSH 账号')}</span>
              </div>
              <Input
                value={sshFormData.sshUser || ''}
                onChange={event => setSshFormData({ sshUser: event.target.value })}
              />
            </div>

            <div className="mBottom20" ref={authTypeRef}>
              <p>{_l('认证方式')}</p>
              <CommonSelect
                getPopupContainer={() => authTypeRef.current}
                disabled={submitLoading}
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
                <Input
                  value={sshFormData.sshPwd || ''}
                  onChange={event => setSshFormData({ sshPwd: event.target.value })}
                />
              </div>
            ) : (
              <div className="mBottom20">
                <Input.TextArea autoSize={PUBLIC_KEY_TEXTAREA_AUTO_SIZE} disabled value={sshFormData.sshPublicKey} />
                <p className="textTertiary TxtRight">
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
            <Input
              value={sshFormData.remark || ''}
              onChange={event => setSshFormData({ remark: event.target.value })}
            />

            {errorInfo.length > 0 && (
              <div className="errorInfo mTop15">
                {errorInfo.map((error, index) => {
                  return <div key={index} className="LineHeight24">{`${index + 1}. ${error}`}</div>;
                })}
              </div>
            )}
          </DialogWrapper>
        </Modal>
      )}
    </Wrapper>
  );
}
