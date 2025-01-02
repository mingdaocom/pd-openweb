import React, { Fragment, useState, useEffect, useRef } from 'react';
import { LoadDiv, Dialog, Checkbox, Switch, Input, SortableList, Icon, Menu, MenuItem } from 'ming-ui';
import { Button, Divider } from 'antd';
import Trigger from 'rc-trigger';
import EmailDialog from './components/EmailDialog';
import MessageSettings from './components/MessageSettings';
import emailApi from 'src/api/email';
import smsApi from 'src/api/sms';
import { updateSysSettings } from '../common';
import privateSysSetting from 'src/api/privateSysSetting';
import privateMapAjax from 'src/api/privateMap';
import tencentyunIcon from '../images/tencentyunIcon.png';
import aliyunIcon from '../images/aliyunIcon.png';
import googleMap from '../images/google_map.png';
import gaodeMap from '../images/gaode_map.png';
import { encrypt } from 'src/util';
import _ from 'lodash';
import styled from 'styled-components';
import Item, { EmptyWrap } from './components/Item';
import AISetting from 'src/pages/NewPrivateDeployment/Setting/components/AISetting.jsx';
import OCRSetting from 'src/pages/NewPrivateDeployment/Setting/components/OCRSetting.jsx';

const ActionWrap = styled(Menu)`
  width: 160px !important;
  .ming.MenuItem .Item-content:not(.disabled):hover {
    background-color: #f5f5f5 !important;
    color: #151515 !important;
  }
  .ming.MenuItem .Item-content.disabled {
    color: #9e9e9e;
    background-color: #f5f5f5 !important;
  }
  .delete {
    color: #f51744;
  }
`;

const EmptyStatus = () => <EmptyWrap className="pLeft16 mBottom12">{_l('未添加服务，功能不可用')}</EmptyWrap>;

const Email = props => {
  const [emailDialogVisible, setEmailDialogVisible] = useState(false);
  const [emailConfig, setEmailConfig] = useState({});
  const [loading, setLoading] = useState(true);
  const style = { width: 100 };

  useEffect(() => {
    emailApi.getSmtpSecret().then(result => {
      result && setEmailConfig(result);
      setLoading(false);
    });
  }, []);

  return (
    <div className="privateCardWrap flexColumn">
      <div className="Font17 bold mBottom8">{_l('邮件服务')}</div>
      {loading ? (
        <LoadDiv />
      ) : (
        <Fragment>
          <div className="flexRow valignWrapper mBottom15">
            <div style={style} className="Gray_75">
              {_l('签名')}
            </div>
            <div>{emailConfig.signature || _l('未配置')}</div>
          </div>
          <div className="flexRow valignWrapper mBottom15">
            <div style={style} className="Gray_75">
              {_l('发送邮箱')}
            </div>
            <div>{emailConfig.fromAddress || _l('未配置')}</div>
          </div>
          <div className="flexRow valignWrapper mBottom15">
            <div style={style} className="Gray_75">
              {_l('服务器')}
            </div>
            <div>{emailConfig.server || _l('未配置')}</div>
          </div>
          <div className="flexRow valignWrapper mBottom15">
            <div style={style} className="Gray_75">
              {_l('账号')}
            </div>
            <div>{emailConfig.account || _l('未配置')}</div>
          </div>
          <div className="flexRow valignWrapper mBottom15">
            <div style={style} className="Gray_75">
              {_l('密码')}
            </div>
            <div>{emailConfig.password ? (emailConfig.password || '').replace(/./g, '*') : _l('未配置')}</div>
          </div>
          <div className="flexRow valignWrapper mBottom15">
            <div style={style} className="Gray_75">
              {_l('端口')}
            </div>
            <div>{emailConfig.port || _l('未配置')}</div>
          </div>
          <div className="flexRow valignWrapper mBottom15">
            <div style={style} className="Gray_75">
              {_l('SSL 链接')}
            </div>
            <div>{emailConfig.enableSsl ? _l('启用') : _l('未启用')}</div>
          </div>
        </Fragment>
      )}
      <div>
        <Button ghost type="primary" onClick={() => setEmailDialogVisible(true)}>
          {_l('设置')}
        </Button>
      </div>
      <EmailDialog
        visible={emailDialogVisible}
        emailConfig={emailConfig}
        onCancel={() => {
          setEmailDialogVisible(false);
        }}
        onChange={data => {
          setEmailConfig(data);
        }}
      />
    </div>
  );
};

