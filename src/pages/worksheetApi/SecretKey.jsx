import React, { Fragment, useState } from 'react';
import appManagementAjax from 'src/api/appManagement';
import { Dialog, Checkbox, Switch } from 'ming-ui';
import { Input } from 'antd';
import { verifyPassword } from 'src/util';
import RadioGroup from 'ming-ui/components/RadioGroup2';

export default ({
  appId = '',
  appKey = '',
  status = 1,
  type = 1,
  viewNull = false,
  getAuthorizes = () => {},
  onClose = () => {},
}) => {
  const [displayStatus, setStatus] = useState(status);
  const [displayType, setType] = useState(type);
  const [displayViewNull, setViewNull] = useState(viewNull);
  const [password, setPassword] = useState('');
  const getData = key => {
    return [
      {
        text: _l('本应用全部接口'),
        value: 1,
        checked: key === 1,
      },
      {
        text: _l('本应用只读接口'),
        value: 2,
        checked: key === 2,
      },
    ];
  };

  return (
    <Dialog
      visible={true}
      overlayClosable={false}
      title={appKey ? _l('编辑授权密钥') : _l('新建授权密钥')}
      width={500}
      onOk={() => {
        verifyPassword(password, () => {
          appManagementAjax[appKey ? 'editAuthorizeStatus' : 'addAuthorize']({
            appId,
            appKey,
            status: displayStatus,
            type: displayType,
            viewNull: displayViewNull,
          }).then(res => {
            onClose();
            getAuthorizes();
          });
        });
      }}
      onCancel={onClose}
    >
      <div className="Gray_75">{_l('应用授权密钥是极为重要的凭证，修改时需要验证身份')}</div>

      {appKey && (
        <Fragment>
          <div className="mTop20">{_l('授权状态')}</div>
          <Switch
            className="mTop10"
            checked={displayStatus === 1}
            text={displayStatus === 1 ? _l('开启') : _l('关闭')}
            onClick={() => setStatus(displayStatus === 1 ? 2 : 1)}
          />
        </Fragment>
      )}

      {displayStatus === 1 && (
        <Fragment>
          <div className="mTop20">{_l('接口权限')}</div>
          <div className="mTop10">
            <RadioGroup data={getData(displayType)} onChange={setType} />
          </div>

          <div className="mTop20">{_l('其他设置')}</div>
          <Checkbox
            className="mTop10"
            text={_l('调用获取工作表列表接口时，视图参数为空则不返回数据')}
            checked={displayViewNull}
            onClick={() => setViewNull(!displayViewNull)}
          />
        </Fragment>
      )}

      <div className="mTop20">{_l('当前用户密码')}</div>
      <Input.Password
        className="boderRadAll_3 mTop10"
        autocomplete="new-password"
        placeholder={_l('请输入密码确认授权')}
        onChange={e => setPassword(e.target.value)}
      />
    </Dialog>
  );
};
