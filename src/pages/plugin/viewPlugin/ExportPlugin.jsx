import React, { useState } from 'react';
import { useSetState } from 'react-use';
import styled from 'styled-components';
import { Dialog, Checkbox, Input, Textarea, Icon } from 'ming-ui';
import { Tooltip, DatePicker } from 'antd';
import functionWrap from 'ming-ui/components/FunctionWrap';
import localeZhCn from 'antd/es/date-picker/locale/zh_CN';
import localeJaJp from 'antd/es/date-picker/locale/ja_JP';
import localeZhTw from 'antd/es/date-picker/locale/zh_TW';
import localeEn from 'antd/es/date-picker/locale/en_US';
import { generateRandomPassword } from 'src/util';
import moment from 'moment';
import pluginApi from 'src/api/plugin';
import ClipboardButton from 'react-clipboard.js';

const FormItem = styled.div`
  margin-bottom: 16px;
  .labelText {
    display: flex;
    align-items: center;
    color: #757575;
    margin-bottom: 8px;
    .requiredStar {
      color: #f44336;
      margin-left: 4px;
      font-weight: bold;
    }
    i {
      font-size: 14px;
      color: #bdbdbd;
      margin-left: 8px;
    }
  }
  input {
    width: 100%;
    font-size: 13px !important;
    &.notEditPwd {
      background: #f5f5f5;
      border: none;
    }
  }
  .pwdOperate {
    min-width: 82px;
  }
  .error {
    color: #f44336;
    margin-top: 5px;
  }

  .ant-picker {
    width: 100%;
    height: 36px;
    transition: none;
    border-color: #ccc;
    border-radius: 3px;
    box-shadow: none;
    .ant-picker-input {
      input {
        font-size: 13px !important;
      }
    }
    &:hover {
      border-color: #bbb;
    }
    &.ant-picker-focused {
      border-color: #1e88e5;
    }
  }
  &.fitContent {
    width: fit-content;
  }
`;

function ExportPlugin(props) {
  const { onClose, pluginId, releaseId, source, onExportSuccess } = props;
  const [checkSecretKey, setCheckSecretKey] = useState(false);
  const [data, setData] = useSetState({});
  const [isPwdError, setIsPwdError] = useState(false);
  const [pwdEditing, setPwdEditing] = useState(false);
  const [exporting, setExporting] = useState(false);
  const locales = { 'zh-Hans': localeZhCn, 'zh-Hant': localeZhTw, en: localeEn, ja: localeJaJp };
  const locale = locales[md.global.Account.lang];

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
      .export({ id: pluginId, releaseId, source, profile: checkSecretKey ? data : undefined })
      .then(res => {
        if (res) {
          setExporting(false);
          alert(_l('插件导出成功'));
          onClose();
          onExportSuccess && onExportSuccess();
        }
      })
      .catch(error => setExporting(false));
  };

  return (
    <Dialog
      visible
      width={580}
      title={_l('导出插件')}
      description={_l('将插件导出为 .mdye 格式，可以导入到其他组织使用')}
      okText={exporting ? _l('导出中...') : _l('导出')}
      okDisabled={(checkSecretKey && !data.password) || exporting}
      onOk={onExport}
      onCancel={onClose}
    >
      <FormItem className="fitContent">
        <Checkbox
          text={_l('导入时校验授权密钥')}
          checked={checkSecretKey}
          onClick={checked => setCheckSecretKey(!checked)}
        />
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
                  className={!pwdEditing && data.password ? 'notEditPwd' : ''}
                  placeholder={_l('输入密码')}
                  value={data.password}
                  onChange={password => setData({ password })}
                  onFocus={() => setPwdEditing(true)}
                  onBlur={e => {
                    if (!e.target.value) return;
                    setIsPwdError(!/^[0-9A-Za-z]{8,20}$/.test(e.target.value));
                    setPwdEditing(false);
                  }}
                />
                <div className="pwdOperate">
                  {!pwdEditing && data.password ? (
                    <ClipboardButton
                      className="pointer Gray_9e ThemeHoverColor3 mLeft16"
                      component="span"
                      data-clipboard-text={data.password}
                      onSuccess={() => alert(_l('复制成功'))}
                    >
                      <Tooltip title={_l('复制')} placement="bottom">
                        <Icon icon="content-copy" />
                      </Tooltip>
                    </ClipboardButton>
                  ) : (
                    <span
                      className="ThemeColor ThemeHoverColor2 pointer mLeft10 mRight20 nowrap"
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
                locale={locale}
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
            <Textarea
              className="Font13"
              placeholder={_l('组织编号格式：xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx\n一行一个，最多10个')}
              minHeight={100}
              onChange={values => {
                setData({
                  projects: values
                    .split(/[\r\n]/)
                    .filter(item => item.trim())
                    .map(item => item.trim()),
                });
              }}
            />
          </FormItem>
          <FormItem>
            <div className="labelText">
              <span> {_l('授权给指定服务器（私有部署）')}</span>
              <Tooltip title={_l('指定后仅该服务器可导入，留空则不限制')}>
                <Icon icon="info_outline" />
              </Tooltip>
            </div>
            <Input
              placeholder={_l('输入私有部署服务器ID')}
              value={(data.servers || [])[0]}
              onChange={value => setData({ servers: [value] })}
            />
          </FormItem>
        </React.Fragment>
      )}
    </Dialog>
  );
}

export default props => functionWrap(ExportPlugin, { ...props });
