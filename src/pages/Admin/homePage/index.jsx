import React, { Fragment, useEffect, useState } from 'react';
import { HomePageWrap, FreeTrialWrap } from './styled';
import cx from 'classnames';
import projectAjax from 'src/api/project';
import processVersionAjax from 'src/pages/workflow/api/processVersion';
import axios from 'axios';
import { Modal, Button, Progress } from 'antd';
import { QUICK_ENTRY_CONFIG, USER_COUNT, ITEM_COUNT, UPLOAD_COUNT, formatFileSize, formatValue } from './config';
import moment from 'moment';
import { getCurrentProject } from 'src/util';
import InstallDialog from './installDialog';
import { Support, Tooltip, Icon } from 'ming-ui';
import addFriends from 'src/components/addFriends/addFriends';
import _ from 'lodash';

export default function HomePage({ match, location: routerLocation }) {
  const { projectId } = _.get(match, 'params');
  const { companyName } = getCurrentProject(projectId);
  const [data, setData] = useState({});
  const [loading, setLoading] = useState(false);
  const [installType, setType] = useState('');
  const [freeTrialVisible, setVisible] = useState(_.includes(routerLocation.pathname, 'showInvite'));
  const isTrial = data.licenseType === 2;
  const isFree = data.licenseType === 0;
  useEffect(() => {
    setLoading(true);
    document.title = _l('组织管理 - 首页 - %0', companyName);
    axios
      .all([
        projectAjax.getProjectLicenseSupportInfo({ projectId }),
        processVersionAjax.getProcessUseCount({ companyId: projectId }),
        projectAjax.getInviteGiveRule({ projectId }),
      ])
      .then(res => {
        let data = res.reduce((p, c) => ({ ...p, ...c }), {});
        setLoading(false);
        setData(data);
      });
  }, []);

  const linkHref = (type, subType) => {
    if (subType) {
      location.assign(`/admin/${type}/${projectId}/${subType}`);
    } else {
      location.assign(`/admin/${type}/${projectId}`);
    }
  };
  const handleActionClick = action => {
    switch (action) {
      case 'addPerson':
        addFriends({
          projectId: projectId,
          fromType: 4,
        });
        break;
      case 'createDepartment':
        location.assign(`/admin/structure/${projectId}/create`);
        break;
      case 'batchImport':
        // location.assign(`/admin/importusers/${projectId}`);
        location.assign(`/admin/structure/${projectId}/importusers`);
        break;
      case 'settingAdmin':
        location.assign(`/admin/sysroles/${projectId}`);
        break;
      case 'completeInfo':
        location.assign(`/admin/sysinfo/${projectId}`);
        break;
      case 'installDesktop':
        setType('desktop');
        break;
      case 'installApp':
        setType('app');
        break;
    }
  };
  const handleClick = type => {
    if (_.includes(['user', 'workflow', 'storage', 'portaluser', 'portalupgrade'], type)) {
      location.assign(`/admin/expansionservice/${projectId}/${type}`);
    }
    if (type === 'recharge') {
      location.assign(`/admin/valueaddservice/${projectId}`);
    }
    if (type === 'upgrade') {
      location.assign(`/admin/upgradeservice/${projectId}`);
    }
    if (type === 'renew') {
      location.assign(`/upgrade/choose?projectId=${projectId}`);
    }
    if (type === 'toast') {
      alert(_l('单应用版暂不支持线上续费，请联系顾问进行续费'), 3);
    }
  };
  const { currentLicense = {}, nextLicense = {} } = data;
  const { endDate, expireDays, startDate, version = {} } = currentLicense;
  const { version: nextVersion, startDate: nextStartDate, endDate: nextEndDate } = nextLicense;
  const versionIdV2 = parseInt(version.versionIdV2);

  const getValue = value => (loading ? '-' : value);

  const getCountText = (key, limit) => {
    if (key === 'useExecCount') {
      return (
        <Fragment>
          {_l('已用')}
          <span className="mLeft4">
            {data[key] >= 1000 ? getValue(data[key] / 10000) + ' ' + _l('万次') : getValue(data[key]) + ' ' + _l('次')}
          </span>
          <span className="mLeft4">/</span>
          <span className="mLeft4">
            {data[limit] >= 10000
              ? getValue(data[limit] / 10000) + ' ' + _l('万次')
              : getValue(data[limit] || 0) + ' ' + _l('次')}
          </span>
          <span className="flex" />
        </Fragment>
      );
    } else {
      return _l('已用 %0 / %1 GB', formatFileSize(data[key]), getValue(data[limit] || 0));
    }
  };
  const getCountProcess = (key, limit) => {
    const value = key === 'useExecCount' ? data[key] : data[key] / (1000 * 1000 * 1000);
    return (value * 100) / data[limit];
  };
  const getOperation = () => {
    return null;
  };
  const getLicenseOperation = () => {
    // 如果是旗舰版 或者是已购买的试用版 不显示
    if (versionIdV2 === 3 || (isTrial && !_.isEmpty(nextLicense))) return null;
    if (isTrial) {
      return (
        <div
          className="delayTrial"
          onClick={() => {
            setVisible(true);
          }}
        >
          <i className="icon-box_trial" />
          <span>{_l('延长试用')}</span>
        </div>
      );
    }
    return (
      <div className={cx('upgrade pointer', { Hidden: loading })} onClick={() => handleClick('upgrade')}>
        {_l('升级')}
      </div>
    );
  };
  const getTotalCount = value => {
    return value >= 10000 ? (
      <span>
        {parseFloat(value / 10000)}
        <span className="Gray_9e Font16">{_l(' 万')}</span>
      </span>
    ) : (
      formatValue(value)
    );
  };
  const isShowInviteUser = (md.global.Account.projects || []).some(it => it.licenseType === 1);

  return (
    <HomePageWrap>
      <div className="infoWrap">
        <div className="infoBox">
          <div className="userInfo userInfoWrap">
            <div className="title bold">{_l('成员')}</div>
            <div className="content">
              {/*<div className="computeMethod">
                <Support
                  type={3}
                  href="https://help.mingdao.com/Prices4.html"
                  text={<span className="Gray_9e Hover_21">{_l('计算方法')}</span>}
                />
              </div>*/}
              <ul>
                {USER_COUNT.map(({ key, text, link }) => (
                  <li
                    className="pointer"
                    key={key}
                    onClick={() => linkHref(link, key === 'notActiveUserCount' ? 'uncursor' : null)}
                  >
                    <div className="name">{text}</div>
                    <div className="count">{formatValue(getValue(data[key] || 0))}</div>
                    { key === 'effectiveUserCount' && (
                      <Fragment onClick={e => e.stopPropagation()}>
                        <div className="limitUser">
                          <span className="nowrap">{_l('上限 %0 人', getValue(data.limitUserCount || 0))}</span>
                          {/* {!isFree && !loading && (
                            <span
                              className="ThemeColor3 hoverColor mLeft10 nowrap "
                              onClick={e => {
                                e.stopPropagation();
                                handleClick('user');
                              }}
                            >
                              {_l('扩充')}
                            </span>
                          )} */}
                        </div>
                      </Fragment>
                    )}
                    {key === 'effectiveExternalUserCount' && (
                      <Fragment>
                        <div className="limitUser">
                          {_l('上限 %0 人', getValue(data.limitExternalUserCount || 0))}
                        </div>
                        {/* {!isFree && !isTrial && !loading && (
                          <div>
                            {data.allowUpgradeExternalPortal && (
                              <Fragment>
                                <span
                                  className="ThemeColor3 hoverColor"
                                  onClick={e => {
                                    e.stopPropagation();
                                    handleClick('portalupgrade');
                                  }}
                                >
                                  {_l('续费')}
                                </span>
                                <span className="mLeft6 mRight6">{_l('或')}</span>
                              </Fragment>
                            )}
                            <span
                              className="ThemeColor3 hoverColor"
                              onClick={e => {
                                e.stopPropagation();
                                handleClick('portaluser');
                              }}
                            >
                              {_l('扩充')}
                            </span>
                          </div>
                        )} */}
                      </Fragment>
                    )}
                  </li>
                ))}
              </ul>
              {isShowInviteUser && (
                <div className="inviteUserWrap">
                  <div className="inviteUserBox">
                    <div className="inviteUser" onClick={() => handleActionClick('addPerson')}>
                      {_l('邀请成员')}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
        <div className="infoBox pRight0">
          <div className="financeInfo">
            <div className="title bold">{_l('版本')}</div>
            <div className="content">
              {isTrial && (
                <div className="trialInfo">
                  <i className="icon-watch_latersvg_22" />
                  {_l('试用还剩 %0 天', getValue(expireDays || 0))}
                </div>
              )}
              <div className="licenseInfoWrap">
                <div className="licenseInfo">
                  <div className="licenseFlag" />
                  <div className="licenseType Font15">{getValue(version.name || '免费版')}</div>
                  {isTrial && <span>{_l('-试用')}</span>}
                  {isFree ? null : (
                    <Fragment>
                      <div className="expireDays">
                        {_l('剩余')}
                        <span>{getValue(expireDays || 0)}</span>
                        {_l('天')}
                      </div>
                      <div className="expireDate">
                        {_l('%0到期', getValue(moment(endDate).format('YYYY年MM月DD日')))}
                      </div>
                      {/* {getLicenseOperation()} */}
                    </Fragment>
                  )}
                </div>
                {!_.isEmpty(nextLicense) && (
                  <div className="nextLicenseInfo">
                    <div className="licenseFlag" />
                    <div className="licenseType Font15">{nextVersion.name}</div>
                    <div className="expireDate">
                      {_l(
                        '%0 ~ %1',
                        moment(nextStartDate).format('YYYY年MM月DD日'),
                        moment(nextEndDate).format('YYYY年MM月DD日'),
                      )}
                    </div>
                  </div>
                )}
                {getOperation()}
              </div>
              {md.global.Config.IsPlatformLocal && <div className="accountInfo">
                <i className="icon-sp_account_balance_wallet_white" />
                <span>{_l('当前账户余额 (￥)')}</span>
                <span className="balance">{getValue(data.balance || 0).toLocaleString()}</span>
              </div>}
              {/* {!isFree && (
                <div className="recharge" onClick={() => handleClick('recharge')}>
                  {_l('充值')}
                </div>
              )} */}
            </div>
          </div>
        </div>
      </div>
      <div className="infoWrap infoWrapCopy">
        <div className="infoBox">
          <div className="userInfo">
            <div className="title overflowHidden">
              <span className="Left bold">{_l('使用')}</span>
              <span
                className="Right Hand Font14 Gray_75"
                onClick={() => {
                  location.assign(`/admin/analytics/${projectId}`);
                }}
              >
                {_l('查看详情')}
                <Icon icon="arrow-right-border" className="mLeft6" />
              </span>
            </div>
            <div className="content">
              <ul>
                {ITEM_COUNT.map(({ key, text, link }) => (
                  <li
                    key={key}
                    className={cx('useAnalysis', {
                      useAnalysisHover: key === 'effectiveApkCount' || key === 'useProcessCount',
                    })}
                    onClick={() => (key === 'effectiveApkCount' || key === 'useProcessCount') && linkHref(link)}
                  >
                    <div className="name">
                      {text}
                      {key === 'effectiveWorksheetRowCount' && (
                        <Tooltip popupPlacement="top" text={<span>{_l('所有工作表行记录总数（包含关闭应用）')}</span>}>
                          <span className="icon-help1 Font13 mLeft8 Gray_9e" />
                        </Tooltip>
                      )}
                    </div>
                    <div className="count">{getTotalCount(getValue(data[key] || 0))}</div>
                    {key === 'effectiveWorksheetCount' && isFree && (
                      <div className="limitUser">{_l('上限 100 个')}</div>
                    )}
                    {key === 'effectiveWorksheetRowCount' && isFree && (
                      <div className="limitUser">{_l('上限 5 万行')}</div>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
        <div className="infoBox pRight0 pTitle">
          <div className="userInfo">
            <div className="content">
              <ul>
                {UPLOAD_COUNT.filter(item =>
                  md.global.Config.IsPlatformLocal ? item : item.key === 'useExecCount',
                ).map(({ key, limit, text, link, click, unit }) => (
                  <li className="pLeft10 pRight10 Hand" onClick={() => linkHref(link)}>
                    <div className="workflowTitle">
                      {text}
                      <span className="Gray_9e">{unit}</span>
                      {key === 'effectiveApkStorageCount' && (
                        <Tooltip
                          popupPlacement="top"
                          text={<span>{_l('应用中本年的附件上传量，上传即占用，删除不会恢复')}</span>}
                        >
                          <span className="icon-help1 Font13 Gray_9e" />
                        </Tooltip>
                      )}
                    </div>
                    <Progress
                      showInfo={false}
                      style={{ margin: '7px 0', textAlign: 'left' }}
                      trailColor="#eaeaea"
                      strokeColor={
                        getCountProcess(key, limit) > 90
                          ? { from: '#F51744 ', to: '  #FF5779' }
                          : { from: '#2196f3 ', to: '  #4bb2ff' }
                      }
                      strokeWidth={4}
                      percent={getCountProcess(key, limit)}
                    />
                    <div className="useCount pointer">
                      {getCountText(key, limit)}
                      {/* {!isTrial && !isFree ? (
                        <span
                          className="dilatation"
                          onClick={e => {
                            e.stopPropagation();
                            e.nativeEvent.stopImmediatePropagation();
                            handleClick(click);
                          }}
                        >
                          {_l('扩容')}
                        </span>
                      ) : null} */}
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
      <div className="quickEntry">
        <div className="title bold">{_l('快捷入口')}</div>
        <div className="content">
          <ul>
            {QUICK_ENTRY_CONFIG.map(({ icon, color, title, explain, action }) => (
              <li key={action} onClick={() => handleActionClick(action)}>
                <div className="wrap">
                  <div className="iconWrap" style={{ backgroundColor: color }}>
                    <i className={`icon-${icon}`} />
                  </div>
                  <div className="text">
                    <div className="entryTitle Font14">{title}</div>
                    <div className="explain">{explain}</div>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
      <InstallDialog type={installType} projectId={projectId} onClose={() => setType('')} />
      <Modal width={720} visible={freeTrialVisible} title={null} footer={null} onCancel={() => setVisible(false)}>
        <FreeTrialWrap>
          <div className="title">{_l('额外获赠最多30天免费试用')}</div>
          <div className="subTitle">{_l('试用期间邀请同事加入即可获赠相应试用天数')}</div>
          <div className="invitePerson">
            {_l('当前已邀请')}
            <span>{data.invitedUserCount || 0}</span>
            {_l('人')}
          </div>
          <div className="expire">
            {_l('试用到期时间：')}
            <span className="expireTime">{data.expireDate ? moment(data.expireDate).format('YYYY-MM-DD') : ''}</span>
            <span className="remainTime">{_l('(剩余时间%0天)', data.leftDays || 0)}</span>
          </div>
          <ul className="inviteRules">
            {(data.rules || []).map(({ inviteCount, addDays, achieveDays }, index) => (
              <li key={inviteCount} style={{ flex: index + 1 }}>
                <div className="achieveDays">
                  <span>{achieveDays}</span>
                  {_l('天')}
                </div>
                <div className={cx('symbolWrap', { activeSymbolWrap: data.invitedUserCount >= inviteCount })}>
                  <div className="iconWrap">
                    <i className="icon-ok" />
                  </div>
                </div>
                <span className="Font12 Gray_75">{_l('邀请%0位用户', inviteCount)}</span>
              </li>
            ))}
          </ul>
          <Button
            style={{ height: '48px', width: '320px' }}
            type="primary"
            block
            onClick={() => handleActionClick('addPerson')}
          >
            {_l('立即邀请同事加入')}
          </Button>
        </FreeTrialWrap>
      </Modal>
    </HomePageWrap>
  );
}
