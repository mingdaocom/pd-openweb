import React, { useState, useRef } from 'react';
import { Dialog } from 'ming-ui';
import { Input, Switch } from 'antd';
import Components from '../../../components';
import { isEmpty } from 'lodash';
import update from 'immutability-helper';
import { v4 as uuidv4 } from 'uuid';
import worksheetAjax from 'src/api/worksheet';
import Options from './Options';
import { SettingItem } from '../../../styled';
import { getDefaultOptions } from '../../../util/setting';

const Icon = Components.Icon;

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
      alert(_l('选项集标题不能为空'), 3);
      return;
    }
    const nextData = { ...rest, name, colorful, enableScore, options: data };
    worksheetAjax.saveOptionsCollection({ appId, ...nextData }).then(({ code, data, msg }) => {
      if (code === 1) {
        onOk(isEmpty(data) ? nextData : data);
      } else {
        alert(msg);
      }
    });
  };

  const getOptionCount = () => {
    return data.filter(item => !item.isDeleted).length;
  };

  const handleCopy = () => {
    const copyOptions = data
      .filter(i => !i.isDeleted)
      .map((item, index) => ({
        key: uuidv4(),
        value: item.value,
        checked: false,
        isDeleted: false,
        index: data.length + index + 1,
        color: item.color,
      }));
    const findOther = _.findIndex(data, i => i.key === 'other');
    const newOptions = update(data, {
      $splice: [[findOther > -1 ? findOther : data.length, 0, ...copyOptions]],
    });
    setData(newOptions.map((item, idx) => ({ ...item, index: idx + 1 })));
    alert(_l('已复制'));
  };

  return (
    <Dialog
      ref={$ref}
      visible
      bodyClass="editOptionDialog"
      title={isEmpty(options) ? _l('新建选项集') : _l('编辑选项集')}
      okText={_l('保存')}
      onCancel={onCancel}
      onOk={handleOk}
    >
      <SettingItem style={{ marginTop: '0px' }}>
        <div className="settingItemTitle">{_l('名称')}</div>
        <Input value={name} placeholder={_l('选项集')} onChange={e => setName(e.target.value)} />
      </SettingItem>
      <SettingItem>
        <div className="settingItemTitle">{_l('选项 ( %0 ) ', getOptionCount())}</div>
        <div className="flexCenter" style={{ justifyContent: 'space-between' }}>
          <div className="flexCenter">
            <i
              style={{ color: colorful ? '#43bd36' : '#bdbdbd' }}
              className={`Font24 pointer icon-${colorful ? 'toggle_on' : 'toggle_off'}`}
              onClick={e => setColorful(colorful ? false : true)}
            ></i>
            <span style={{ marginLeft: '8px' }}>{_l('彩色')}</span>
          </div>
          <div className="flexCenter hoverText" onClick={handleCopy}>
            <Icon icon="content-copy" className="Font13" />
            <span style={{ marginLeft: '6px' }}>{_l('复制')}</span>
          </div>
        </div>
      </SettingItem>
      <Options
        mode="list"
        options={data}
        colorful={colorful}
        enableScore={enableScore}
        showAssign={true}
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
