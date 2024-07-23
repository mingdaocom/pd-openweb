import React, { useState } from 'react';
import { Dialog, Switch, FunctionWrap } from 'ming-ui';
import styled from 'styled-components';
import { useSetState } from 'react-use';
import projectSettingController from 'src/api/projectSetting';

const DialogWrap = styled(Dialog)`
  .des {
    color: #a7a7a7;
    margin-bottom: 30px;
  }
`;

const limitData = [
  { text: _l('创建应用'), value: 'onlyManagerCreateApp' },
  { text: _l('创建 API 连接'), value: 'apiIntgOnlyManager' },
  // { text: _l('数据集成'), value: 'dataPipeOnlyManager' },
  { text: _l('开发插件'), value: 'pluginsOnlyManager' },
];

function LimitFeatureDialog(props) {
  const { projectId, updateData = () => {}, onCancel = () => {} } = props;
  const [data, setData] = useSetState(props.data);
  const [loading, setLoading] = useState(false);

  const onOk = () => {
    setLoading(true);
    projectSettingController
      .setOnlyManager({ projectId, ...data })
      .then(res => {
        if (res) {
          setData({ ...data });
          updateData({ ...data });
        }
        setLoading(false);
      })
      .catch(err => {
        setLoading(false);
      });
    onCancel();
  };

  return (
    <DialogWrap visible title={_l('功能限制')} okDisabled={loading} onCancel={onCancel} onOk={onOk}>
      <div className="des">{_l('关闭全员功能，只允许授权的管理员使用')}</div>
      {limitData
        .filter(
          item =>
            !(item.value === 'onlyManagerCreateApp' && md.global.Config.IsLocal && !md.global.Config.IsPlatformLocal) &&
            !(item.value === 'pluginsOnlyManager' && md.global.SysSettings.hidePlugin) &&
            !(item.value === 'apiIntgOnlyManager' && md.global.SysSettings.hideIntegration),
        )
        .map((item, index) => {
          return (
            <div key={index} className="mBottom30 flexRow alignItemsCenter">
              <Switch
                size="small"
                checked={!data[item.value]}
                onClick={checked => {
                  setData({ [item.value]: checked });
                }}
              />
              <span className="TxtMiddle mLeft12">{item.text}</span>
            </div>
          );
        })}
    </DialogWrap>
  );
}

export default props => FunctionWrap(LimitFeatureDialog, props);
