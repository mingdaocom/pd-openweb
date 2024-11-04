import React, { Fragment, useState } from 'react';
import styled from 'styled-components';
import cx from 'classnames';
import _ from 'lodash';
import { Dialog, Input } from 'ming-ui';
import { encrypt } from 'src/util';
import privatePushAjax from 'src/api/privatePush';
import { RequestLabel, APP_PUSH_CONFIG } from '../../common';

const Config = {
  mi: {
    name: _l('小米'),
    list: [
      { name: _l('包名'), key: 'packageName' },
      { name: _l('渠道ID'), key: 'channelId' },
      { name: _l('密钥'), key: 'appSecret', type: 'password' },
    ],
    ajax: 'setMiPushSetting',
  },
  huawei: {
    name: _l('华为'),
    list: [
      { name: _l('应用ID'), key: 'appId' },
      { name: _l('密钥'), key: 'appSecret', type: 'password' },
    ],
    ajax: 'setHuaweiPushSetting',
  },
};

const Wrap = styled.div`
  input {
    margin-bottom: 22px;
    height: 44px;
  }
`;

function AndroidPushSettingDialog(props) {
  const { visible, data = {}, type = 'mi', onOk, onClose } = props;
  const List = Config[type].list;

  const [value, setValue] = useState(
    _.pick(
      data,
      List.map(l => l.key),
    ),
  );

  const handleOk = async () => {
    let flag = false;
    List.forEach(item => {
      if (!value[item.key]) {
        alert(_l('请输入') + item.name, 3);
        flag = true;
      }
    });

    if (flag) return;

    const res = await privatePushAjax[Config[type].ajax]({
      ...value,
      appSecret: encrypt(value.appSecret),
    });

    if (res) {
      value.appSecret = '************';
      const isFirst = _.isEmpty(data);
      alert(isFirst ? _l('添加成功') : _l('编辑成功'));
      onOk(type, isFirst ? { ...value, status: 1 } : value);
      isFirst && privatePushAjax.setPushSettingEnable({ pushMode: APP_PUSH_CONFIG[type].value, status: 1 });
    }
  };

  return (
    <Dialog width={480} anim={false} visible={visible} title={Config[type].name} onOk={handleOk} onCancel={onClose}>
      <Wrap>
        {List.map((item, i) => (
          <Fragment key={`${item.key}-${i}`}>
            <RequestLabel title={item.name} className={cx('mBottom10 LineHeight1em', { mTop10: i === 0 })} />
            <Input
              className="w100"
              type={item.type || 'text'}
              value={_.get(value, item.key)}
              onChange={l => setValue({ ...value, [item.key]: l })}
            />
          </Fragment>
        ))}
      </Wrap>
    </Dialog>
  );
}

export default AndroidPushSettingDialog;
