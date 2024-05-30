import React, { Fragment, useEffect, useState, useRef } from 'react';
import { HomePageWrap, FreeTrialWrap } from './styled';
import cx from 'classnames';
import projectAjax from 'src/api/project';
import processVersionAjax from 'src/pages/workflow/api/processVersion';
import { Modal, Button, Progress } from 'antd';
import { QUICK_ENTRY_CONFIG, USER_COUNT, ITEM_COUNT, UPLOAD_COUNT, formatFileSize, formatValue } from './config';
import moment from 'moment';
import { getCurrentProject, getFeatureStatus } from 'src/util';
import { navigateTo } from 'src/router/navigateTo';
import InstallDialog from './installDialog';
import { Support, Tooltip, Icon } from 'ming-ui';
import addFriends from 'src/components/addFriends';
import { purchaseMethodFunc } from 'src/components/pay/versionUpgrade/PurchaseMethodModal';
import { useSetState } from 'react-use';
import _ from 'lodash';

export default function HomePage({ match, location: routerLocation }) {
  const { projectId } = _.get(match, 'params');
  const { companyName } = getCurrentProject(projectId);
  const [data, setData] = useSetState({});
  const [installType, setType] = useState('');
  const [freeTrialVisible, setVisible] = useState(_.includes(routerLocation.pathname, 'showInvite'));
  const isTrial = data.licenseType === 2;
  const isFree = data.licenseType === 0;
  const wrap = useRef(null);
  const content1 = useRef(null);
  const content2 = useRef(null);
  const isEnLang = md.global.Account.lang === 'en';

  useEffect(() => {
    document.title = _l('组织管理 - 首页 - %0', companyName);
    getBaseData();
    getUsageData();
    getVersionInfo();
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
      setData(res);
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
        effectiveDataPipelineRowCount,
        effectiveAggregationTableCount,
      });
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
    if (_.includes(['user', 'workflow', 'storage', 'portaluser', 'portalupgrade', 'dataSync'], type)) {
      location.assign(`/admin/expansionservice/${projectId}/${type}`);
    }
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
  const { currentLicense = {}, nextLicense = {} } = data;
  const { endDate, expireDays, version = {} } = currentLicense;
  const { version: nextVersion, startDate: nextStartDate, endDate: nextEndDate } = nextLicense;
  const versionIdV2 = parseInt(version.versionIdV2);

  const getValue = value => (_.isUndefined(value) || _.isNaN(value) ? '-' : value);

  const getCountText = (key, limit, numUnit) => {
    const isAttachmentUpload = key === 'effectiveApkStorageCount'; // 附件上传量
    let percent = isAttachmentUpload
      ? ((data[key] / (getValue(data[limit]) * Math.pow(1024, 3))) * 100).toFixed(2)
      : data[key] / data[limit] > 0 && (data[key] / data[limit]) * 10000 <= 1
      ? 0.01
      : ((data[key] / data[limit]) * 100).toFixed(2);

    const getUsage = key => {
      return isAttachmentUpload
        ? formatFileSize(data[key])
        : isEnLang
        ? `${formatValue(data[key])} ${numUnit}`
        : data[key] >= 10000
        ? _l('%0 万', getValue(data[key] / 10000)) + numUnit
        : `${getValue(data[key])} ${numUnit}`;
    };

    return (
      <div className="useCount">
        <dov>
          {_l('已用')}
          <span className="Gray mLeft4">{`${percent === 'NaN' ? '-' : percent}%`}</span>
        </dov>
        <div className="flex TxtRight">
          <span>{getUsage(key)}</span>
          <span className="mLeft4">/</span>
          <span className="mLeft4">{isAttachmentUpload ? `${data[limit]}GB` : getUsage(limit)}</span>
        </div>
      </div>
    );
  };
  const getCountProcess = (key, limit) => {
    let percent = 0;
    if (key === 'useExecCount' || key === 'effectiveDataPipelineRowCount') {
      percent =
        data[key] / data[limit] > 0 && (data[key] / data[limit]) * 10000 <= 1
          ? 0.01
          : ((data[key] / data[limit]) * 100).toFixed(2);
    } else {
      percent = ((data[key] / (getValue(data[limit]) * Math.pow(1024, 3))) * 100).toFixed(2);
    }
    return percent;
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
      <div className="upgrade pointer" onClick={() => handleClick('upgrade')}>
        {_l('升级')}
      </div>
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
              <ul>
                {USER_COUNT.map(({ key, text, link }) => (
                  <li
                    className={cx('pointer', {})}
                    key={key}
                    onClick={() => linkHref(link, key === 'notActiveUserCount' ? 'uncursor' : null)}
                  >
                    <div className="name">{text}</div>
                    <div className="count">{formatValue(getValue(data[key] || 0))}</div>
                    {key === 'effectiveUserCount' && (
                      <Fragment onClick={e => e.stopPropagation()}>
                        <div className="limitUser">
                          <span className="nowrap">{_l('上限 %0 人', getValue(data.limitUserCount || 0))}</span>
                        </div>
                      </Fragment>
                    )}
                    {key === 'effectiveExternalUserCount' && (
                      <Fragment>
                        <div className="limitUser">{_l('上限 %0 人', getValue(data.limitExternalUserCount || 0))}</div>
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
                  <div className="licenseType Font15">{getValue(version.name)}</div>
                  {isTrial && <span>{_l('-试用')}</span>}
                  {isFree ? null : (
                    <Fragment>
                      <div className="expireDays">
                        {_l('剩余')}
                        <span>{getValue(expireDays || 0)}</span>
                        {_l('天')}
                      </div>
                      <div className="expireDate">{_l('%0到期', getValue(moment(endDate).format('YYYY-MM-DD')))}</div>
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
              {md.global.Config.IsPlatformLocal && (
                <div className="accountInfo">
                  <i className="icon-sp_account_balance_wallet_white" />
                  <span>{_l('当前账户余额 (￥)')}</span>
                  <span className="balance">{getValue(data.balance || 0).toLocaleString()}</span>
                </div>
              )}
              {/* {!isFree && !isTrial && (
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
                {ITEM_COUNT.map(({ key, text, link, featureId }) => {
                  if (featureId && !getFeatureStatus(projectId, featureId)) return;

                  return (
                    <li
                      key={key}
                      className={cx('useAnalysis', {
                        useAnalysisHover: _.includes(
                          [
                            'effectiveApkCount',
                            'useProcessCount',
                            'effectiveDataPipelineJobCount',
                            'effectiveAggregationTableCount',
                          ],
                          key,
                        ),
                      })}
                      onClick={() => {
                        if (key === 'effectiveDataPipelineJobCount') {
                          localStorage.setItem('currentProjectId', projectId);
                          return location.assign('/integration/task');
                        } else if (
                          _.includes(['effectiveApkCount', 'useProcessCount', 'effectiveAggregationTableCount'], key)
                        ) {
                          linkHref(link);
                        }
                      }}
                    >
                      <div className="name">
                        {text}
                        {key === 'effectiveWorksheetRowCount' && (
                          <Tooltip
                            popupPlacement="top"
                            text={<span>{_l('所有工作表行记录总数（包含关闭应用）')}</span>}
                          >
                            <span className="icon-help1 Font13 mLeft8 Gray_9e" />
                          </Tooltip>
                        )}
                      </div>
                      <div className="count">{formatValue(getValue(data[key] || 0))}</div>
                      {key === 'effectiveWorksheetCount' && isFree && (
                        <div className="limitUser">{_l('上限 %0 个', data.limitWorksheetCount)}</div>
                      )}
                      {key === 'effectiveWorksheetRowCount' && isFree && (
                        <div className="limitUser">{_l('上限 %0 万行', data.limitAllWorksheetRowCount / 10000)}</div>
                      )}
                      {key === 'effectiveAggregationTableCount' && data.limitAggregationTableCount ? (
                        <div className="limitUser">{_l('上限 %0', data.limitAggregationTableCount)}</div>
                      ) : (
                        ''
                      )}
                    </li>
                  );
                })}
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
                ).map(({ key, limit, text, link, click, unit, numUnit }) => {
                  const percentValue = getCountProcess(key, limit);
                  return (
                    <li
                      className="pLeft10 pRight10 Hand"
                      onClick={() => {
                        if (key == 'effectiveDataPipelineRowCount') {
                          localStorage.setItem('currentProjectId', projectId);
                          return location.assign('/integration/task');
                        }
                        linkHref(link);
                      }}
                    >
                      <div className="workflowTitle flexRow">
                        <div className="flex">
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
                        {/* {!isTrial && !isFree ? (
                          <span
                            className="Normal ThemeColor"
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
                    </li>
                  );
                })}
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
