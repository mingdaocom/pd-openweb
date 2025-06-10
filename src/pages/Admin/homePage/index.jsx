import React, { Fragment, useEffect, useState } from 'react';
import { useSetState } from 'react-use';
import { Button, Modal, Progress } from 'antd';
import cx from 'classnames';
import _ from 'lodash';
import moment from 'moment';
import { Dialog, Icon, Support, Tooltip } from 'ming-ui';
import certificationApi from 'src/api/certification.js';
import projectAjax from 'src/api/project';
import projectSettingAjax from 'src/api/projectSetting';
import processVersionAjax from 'src/pages/workflow/api/processVersion';
import addFriends from 'src/components/addFriends';
import { purchaseMethodFunc } from 'src/components/pay/versionUpgrade/PurchaseMethodModal';
import SelectCertification from 'src/pages/certification/SelectCertification';
import { settingEarlyWarning } from 'src/pages/workflow/WorkflowList/components/WorkflowMonitor/EarlyWarningDialog';
import { navigateTo } from 'src/router/navigateTo';
import { formatNumberThousand } from 'src/utils/control';
import { getCurrentProject, getFeatureStatus } from 'src/utils/project';
import BalanceManage from '../components/BalanceManage';
import PurchaseExpandPack from '../components/PurchaseExpandPack';
import { PERMISSION_ENUM } from '../enum';
import { formatFileSize, formatValue, QUICK_ENTRY_CONFIG, UPLOAD_COUNT } from './config';
import PurchaseIcon from './image/purchaseIcon.png';
import TimeIcon from './image/time.png';
import InstallDialog from './installDialog';
import { FreeTrialWrap, HomePageWrap, TitleWrap } from './styled';

