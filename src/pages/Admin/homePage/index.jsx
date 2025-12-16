import React, { useEffect } from 'react';
import { useSetState } from 'react-use';
import _ from 'lodash';
import projectAjax from 'src/api/project';
import projectSettingAjax from 'src/api/projectSetting';
import processVersionAjax from 'src/pages/workflow/api/processVersion';
import { getCurrentProject } from 'src/utils/project';
import BalanceManage from '../components/BalanceManage';
import AccountBalance from './components/AccountBalance';
import OrgQuota from './components/orgQuota';
import QuickEntrance from './components/QuickEntrance';
import UserCard from './components/UserCard';
import VersionCard from './components/VersionCard';
import { HomePageWrap } from './styled';

export default function HomePage({ match, location: routerLocation, authority }) {
  const { projectId } = _.get(match, 'params');
  const { companyName } = getCurrentProject(projectId);
  const [data, setData] = useSetState({ basicLoading: true, hideBalance: true });
  const isTrial = data.licenseType === 2;
  const isFree = data.licenseType === 0;
  const isLocal = md.global.Config.IsLocal;
  const trialAuthenticate = !isLocal && isTrial && !data.authType;

  useEffect(() => {
    document.title = _l('组织管理 - 首页 - %0', companyName);
    getBaseData();
    getUsageData();
    getVersionInfo();
    getBalanceLimitNoticeSettings();
  }, []);

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
  const getUsageData = () => {
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

  const params = {
    projectId,
    data,
    isLocal,
    isTrial,
    isFree,
    routerLocation,
    authority,
    trialAuthenticate,
    updateData: setData,
  };

  return (
    <HomePageWrap>
      <div className="basicInfo">
        <VersionCard {...params} />
        <UserCard {...params} />
        {md.global.Config.IsPlatformLocal && <AccountBalance {...params} />}
      </div>
      <OrgQuota {...params} />
      <QuickEntrance {...params} />
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
