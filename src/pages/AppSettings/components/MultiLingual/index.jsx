import React, { useEffect, useState } from 'react';
import _ from 'lodash';
import { LoadDiv } from 'ming-ui';
import appManagementApi from 'src/api/appManagement';
import fixedDataApi from 'src/api/fixedData';
import worksheetApi from 'src/api/worksheet';
import workflowTranslatorApi from 'src/pages/workflow/api/translator';
import { navigateTo } from 'src/router/navigateTo';
import { getRequest } from 'src/utils/common';
import EditLingual from './EditLingual';
import LingualList from './LingualList';

const keys = {
  'zh-Hans': 'zh_hansName',
  'zh-Hant': 'zh_hantName',
  en: 'enName',
  ja: 'jaName',
};

export default function MultiLingual(props) {
  const { data, match } = props;
  const { id, projectId } = data;
  const [loading, setLoading] = useState(true);
  const [langs, setLangs] = useState([]);
  const [langInfo, setLangInfo] = useState(null);
  const [collections, setCollections] = useState([]);
  const [workflows, setWorkflows] = useState([]);
  const [allLangList, setAllLangList] = useState([]);
  const { langId, flag } = getRequest();
  const currentLangKey = keys[getCookie('i18n_langtag')];

  const handleGetAppLangs = () => {
    setLoading(true);
    Promise.all([
      appManagementApi.getAppLangs({
        projectId,
        appId: id,
      }),
      worksheetApi.getCollectionsByAppId({
        appId: id,
        status: 1,
      }),
      workflowTranslatorApi.getProcessTranslatorList({
        apkId: id,
        all: false,
      }),
    ]).then(([appLangsData, collectionsData, workflowData]) => {
      setLangs(appLangsData);
      setCollections(collectionsData.data);
      setWorkflows(workflowData);
      setLangInfo(_.find(appLangsData, { id: langId }));
      setLoading(false);
    });
  };

  useEffect(() => {
    if (data.id !== match.params.appId) {
      location.reload();
    }
  }, []);

  useEffect(() => {
    fixedDataApi.loadLangList().then(data => {
      setAllLangList(_.toArray(data));
    });
    handleGetAppLangs();
  }, [flag]);

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
        app={{
          ...data,
          collections,
          workflows,
        }}
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
      onGetAppLangs={handleGetAppLangs}
      onChangeLangInfo={data => {
        navigateTo(`?langId=${data.id}`);
        setLangInfo(data);
      }}
    />
  );
}
