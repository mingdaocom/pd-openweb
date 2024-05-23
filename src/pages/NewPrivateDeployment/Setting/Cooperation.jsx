import React, { Fragment, useState, useEffect } from 'react';
import { Checkbox, Divider } from 'antd';
import { updateSysSettings } from '../common';
import _ from 'lodash';

const Cooperation = props => {
  const { SysSettings } = md.global;
  const [forbidSuites, setForbidSuites] = useState(_.uniq(SysSettings.forbidSuites.split('|')));

  const handleChangeForbidSuites = value => {
    const isExist = forbidSuites.filter(item => item === value).length;
    const data = isExist ? forbidSuites.filter(item => item !== value) : forbidSuites.concat(value).sort((a, b) => a - b);
    updateSysSettings({
      forbidSuites: data.join('|')
    }, () => {
      setForbidSuites(data);
      md.global.SysSettings.forbidSuites = data.join('|');
    });
  }

  return (
    <div className="privateCardWrap flexColumn">
      <div className="Font17 bold mBottom8">{_l('协作套件')}</div>
      <div className="Gray_9e mBottom25">{_l('平台默认协作功能模块，可自定义是否启用')}</div>
      <div>
        <Checkbox className="mRight15" checked={!forbidSuites.includes('1')} onChange={() => handleChangeForbidSuites('1')}>{_l('动态')}</Checkbox>
        <Checkbox className="mRight15" checked={!forbidSuites.includes('2')} onChange={() => handleChangeForbidSuites('2')}>{_l('任务')}</Checkbox>
        <Checkbox className="mRight15" checked={!forbidSuites.includes('3')} onChange={() => handleChangeForbidSuites('3')}>{_l('日程')}</Checkbox>
        <Checkbox className="mRight15" checked={!forbidSuites.includes('4')} onChange={() => handleChangeForbidSuites('4')}>{_l('文件')}</Checkbox>
        <Checkbox className="mRight15" checked={!forbidSuites.includes('6')} onChange={() => handleChangeForbidSuites('6')}>{_l('聊天')}</Checkbox>
      </div>
    </div>
  );
}

export default Cooperation;

