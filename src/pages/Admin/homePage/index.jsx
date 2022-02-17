import React, { Fragment, useEffect, useState } from 'react';
import { HomePageWrap, FreeTrialWrap } from './styled';
import cx from 'classnames';
import { getProjectLicenseSupportInfo, getInviteGiveRule } from 'src/api/project';
import { getProcessUseCount } from 'src/pages/workflow/api/processVersion';
import axios from 'axios';
import { Modal, Button, Progress } from 'antd';
import { QUICK_ENTRY_CONFIG, USER_COUNT, ITEM_COUNT, UPLOAD_COUNT, formatFileSize, formatValue } from './config';
import moment from 'moment';
import { getCurrentProject } from 'src/util';
import InstallDialog from './installDialog';
import { Support, Tooltip } from 'ming-ui';

const { admin: {homePage, adminLeftMenu: { billinfo, portal } }} = window.private
const {upgrade, computeMethod, recharge, extendWorkflow, renewBtn, userBuy, versionName, delayTrial, quickEntry} = homePage

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
        getProjectLicenseSupportInfo({ projectId }),
        getProcessUseCount({ companyId: projectId }),
        getInviteGiveRule({ projectId }),
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
        require(['dialogSelectUser'], function () {
          $({}).dialogSelectUser({
            title: _l('邀请用户'),
            elementId: 'projectInviteUser',
            sourceId: projectId,
            fromType: 4,
            SelectUserSettings: {
              callback: function (users) {
                require(['src/components/common/inviteMember/inviteMember'], function (Invite) {
                  Invite.inviteByAccountIds(projectId, users);
                });
              },
            },
            ChooseInviteSettings: {
              viewHistory: true, // 是否呈现邀请记录
              callback: function (data, callbackInviteResult) {
                require(['src/components/common/inviteMember/inviteMember'], function (Invite) {
                  Invite.inviteByAccounts(projectId, data, callbackInviteResult);
                });
              },
            },
          });
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
        location.assign(`/admin/rolelist/${projectId}`);
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
      alert(_l('单应用版暂不支持线上续费，请联系顾问进行续费'), 3)
    }
  };
  const { currentLicense = {}, nextLicense = {} } = data;
  const { endDate, expireDays, startDate, version = {} } = currentLicense;
  const { version: nextVersion, startDate: nextStartDate, endDate: nextEndDate } = nextLicense;

  const isTeam = data.licenseType === 1 && version.versionId === 1;
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
    if (version.versionId === 3 || (isTrial && !_.isEmpty(nextLicense))) return null;
    if (isTrial) {
      return (
        <div
          className={cx("delayTrial", {Hidden: delayTrial})}
          onClick={() => {
            setVisible(true);
          }}
        >
          <i className="icon-box_trial"></i>
          <span>{_l('延长试用')}</span>
        </div>
      );
    }
    return (
      <div className={cx('upgrade pointer', { Hidden: upgrade || loading })} onClick={() => handleClick('upgrade')}>
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
  return (
    <HomePageWrap>
      <div className="infoWrap">
        <div className="infoBox">
          <div className="userInfo userInfoWrap">
            <div className="title">{_l('人员与部门')}</div>
            <div className="content">
              <div className={cx("computeMethod Hover_49", { Hidden: computeMethod})}>
                <Support type={3} href="https://help.mingdao.com/Prices4.html" text={_l('计算方法')} />
              </div>
              <ul>
                {USER_COUNT.filter(item => item.key !== 'effectiveExternalUserCount' || !portal).map(({ key, text, link }) => (
                  <li
                    className="pointer"
                    key={key}
                    onClick={() => linkHref(link, key === 'notActiveUserCount' ? 'uncursor' : null)}
                  >
                    <div className="name">{text}</div>
                    <div className="count">{formatValue(getValue(data[key] || 0))}</div>
                    {!isTrial && key === 'effectiveUserCount' && (
                      <div className="limitUser">{_l('最大上限 %0 人', getValue(data.limitUserCount || 0))}</div>
                    )}
                    {key === 'effectiveExternalUserCount' && (
                      <div className="limitUser">{_l('最大上限 %0 人', getValue(data.limitExternalUserCount || 0))}</div>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
        <div className="infoBox pRight0">
          <div className="financeInfo">
            <div className="title">{_l('账务')}</div>
            <div className="content">
              {isTrial && (
                <div className="trialInfo">
                  <i className="icon-watch_latersvg_22"></i>
                  {_l('试用还剩 %0 天', getValue(expireDays || 0))}
                </div>
              )}
              <div className="licenseInfoWrap">
                <div className="licenseInfo">
                  <div className="licenseFlag"></div>
                  <div className={cx("licenseType", {Hidden: versionName})}>{getValue(version.name || '免费版')}</div>
                  {isTrial && <span>{_l('试用')}</span>}
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
                      {getLicenseOperation()}
                    </Fragment>
                  )}
                </div>
                {!_.isEmpty(nextLicense) && (
                  <div className="nextLicenseInfo">
                    <div className="licenseFlag"></div>
                    <div className="licenseType">{nextVersion.name}</div>
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
              <div className={cx("accountInfo", {Hidden: billinfo})}>
                <i className="icon-sp_account_balance_wallet_white"></i>
                <span>{_l('当前账户余额 (￥)')}</span>
                <span className="balance">{getValue(data.balance || 0).toLocaleString()}</span>
              </div>
              {!isFree && (
                <div className={cx("recharge", {Hidden: recharge})} onClick={() => handleClick('recharge')}>
                  {_l('充值')}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      <div className="infoWrap infoWrapCopy">
        <div className="infoBox">
          <div className="userInfo">
            <div className="title">{_l('用量统计')}</div>
            <div className="content">
              <ul>
                {ITEM_COUNT.map(({ key, text, link }) => (
                  <li key={key} className="pointer" onClick={() => linkHref(link)}>
                    <div className="name">
                      {text}
                      {key === 'effectiveWorksheetRowCount' && (
                        <Tooltip popupPlacement="top" text={<span>{_l('所有工作表行记录总数（包含关闭应用）')}</span>}>
                          <span className="icon-help1 Font13 mLeft8 Gray_9e"></span>
                        </Tooltip>
                      )}
                    </div>
                    <div className="count">{getTotalCount(getValue(data[key] || 0))}</div>
                    {key === 'effectiveWorksheetCount' && (isFree || isTeam) && (
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
                {UPLOAD_COUNT.map(({ key, limit, text, link, click, unit }) => (
                  <li className="pLeft10 pRight10 Hand" onClick={() => linkHref(link)}>
                    <div className="workflowTitle">
                      {text}
                      <span className="Gray_9e">{unit}</span>
                      {key === 'effectiveApkStorageCount' && (
                        <Tooltip
                          popupPlacement="top"
                          text={<span>{_l('应用中本年的附件上传量，上传即占用，删除不会恢复')}</span>}
                        >
                          <span className="icon-help1 Font13 Gray_9e"></span>
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
                      {!isTrial &&!extendWorkflow && !isFree ? (
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
                      ) : null}
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
      <div className={cx("quickEntry", {Hidden: quickEntry})}>
        <div className="title">{_l('快捷入口')}</div>
        <div className="content">
          <ul>
            {QUICK_ENTRY_CONFIG.map(({ icon, color, title, explain, action }) => (
              <li key={action} onClick={() => handleActionClick(action)} className={cx({Hidden: homePage[action]})}>
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
                    <i className="icon-ok"></i>
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
