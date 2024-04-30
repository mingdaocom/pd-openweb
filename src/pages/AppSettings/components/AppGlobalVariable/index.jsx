import React, { useState, useEffect } from 'react';
import cx from 'classnames';
import './index.less';
import GlobalVarTable from 'src/pages/Admin/app/globalVariable/components/GlobalVarTable';
import VarAddOrEditModal from 'src/pages/Admin/app/globalVariable/components/VarAddOrEditModal';
import { REFRESH_TYPE } from 'src/pages/Admin/app/globalVariable/constant';
import AppSettingHeader from '../AppSettingHeader';
import variableApi from 'src/api/variable';
import { getFeatureStatus, buriedUpgradeVersionDialog } from 'src/util';
import { VersionProductType } from 'src/util/enum';

const tabInfos = [
  { label: _l('应用'), value: 'app' },
  { label: _l('组织'), value: 'project' },
];

export default function AppGlobalVariable(props) {
  const { projectId, appId } = props;
  const [currentTab, setCurrentTab] = useState('app');
  const [loading, setLoading] = useState(true);
  const [keyWord, setKeyWord] = useState('');
  const [addOrEditVar, setAddOrEditVar] = useState({ visible: false, isEdit: false });
  const [defaultFormValue, setDefaultFormValue] = useState({});
  const [varList, setVarList] = useState([]);
  const [activeId, setActiveId] = useState('');
  const featureType = getFeatureStatus(projectId, VersionProductType.globalVariable);

  useEffect(() => {
    setLoading(true);
    variableApi.gets({ sourceId: appId, sourceType: currentTab === 'project' ? 11 : 1 }).then(res => {
      setLoading(false);
      if (res.resultCode === 1) {
        setVarList(res.variables);
      } else {
        setVarList([]);
      }
    });
  }, [currentTab]);

  const onRefreshVarList = (type, updateItem) => {
    let list = [];
    if (type === REFRESH_TYPE.ADD) {
      list = varList.concat([updateItem]);
      setVarList(list);
    } else if (type === REFRESH_TYPE.UPDATE) {
      list = varList.map(item => {
        return item.id === updateItem.id ? updateItem : item;
      });
      setVarList(list);
    } else {
      list = varList.filter(item => item.id !== updateItem.id);
      setVarList(list);
    }
  };

  return (
    <div className="appGlobalVarWrapper">
      <AppSettingHeader
        title={_l('全局变量')}
        showSearch={true}
        addBtnName={_l('应用变量')}
        needUpgrade={featureType === '2'}
        link="https://help.mingdao.com/workflow/node-update-global-variables"
        description={_l('使用全局变量实现组织内数据的共享与传递')}
        handleSearch={_.debounce(value => {
          setKeyWord(value);
        }, 500)}
        handleAdd={() => {
          featureType === '2'
            ? buriedUpgradeVersionDialog(projectId, VersionProductType.globalVariable)
            : setAddOrEditVar({ visible: true, isEdit: false });
        }}
      />
      <div className="tabWrap">
        {tabInfos.map(item => (
          <div
            className={cx('tabItem Hand', { active: item.value === currentTab })}
            onClick={() => setCurrentTab(item.value)}
          >
            {item.label}
          </div>
        ))}
      </div>
      <div className="flex">
        <GlobalVarTable
          data={varList.filter(item => item.name.indexOf(keyWord) > -1)}
          readOnly={currentTab === 'project'}
          loading={loading}
          onRefreshVarList={onRefreshVarList}
          emptyText={keyWord ? _l('暂无搜索结果') : _l('暂无全局变量')}
          onAdd={name => {
            setAddOrEditVar({ visible: true, isEdit: false });
            setDefaultFormValue({ name });
          }}
          onEdit={detailData => {
            setActiveId(detailData.id);
            setAddOrEditVar({ visible: true, isEdit: true });
            setDefaultFormValue(detailData);
          }}
          activeId={activeId}
          setActiveId={setActiveId}
          projectId={projectId}
          emptyNoBorder={true}
        />
      </div>

      {addOrEditVar.visible && (
        <VarAddOrEditModal
          visible={addOrEditVar.visible}
          isEdit={addOrEditVar.isEdit}
          onClose={() => {
            setAddOrEditVar({ visible: false });
            setDefaultFormValue({});
            setActiveId('');
          }}
          projectId={projectId}
          appId={appId}
          defaultFormValue={defaultFormValue}
          onRefreshVarList={currentTab === 'app' ? onRefreshVarList : () => {}}
        />
      )}
    </div>
  );
}
