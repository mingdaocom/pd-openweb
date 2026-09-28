import React, { Fragment, useCallback, useEffect, useState } from 'react';
import { withRouter } from 'react-router-dom';
import { Icon, LoadDiv } from 'ming-ui';
import { Button, Dropdown, Modal, Tooltip } from 'ming-ui/antd-components';
import projectAjax from 'src/api/project';
import { pathCompletion } from 'src/utils/platform/navigation/path';
import ConnectDataBase from '../component/ConnectDataBase';
import DataBaseImg from '../images/database.png';
import './DataBase.less';

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
    format: l => (
      <span className={l === 1 ? 'allowCreateColor' : 'textPrimary'}>{l === 1 ? _l('允许') : _l('不允许')}</span>
    ),
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

  const getLimit = useCallback(() => {
    projectAjax.getDBInstanceLimit({ projectId }).then(res => {
      setLimit(res);
    });
  }, [projectId]);

  const getList = useCallback(() => {
    projectAjax.getDBInstances({ projectId }).then(res => {
      setList(res);
      setLoading(false);
    });
  }, [projectId]);

  useEffect(() => {
    getList();
    getLimit();
  }, [getLimit, getList]);

  useEffect(() => {
    if (refresh === -1) return;

    getList();
  }, [getList, refresh]);

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
    Modal.confirm({
      title: <span className="textError">{_l('请确认是否删除%0数据库？', item.name)}</span>,
      onOk: () => onRemove(item),
      okText: _l('确定'),
    });
  };

  const toManage = item =>
    history.push(pathCompletion(`/admin/database/${projectId}/${item.id}`, { hasDomain: false }), item);

  const renderEmpty = () => {
    return (
      <div className="emptyWrap">
        <img src={DataBaseImg} />
        <div className="Font22 Bold mBottom24">{_l('数据库')}</div>
        <div className="textCon">
          {window.platformENV.isPlatform && window.platformENV.isHap
            ? _l(
                '可将指定应用内的所有工作表数据存储到专属数据库中，免受系统默认数据库的影响，适用于隔离等场景，系统默认支持最多创建%0个可用专属数据库实例；管理员创建应用时，可选择专属数据库。',
                limit,
              )
            : _l(
                '可将指定应用内的所有工作表数据存储到专属数据库中，免受系统默认数据库的影响，适用于隔离等场景，当前支持最多创建%0个可用专属数据库实例；管理员创建应用时，可选择专属数据库。',
                limit,
              )}
        </div>
        <Button type="primary" icon={<Icon icon="add" />} shape="round" onClick={onCreate}>
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
            {window.platformENV.isPlatform && window.platformENV.isHap
              ? _l(
                  '可将指定应用内的所有工作表数据存储到专属数据库中，免受系统默认数据库的影响，适用于隔离等场景，系统默认支持最多创建%0个可用专属数据库实例；管理员创建应用时，可选择专属数据库。',
                  limit,
                )
              : _l(
                  '可将指定应用内的所有工作表数据存储到专属数据库中，免受系统默认数据库的影响，适用于隔离等场景，当前支持最多创建%0个可用专属数据库实例；管理员创建应用时，可选择专属数据库。',
                  limit,
                )}
          </span>
          <Button color="primary" variant="text" size="small" icon={<Icon icon="add" />} onClick={onCreate}>
            {_l('创建')}
          </Button>
        </div>
        <ul className="exclusiveCompList">
          {list.map(item => (
            <li key={`database-${item.id}`}>
              <div className="header">
                <div className="left">
                  <span className="valignWrapper" onClick={() => toManage(item)}>
                    <span className="imgCon mRight8 Hand">
                      <img src={DataBaseImg} />
                    </span>
                    <span className="name flex mRight8 Font15 Bold Hand">{item.name}</span>
                  </span>
                  {item.remark && (
                    <Tooltip title={item.remark}>
                      <span className="icon-info_outline Font16 textDisabled"></span>
                    </Tooltip>
                  )}
                </div>
                <div className="right">
                  <Button
                    color="default"
                    variant="outlined"
                    shape="round"
                    className="mLeft24 Bold"
                    onClick={() => toManage(item)}
                  >
                    {_l('应用管理')}
                  </Button>
                  <Dropdown
                    open={popupVisibleId === item.id}
                    trigger={['click']}
                    menu={{
                      items: [
                        { key: 'edit', label: _l('编辑'), onClick: () => onEdit(item) },
                        ...(item.numberOfApp === 0
                          ? [{ key: 'delete', label: _l('删除'), danger: true, onClick: () => removeDialog(item) }]
                          : []),
                      ],
                      style: { minWidth: 160 },
                    }}
                    onOpenChange={visible => {
                      setPopupVisibleId(visible ? item.id : undefined);
                    }}
                  >
                    <Icon icon="moreop" className="textDisabled Font20 mLeft24 hoverColorPrimaryLight Hand" />
                  </Dropdown>
                </div>
              </div>
              <div className="content Font13 valignWrapper">
                {DISPLAY_DATA.map(l => {
                  const itemValue = item[l.key] || l.defaultValue;

                  return (
                    <div>
                      <div className="label textTertiary mBottom8">{l.label}</div>
                      <div className="value">{l.format ? l.format(itemValue) : itemValue}</div>
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
