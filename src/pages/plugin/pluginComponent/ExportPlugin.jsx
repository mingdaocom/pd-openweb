import React, { useState } from 'react';
import { useSetState } from 'react-use';
import copy from 'copy-to-clipboard';
import moment from 'moment';
import styled from 'styled-components';
import { Icon } from 'ming-ui';
import { Checkbox, DatePicker, Input, Modal, Tooltip } from 'ming-ui/antd-components';
import useFunctionWrapComponent from 'ming-ui/hooks/useFunctionWrapComponent';
import { generateRandomPassword } from 'src/utils/core/string';
import { API_EXTENDS, pluginApiConfig } from '../config';

const FormItem = styled.div`
  margin-bottom: 16px;
  .labelText {
    display: flex;
    align-items: center;
    color: var(--color-text-secondary);
    margin-bottom: 8px;
    .requiredStar {
      color: var(--color-error);
      margin-left: 4px;
      font-weight: bold;
    }
    i {
      font-size: 14px;
      color: var(--color-text-disabled);
      margin-left: 8px;
    }
  }
  input {
    width: 100%;
  }
  .pwdOperate {
    min-width: 82px;
  }
  .error {
    color: var(--color-error);
    margin-top: 5px;
  }

  .hap-picker {
    width: 100%;
    height: 36px;
    transition: none;
    border-color: var(--color-border-tertiary);
    border-radius: 3px;
    box-shadow: none;
    .hap-picker-input {
      input {
        font-size: 13px !important;
      }
    }
    &:hover {
      border-color: var(--color-text-disabled);
    }
    &.hap-picker-focused {
      border-color: var(--color-primary);
    }
  }
  &.fitContent {
    width: fit-content;
  }
`;

const PROJECTS_TEXTAREA_STYLE = { minHeight: 100 };

function ExportPlugin(props) {
  const { onClose, pluginId, releaseId, source, onExportSuccess, pluginType } = props;
  const [checkSecretKey, setCheckSecretKey] = useState(false);
  const [data, setData] = useSetState({});
  const [isPwdError, setIsPwdError] = useState(false);
  const [pwdEditing, setPwdEditing] = useState(false);
  const [exporting, setExporting] = useState(false);
  const pluginApi = pluginApiConfig[pluginType];

  const onExport = () => {
    if (checkSecretKey) {
      if (!/^[0-9A-Za-z]{8,20}$/.test(data.password)) {
        alert(_l('密码不符合规范'), 3);
        return;
      }

      if (data.projects && data.projects.length > 10) {
        alert(_l('授权组织不能超过10个'), 3);
        return;
      }
    }

    setExporting(true);
    pluginApi
      .export({ id: pluginId, releaseId, source, profile: checkSecretKey ? data : undefined }, API_EXTENDS)
      .then(res => {
        if (res) {
          setExporting(false);
          alert(_l('插件导出成功'));
          onClose();
          onExportSuccess && onExportSuccess();
        }
      })
      .catch(() => setExporting(false));
  };

  return (
    <Modal
      open
      mask={{ closable: true }}
      keyboard
      width={580}
      title={_l('导出插件')}
      okText={exporting ? _l('导出中...') : _l('导出')}
      okDisabled={checkSecretKey && !data.password}
      confirmLoading={exporting}
      onOk={onExport}
      onCancel={onClose}
    >
      <div className="textSecondary mBottom16">{_l('将插件导出为 .mdye 格式，可以导入到其他组织使用')}</div>
      <FormItem className="fitContent">
        <Checkbox checked={checkSecretKey} onChange={event => setCheckSecretKey(event.target.checked)}>
          {_l('导入时校验授权密钥')}
        </Checkbox>
      </FormItem>
      {checkSecretKey && (
        <React.Fragment>
          <div className="flexRow">
            <FormItem className="flex">
              <div className="labelText">
                <span>{_l('密码')}</span>
                <span className="requiredStar">*</span>
              </div>
              <div className="flexRow alignItemsCenter">
                <Input
                  variant={!pwdEditing && data.password ? 'filled' : 'outlined'}
                  placeholder={_l('输入密码')}
                  value={data.password}
                  onChange={event => setData({ password: event.target.value })}
                  onFocus={() => setPwdEditing(true)}
                  onBlur={e => {
                    if (!e.target.value) return;
                    setIsPwdError(!/^[0-9A-Za-z]{8,20}$/.test(e.target.value));
                    setPwdEditing(false);
                  }}
                />
                <div className="pwdOperate">
                  {!pwdEditing && data.password ? (
                    <span
                      className="pointer textTertiary hoverColorPrimary mLeft16"
                      onClick={() => {
                        copy(data.password);
                        alert(_l('复制成功'));
                      }}
                    >
                      <Tooltip title={_l('复制')} placement="bottom">
                        <Icon icon="content-copy" />
                      </Tooltip>
                    </span>
                  ) : (
                    <span
                      className="colorPrimary hoverColorPrimaryDark pointer mLeft10 mRight20 nowrap"
                      onMouseDown={() => {
                        setData({ password: generateRandomPassword(8) });
                        setPwdEditing(false);
                      }}
                    >
                      {_l('随机生成')}
                    </span>
                  )}
                </div>
              </div>
              {isPwdError && <div className="error">{_l('请输入8-20位字符，仅支持数字和英文字母')}</div>}
            </FormItem>
            <FormItem className="flex">
              <div className="labelText">
                <span> {_l('授权到期时间')}</span>
                <Tooltip title={_l('插件到期后不可用，留空则为永久有效')}>
                  <Icon icon="info_outline" />
                </Tooltip>
              </div>
              <DatePicker
                placeholder={_l('请选择授权到期时间')}
                showNow={false}
                allowClear={true}
                disabledDate={date => date < moment().endOf('day')}
                format="YYYY-MM-DD 00:00"
                onChange={validityPeriod =>
                  setData({ validityPeriod: validityPeriod ? moment(validityPeriod).format('YYYY-MM-DD') : undefined })
                }
              />
            </FormItem>
          </div>
          <FormItem>
            <div className="labelText">
              <span> {_l('授权给指定组织')}</span>
              <Tooltip title={_l('不在该列表内的组织不可导入，留空则所有组织可导入')}>
                <Icon icon="info_outline" />
              </Tooltip>
            </div>
            <Input.TextArea
              autoSize
              className="Font13"
              placeholder={_l('组织编号格式') + '：xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx\n' + _l('一行一个，最多10个')}
              style={PROJECTS_TEXTAREA_STYLE}
              onChange={event => {
                const values = event.target.value;
                setData({
                  projects: values
                    .split(/[\r\n]/)
                    .filter(item => item.trim())
                    .map(item => item.trim()),
                });
              }}
            />
          </FormItem>
        </React.Fragment>
      )}
    </Modal>
  );
}

export function useExportPlugin() {
  return useFunctionWrapComponent(ExportPlugin);
}
