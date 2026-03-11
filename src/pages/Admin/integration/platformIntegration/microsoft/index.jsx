import React, { Fragment, useEffect, useRef, useState } from 'react';
import { useSetState } from 'react-use';
import cx from 'classnames';
import { Button, Dialog, Icon, Input, LoadDiv, Support, Switch, UpgradeIcon } from 'ming-ui';
import workMicrosoftApi from 'src/api/workMicrosoft';
import { buriedUpgradeVersionDialog } from 'src/components/upgradeVersion';
import { getRequest } from 'src/utils/common';
import CancelIntegration from '../components/CancelIntegration';
import SyncDialog from '../components/SyncDialog';
import microsoftImg from '../images/microsoft.png';
import microsoftLoginImg from '../images/microsoftLogin.png';
import { checkClearIntergrationData } from '../utils';
import './style.less';

const TABS = [
  { key: 'base', label: _l('Microsoft Entra 集成') },
  { key: 'sso', label: _l('单点登录设置') },
];

const SSO_DESC = [
  {
    title: _l('启用后:'),
    descList: [
      _l('- 组织成员只允许使用组织的Microsoft帐户单点登录'),
      _l('- 禁止其他所有登录方式（密码、验证码、个人SSO等），避免绕过企业安全策略'),
      _l('- 由 Microsoft Entra 统一管理组织成员的密码策略、登录校验和二次验证'),
    ],
  },
  {
    title: _l('启用条件:'),
    descList: [
      _l('- 您已在 Microsoft Entra 管理所有组织成员'),
      _l('- 您本平台的组织已集成 Microsoft Entra 并完成所有用户同步'),
    ],
  },
];

