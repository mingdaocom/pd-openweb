import React, { useState } from 'react';
import _ from 'lodash';
import { Icon, UpgradeIcon } from 'ming-ui';
import { Button } from 'ming-ui/antd-components';
import { buriedUpgradeVersionDialog } from 'src/components/upgradeVersion';
import Search from 'src/pages/workflow/components/Search';
import { VersionProductType } from 'src/utils/domain/shared/productFeatures';
import { getFeatureStatus } from 'src/utils/services/project';
import GlobalVarTable from './GlobalVarTable';
import VarAddOrEditModal from './VarAddOrEditModal';
import '../index.less';

export default function GlobalVarRight(props) {
  const { projectId, activeItem, loading, varList, onRefreshVarList } = props;
  const [keyWord, setKeyWord] = useState('');
  const [addOrEditVar, setAddOrEditVar] = useState({ visible: false, isEdit: false });
  const [defaultFormValue, setDefaultFormValue] = useState({});
  const [activeId, setActiveId] = useState('');
  const featureType = getFeatureStatus(projectId, VersionProductType.globalVariable);
  const needUpgrade = featureType === '2';

  const handleAdd = () => {
    if (needUpgrade) {
      buriedUpgradeVersionDialog(projectId, VersionProductType.globalVariable);
      return;
    }

    setAddOrEditVar({ visible: true, isEdit: false });
  };

  return (
    <div className="globalVarRight flexColumn overflowHidden">
      <div className="rightHeader">
        <Search
          className="varSearch"
          placeholder={_l('搜索变量名称')}
          handleChange={_.debounce(value => {
            setKeyWord(value);
          }, 500)}
        />
        <Button
          type={needUpgrade ? undefined : 'primary'}
          color={needUpgrade ? 'default' : undefined}
          variant={needUpgrade ? 'filled' : undefined}
          shape="round"
          className="Bold"
          icon={<Icon icon="add" />}
          onClick={handleAdd}
        >
          {activeItem === 'project' ? _l('组织变量') : _l('应用变量')}
          {needUpgrade && <UpgradeIcon />}
        </Button>
      </div>
      <div className="flex mTop8 overflowHidden">
        <GlobalVarTable
          data={varList.filter(item => item.name.indexOf(keyWord) > -1)}
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
          appId={activeItem === 'project' ? '' : activeItem}
          defaultFormValue={defaultFormValue}
          onRefreshVarList={onRefreshVarList}
        />
      )}
    </div>
  );
}
