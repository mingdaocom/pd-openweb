import React, { useRef, useState } from 'react';
import cx from 'classnames';
import _ from 'lodash';
import styled from 'styled-components';
import { Dialog, Icon, Switch, Textarea } from 'ming-ui';
import { Tooltip } from 'ming-ui/antd-components';
import projectAjax from 'src/api/project';
import { encrypt } from 'src/utils/common';
import TextInput from './TextInput';

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
  .deleteIcon {
    color: var(--color-text-secondary);
    font-size: 16px;
    cursor: pointer;
    &:hover {
      color: var(--color-error);
    }
  }
`;

function ConnectDataBase(props) {
  const { id, info, projectId, onClose, onOk } = props;

  const [data, setData] = useState({
    name: undefined,
    account: undefined,
    password: undefined,
    dbName: undefined,
    other: undefined,
    status: 0,
    remark: undefined,
  });
  const [errors, setErrors] = useState([]);
  const [pending, setPending] = useState(false);
  const [addressList, setAddressList] = useState([{ host: '', port: 27017 }]);
  const hostInputRefs = useRef([]);

  useState(() => {
    if (id) {
      setData(info);
      const hosts = (info.hosts || []).length > 1 ? info.hosts : [{ host: info.host, port: info.port }];
      setAddressList(hosts);
    }
  }, [id]);

  const updateAddressPost = (data, index) => {
    const newAddressList = addressList.map((item, i) => (i === index ? data : item));
    setAddressList(newAddressList);
  };

  const handleChangeData = value => {
    setData({ ...data, ...value });
  };

  const check = () => {
    const request = ['name', 'account', 'password', 'dbName'];
    const _errors = [];
    request.forEach(key => {
      if (!data[key]) _errors.push(key);
    });
    addressList.forEach((item, index) => {
      if (!item.host) _errors.push(`host${index}`);
      if (!item.port) _errors.push(`port${index}`);
    });
    setErrors(_errors);
    return _errors;
  };

  const createDB = () => {
    const err = check();
    if (err.length > 0) return;
    const hostParams =
      addressList.length > 1 ? { hosts: addressList } : { host: addressList[0].host, port: addressList[0].port };

    let promiseAjax = id ? projectAjax.editDBInstance : projectAjax.createDBInstance;
    promiseAjax({
      ..._.omit(data, ['host', 'port']),
      id,
      projectId: projectId,
      password: /^[*]+$/.test(data.password) ? undefined : encrypt(data.password),
      ...hostParams,
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
    const hostParams =
      addressList.length > 1 ? { hosts: addressList } : { host: addressList[0].host, port: addressList[0].port };

    projectAjax
      .testConnection(
        {
          ..._.omit(data, ['host', 'port']),
          id,
          projectId: projectId,
          password: /^[*]+$/.test(data.password) ? undefined : encrypt(data.password),
          ...hostParams,
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
    const oldAddressList = (info.hosts || []).length > 1 ? info.hosts : [{ host: info.host, port: info.port }];
    return (
      _.some(
        ['name', 'host', 'port', 'account', 'password', 'dbName', 'other', 'remark', 'status'],
        l => info[l] !== data[l],
      ) || !_.isEqual(oldAddressList, addressList)
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
        <div className="flexRow alignItemsCenter">
          <div className="colorPrimary ThemeHoverColor2 Hand" onClick={testConnection}>
            {pending ? _l('连接中，请稍后…') : _l('测试连接')}
          </div>
          <Tooltip
            title={_l(
              '将向配置的数据库地址运行一条内容为 “ping=1”的命令 ，若在 5 秒内可以正常连接并收到返回内容，则视为测试通过。注：未通过测试不可保存，系统会强制校验',
            )}
          >
            <Icon icon="info_outline" className="Font16 textDisabled mLeft8" />
          </Tooltip>
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
        {addressList.map((item, index) => (
          <div key={index} className="rowFlex mBottom12">
            <TextInput
              className="mRight16 textInput"
              value={item.host}
              // disabled={id && numberOfApp > 0}
              label={_l('数据库地址')}
              isRequired={true}
              error={errors.includes(`host${index}`)}
              onChange={e => updateAddressPost({ ...item, host: e.target.value }, index)}
              onFocus={() => clearError(`host${index}`)}
              tips={_l('支持单机与副本集，副本集请输入多个数据库地址和端口，且包含主节点')}
              hideLabel={index !== 0}
              ref={el => (hostInputRefs.current[index] = el)}
            />
            <TextInput
              className="textInput"
              label={_l('端口号')}
              hideLabel={index !== 0}
              value={item.port}
              // disabled={id && numberOfApp > 0}
              isRequired={true}
              error={errors.includes(`port${index}`)}
              onChange={e => {
                const value = Number(e.target.value);
                updateAddressPost(
                  {
                    ...item,
                    port: _.isNumber(value) && !_.isNaN(value) ? value : '',
                  },
                  index,
                );
              }}
              onFocus={() => clearError(`port${index}`)}
            />
            <div className={cx('flexRow alignItemsCenter mLeft8 Height36', { Hidden: addressList.length === 1 })}>
              <Icon
                icon="delete1"
                className={cx('deleteIcon', { Visibility: index === 0 })}
                onClick={() => {
                  setAddressList(addressList.filter((_, i) => i !== index));
                }}
              />
            </div>
          </div>
        ))}
        <div
          style={{ width: 'fit-content' }}
          className="colorPrimary ThemeHoverColor2 Hand mTop4 mBottom16"
          onClick={() => {
            const newIndex = addressList.length;
            setAddressList(addressList.concat({ host: '', port: 27017 }));
            setTimeout(() => {
              hostInputRefs.current[newIndex]?.focus();
            }, 0);
          }}
        >
          <Icon icon="add" className="Font14" />
          <span className="mLeft2">{_l('地址')}</span>
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
          type="password"
          tips={_l('密码保存之后数据库将加密存储，同时在界面上将掩码展示')}
        />
        <TextInput
          className="mBottom16 textInput"
          value={data.dbName}
          // disabled={id && numberOfApp > 0}
          label={_l('数据库名称')}
          isRequired={true}
          error={errors.includes('dbName')}
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
          <Tooltip title={_l('开启时，允许拥有“应用服务和资源”的管理员，新增应用到这个数据库')}>
            <Icon icon="info_outline" className="Font16 textDisabled mLeft8" />
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
