import React, { useState } from 'react';
import { Dialog, Icon } from 'ming-ui';
import SvgIcon from 'src/components/SvgIcon';
import appManagementAjax from 'src/api/appManagement';
import ajaxRequest from 'src/api/appManagement';
import { navigateTo } from 'src/router/navigateTo';
import { transferExternalLinkUrl } from 'src/pages/AppHomepage/AppCenter/utils';
import styled from 'styled-components';
import cx from 'classnames';

const Wrap = styled.div`
  .iconWrap {
    width: 22px;
    height: 22px;
    border-radius: 5px;
    margin-right: 10px;
    text-align: center;
    padding-top: 3px;
  }
`;

export default function IsAppAdmin(props) {
  const {
    appId,
    appName,
    iconUrl,
    iconColor,
    createType,
    urlTemplate,
    projectId,
    defaultIcon,
    className,
    desc = undefined,
  } = props;
  const [checkAdmin, setCheckAdmin] = useState({ id: '', post: false, visible: false, title: '' });

  /**
   * 设为应用管理员
   */
  const addRoleMemberForAppAdmin = () => {
    ajaxRequest
      .addRoleMemberForAppAdmin({
        appId,
      })
      .then(result => {
        if (result) {
          window.open(`/app/${appId}`);
          setCheckAdmin(Object.assign({}, checkAdmin, { visible: false }));
        }
      });
  };

  /**
   * 检测是否是应用管理员
   */
  const checkIsAppAdmin = () => {
    const opts = post => {
      return {
        id: appId,
        post,
        visible: true,
        title: appName,
      };
    };
    setCheckAdmin(opts(true));
    appManagementAjax
      .checkAppAdminForUser({
        appId,
      })
      .then(result => {
        if (result) {
          window.open(`/app/${appId}`);
          setCheckAdmin(Object.assign({}, checkAdmin, { visible: false }));
        } else {
          setCheckAdmin(opts(false));
        }
      });
  };

  return (
    <Wrap className={`flexRow overflowHidden ${className}`}>
      <div className="iconWrap" style={{ backgroundColor: iconColor }}>
        {iconUrl ? <SvgIcon url={iconUrl} fill="#fff" size={16} /> : <Icon icon={defaultIcon} />}
      </div>
      <div
        className={cx('flex nameBox ellipsis Font14 Hand Hover_21')}
        onClick={() => {
          if (createType === 1) {
            window.open(transferExternalLinkUrl(urlTemplate, projectId, appId));
          } else {
            checkIsAppAdmin();
          }
        }}
      >
        {appName}
        {desc && <div className="desc ellipsis Font12 Gray_bd">{desc}</div>}
      </div>
      <Dialog
        visible={checkAdmin.visible}
        title={_l('管理应用“%0”', appName)}
        description={_l('如果你不是应用的管理员，需要将自己加为管理员以获得权限')}
        cancelText=""
        okText={checkAdmin.post ? _l('验证权限...') : _l('加为此应用管理员')}
        onOk={checkAdmin.post ? () => {} : addRoleMemberForAppAdmin}
        onCancel={() => setCheckAdmin(Object.assign({}, checkAdmin, { visible: false }))}
      />
    </Wrap>
  );
}
