import React, { useCallback, useEffect, useState } from 'react';
import _ from 'lodash';
import { Tooltip } from 'ming-ui/antd-components';
import departmentAjax from 'src/api/department';
import { getCurrentProject } from 'src/utils/project';

const LOADING_TEXT = _l('加载中...');

const DepartmentTooltip = ({ item = {}, projectId, advancedSetting = {}, dragging, children }) => {
  const [departmentName, setDepartmentName] = useState(LOADING_TEXT);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    setVisible(false);
    setDepartmentName(LOADING_TEXT);
  }, [item, dragging]);

  const getDepartmentName = useCallback(
    (item, dragging) => {
      if (dragging) {
        setDepartmentName('');
        return;
      }
      if (departmentName !== LOADING_TEXT) {
        setVisible(true);
        return;
      }
      if (item.isDelete) {
        setDepartmentName(_l('%0部门已被删除', item.deleteCount > 1 ? `${item.deleteCount}个` : ''));
        setVisible(true);
        return;
      }
      if (item.disabled) {
        setDepartmentName(_l('部门已停用'));
        setVisible(true);
        return;
      }
      if (_.get(window, 'shareState.shareId') || !projectId) {
        setDepartmentName('');
        setVisible(false);
        return;
      }
      const { allpath } = advancedSetting;
      if (allpath === '1' || _.isEmpty(getCurrentProject(projectId))) {
        setDepartmentName(item.departmentName);
        setVisible(true);
        return;
      }
      departmentAjax.getDepartmentFullNameByIds({ projectId, departmentIds: [item.departmentId] }).then(res => {
        setDepartmentName(_.get(res, '0.name'));
        setVisible(true);
      });
    },
    [projectId, advancedSetting, departmentName],
  );

  return (
    <Tooltip
      key={item.departmentId}
      title={departmentName}
      visible={visible}
      onVisibleChange={open => {
        if (open) {
          getDepartmentName(item, dragging);
        } else {
          setVisible(false);
        }
      }}
    >
      {children}
    </Tooltip>
  );
};

export default DepartmentTooltip;
