import React, { useState } from 'react';
import { Dialog, Switch } from 'ming-ui';
import Ajax from 'src/api/workWeiXin';

export default function SyncRootDepartment(props) {
  const [syncRootDepartment, setSyncRootDepartment] = useState(props.syncRootDepartment || false);
  const [isLoading, setIsLoading] = useState(false);

  /**
   * 开启同步根部门
   */
  const handleSyncRootDeptment = () => {
    setIsLoading(true);

    const request = () => {
      Ajax.editProjectSyncRootDepartment({
        projectId: props.projectId,
        status: syncRootDepartment ? 0 : 1,
      })
        .then(res => {
          if (res) {
            setIsLoading(false);
            setSyncRootDepartment(!syncRootDepartment);
            props.updateSyncRootDepartment(!syncRootDepartment);
            alert(_l('操作成功'));
          } else {
            setIsLoading(false);
            alert(_l('操作失败'), 2);
          }
        })
        .catch(() => {
          setIsLoading(false);
          alert(_l('操作失败'), 2);
        });
    };

    if (syncRootDepartment) {
      Dialog.confirm({
        title: _l('确认关闭 “同步根部门”'),
        description: _l('关闭后，已同步的根部门将在下次同步时被移除'),
        onOk: request,
      });
    } else {
      request();
    }
  };

  return (
    <div className="stepItem">
      <h3 className="stepTitle Font16 textPrimary mBottom24">{_l('同步根部门')}</h3>
      <Switch disabled={isLoading} checked={syncRootDepartment} onClick={handleSyncRootDeptment} />
      <div className="Font14 textSecondary mTop16">
        {_l('开启后，将第三方平台组织架构的根节点（通常为组织名称），作为一级部门进行同步')}
      </div>
    </div>
  );
}
