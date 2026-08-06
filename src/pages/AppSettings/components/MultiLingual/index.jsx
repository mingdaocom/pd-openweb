import React, { useCallback, useEffect, useState } from 'react';
import _ from 'lodash';
import { LoadDiv } from 'ming-ui';
import appManagementApi from 'src/api/appManagement';
import fixedDataApi from 'src/api/fixedData';
import { navigateTo } from 'src/router/navigateTo';
import { getRequest } from 'src/utils/common';
import EditLingual from './EditLingual';
import LingualList from './LingualList';

const keys = {
  'zh-Hans': 'zh_hansName',
  'zh-Hant': 'zh_hantName',
  en: 'enName',
  ja: 'jaName',
  th: 'thName',
  ms: 'msName',
};

export default function MultiLingual(props) {
  const { data, match } = props;
  const { id, projectId } = data;
  const routeAppId = match.params.appId;
  const [loading, setLoading] = useState(true);
  const [langs, setLangs] = useState([]);
  const [langInfo, setLangInfo] = useState(null);
  const [allLangList, setAllLangList] = useState([]);
  const { langId, flag } = getRequest();
  const currentLangKey = keys[getCookie('i18n_langtag')];

  const handleGetAppLangs = useCallback(() => {
    appManagementApi
      .getAppLangs({
        projectId,
        appId: id,
      })
      .then(appLangsData => {
        setLangs(appLangsData);
        setLangInfo(_.find(appLangsData, { id: langId }));
        setLoading(false);
      });
  }, [id, langId, projectId]);

  useEffect(() => {
    if (id !== routeAppId) {
      location.reload();
    }
  }, [id, routeAppId]);

  useEffect(() => {
    fixedDataApi.loadLangList().then(data => {
      setAllLangList(_.toArray(data));
    });
    handleGetAppLangs();
  }, [flag, handleGetAppLangs]);

  if (loading) {
    return (
      <div className="flexRow alignItemsCenter justifyContentCenter h100">
        <LoadDiv />
      </div>
    );
  }

  if (langInfo) {
    return (
      <EditLingual
        app={data}
        currentLangKey={currentLangKey}
        langs={langs}
        allLangList={allLangList}
        langInfo={langInfo}
        onBack={() => {
          navigateTo(`/app/${id}/settings/language`);
          setLangInfo(null);
        }}
      />
    );
  }

  return (
    <LingualList
      app={data}
      currentLangKey={currentLangKey}
      langs={langs}
      allLangList={allLangList}
      onGetAppLangs={() => {
        setLoading(true);
        handleGetAppLangs();
      }}
      onChangeLangInfo={data => {
        navigateTo(`/app/${id}/settings/language?langId=${data.id}`);
        setLangInfo(data);
      }}
    />
  );
}