export default function Microsoft(props) {
  const { onClose, projectId, featureId, featureType } = props;
  const [pageLoading, setPageLoading] = useState(true);
  const [linkLoading, setLinkLoading] = useState(false);
  const [checkLoading, setCheckLoading] = useState(false);
  const [bindDialogVisible, setBindDialogVisible] = useState(false);
  const [currentTab, setCurrentTab] = useState('base');
  const [setting, setSetting] = useSetState({
    enable: false,
    groupId: '',
    tenantId: '',
    clientId: '',
    state: '',
    entraOnlyLogin: false,
  });
  const { tenantId, state } = getRequest() || {};
  const onlyLoginAjax = useRef(null);

  useEffect(() => {
    getSetting();
  }, []);

  const getSetting = async () => {
    setPageLoading(true);

    if (tenantId && state) {
      await workMicrosoftApi.setWorkMicrosoftTenantId({ tenantId, state });
      history.replaceState(null, '', `/admin/platformintegration/${projectId}`);
    }

    workMicrosoftApi
      .getWorkMicrosoftProjectSettingInfo({ projectId })
      .then(res => {
        res && setSetting(res);
      })
      .finally(() => {
        setPageLoading(false);
      });
  };

  const onConnectMicrosoft = () => {
    const handleConnect = () => {
      const targetOrigin = 'https://login.microsoftonline.com/organizations/adminconsent';
      const redirectUrl = `${md.global.Config.WebUrl}microsoftAuth`;
      const url = `${targetOrigin}?client_id=${setting.clientId}&redirect_uri=${encodeURIComponent(redirectUrl)}&state=${setting.state}_${projectId}`;
      location.href = url;
    };

    setLinkLoading(true);
    checkClearIntergrationData({
      projectId,
      integrationType: 7,
      onSave: handleConnect,
      onClose: () => setLinkLoading(false),
    });
  };

  const onEdit = (key, value, isCancel) => {
    if (
      key === 'groupId' &&
      value &&
      !/^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/.test(value)
    ) {
      alert(_l('GroupID格式不正确'), 2);
      return;
    }

    workMicrosoftApi.editMicrosoftProjectSetting({ projectId, [key]: value }).then(res => {
      const { item1, item2 } = res || {};
      if (!item1) {
        alert(item2 || _l('操作失败'), 2);
        return;
      }

      if (key === 'enable') {
        if (isCancel) {
          alert(_l('取消成功'));
          onClose();
        }
        setSetting({ [key]: value });
      }
    });
  };

  const onChangeEntraOnlyLogin = value => {
    if (onlyLoginAjax.current) {
      onlyLoginAjax.current.abort();
    }
    onlyLoginAjax.current = workMicrosoftApi.setEntraOnlyLogin({ projectId, status: value });
    onlyLoginAjax.current
      .then(res => {
        if (res) {
          setSetting({ entraOnlyLogin: value === 1 });
          alert(value === 1 ? _l('启用成功') : _l('关闭成功'));
        } else {
          alert(_l('操作失败'), 2);
        }
      })
      .finally(() => {
        onlyLoginAjax.current = null;
      });
  };

  const checkSync = () => {
    if (featureType === '2') {
      buriedUpgradeVersionDialog(projectId, featureId);
      return;
    }

    setCheckLoading(true);
    workMicrosoftApi
      .checkMicrosoftToMingByApp({ projectId })
      .then(res => {
        const { item1, item2, item3 = {} } = res;
        if (!item1) {
          alert(_l(item2 || '同步失败'), 2);
          return;
        }

        const { logDetailItems = [] } = item3;
        const bindUsers = logDetailItems.find(item => item.type === 6)?.items?.length || 0;
        const newUsers = logDetailItems.find(item => item.type === 4)?.items?.length || 0;
        const deletedUsers = logDetailItems.find(item => item.type === 5)?.items?.length || 0;
        const restoredUsers = logDetailItems.find(item => item.type === 17)?.items?.length || 0;
        onSync({ bindUsers, newUsers, deletedUsers, restoredUsers });
      })
      .finally(() => {
        setCheckLoading(false);
      });
  };

  const onSync = ({ bindUsers, newUsers, deletedUsers, restoredUsers }) => {
    Dialog.confirm({
      width: 600,
      title: _l('确定同步？'),
      description: (
        <div>
          <div>{_l('- 同步以 Microsoft Entra 为主，停用/删除用户，平台会解除账号绑定关系，并做离职处理')}</div>
          <div>{_l('- 平台会给未绑定组织用户的 Microsoft Entra 用户创建一个组织账号绑定')}</div>
        </div>
      ),
      children: (
        <div className="Font14 bold">
          {_l(
            '绑定到已有组织用户：%0个；新增组织用户%1个，删除与组织用户绑定关系%2个，已恢复离职用户%3个',
            bindUsers,
            newUsers,
            deletedUsers,
            restoredUsers,
          )}
        </div>
      ),
      okText: _l('同步'),
      onOk: () => {
        workMicrosoftApi.syncMicrosoftToMingByApp({ projectId, userMaps: {} }).then(res => {
          const { item1, item2 } = res;
          !item1 ? alert(_l(item2 || '同步失败'), 2) : alert(_l('同步成功'));
        });
      },
    });
  };

  if (pageLoading) {
    return <LoadDiv className="mTop80" />;
  }

  return (
    <div className="orgManagementWrap microsoftMainContent platformIntegrationContent">
      <div className="orgManagementHeader">
        <div className="h100 flexRow alignItemsCenter">
          {setting.enable ? (
            <div className="tabBox">
              {TABS.map(({ key, label }) => {
                return (
                  <span
                    key={key}
                    className={cx('tabItem Hand', { active: currentTab === key })}
                    onClick={() => setCurrentTab(key)}
                  >
                    {label}
                  </span>
                );
              })}
            </div>
          ) : (
            <Fragment>
              <i className="icon-backspace Font22 ThemeHoverColor3 pointer mRight10" onClick={onClose} />
              <div className="Font17 bold">{_l('Microsoft Entra 集成')}</div>
            </Fragment>
          )}
        </div>
        {setting.enable && <CancelIntegration clickCancel={() => onEdit('enable', false, true)} />}
      </div>

      {!setting.tenantId ? (
        <div className="linkPageWrapper flexColumn alignItemsCenter justifyContentCenter">
          <div className="flexRow alignItemsCenter">
            <img src={microsoftImg} alt="Microsoft" className="microsoftLogo" />
            <Icon icon="swap_horiz" className="Font36 mLeft60 mRight60 Gray_bd" />
            <Icon icon="hap" className="colorPrimary Font50" />
          </div>

          <div className="mTop32 bold Font20">{_l('连接 Microsoft Entra / Microsoft 365 组织目录')}</div>
          <div className="mTop36 TxtCenter Font14">
            {_l(
              '使用 Microsoft Entra 租户管理员账号完成授权后，平台将以只读方式访问 Entra （原 Azure AD，Microsoft 365 的统一身份目录），同步用户信息用于平台创建、更新成员，平台不会修改 Entra 目录中的任何数据。授权完成后，可在「单点登录设置」中将 Microsoft Entra 设为本组织的唯一登录方式。',
            )}
          </div>
          <Button type="primary" className="mTop36" radius loading={linkLoading} onClick={onConnectMicrosoft}>
            {_l('连接 Microsoft Entra')}
          </Button>
        </div>
      ) : (
        <div className="orgManagementContent">
          {currentTab === 'base' && (
            <div className="pBottom100">
              {/* 1.已授权应用 */}
              <div className="stepItem">
                <div className="flexRow alignItemsCenter">
                  <div className="stepTitle flex">{_l('1.授权组织')}</div>
                  <Switch checked={setting.enable} onClick={() => onEdit('enable', !setting.enable)} />
                </div>

                {setting.enable && (
                  <Fragment>
                    <div className="stepDesc">
                      {_l(
                        ' Microsoft Entra 管理员已授权此组织，平台将以只读方式访问您的Microsoft Entra目录，用于同步员工账号信息，不会修改任何数据。',
                      )}
                    </div>
                    <div className="mTop24">
                      <span>{_l('已授权的Microsoft TenantID')}</span>
                      <span className="mLeft48">{setting.tenantId}</span>
                    </div>
                  </Fragment>
                )}
              </div>

              {/* 2.员工同步范围配置 */}
              <div className="stepItem">
                <div className="stepTitle">{_l('2.员工同步范围')}</div>
                {setting.enable && (
                  <Fragment>
                    <div className="stepDesc">
                      <div>
                        <span>
                          {_l(
                            '可在 Microsoft Entra 后台创建一个安全组，并将需要同步到平台的成员加入该组，平台后续仅同步该安全组内的用户及其相关信息；如不填写安全组（GroupID 为空），则默认同步目录下的全部成员。',
                          )}
                        </span>
                        <Support
                          type={3}
                          text={_l('参考帮助文档')}
                          href="https://help.mingdao.com"
                          className="mBottom2"
                        />
                      </div>
                    </div>
                    <div className="flexRow alignItemsCenter mTop16">
                      <div className="mRight30">GroupID</div>
                      <Input
                        className="flex"
                        placeholder={_l('请输入GroupID')}
                        value={setting.groupId}
                        onChange={value => setSetting({ groupId: value })}
                        onBlur={() => onEdit('groupId', setting.groupId)}
                      />
                    </div>
                  </Fragment>
                )}
              </div>

              {/* 3.数据同步 */}
              <div className="stepItem">
                <div className="stepTitle">{_l('3.数据同步')}</div>
                <div className="flexRow alignItemsCenter">
                  <div className="stepDesc flex">
                    <span>
                      {_l(
                        '将按当前授权与同步范围，从 Microsoft Entra 读取最新用户信息，在平台创建账号或更新用户信息。',
                      )}
                    </span>
                    <span
                      className="ThemeColor3 Hand mLeft8 ThemeHoverColor2"
                      onClick={() => setBindDialogVisible(true)}
                    >
                      {_l('账号绑定关系列表')}
                    </span>
                  </div>
                  <Button
                    type="primary"
                    className="Height36 mLeft50 syncBtn"
                    onClick={checkSync}
                    disabled={checkLoading || !setting.enable}
                  >
                    {checkLoading ? _l('正在计算，请稍等') : _l('同步')}
                  </Button>
                </div>
              </div>
            </div>
          )}

          {currentTab === 'sso' && (
            <div className="flexRow">
              <div className="flex">
                <div className="Font22 bold">{_l('将 Microsoft Entra 设为组织唯一登录方式')}</div>
                {SSO_DESC.map(({ title, descList }, index) => {
                  return (
                    <div key={`subTitle-${index}`} className="mTop32">
                      <div className="Font14 bold">{title}</div>
                      <div className="Font14">
                        {descList.map((desc, i) => (
                          <div className="mTop16" key={i}>
                            {desc}
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
                <div className="flexRow alignItemsCenter mTop32">
                  <Button
                    type="primary"
                    className="enableBtn"
                    disabled={setting.entraOnlyLogin}
                    onClick={() => {
                      featureType === '2'
                        ? buriedUpgradeVersionDialog(projectId, featureId)
                        : onChangeEntraOnlyLogin(1);
                    }}
                  >
                    <div className="flexRow alignItemsCenter">
                      {setting.entraOnlyLogin && <Icon icon="done" className="mRight4 Font16" />}
                      <span>{_l('启用')}</span>
                    </div>
                  </Button>
                  {!setting.entraOnlyLogin && featureType === '2' && <UpgradeIcon className="mLeft10" />}
                  {setting.entraOnlyLogin && (
                    <Button type="ghost" className="mLeft10 closeBtn" onClick={() => onChangeEntraOnlyLogin(2)}>
                      {_l('关闭')}
                    </Button>
                  )}
                </div>

                <div className="mTop24">
                  <span className="bold">{_l('注意：')}</span>
                  <span>
                    {_l('单点登录对所有已经同步绑定的成员生效，未同步绑定的成员不生效可继续使用平台账户登录')}
                  </span>
                </div>
              </div>
              <div className="mTop36">
                <img src={microsoftLoginImg} style={{ marginRight: 100 }} width={160} />
              </div>
            </div>
          )}
        </div>
      )}

      <SyncDialog
        visible={bindDialogVisible}
        isBindRelationship={true}
        projectId={projectId}
        integrationType={7}
        onCancel={() => setBindDialogVisible(false)}
      />
    </div>
  );
}
