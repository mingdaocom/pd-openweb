import React, { useEffect } from 'react';
import { useSetState } from 'react-use';
import Info from 'src/pages/AppSettings/components/Aggregation/components/Info';
import FullScreenCurtain from 'src/pages/workflow/components/FullScreenCurtain/index.jsx';
import { getFeatureStatus, setFavicon } from 'src/util';
import { buriedUpgradeVersionDialog } from 'src/components/upgradeVersion';
import { navigateTo } from 'src/router/navigateTo';
import homeAppApi from 'api/homeApp';
import { VersionProductType } from 'src/util/enum';

export default function AggregationEdit(props) {
  const { appId, aggTableId } = _.get(props, 'match.params');
  const [{ loading, projectId, name }, setState] = useSetState({
    loading: true,
    projectId: '',
    name,
  });
  useEffect(() => {
    getData();
  }, []);

  const getData = () => {
    homeAppApi
      .getApp(
        {
          appId: md.global.Account.isPortal ? md.global.Account.appId : appId,
          getSection: true,
          getManager: window.isPublicApp ? false : true,
          getLang: true,
        },
        { isAggTable: true },
      )
      .then(data => {
        setFavicon(data.iconUrl, data.iconColor);
        const { permissionType, id, isLock, isPassword, projectId, name } = data;
        const featureType = getFeatureStatus(projectId, VersionProductType.aggregation);
        if (!permissionType || (isLock && isPassword) || !featureType) {
          navigateTo(`/app/${id}`); // 普通角色、加锁应用、无应用管理中特性时跳至应用首页
          return;
        }
        if (featureType === '2') {
          buriedUpgradeVersionDialog(projectId, VersionProductType.aggregation);
          return;
        }
        setState({ loading: false, projectId, name });
      });
  };

  return (
    !loading && (
      <FullScreenCurtain>
        <Info
          id={aggTableId}
          projectId={projectId}
          appId={appId}
          onClose={() => {
            navigateTo(`/app/${appId}/settings/aggregations${location.search}`);
          }}
          appName={name}
        />
      </FullScreenCurtain>
    )
  );
}
