import React, { useEffect } from 'react';
import { useSetState } from 'react-use';
import _ from 'lodash';
import { Icon, Tooltip } from 'ming-ui';
import datalimitAjax from 'src/api/dataLimit';
import workflowDataLimitAjax from 'src/pages/workflow/api/DataLimit';
import { buriedUpgradeVersionDialog } from 'src/components/upgradeVersion';
import { VersionProductType } from 'src/utils/enum.js';
import { getFeatureStatus } from 'src/utils/project';
import { QUOTA_LIST_CONTENT } from './config.js';
import Settings from './Settings.jsx';
import './index.less';

const handleSettingData = ({ data = {}, type = '', isKey }) => {
  const setting = data[type] || {};
  if (_.isEmpty(setting)) return '';
  return isKey ? Object.keys(setting)[0] : Object.values(setting)[0] || '-';
};

export default function Quota(props) {
  const projectId = _.get(props, 'match.params.projectId');
  const [{ data, globalSize, settingVisible, currentInfo }, setData] = useSetState({
    data: {},
    settingVisible: false,
    currentInfo: {},
  });

  const getListPage = () => {
    Promise.all([
      datalimitAjax.getListPage({ projectId }),
      workflowDataLimitAjax.GetUageLimits({ entityIds: [projectId], projectId }),
    ]).then(([res, workflowRes]) => {
      const size = _.get(workflowRes, 'data[0].size') || -1;
      setData({ data: { ...res, workflowLimit: { [size]: workflowRes.total } } });
    });
  };

  const handleSetting = item => {
    const featureType = getFeatureStatus(projectId, VersionProductType.quota);
    if (VersionProductType.quota && featureType === '2') {
      buriedUpgradeVersionDialog(projectId, VersionProductType.quota);
      return;
    }
    const size = handleSettingData({ data, type: item.type, isKey: true });
    setData({ settingVisible: true, globalSize: size ? Number(size) : undefined, currentInfo: item });
  };

  useEffect(() => {
    getListPage();
  }, []);

  if (settingVisible) {
    return (
      <Settings
        projectId={projectId}
        globalSize={globalSize}
        businessType={currentInfo.businessType}
        globalDesc={currentInfo.globalDesc}
        globalUnit={currentInfo.globalUnit}
        columns={currentInfo.columns}
        title={currentInfo.title}
        updateData={getListPage}
        onClose={() => setData({ settingVisible: false })}
      />
    );
  }

  return (
    <div className="orgManagementWrap quotaManagement">
      <div className="orgManagementHeader Font17"> {_l('额度管理')}</div>
      <div className="orgManagementContent">
        <div className="promptWrap mBottom10">
          {_l('设置应用、工作表消耗的服务资源额度上限。可全局配置额度，也可以单独设置')}
        </div>

        <div className="listWrap">
          <div className="listHeader flexRow pTop10 pBottom10 Gray_15">
            <div className="flex pLeft10">{_l('资源类型')}</div>
            <div className="globalQuota">
              <span className="TxtMiddle"> {_l('全局额度')}</span>
              <Tooltip text={<div>{_l('设置为“不限”，实际使用不得超过系统限制')}</div>} autoCloseDelay={0}>
                <Icon icon="info_outline" className="Font16 Gray_9e mLeft5 TxtMiddle" />
              </Tooltip>
            </div>
            <div className="extraSetting">{_l('额外设置')}</div>
            <div className="setting"></div>
          </div>
          <div className="listContent">
            {QUOTA_LIST_CONTENT.map(item => {
              let size = handleSettingData({ data, type: item.type, isKey: true });
              const extra = handleSettingData({ data, type: item.type, isKey: false });

              size = item.businessType === 1 && size === 0 ? -1 : size; // 历史数据兼容

              return (
                <div className="flexRow listContentItem">
                  <div className="flex pLeft10">
                    <div className="Font14 Gray_15 bold mBottom5">{item.title}</div>
                    <div className="Gray_9e">{item.desc}</div>
                  </div>
                  <div className="globalQuota">
                    {size && Number(size) === -1 ? _l('不限') : `${size}${item.quotaUnit}`}
                  </div>
                  <div className="extraSetting">
                    {extra && _.isNumber(extra) ? `${extra}${item.extraSetting}` : '-'}
                  </div>
                  <div className="setting ThemeColor Hand" onClick={() => handleSetting(item)}>
                    {_l('设置')}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
