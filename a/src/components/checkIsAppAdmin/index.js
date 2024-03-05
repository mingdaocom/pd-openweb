import React, { useEffect, useState } from 'react';
import { Dialog } from 'ming-ui';
import FunctionWrap from 'ming-ui/components/FunctionWrap';
import appManagementAjax from 'src/api/appManagement.js';
import { addBehaviorLog } from 'src/util';
import { navigateTo } from 'src/router/navigateTo';
import cx from 'classnames';
import styled from 'styled-components';

const DialogCom = styled(Dialog)`
  .checkAdminDialog {
    .Button--primary {
      background: #f5f5f5;
      color: #2196f3;
      &:hover {
        background: #f5f5f5;
      }
    }
  }
`;

function CheckIsAppAdminCon(props) {
  const { appId, appName, title, description, onCancel = () => {}, callback } = props;
  const [loading, setLoading] = useState(false);

  // 检测是否是应用管理员
  const checkAppAdminForUser = () => {
    setLoading(true);
    appManagementAjax.checkAppAdminForUser({ appId }).then(res => {
      if (res) {
        onCancel();
        if (_.isFunction(callback)) {
          callback();
          return;
        }
        addBehaviorLog('app', appId); // 浏览应用埋点
        navigateTo(`/app/${appId}`);
      } else {
        setLoading(false);
      }
    });
  };

  // 设为应用管理员
  const addRoleMemberForAppAdmin = () => {
    appManagementAjax
      .addRoleMemberForAppAdmin({
        appId,
      })
      .then(res => {
        if (res) {
          if (_.isFunction(callback)) {
            callback();
            return;
          }
          addBehaviorLog('app', appId); // 浏览应用埋点
          navigateTo(`/app/${appId}`);
        }
        onCancel();
      });
  };

  useEffect(() => {
    checkAppAdminForUser();
  }, []);

  return (
    <DialogCom
      visible
      className={cx({ checkAdminDialog: loading })}
      title={title || _l('管理应用“%0”', appName)}
      description={description || _l('如果你不是应用的管理员，需要将自己加为管理员以获得权限')}
      cancelText=""
      okText={loading ? _l('验证权限...') : _l('加为此应用管理员')}
      onOk={loading ? () => {} : addRoleMemberForAppAdmin}
      onCancel={onCancel}
    />
  );
}

export const checkIsAppAdmin = props => FunctionWrap(CheckIsAppAdminCon, props);
