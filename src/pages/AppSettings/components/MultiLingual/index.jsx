import React, { Fragment, useState, useEffect } from 'react';
import { Icon, Button, LoadDiv } from 'ming-ui';
import languageIcon from '../../img/language.png';
import LingualList from './LingualList';
import EditLingual from './EditLingual';
import AddLangModal from './AddLangModal';
import appManagementApi from 'src/api/appManagement';
import { navigateTo } from 'src/router/navigateTo';
import { getRequest } from 'src/util';

function Entrance(props) {
  const { app, onGetAppLangs } = props;
  const [visible, setVisible] = useState(false);
  return (
    <div className="h100 flexColumn justifyContentCenter alignItemsCenter">
      <img style={{ width: 200 }} src={languageIcon} />
      <div className="Font32 bold mTop25 mBottom15">{_l('多语言')}</div>
      <div className="Font15 mBottom20">{_l('设置用户在访问应用时可以使用的语言')}</div>
      <Button
        type="primary"
        radius={true}
        style={{ height: 36 }}
        onClick={() => setVisible(true)}
      >
        <Icon icon="plus" />
        <span>{_l('添加语言')}</span>
      </Button>
      <AddLangModal
        app={app}
        visible={visible}
        onSave={onGetAppLangs}
        onCancel={() => setVisible(false)}
      />
    </div>
  );
}

export default function MultiLingual(props) {
  const { data } = props;
  const { id, projectId } = data;
  const [loading, setLoading] = useState(true);
  const [langs, setLangs] = useState([]);
  const [langInfo, setLangInfo] = useState(null);
  const { langId, flag } = getRequest();

  const handleGetAppLangs = () => {
    setLoading(true);
    appManagementApi.getAppLangs({
      projectId,
      appId: id,
    }).then(data => {
      setLangs(data);
      setLangInfo(_.find(data, { id: langId }));
      setLoading(false);
    });
  }

  useEffect(() => {
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
        app={data}
        langs={langs}
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
      langs={langs}
      onGetAppLangs={handleGetAppLangs}
      onChangeLangInfo={data => {
        navigateTo(`?langId=${data.id}`);
        setLangInfo(data);
      }}
    />
  );
}
