import React, { useState, useEffect } from 'react';
import { LoadDiv } from 'ming-ui';
import LingualList from './LingualList';
import EditLingual from './EditLingual';
import appManagementApi from 'src/api/appManagement';
import worksheetApi from 'src/api/worksheet';
import { navigateTo } from 'src/router/navigateTo';
import { getRequest } from 'src/util';
import fixedDataApi from 'src/api/fixedData';

const keys = {
  'zh-Hans': 'zh_hansName',
  'zh-Hant': 'zh_hantName',
  'en': 'enName',
  'ja': 'jaName',
};

export default function MultiLingual(props) {
  const { data, match } = props;
  const { id, projectId } = data;
  const [loading, setLoading] = useState(true);
  const [langs, setLangs] = useState([]);
  const [collections, setCollections] = useState([]);
  const [langInfo, setLangInfo] = useState(null);
  const [allLangList, setAllLangList] = useState([]);
  const { langId, flag } = getRequest();
  const currentLangKey = keys[getCookie('i18n_langtag')];

  const handleGetAppLangs = () => {
    setLoading(true);
    Promise.all([
      worksheetApi.getCollectionsByAppId({
        appId: id,
        status: 1
      }),
      appManagementApi.getAppLangs({
        projectId,
        appId: id
      })
    ]).then(([collectionsData, appLangsData]) => {
      setCollections(collectionsData.data);
      setLangs(appLangsData);
      setLangInfo(_.find(appLangsData, { id: langId }));
      setLoading(false);
    });
  }

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
          collections
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
