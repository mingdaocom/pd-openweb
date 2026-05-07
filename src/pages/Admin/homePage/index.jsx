import React, { useEffect } from 'react';
import { useSetState } from 'react-use';
import _ from 'lodash';
import { Dialog, Icon } from 'ming-ui';
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
  const isMingdaoSaas = !window.platformENV.isOverseas && !window.platformENV.isLocal;
  const trialAuthenticate = isMingdaoSaas && isTrial && !data.authType;

  useEffect(() => {
    document.title = _l('组织管理 - 首页 - %0', companyName);
    getBaseData();
    getUsageData();
    getVersionInfo();
    window.platformENV.isOverseas && !window.platformENV.isLocal && displayPaySuccess();
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
        effectiveVectorKnowledgeCount,
        effectiveVectorKnowledgeChunkCount,
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
        effectiveVectorKnowledgeCount: effectiveVectorKnowledgeCount || 0,
        effectiveVectorKnowledgeChunkCount: effectiveVectorKnowledgeChunkCount || 0,
      });
    });
  };

  // 获取组织余额警告提醒
  const getBalanceLimitNoticeSettings = () => {
    projectSettingAjax.getOnlyManagerSettings({ projectId }).then(res => {
      res && setData({ balanceInfo: res.balanceLimitNotice });
    });
  };

  const displayPaySuccess = () => {
    const onClose = () => {
      location.replace(location.href.split('#')[0]);
    };

    if (_.includes(routerLocation.hash, 'paySuccess')) {
      Dialog.confirm({
        width: 420,
        dialogClasses: 'paySuccessDialog',
        removeCancelBtn: true,
        okText: _l('好的'),
        onOk: onClose,
        onCancel: onClose,
        children: (
          <div className="TxtCenter">
            <Icon icon="Finish" className="Font40 Green" />
            <div className="Font17 bold mTop24 mBottom12">{_l('您已支付成功')}</div>
            <div className="Gray_75">
              {_l('我们正在为您的组织进行授权，预计需要约1分钟。授权完成后，您将收到系统消息通知。')}
            </div>
          </div>
        ),
      });
    }
  };

  const params = {
    projectId,
    data,
    isMingdaoSaas,
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
        {window.platformENV.isPlatform && <AccountBalance {...params} />}
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
