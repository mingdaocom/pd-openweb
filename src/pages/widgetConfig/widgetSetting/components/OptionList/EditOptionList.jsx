import React, { useState, useRef } from 'react';
import { Dialog } from 'ming-ui';
import { Input, Switch } from 'antd';
import { isEmpty } from 'lodash';
import { saveOptionsCollection } from 'src/api/worksheet';
import Options from './Options';
import { SettingItem } from '../../../styled';
import { getDefaultOptions } from '../../../util/setting';

export default function EditOptionList(props) {
  const { onOk, options, globalSheetInfo = {}, onCancel, ...rest } = props;
  const appId = props.appId || globalSheetInfo.appId;
  const $ref = useRef(null);
  const [name, setName] = useState(props.name);
  const [data, setData] = useState(isEmpty(options) ? getDefaultOptions() : options);
  const [colorful, setColorful] = useState(props.colorful);
  const [enableScore, setEnableScore] = useState(props.enableScore);

  const handleOk = () => {
    if (!name) {
      alert(_l('选项集标题不能为空'));
      return;
    }
    const nextData = { ...rest, name, colorful, enableScore, options: data };
    saveOptionsCollection({ appId, ...nextData }).then(({ code, data, msg }) => {
      if (code === 1) {
        onOk(isEmpty(data) ? nextData : data);
      } else {
        alert(_l('%0', msg));
      }
    });
  };

  const getOptionCount = () => {
    return data.filter(item => !item.isDeleted).length;
  };

  return (
    <Dialog
      ref={$ref}
      visible
      bodyClass="editOptionDialog"
      title={isEmpty(options) ? _l('新建选项集') : _l('编辑选项集')}
      okText={_l('保存')}
      onCancel={onCancel}
      onOk={handleOk}>
      <SettingItem style={{ marginTop: '0px' }}>
        <div className="settingItemTitle">{_l('名称')}</div>
        <Input value={name} placeholder={_l('选项集')} onChange={e => setName(e.target.value)} />
      </SettingItem>
      <SettingItem>
        <div className="settingItemTitle">{_l('选项 ( %0 ) ', getOptionCount())}</div>
        <div className="flexCenter">
          <Switch checked={colorful} size="small" onChange={checked => setColorful(checked)} />
          <span style={{ marginLeft: '8px' }}>{_l('彩色')}</span>
        </div>
      </SettingItem>
      <Options
        mode="list"
        options={data}
        colorful={colorful}
        enableScore={enableScore}
        onChange={({ options, enableScore }) => {
          setData(options);
          if (typeof enableScore === 'boolean') {
            setEnableScore(enableScore);
          }
        }}
      />
    </Dialog>
  );
}