const Message = props => {
  const { SysSettings } = md.global;
  const [sms, setSms] = useState([]);
  const [loading, setLoading] = useState(true);
  const formContent = useRef(null);
  const [currentSms, setCurrentSms] = useState({});
  const [enableSmsCustomContent, setEnableSmsCustomContent] = useState(SysSettings.enableSmsCustomContent);
  const [addVisible, setAddVisible] = useState(false);

  useEffect(() => {
    smsApi.getProviders().then(result => {
      setSms(result);
      setLoading(false);
    });
  }, []);

  const SmsList = [
    {
      name: _l('腾讯云'),
      key: 'Tencentyun',
      tags: ['App ID', 'App Key'],
      keys: ['appId', 'appKey'],
      icon: tencentyunIcon,
    },
    {
      name: _l('阿里云'),
      key: 'Aliyun',
      tags: ['Access Key', 'Access Secret'],
      keys: ['accessKey', 'accessSecret'],
      icon: aliyunIcon,
    },
  ];

  const onDelete = item => {
    smsApi
      .removeProvider({ name: item.key })
      .then(res => {
        if (res) {
          alert(_l('删除成功'));
          setSms(sms.filter(l => l.name !== item.key));
        } else {
          alert(_l('删除失败'), 2);
        }
      })
      .catch(() => {
        alert(_l('删除失败'), 2);
      });
  };

  const changeStatus = (status, key) => {
    smsApi
      .editProviderStatus({ name: key, status: status ? 1 : 2 })
      .then(res => {
        if (res) {
          alert(_l('设置成功'));
          setSms(
            sms.map(l => ({
              ...l,
              status: l.name === key ? (status ? 1 : 2) : l.status,
            })),
          );
        } else {
          alert(_l('设置失败'), 2);
        }
      })
      .catch(() => {
        alert(_l('设置失败'), 2);
      });
  };

  const onEdit = data => {
    const isEdit = _.find(sms, l => l.name === data.name);

    setSms(isEdit ? sms.map(l => (l.name === data.name ? data : l)) : sms.concat(data));
    setCurrentSms({});
    !isEdit && smsApi.editProviderStatus({ name: data.name, status: 1 });
  };

  const renderAddBtn = () => {
    if (sms.length === SmsList.length) return null;

    return (
      <Trigger
        popupVisible={addVisible}
        onPopupVisibleChange={visible => setAddVisible(visible)}
        action={['click']}
        popupAlign={{
          points: ['tl', 'bl'],
          offset: [0, 5],
          overflow: { adjustX: true, adjustY: true },
        }}
        popup={
          <ActionWrap>
            {SmsList.map((item, index) => {
              return (
                <MenuItem
                  disabled={!!sms.find(l => l.name === item.key)}
                  key={item.key}
                  onClick={() => {
                    if (sms.find(l => l.name === item.key)) return;

                    setAddVisible(false);
                    setCurrentSms(item);
                  }}
                >
                  {item.name}
                </MenuItem>
              );
            })}
          </ActionWrap>
        }
      >
        <span className="ThemeColor Hand mTop10">
          <i className="icon-add TxtMiddle mRight3" />
          <span>{_l('服务')}</span>
        </span>
      </Trigger>
    );
  };

  const renderList = () => {
    if (!sms.length) return <EmptyStatus />;

    return SmsList.map((l, i) => {
      const data = _.find(sms, { name: l.key });

      return data && data.signature ? (
        <Item
          key={`sms-item-${l.key}`}
          item={{
            ..._.pick(l, ['name', 'icon', 'key']),
            desc: _l('%0个短信模版', _.get(data, 'sms.china.templates.length') || 0),
            status: data.status,
          }}
          className="pLeft20"
          onEdit={() => setCurrentSms(l)}
          onDelete={onDelete}
          onSwitch={value => {
            changeStatus(!value, l.key);
          }}
        />
      ) : null;
    });
  };

  return (
    <div className="privateCardWrap flexColumn">
      <div className="Font17 bold mBottom20">{_l('短信服务')}</div>
      <div className="Font14 bold mBottom13">{_l('验证码短信')}</div>
      <div className="Font13 Gray_9e mBottom12">
        {_l(
          '仅支持发送登录/注册验证码。只需配置一个服务商，若配置了多个服务商，则发送验证码短信时每次会随机选择一个。',
        )}
      </div>
      {loading ? <LoadDiv /> : renderList()}
      {renderAddBtn()}
      <Divider className="mTop20 mBottom20" />
      <div className="Font14 bold mBottom13 valignWrapper">
        <span className="flex">{_l('自定义短信功能')}</span>
        <Switch
          size="small"
          checked={!enableSmsCustomContent}
          onClick={value => {
            updateSysSettings(
              {
                enableSmsCustomContent: value,
              },
              () => {
                setEnableSmsCustomContent(value);
                md.global.SysSettings.enableSmsCustomContent = value;
              },
            );
          }}
        />
      </div>
      <div className="Font13 Gray_9e">
        {_l(
          '开启后将显示短信相关功能入口（如：工作流发送短信节点、手机号邀请用户、外部门户短信通知等）。为保障功能实际可用，需要自行申请第三方短信服务商账号，然后自主集成或由官方技术团队定制开发',
        )}
        <a className="pointer" target="_blank" href="https://docs-pd.mingdao.com/faq/sms">
          {_l('了解自主集成')}
        </a>
      </div>
      <Dialog
        visible={!_.isEmpty(currentSms)}
        anim={false}
        title={_l('%0短信配置服务', currentSms.name)}
        width={680}
        okText={_l('保存')}
        onOk={() => {
          formContent.current.editProviders();
        }}
        onCancel={() => setCurrentSms({})}
      >
        <MessageSettings
          ref={formContent}
          name={currentSms.key}
          item={_.find(sms, l => l.name === currentSms.key)}
          onSave={onEdit}
        />
      </Dialog>
    </div>
  );
};

