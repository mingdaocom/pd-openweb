import React, { useEffect, useState } from 'react';
import _ from 'lodash';
import { Input, LoadDiv, Switch } from 'ming-ui';
import workWeiXinAjax from 'src/api/workWeiXin';

// 流程待办同步
export default function ProcessSync(props) {
  const { projectId, isLark, updateState = () => {}, getFeishuProjectSettingInfo = () => {} } = props;
  const [isSync, setIsSync] = useState(props.enableTodo);
  const [approveName, setApproveName] = useState(props.approveName);
  const [originApproveName, setOriginApproveName] = useState(props.approveName);
  const [isLoading, setIsLoading] = useState(false);

  const handleChangeScanEnabled = checked => {
    setIsLoading(true);
    workWeiXinAjax
      .editFeishuTodoMessageEnabled({ projectId, enableTodo: !checked, isLark })
      .then(res => {
        setIsLoading(false);
        if (res) {
          setIsSync(!checked);
          updateState({ enableTodo: !checked });
          if (!approveName) {
            getFeishuProjectSettingInfo();
          }
        } else {
          alert(_l('请先开通飞书待办权限'), 3);
        }
      })
      .catch(() => {
        setIsLoading(false);
        alert(_l('请先开通飞书待办权限'), 3);
      });
  };

  const onChangeApproveName = e => {
    if (!_.trim(e.target.value)) {
      setApproveName(originApproveName);
      return;
    }

    workWeiXinAjax.editFeishuApproveName({ projectId, approveName: _.trim(e.target.value), isLark }).then(res => {
      if (res) {
        setApproveName(e.target.value);
        setOriginApproveName(e.target.value);
        updateState({ approveName: e.target.value });
        alert(_l('修改成功'));
      } else {
        alert(_l('修改失败'), 2);
      }
    });
  };

  useEffect(() => {
    setApproveName(props.approveName);
  }, [props.approveName]);

  return (
    <div className="stepItem">
      <h3 className="stepTitle Font16 Gray mBottom24">
        {isLark ? _l('流程待办同步至Lark审批中心') : _l('流程待办同步至飞书审批中心')}
      </h3>
      <div style={{ width: 50 }}>
        {isLoading ? (
          <LoadDiv size="small" />
        ) : (
          <Switch disabled={isLoading} checked={isSync} onClick={handleChangeScanEnabled} />
        )}
      </div>

      <div className="mTop16 syncBox">
        <span className="Font14 Gray_75">
          {isLark
            ? _l('开启后，我的流程中的待办（待审批、待填写）同时会进入Lark待办任务，处理状态会同步更新')
            : _l('开启后，我的流程中的待办（待审批、待填写）同时会进入飞书待办任务，处理状态会同步更新')}
        </span>
      </div>
      <a
        href={`/feishuSyncCourse/${projectId}?type=${isLark ? 'lark' : 'feishu'}&position=processSync`}
        target="_blank"
        className="helpEntry"
      >
        {_l('如何实现流程待办同步')}
      </a>
      {isSync && (
        <div className="flexRow alignItemsCenter mTop16">
          <span className="mRight20">{_l('审批定义')}</span>
          <Input
            className="mRight12"
            value={approveName}
            onChange={val => setApproveName(val)}
            onBlur={e => onChangeApproveName(e)}
          />
        </div>
      )}
    </div>
  );
}