export default function HomePage({ match, location: routerLocation, authority, ...reset }) {
  const { projectId } = _.get(match, 'params');
  const { companyName } = getCurrentProject(projectId);
  const [data, setData] = useSetState({ basicLoading: true, hideBalance: true });
  const [installType, setType] = useState('');
  const [freeTrialVisible, setVisible] = useState(_.includes(routerLocation.pathname, 'showInvite'));
  const isTrial = data.licenseType === 2;
  const isFree = data.licenseType === 0;
  const isEnLang = md.global.Account.lang === 'en';
  const isLocal = md.global.Config.IsLocal;
  const isCloseProject = !_.find(md.global.Account.projects, l => l.projectId === projectId);

  useEffect(() => {
    document.title = _l('组织管理 - 首页 - %0', companyName);
    getBaseData();
    getUsageData();
    getVersionInfo();
    getBalanceLimitNoticeSettings();
  }, []);

  useEffect(() => {
    if (!freeTrialVisible || data.rules) return;
    projectAjax.getInviteGiveRule({ projectId }).then(res => {
      setData(res);
    });
  }, [freeTrialVisible]);

  // 获取版本信息
  const getVersionInfo = () => {
    processVersionAjax.getProcessUseCount({ companyId: projectId }).then(res => {
      setData(res);
    });
  };

  // 获取基本信息
  const getBaseData = () => {
    projectAjax.getProjectLicenseSupportInfo({ projectId, onlyNormal: true, onlyUsage: false }).then(res => {
      if (!res.currentLicense.version) {
        res.currentLicense.version = { name: _l('免费版') };
      }
      const resData = _.omit(res, [
        'effectiveApkCount',
        'effectiveApkStorageCount',
        'effectiveWorkflowCount',
        'effectiveWorksheetCount',
        'effectiveWorksheetRowCount',
        'effectiveDataPipelineJobCount',
        'effectiveDataPipelineEtlJobCount',
        'effectiveDataPipelineRowCount',
        'effectiveAggregationTableCount',
      ]);
      resData.basicLoading = false;
      setData(resData);
    });
  };

  // 获取用量信息
  const getUsageData = data => {
    projectAjax.getProjectLicenseSupportInfo({ projectId, onlyNormal: false, onlyUsage: true }).then(res => {
      const {
        effectiveApkCount,
        effectiveApkStorageCount,
        effectiveWorkflowCount,
        effectiveWorksheetCount,
        effectiveWorksheetRowCount,
        effectiveDataPipelineJobCount,
        effectiveDataPipelineEtlJobCount,
        effectiveDataPipelineRowCount,
        effectiveAggregationTableCount,
      } = res;
      setData({
        effectiveApkCount,
        effectiveApkStorageCount,
        effectiveWorkflowCount,
        effectiveWorksheetCount,
        effectiveWorksheetRowCount,
        effectiveDataPipelineJobCount,
        effectiveDataPipelineEtlJobCount,
        effectiveDataPipelineRowCount,
        effectiveAggregationTableCount,
      });
    });
  };

  // 获取组织余额警告提醒
  const getBalanceLimitNoticeSettings = () => {
    projectSettingAjax.getOnlyManagerSettings({ projectId }).then(res => {
      res && setData({ balanceInfo: res.balanceLimitNotice });
    });
  };

  const linkHref = (type, subType) => {
    if (subType) {
      navigateTo(`/admin/${type}/${projectId}/${subType}`);
    } else {
      navigateTo(`/admin/${type}/${projectId}`);
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
    if (type === 'recharge') {
      location.assign(`/admin/valueaddservice/${projectId}`);
    }
    if (type === 'upgrade') {
      location.assign(`/admin/upgradeservice/${projectId}`);
    }
    if (type === 'renew') {
      purchaseMethodFunc({ projectId, isTrial });
    }
    if (type === 'toast') {
      alert(_l('单应用版暂不支持线上续费，请联系顾问进行续费'), 3);
    }
  };

  // 身份认证
  const handleAuthenticate = () => {
    Dialog.confirm({
      title: _l('请先完成组织身份认证'),
      description: _l('需要完成组织身份认证后才能进行余额充值'),
      okText: _l('前往认证'),
      onOk: () => {
        certificationApi.getCertInfoList({ certSource: 1, isUpgrade: false }).then(res => {
          if (res && !!res.length) {
            SelectCertification({
              certList: res,
              projectId,
              onUpdateCertStatus: authType => setData({ authType }),
            });
          } else {
            navigateTo(`/certification/project/${projectId}?returnUrl=${encodeURIComponent(location.href)}`);
          }
        });
      },
    });
  };

  const { currentLicense = {}, nextLicense = {} } = data;
  const { endDate, expireDays, version = {} } = currentLicense;
  const { version: nextVersion, startDate: nextStartDate, endDate: nextEndDate } = nextLicense;
  const versionIdV2 = parseInt(version.versionIdV2);

  const isTeam = data.licenseType === 1 && versionIdV2 === 1;
  const getValue = value => (_.isUndefined(value) || _.isNaN(value) ? '-' : value);

  const getNoLimit = key => {
    const isSingleVersion = versionIdV2 === 0;

    if (isCloseProject) return false;

    switch (key) {
      case 'limitWorksheetCount':
        return isLocal ? data[key] === 2147483647 : !isFree && !isTeam && !isSingleVersion;
      case 'limitDataPipelineJobCount':
        return !isFree && !isLocal && !isSingleVersion;
      case 'limitDataPipelineEtlJobCount':
        return !isFree && !isLocal && !isSingleVersion;
      case 'limitAllWorksheetRowCount':
        return !isFree && !isSingleVersion;
      case 'limitAggregationTableCount':
        return isLocal && versionIdV2 === 3;
    }
    return false;
  };

  const getAllowAdd = key => {
    switch (key) {
      case 'limitExternalUserCount':
        return !isFree && !isTrial;
      default:
        return !getNoLimit(key) && !isCloseProject;
    }
  };

  const getUsage = (key, numUnit, isAttachmentUpload) => {
    if (getValue(data[key]) === '-' || getNoLimit(key)) return _l('不限');

    return isAttachmentUpload
      ? formatFileSize(data[key])
      : isEnLang
        ? `${formatValue(data[key])} ${numUnit}`
        : data[key] >= 100000000
          ? _l('%0 亿+', _.floor(getValue(data[key] / 100000000), 4)) + numUnit
          : data[key] >= 10000
            ? _l('%0 万', getValue(data[key] / 10000)) + numUnit
            : `${getValue(data[key])} ${numUnit}`;
  };

  const getCountText = (key, limit, numUnit) => {
    const isAttachmentUpload = key === 'effectiveApkStorageCount'; // 附件上传量

    return (
      <div className="useCount">
        <div>{_l('已用: %0', getUsage(key, numUnit, isAttachmentUpload))}</div>
        <div className="flex TxtRight">
          <span className="mLeft4">
            {isAttachmentUpload ? `${getValue(data[limit])}GB` : getUsage(limit, numUnit, isAttachmentUpload)}
          </span>
        </div>
      </div>
    );
  };

  const getCountProcess = (key, limit) => {
    if (getValue(data[limit]) === '-' || getNoLimit(limit)) return 1;

    let percent = 0;

    if (
      [
        'effectiveDataPipelineRowCount',
        'useExecCount',
        'effectiveAggregationTableCount',
        'effectiveExternalUserCount',
        'effectiveWorksheetCount',
        'effectiveWorksheetRowCount',
      ].includes(key)
    ) {
      percent =
        data[key] / data[limit] > 0 && (data[key] / data[limit]) * 10000 <= 1
          ? 0.01
          : ((data[key] / data[limit]) * 100).toFixed(2);
    } else {
      percent = ((data[key] / (getValue(data[limit]) * Math.pow(1024, 3))) * 100).toFixed(2);
    }
    return percent;
  };

  const isShowInviteUser = (md.global.Account.projects || []).some(it => it.licenseType === 1);

  // 设置余额警告提醒
  const setBalanceLimitNotice = ({ noticeEnabled, balanceLimit, notifiers, noticeTypes, closeDialog = () => {} }) => {
    projectSettingAjax
      .setBalanceLimitNotice({
        projectId,
        noticeEnabled,
        balanceLimit,
        accountIds: notifiers.map(v => v.accountId),
        noticeTypes: _.uniq(noticeTypes),
      })
      .then(res => {
        if (res) {
          alert(_l('操作成功'));
          closeDialog();
          setData({
            balanceInfo: {
              ...data.balanceInfo,
              noticeEnabled,
              balanceLimit,
              noticeAccounts: notifiers,
              noticeTypes,
            },
          });
        } else {
          alert(_l('操作失败'), 2);
        }
      });
  };

  const setEarlyWarning = () => {
    const { balanceInfo = {} } = data;

    settingEarlyWarning({
      type: 'balance',
      projectId,
      warningValue: balanceInfo.balanceLimit,
      isWarning: balanceInfo.noticeEnabled,
      notifiers: balanceInfo.noticeAccounts,
      noticeTypes: balanceInfo.noticeTypes,
      onOk: (warningValue, notifiers, noticeTypes, closeDialog) => {
        setBalanceLimitNotice({
          noticeEnabled: true,
          balanceLimit: warningValue,
          notifiers,
          noticeTypes,
          closeDialog,
        });
      },
      closeWarning: (warningValue, notifiers, noticeTypes, closeDialog) => {
        setBalanceLimitNotice({
          noticeEnabled: false,
          balanceLimit: 0,
          notifiers,
          noticeTypes,
          closeDialog,
        });
      },
    });
  };

  const handleClickRecherge = () => {
    if (isFree && !data.authType) {
      handleAuthenticate();
      return;
    }
    handleClick('recharge');
  };

  const renderVersionCard = () => {
    const hasNextLicense = !_.isEmpty(nextLicense);
    const surplus = getValue(expireDays || 0);

    return (
      <div className="infoCard row1">
        <div>
          <div className="Font16 bold Gray mBottom6">{_l('版本')}</div>
          <div className="Font28 bold Gray mBottom8 valignWrapper">
            {getValue(version.name)}
            {isTrial && <span className="trialTag Font14 Bold">{_l('试用中')}</span>}
          </div>
          {!data.basicLoading && (
            <Fragment>
              {hasNextLicense && (
                <div className="Font14 mBottom10">
                  <span className="renewTag mRight10">
                    <Icon icon="done" className="doneIcon" />
                    <span className="Bold">{_l('已续费')}</span>
                  </span>
                  {_.get(nextLicense, 'version.versionIdV2') !== _.get(version, 'versionIdV2') && (
                    <span className="Gray">{nextVersion.name}</span>
                  )}
                </div>
              )}
              {isTrial && (
                <div className="Font14 bold">
                  <span className="mRight8 Yellow_de9">{_l('免费试用剩余 %0 天', surplus)}</span>
                  {!hasNextLicense && !isLocal && (
                    <span className="ThemeColor Hand" onClick={() => setVisible(true)}>
                      {_l('延长试用')}
                    </span>
                  )}
                </div>
              )}
              {!isFree && !isTrial && (
                <Fragment>
                  <div className="Font14">
                    {hasNextLicense ? (
                      <span className="Gray_75 mRight5">{_l('当前授权')}</span>
                    ) : surplus < 31 ? (
                      <span className="Red_f00 bold mRight5">{_l('剩余 %0 天', surplus)}</span>
                    ) : null}
                    <span className="Gray_75">{_l('%0到期', getValue(createTimeSpan(endDate, 4)))}</span>
                  </div>
                  {hasNextLicense && (
                    <div className="Font14 Gray_75">
                      <span className="mRight5">{_l('下个授权')}</span>
                      {_l('%0到期', getValue(createTimeSpan(nextLicense.endDate, 4)))}
                      <Tooltip
                        text={
                          <span>
                            {_l('下个授权：%0', nextVersion.name)}
                            <br />
                            {`${createTimeSpan(nextLicense.startDate, 4)} ${moment(nextLicense.startDate).format(
                              'HH:mm',
                            )} ${_l('开始')}`}
                          </span>
                        }
                      >
                        <Icon icon="info" className="Gray_9e mLeft4 Hand" />
                      </Tooltip>
                    </div>
                  )}
                </Fragment>
              )}
            </Fragment>
          )}
        </div>
        {!data.basicLoading && !isLocal && (
          <div className="buttons">
            {!isFree && _.isEmpty(nextLicense) && (
              <div
                className={cx('Bold', isTrial ? 'greenBtn' : 'blueBtn')}
                onClick={() => handleClick(versionIdV2 === 0 ? 'toast' : 'renew')}
              >
                <img src={isTrial ? PurchaseIcon : TimeIcon} />
                {isTrial ? _l('购买') : _l('续费')}
              </div>
            )}
            {(isFree || (versionIdV2 !== 3 && !isTrial)) && (
              <div
                className={cx('Bold', isFree ? 'greenBtn' : 'whiteBtn')}
                onClick={() => handleClick(isFree ? 'renew' : 'upgrade')}
              >
                <span className="mRight6">🚀</span>
                {_l('升级')}
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  const renderUserCard = () => {
    return (
      <div className={cx('infoCard', { row1: md.global.Config.IsPlatformLocal === false })}>
        <div>
          <div className="Font16 bold Gray mBottom6 valignWrapper mBottom6">
            {_l('用户')}
            {!isLocal && (
              <Support
                className="mLeft6 helpIcon Hover_21"
                type={1}
                title={_l('点击查看人数计算规则')}
                href="https://help.mingdao.com/purchase/user-billing"
              />
            )}
          </div>
          <div className="mBottom6">
            <span className="Font28 Gray Bold Hand" onClick={() => linkHref('structure')}>
              {formatValue(getValue(data.effectiveUserCount || 0))}
            </span>
            <span className="mLeft6 Black Font13">{_l('人')}</span>
          </div>
          {(!isTrial || isLocal) && !data.basicLoading && (
            <div className="Font14">
              <span className="Gray_75">{_l('上限 %0 人', getValue(data.limitUserCount || 0))}</span>
              {!isFree && !_.isUndefined(data.limitUserCount) && (
                <PurchaseExpandPack
                  className="mLeft8 hoverColor"
                  text={_l('扩充人数')}
                  type="user"
                  projectId={projectId}
                />
              )}
              {/* {!isFree && !isTrial && (
                <div className="recharge" onClick={() => handleClick('recharge')}>
                  {_l('充值')}
                </div>
              )} */}
            </div>
          )}
        </div>
        {isShowInviteUser && (
          <div className="buttons">
            <div className="blueBtn Bold" onClick={() => handleActionClick('addPerson')}>
              {_l('邀请成员')}
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderBalanceCard = () => {
    const IsPlatformLocal = md.global.Config.IsPlatformLocal;

    if (IsPlatformLocal === false) return;

    const balanceInfo = data.balanceInfo;
    const hasBalance = authority.includes(PERMISSION_ENUM.FINANCE);
    const trialAuthenticate = !isLocal && isTrial && !data.authType;

    return (
      <div className="infoCard">
        <div>
          <div className="Font16 bold Gray mBottom6 valignWrapper mBottom6">
            {_l('账户余额')}
            <Tooltip
              text={_l(
                '用于系统中发送邮件、短信等计费服务项目自动扣费。为避免系统功能不可用，请保障账户余额充足。【点击查看详细说明】',
              )}
              popupPlacement="bottom"
            >
              <Icon icon="workflow_help" className="mLeft6 Hover_21 helpIcon" />
            </Tooltip>
          </div>
          <div className="mBottom6">
            <span className="Font28 Gray Bold Hand">
              {data.hideBalance ? '*****' : formatNumberThousand(data.balance)}
            </span>
            <span className="mLeft6 Black Font13 mRight8">{_l('元')}</span>
            <Icon
              icon={data.hideBalance ? 'eye_off' : 'eye'}
              className="Gray_9e eyeIcon Hand"
              onClick={() => setData({ hideBalance: !data.hideBalance })}
            />
          </div>
          {!_.isEmpty(balanceInfo) && hasBalance && (
            <div className="Font14">
              {!!balanceInfo.noticeEnabled && (
                <span className="Gray_70 mRight8">{_l('预警（<%0元）', balanceInfo.balanceLimit || 0)}</span>
              )}
              <span className="ThemeColor Hand hoverColor" onClick={setEarlyWarning}>
                {balanceInfo.noticeEnabled ? _l('设置') : _l('余额预警')}
              </span>
            </div>
          )}
        </div>
        <div className="buttons">
          {trialAuthenticate ? (
            <span className="recharge trialAuthenticate" onClick={handleAuthenticate}>
              <Icon icon="gift" className="mRight5" />
              {_l('认证组织+10元余额')}
            </span>
          ) : (
            <Fragment>
              {!md.global.Config.IsLocal && ((isTrial && data.authType) || !isTrial) && (
                <span className="blueBtn Bold" onClick={handleClickRecherge}>
                  {_l('充值')}
                </span>
              )}
              {hasBalance && (
                <Fragment>
                  <span className="whiteBtn Bold" onClick={() => linkHref('billinfo')}>
                    {_l('使用明细')}
                  </span>
                  {/*<span className="whiteBtn Bold" onClick={() => setData({ balanceManageVisible: true })}>
                    {_l('管理')}
                  </span>
                  */}
                </Fragment>
              )}
            </Fragment>
          )}
        </div>
      </div>
    );
  };

  const renderBasicInfo = () => {
    return (
      <div className="basicInfo">
        {renderVersionCard()}
        {renderUserCard()}
        {renderBalanceCard()}
      </div>
    );
  };

  const renderLimit = () => {
    const IsPlatformLocal = md.global.Config.IsPlatformLocal;
    const hasBalance = IsPlatformLocal !== false && authority.includes(PERMISSION_ENUM.FINANCE);

    return (
      <div className="infoWrap infoWrapCopy">
        <div className="infoBox pRight0">
          <div className="userInfo">
            <div className="content">
              <ul>
                {UPLOAD_COUNT.filter(item => (IsPlatformLocal || !isLocal ? item : item.isLocalFilter)).map(item => {
                  const {
                    key,
                    limit,
                    text,
                    link,
                    click,
                    numUnit,
                    featureId,
                    routePath = undefined,
                    autoPurchase,
                  } = item;

                  if (featureId && !getFeatureStatus(projectId, featureId)) return;

                  const percentValue = getCountProcess(key, limit);

                  return (
                    <li
                      className="Hand"
                      onClick={() => {
                        if (
                          [
                            'effectiveDataPipelineRowCount',
                            'effectiveDataPipelineJobCount',
                            'effectiveDataPipelineEtlJobCount',
                          ].includes(key)
                        ) {
                          localStorage.setItem('currentProjectId', projectId);
                          return location.assign('/integration/task');
                        }
                        link && linkHref(link);
                      }}
                    >
                      <div className="workflowTitle flexRow">
                        <div className="flex">
                          <span className="Font15 Bold">{text}</span>
                          {key === 'effectiveApkStorageCount' && (
                            <Tooltip
                              popupPlacement="top"
                              text={<span>{_l('应用中本年的附件上传量，上传即占用，删除不会恢复')}</span>}
                            >
                              <span className="icon-help1 Font13 Gray_9e" />
                            </Tooltip>
                          )}
                        </div>
                        {link && <span className="Gray_9e Bold Font13 Hover_21 detailBtn">{_l('查看')}</span>}
                        {!!item.PurchaseExpandPack && getAllowAdd(limit) && (
                          <PurchaseExpandPack
                            className="mLeft12 Bold Hover_theme"
                            text={_l('扩容')}
                            type={click}
                            projectId={projectId}
                            routePath={routePath}
                          />
                        )}
                      </div>
                      <Progress
                        showInfo={false}
                        style={{ margin: '7px 0', textAlign: 'left' }}
                        trailColor="#eaeaea"
                        strokeColor={
                          _.isNaN(Number(percentValue))
                            ? '#eaeaea'
                            : percentValue > 90
                              ? { from: '#F51744 ', to: '#FF5779' }
                              : { from: '#2196f3 ', to: '#4bb2ff' }
                        }
                        strokeWidth={4}
                        percent={percentValue}
                      />
                      {getCountText(key, limit, numUnit)}
                      {!md.global.Config.IsLocal && hasBalance && !!autoPurchase && !data[autoPurchase] && (
                        <span
                          className="mTop10 InlineBlock Gray_75 Font13 Underline Hover_21"
                          onClick={e => {
                            e.stopPropagation();
                            setData({ balanceManageVisible: true });
                          }}
                        >
                          {_l('启用自动增补')}
                        </span>
                      )}
                      {data[autoPurchase] && item.autoPurchaseText && (
                        <div className="mTop10 Gray_75 Font13 mul2_overflow_ellipsis">{item.autoPurchaseText}</div>
                      )}
                    </li>
                  );
                })}
              </ul>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <HomePageWrap>
      {renderBasicInfo()}
      <TitleWrap>
        <span className="flex overflow_ellipsis">{_l('组织额度')}</span>
        <span className="titleBtn" onClick={() => linkHref('analytics')}>
          <Icon icon="stats_line_chart" className="ThemeColor Font16 mRight3" />
          {_l('使用分析')}
        </span>
      </TitleWrap>
      {renderLimit()}
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
                    <div className="entryTitle Font14 Bold">{title}</div>
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
      <BalanceManage
        visible={data.balanceManageVisible || false}
        projectId={projectId}
        value={_.pick(data, [
          'autoPurchaseWorkflowExtPack',
          'autoPurchaseApkStorageExtPack',
          'autoPurchaseDataPipelineExtPack',
        ])}
        onClose={() => setData({ balanceManageVisible: false })}
        onChange={value => setData(value)}
      />
    </HomePageWrap>
  );
}
