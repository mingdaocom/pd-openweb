import React, { useState, useEffect } from 'react';
import AdminTitle from 'src/pages/Admin/common/AdminTitle';
import './index.less';
import _ from 'lodash';
import GlobalVarLeft from './components/GlobalVarLeft';
import GlobalVarRight from './components/GlobalVarRight';
import variableApi from 'src/api/variable';
import { REFRESH_TYPE } from './constant';

export default function GlobalVariable(props) {
  const projectId = props.match.params.projectId;
  const [activeItem, setActiveItem] = useState('project');
  const [varList, setVarList] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    variableApi
      .gets({
        sourceId: activeItem === 'project' ? projectId : activeItem,
        sourceType: activeItem === 'project' ? 0 : 1,
      })
      .then(res => {
        setLoading(false);
        if (res.resultCode === 1) {
          setVarList(res.variables);
        } else {
          setVarList([]);
        }
      });
  }, [activeItem]);

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
    <div className="globalVarWrapper">
      <AdminTitle prefix={_l('全局变量')} />
      <GlobalVarLeft projectId={projectId} activeItem={activeItem} onSelect={item => setActiveItem(item)} />
      <GlobalVarRight
        key={activeItem}
        projectId={projectId}
        activeItem={activeItem}
        loading={loading}
        varList={varList}
        onRefreshVarList={onRefreshVarList}
      />
    </div>
  );
}
