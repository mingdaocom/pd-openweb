import React, { useState } from 'react';
import styled from 'styled-components';
import { Dialog, Switch, Textarea, Tooltip, Icon } from 'ming-ui';
import _ from 'lodash';
import TextInput from './TextInput';
import projectAjax from 'src/api/project';
import { encrypt } from 'src/util';

const DialogContentWrap = styled.div`
  .rowFlex {
    display: flex;
    align-items: flex-start;
    .formGroup:nth-child(1) {
      flex: 6;
    }
    .formGroup:nth-child(2) {
      flex: 4;
    }
  }
  .textInput {
    .formLabel {
      margin-bottom: 4px !important;
    }
  }
`;

function ConnectDataBase(props) {
  const { id, info, projectId, numberOfApp = 0, onClose, onOk } = props;

  const [data, setData] = useState({
    name: undefined,
    host: undefined,
    port: 27017,
    account: undefined,
    password: undefined,
    dbName: undefined,
    other: undefined,
    status: 0,
    remark: undefined,
  });
  const [errors, setErrors] = useState([]);
  const [pending, setPending] = useState(false);

  useState(() => {
    id && setData(info);
  }, [id]);

  const handleChangeData = value => {
    setData({
      ...data,
      ...value,
    });
  };

  const check = () => {
    const request = ['name', 'host', 'port', 'account', 'password', 'dbName'];
    const _errors = [];
    request.forEach(key => {
      if (!data[key]) _errors.push(key);
    });
    setErrors(_errors);
    return _errors;
  };

  const createDB = () => {
    const err = check();
    if (err.length > 0) return;
    let promiseAjax = id ? projectAjax.editDBInstance : projectAjax.createDBInstance;
    promiseAjax({
      ...data,
      id,
      projectId: projectId,
      password: /^[*]+$/.test(data.password) ? undefined : encrypt(data.password),
    }).then(res => {
      if (res) {
        alert('保存成功');
        onOk();
      } else alert('创建失败', 2);
    });
  };

  const testConnection = () => {
    const err = check();
    if (err.length > 0) return;
    setPending(true);
    projectAjax
      .testConnection(
        {
          ...data,
          id,
          projectId: projectId,
          password: /^[*]+$/.test(data.password) ? undefined : encrypt(data.password),
        },
        { silent: true },
      )
      .then(res => {
        setPending(false);
        if (res) alert(_l('连接成功'));
        else alert(_l('连接失败，请检查'), 3);
      })
      .catch(({ errorMessage }) => {
        setPending(false);
        alert(errorMessage || _l('连接失败，请检查'), 3);
      });
    return false;
  };

  const clearError = key => {
    setErrors(errors.filter(l => l !== key));
  };

  const isEdited = () => {
    if (!id) return true;
    return _.some(
      ['name', 'host', 'port', 'account', 'password', 'dbName', 'other', 'remark', 'status'],
      l => info[l] !== data[l],
    );
  };

  return (
    <Dialog
      className="connectDataBaseDialog"
      visible={true}
      width={496}
      title={_l('数据库实例')}
      okDisabled={!isEdited()}
      okText={id ? _l('保存') : _l('创建')}
      footerLeftElement={() => (
        <div className="ThemeColor ThemeHoverColor2 Hand" onClick={testConnection}>
          {pending ? _l('连接中，请稍后…') : _l('测试连接')}
        </div>
      )}
      onOk={createDB}
      onCancel={onClose}
    >
      <DialogContentWrap>
        <TextInput
          className="mBottom16 textInput"
          value={data.name}
          label={_l('实例名称')}
          isRequired={true}
          error={errors.includes('name')}
          onChange={e => handleChangeData({ name: e.target.value })}
          onFocus={() => clearError('name')}
        />
        <div className="rowFlex mBottom16">
          <TextInput
            className="mRight16 textInput"
            value={data.host}
            // disabled={id && numberOfApp > 0}
            label={_l('数据库地址')}
            isRequired={true}
            error={errors.includes('host')}
            onChange={e => handleChangeData({ host: e.target.value })}
            onFocus={() => clearError('host')}
          />
          <TextInput
            className="textInput"
            label={_l('端口号')}
            value={data.port}
            // disabled={id && numberOfApp > 0}
            isRequired={true}
            error={errors.includes('port')}
            onChange={e => {
              const value = Number(e.target.value);
              handleChangeData({
                port: _.isNumber(value) && !_.isNaN(value) ? value : '',
              });
            }}
            onFocus={() => clearError('port')}
          />
        </div>
        <TextInput
          className="mBottom16 textInput"
          value={data.account}
          label={_l('账号')}
          isRequired={true}
          error={errors.includes('account')}
          onChange={e => handleChangeData({ account: e.target.value })}
          onFocus={() => clearError('account')}
        />
        <TextInput
          className="mBottom16 textInput"
          value={data.password}
          label={_l('密码')}
          isRequired={true}
          error={errors.includes('password')}
          onChange={e => handleChangeData({ password: e.target.value })}
          onFocus={() => {
            clearError('password');
            if (id) {
              handleChangeData({ password: '' });
            }
          }}
          onBlur={() => {
            if (id && !data.password) handleChangeData({ password: info.password });
          }}
        />
        <TextInput
          className="mBottom16 textInput"
          value={data.dbName}
          // disabled={id && numberOfApp > 0}
          label={_l('数据库名称')}
          isRequired={true}
          onChange={e => handleChangeData({ dbName: e.target.value })}
        />
        <TextInput
          className="mBottom16 textInput"
          value={data.other}
          label={_l('其他连接串参数')}
          isRequired={false}
          onChange={e => handleChangeData({ other: e.target.value })}
        />
        <div className="Font14 mBottom4 valignWrapper">
          {_l('新增应用')}
          <Tooltip text={_l('开启时，允许拥有“应用服务和资源”的管理员，新增应用到这个数据库')}>
            <Icon icon="info_outline" className="Font16 Gray_bd mLeft8" />
          </Tooltip>
        </div>
        <div className="SwitchCon mBottom16">
          <Switch
            className="mRight8"
            checked={!!data.status}
            onClick={checked => {
              setData({ ...data, status: !checked ? 1 : 0 });
            }}
          />
          <span>{data.status ? _l('允许') : _l('不允许')}</span>
        </div>
        <div className="Font14 mBottom4">{_l('备注')}</div>
        <Textarea minHeight={62} value={data.remark} onChange={value => handleChangeData({ remark: value })} />
      </DialogContentWrap>
    </Dialog>
  );
}

export default ConnectDataBase;
