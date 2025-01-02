import React, { Fragment, useEffect, useState } from 'react';
import { withRouter } from 'react-router-dom';
import styled from 'styled-components';
import Trigger from 'rc-trigger';
import { Button, Icon, Tooltip, LoadDiv, Dialog } from 'ming-ui';
import projectAjax from 'src/api/project';
import DataBaseImg from '../images/database.png';
import ConnectDataBase from '../component/ConnectDataBase';
import { navigateTo } from 'router/navigateTo';
import './DataBase.less';

const MoreOperateMenu = styled.ul`
  background: #fff;
  box-shadow: 0px 4px 16px 1px rgba(0, 0, 0, 0.24);
  border-radius: 3px 3px 3px 3px;
  width: 160px;
  font-size: 13px;
  color: #151515;
  padding: 4px 0;
  li {
    line-height: 36px;
    padding: 0 24px;
    cursor: pointer;
    a {
      color: #151515;
      transition: none !important;
    }
    &:hover {
      background-color: #2196f3;
      color: #fff;
      a {
        color: #fff;
      }
    }
  }
`;

const DISPLAY_DATA = [
  {
    label: _l('存储应用数'),
    key: 'numberOfApp',
    defaultValue: 0,
  },
  {
    label: _l('数据库地址'),
    key: 'host',
    defaultValue: '',
  },
  {
    label: _l('新增应用'),
    key: 'status',
    format: l => <span className={l === 1 ? 'allowCreateColor' : 'Gray'}>{l === 1 ? _l('允许') : _l('不允许')}</span>,
    defaultValue: '',
  },
];

function DataBase(props) {
  const { projectId, refresh, history } = props;
  const [createConnect, setCreateConnect] = useState({ visible: false, id: undefined, data: {} });
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [popupVisibleId, setPopupVisibleId] = useState(undefined);
  const [limit, setLimit] = useState('-');

  useEffect(() => {
    getList();
    getLimit();
  }, []);

  useEffect(() => {
    if (refresh === -1) return;

    getList();
  }, [refresh]);

  const getLimit = () => {
    projectAjax.getDBInstanceLimit({ projectId }).then(res => {
      setLimit(res);
    });
  };

  const getList = () => {
    !loading && setLoading(true);
    projectAjax.getDBInstances({ projectId }).then(res => {
      setList(res);
      setLoading(false);
    });
  };

  const onCreate = () => {
    setCreateConnect({ visible: true, id: undefined, data: {} });
  };

  const onEdit = item => {
    const data = {
      name: item.name,
      host: item.host,
      port: item.port,
      account: item.account,
      password: item.password,
      dbName: item.dbName,
      other: item.other,
      status: item.status,
      remark: item.remark,
    };
    setCreateConnect({ visible: true, id: item.id, data: data, numberOfApp: item.numberOfApp });
    setPopupVisibleId(false);
  };

  const onRemove = item => {
    projectAjax
      .removeDBInstance({
        projectId,
        instanceId: item.id,
      })
      .then(res => {
        if (res) {
          alert(_l('删除成功'));
          getList();
        } else alert(_l('该实例不可删除'), 3);
      });
  };

  const removeDialog = item => {
    setPopupVisibleId(false);
    Dialog.confirm({
      title: _l('请确认是否删除%0数据库？', item.name),
      onOk: () => onRemove(item),
      okText: _l('确定'),
    });
  };

  const toManage = item => history.push(`/admin/database/${projectId}/${item.id}`, item);

  const renderPopup = item => {
    return (
      <MoreOperateMenu>
        <li onClick={() => onEdit(item)}>{_l('编辑')}</li>
        {item.numberOfApp === 0 && <li onClick={() => removeDialog(item)}>{_l('删除')}</li>}
      </MoreOperateMenu>
    );
  };

  const renderEmpty = () => {
    return (
      <div className="emptyWrap">
        <img src={DataBaseImg} />
        <div className="Font22 Bold mBottom24">{_l('数据库')}</div>
        <div className="textCon">
          {_l(
            '可将指定应用内的所有工作表数据存储到专属数据库中，免受系统默认数据库的影响，适用于隔离等场景，当前支持最多创建%0个可用专属数据库实例；管理员创建应用时，可选择专属数据库。',
            limit,
          )}
        </div>
        <Button icon="add" radius className="dataBaseCreateButton Font14" onClick={onCreate}>
          {_l('创建')}
        </Button>
      </div>
    );
  };

  const renderContent = () => {
    return (
      <Fragment>
        <div className="dataBaseExplain">
          <span className="textCon flex">
            {_l(
              '可将指定应用内的所有工作表数据存储到专属数据库中，免受系统默认数据库的影响，适用于隔离等场景，当前支持最多创建%0个可用专属数据库实例；管理员创建应用时，可选择专属数据库。',
              limit,
            )}
          </span>
          <span className="createDataBaseButton Hand" onClick={onCreate}>
            <Icon icon="add" className="mRight3" />
            {_l('创建')}
          </span>
        </div>
        <ul className="exclusiveCompList">
          {list.map(item => (
            <li key={`database-${item.id}`}>
              <div className="header">
                <div className="left">
                  <span className='valignWrapper' onClick={() => toManage(item)}>
                    <span className="imgCon mRight8 Hand">
                      <img src={DataBaseImg} />
                    </span>
                    <span className="name flex mRight8 Font15 Bold Hand">{item.name}</span>
                  </span>
                  {item.remark && (
                    <Tooltip text={item.remark}>
                      <span className="icon-info_outline Font16 Gray_bd"></span>
                    </Tooltip>
                  )}
                </div>
                <div className="right">
                  <span className="manageBtn" onClick={() => toManage(item)}>
                    {_l('应用管理')}
                  </span>
                  <Trigger
                    popupVisible={popupVisibleId === item.id}
                    action={['click']}
                    popupAlign={{ points: ['tr', 'bc'], offset: [15, 0] }}
                    popup={renderPopup(item)}
                    onPopupVisibleChange={visible => {
                      setPopupVisibleId(visible ? item.id : undefined);
                    }}
                  >
                    <Icon icon="moreop" className="Gray_bd Font20 mLeft24 Hover_49 Hand" />
                  </Trigger>
                </div>
              </div>
              <div className="content Font13 valignWrapper">
                {DISPLAY_DATA.map(l => {
                  const itemValue = item[l.key] || l.defaultValue;

                  return (
                    <div>
                      <div className="label Gray_9e mBottom8">{l.label}</div>
                      <div className="value">{!!l.format ? l.format(itemValue) : itemValue}</div>
                    </div>
                  );
                })}
                <div></div>
              </div>
            </li>
          ))}
        </ul>
      </Fragment>
    );
  };

  const closeConnectDialog = () => {
    setCreateConnect({ visible: false, id: undefined, data: {} });
  };

  const createSuccess = () => {
    setCreateConnect({ visible: false, id: undefined, data: {} });
    getList();
  };

  return (
    <div className="dataBaseWrap flex">
      {loading ? <LoadDiv /> : list.length === 0 ? renderEmpty() : renderContent()}
      {createConnect.visible && (
        <ConnectDataBase
          id={createConnect.id}
          projectId={projectId}
          info={createConnect.data}
          numberOfApp={createConnect.numberOfApp || 0}
          onOk={createSuccess}
          onClose={closeConnectDialog}
        />
      )}
    </div>
  );
}

export default withRouter(DataBase);
