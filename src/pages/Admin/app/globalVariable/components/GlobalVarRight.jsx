import React, { useState } from 'react';
import cx from 'classnames';
import _ from 'lodash';
import { Icon, UpgradeIcon } from 'ming-ui';
import { buriedUpgradeVersionDialog } from 'src/components/upgradeVersion';
import Search from 'src/pages/workflow/components/Search';
import { VersionProductType } from 'src/utils/enum';
import { getFeatureStatus } from 'src/utils/project';
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

  return (
    <div className="globalVarRight flexColumn">
      <div className="rightHeader">
        <Search
          className="varSearch"
          placeholder={_l('搜索变量名称')}
          handleChange={_.debounce(value => {
            setKeyWord(value);
          }, 500)}
        />
        <div
          className={cx('addBtn', { needUpgrade: featureType === '2' })}
          onClick={() => {
            featureType === '2'
              ? buriedUpgradeVersionDialog(projectId, VersionProductType.globalVariable)
              : setAddOrEditVar({ visible: true, isEdit: false });
          }}
        >
          <Icon icon="add" />
          <span>{activeItem === 'project' ? _l('组织变量') : _l('应用变量')}</span>
          {featureType === '2' && <UpgradeIcon />}
        </div>
      </div>
      <div className="flex mTop8">
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