const PlatformIntegration = props => {
  const platTypes = [
    { type: 'WorkWeixin', text: _l('企业微信') },
    { type: 'Dingding', text: _l('钉钉') },
    { type: 'Welink', text: _l('Welink') },
    { type: 'Feishu', text: _l('飞书') },
    { type: 'Weixin', text: _l('微信') },
  ];
  const [usePlatformInfo, setUserPlatformInfo] = useState({
    hideWorkWeixin: md.global.SysSettings.hideWorkWeixin,
    hideDingding: md.global.SysSettings.hideDingding,
    hideWelink: md.global.SysSettings.hideWelink,
    hideFeishu: md.global.SysSettings.hideFeishu,
    hideWeixin: md.global.SysSettings.hideWeixin,
  });

  const changeCheckedIntegration = (checked, type) => {
    privateSysSetting
      .editSysSettings({
        settings: {
          [`hide${type}`]: checked,
        },
      })
      .then(res => {
        if (res) {
          setUserPlatformInfo({
            ...usePlatformInfo,
            [`hide${type}`]: checked,
          });
          md.global.SysSettings[`hide${type}`] = checked;
          alert(_l('修改成功'));
        } else {
          alert(_l('修改失败'), 2);
        }
      });
  };

  return (
    <div className="privateCardWrap flexColumn">
      <div className="Font17 bold mBottom8">{_l('第三方平台')}</div>
      <div className="mBottom15 Gray_9e">{_l('如果组织内不使用以下第三方平台，可取消勾选')}</div>
      <div className="flexRow">
        {platTypes.map(item => {
          const { type, text } = item;

          return (
            <Fragment key={type}>
              <Checkbox
                checked={!usePlatformInfo[`hide${type}`]}
                onClick={checked => changeCheckedIntegration(checked, type)}
              />
              <span className="mRight30">{text}</span>
            </Fragment>
          );
        })}
      </div>
    </div>
  );
};

const MapSetting = props => {
  const [enableMap, setEnableMap] = useState(md.global.SysSettings.enableMap);
  const [actionType, setActionType] = useState('');
  const [mapList, setMapList] = useState([]);
  const [popupVisible, setPopupVisible] = useState(false);
  const [mapPrams, setMapParams] = useState({ key: '', secret: '' });
  const [serveType, setServeType] = useState(0);
  const { key, secret, id } = mapPrams;
  const existType = _.find([0, 1], item =>
    _.includes(
      mapList.map(v => v.type),
      item,
    ),
  );

  const setting = [
    { type: 0, name: _l('高德地图'), icon: gaodeMap },
    { type: 1, name: _l('Google地图'), icon: googleMap },
  ];

  const getMapList = () => {
    privateMapAjax.getMapList({}).then(res => {
      const list = (res || []).map(item => {
        const it = _.find(setting, v => v.type === item.type);
        if (it) {
          return { ...item, ...it };
        }
        return item;
      });

      setMapList(list);
    });
  };

  // 新增/编辑
  const saveServe = () => {
    const promise = actionType === 'add' ? privateMapAjax.addMap : privateMapAjax.editMap;
    if (!_.trim(key) || (serveType === 0 && !_.trim(secret))) return;

    promise({
      id,
      type: serveType,
      secretDict: {
        key: encrypt(key),
        secret: secret ? encrypt(secret) : undefined,
      },
    }).then(res => {
      if (res) {
        setActionType(false);
        if (actionType === 'add') {
          setMapParams({ key: '', secret: '' });
          getMapList();
        } else {
          const newList = mapList.map(item => {
            if (id === item.id) {
              return { ...item, secretObject: { key, secret } };
            }
            return item;
          });
          setMapList(newList);
        }
      }
    });
  };

  // 删除
  const removeMap = item => {
    privateMapAjax.removeMap({ id: item.id }).then(res => {
      if (res) {
        alert(_l('操作成功'));
      }
    });
  };

  // 编辑状态
  const handleEditStatus = (visible, item) => {
    privateMapAjax.editMapStatus({ id: item.id, status: !visible ? 1 : 0 }).then(res => {
      if (res) {
        const newMpaList = mapList.map(v => {
          if (v.id === item.id) {
            return { ...v, status: !visible ? 1 : 0 };
          }
          return v;
        });
        setMapList(newMpaList);
        alert(_l('操作成功'));
      }
    });
  };

  useEffect(() => {
    getMapList();
  }, []);

  const renderItem = options => {
    const { item, DragHandle } = options;

    return (
      <Item
        dragIcon={
          <DragHandle className="alignItemsCenter flexRow">
            <Icon className="mRight10 Font16 Hand Gray_bd" icon="drag" />
          </DragHandle>
        }
        item={item}
        onSwitch={visible => handleEditStatus(visible, item)}
        onEdit={() => {
          setMapParams({ ...item.secretObject, id: item.id });
          setServeType(item.type);
          setActionType('edit');
        }}
        onDelete={() => {
          setMapList(mapList.filter(v => v.id !== item.id));
          removeMap(item);
        }}
      />
    );
  };

  return (
    <Fragment>
      <div className="privateCardWrap flexColumn">
        <div className="Font17 bold mBottom8">{_l('地图服务')}</div>
        <div className="flexRow">
          <div className="mBottom15 Gray_9e flex mRight20">
            {_l(
              '开启后将显示地图相关功能入口（如：地图视图、定位字段、个人偏好设置>地图）。若要保证功能正常使用，还需要在下方配置并开启地图服务。个人偏好>地图的初始值将跟随列表中第一个开启的地图服务',
            )}
          </div>
          <Switch
            checked={enableMap}
            onClick={value => {
              updateSysSettings(
                {
                  enableMap: !value,
                },
                () => {
                  setEnableMap(!value);
                  md.global.SysSettings.enableMap = !value;
                },
              );
            }}
          />
        </div>
        {md.global.SysSettings.enableMap && (
          <Fragment>
            {_.isEmpty(mapList) ? (
              <EmptyStatus />
            ) : (
              <SortableList
                useDragHandle
                canDrag
                itemKey="id"
                items={mapList}
                renderItem={renderItem}
                onSortEnd={newItems => {
                  setMapList(newItems);
                  const sortDict = {};
                  newItems.forEach((item, index) => {
                    sortDict[item.id] = index;
                  });

                  privateMapAjax.editMapSort({ sortDict }).then(res => {
                    if (res) {
                      alert(_('操作成功'));
                    }
                  });
                }}
              />
            )}

            {mapList.length < 2 && (
              <div>
                <Trigger
                  popupVisible={popupVisible}
                  onPopupVisibleChange={visible => setPopupVisible(visible)}
                  action={['click']}
                  popupAlign={{
                    points: ['tl', 'bl'],
                    offset: [0, 5],
                    overflow: { adjustX: true, adjustY: true },
                  }}
                  popup={
                    <ActionWrap>
                      {setting.map(item => {
                        return (
                          <MenuItem
                            disabled={existType === item.type}
                            key={item.type}
                            onClick={() => {
                              setPopupVisible(false);
                              setServeType(item.type);
                              setActionType('add');
                            }}
                          >
                            {item.name}
                          </MenuItem>
                        );
                      })}
                    </ActionWrap>
                  }
                >
                  <span className="ThemeColor Hand mTop10">
                    <i className="icon-add TxtMiddle mRight3" />
                    <span>{_l('服务')}</span>
                  </span>
                </Trigger>
              </div>
            )}
          </Fragment>
        )}
      </div>
      {actionType && (
        <Dialog
          visible={actionType}
          title={serveType === 0 ? _l('高德地图') : _l('Google地图')}
          okText={_l('保存')}
          onCancel={() => {
            setActionType(false);
            setMapParams({ key: '', secret: '' });
          }}
          onOk={saveServe}
        >
          <div className="mBottom8">API Key</div>
          <Input className="w100" value={key} onChange={value => setMapParams({ ...mapPrams, key: value })} />
          {serveType === 0 && (
            <Fragment>
              <div className="mBottom8 mTop8">{_l('密钥')}</div>
              <Input className="w100" value={secret} onChange={value => setMapParams({ ...mapPrams, secret: value })} />
            </Fragment>
          )}
        </Dialog>
      )}
    </Fragment>
  );
};

const DataPipelineSetting = () => {
  const [hideDataPipeline, setHideDataPipeline] = useState(md.global.SysSettings.hideDataPipeline);
  return (
    <div className="privateCardWrap flexColumn">
      <div className="flexRow">
        <div className="Font17 bold mBottom8 flex">{_l('数据集成')}</div>
        <Switch
          checked={!hideDataPipeline}
          onClick={value => {
            updateSysSettings(
              {
                hideDataPipeline: value,
              },
              () => {
                setHideDataPipeline(value);
                md.global.SysSettings.hideDataPipeline = value;
              },
            );
          }}
        />
      </div>
      <div className="Gray_9e flex mRight20">
        {_l('开启后将显示数据集成相关功能入口（如：数据集成、聚合表）')}
        <a className="pointer" target="_blank" href="https://docs-pd.mingdao.com/faq/integrate/flink/combine">
          {_l('了解服务配置')}
        </a>
      </div>
    </div>
  );
};

export default props => {
  return (
    <Fragment>
      <Email {...props} />
      <Message {...props} />
      <MapSetting {...props} />
      <AISetting {...props} />
      <OCRSetting {...props} />
      <DataPipelineSetting {...props} />
      <PlatformIntegration {...props} />
    </Fragment>
  );
};
