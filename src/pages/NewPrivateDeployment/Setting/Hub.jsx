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

const EmptyWrap = styled.div`
  height: 48px;
  line-height: 46px;
  border-radius: 3px;
  border: 1px solid #e6e6e6;
`;
const MapItem = styled(EmptyWrap)`
  display: flex;
  align-items: center;
  padding: 0 15px 0 7px;
  margin-bottom: 12px;
  .iconImg {
    width: 20px;
    height: 20px;
    margin-right: 8px;
  }
`;

const ActionWrap = styled(Menu)`
  width: 160px !important;
  .ming.MenuItem .Item-content:not(.disabled):hover {
    background-color: #f5f5f5 !important;
    color: #333 !important;
  }
  .ming.MenuItem .Item-content.disabled {
    color: #9e9e9e;
    background-color: #f5f5f5 !important;
  }
  .delete {
    color: #f51744;
  }
`;

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
  const style = { width: 100 };

  useEffect(() => {
    smsApi.getProviders().then(result => {
      setSms(result);
      setLoading(false);
    });
  }, []);

  const renderSms = (data = {}, smsInfo) => {
    const { name, secret = {}, sms } = data;
    const { tags, keys, icon } = smsInfo;
    const id = secret[keys[0]];
    const key = secret[keys[1]];
    return (
      <Fragment>
        <div className="flexRow valignWrapper mBottom15">
          <img style={{ width: 15 }} src={icon} />
          <div className="Font14 bold mLeft5">{smsInfo.title}</div>
          <div className="Gray_9e mLeft20 pTop2">{_l('仅支持发送登录/注册验证码')}</div>
        </div>
        <div className="flexRow valignWrapper mBottom12">
          <div style={style} className="Gray_75">
            {tags[0]}
          </div>
          <div>{id || _l('未配置')}</div>
        </div>
        <div className="flexRow valignWrapper mBottom12">
          <div style={style} className="Gray_75">
            {tags[1]}
          </div>
          <div>{key ? key.replace(/./g, '*') : _l('未配置')}</div>
        </div>
        <div className="flexRow valignWrapper mBottom12">
          <div style={style} className="Gray_75">
            {_l('签名')}
          </div>
          <div>{data.signature || _l('未配置')}</div>
        </div>
        <div className="flexRow valignWrapper mBottom12">
          <div style={style} className="Gray_75">
            {_l('短信模板')}
          </div>
          <div>{_l('%0个', _.get(sms, 'china.templates.length') || 0)}</div>
        </div>
        <div>
          <Button
            ghost
            type="primary"
            onClick={() => {
              setCurrentSms(smsInfo);
            }}
          >
            {_l('设置')}
          </Button>
        </div>
      </Fragment>
    );
  };

  const tencentyunInfo = {
    title: _l('腾讯云'),
    name: 'Tencentyun',
    tags: ['App ID', 'App Key'],
    keys: ['appId', 'appKey'],
    icon: tencentyunIcon,
  };
  const aliyunInfo = {
    title: _l('阿里云'),
    name: 'Aliyun',
    tags: ['Access Key', 'Access Secret'],
    keys: ['accessKey', 'accessSecret'],
    icon: aliyunIcon,
  };

  return (
    <div className="privateCardWrap flexColumn">
      <div className="Font17 bold mBottom8">{_l('短信服务')}</div>
      {loading ? (
        <LoadDiv />
      ) : (
        <Fragment>
          {renderSms(_.find(sms, { name: 'Tencentyun' }), tencentyunInfo)}
          <Divider className="mTop20 mBottom20" />
          {renderSms(_.find(sms, { name: 'Aliyun' }), aliyunInfo)}
        </Fragment>
      )}
      <Divider className="mTop20 mBottom20" />
      <div className="Font15 bold mBottom8">{_l('自主集成服务')}</div>
      <div className="Gray_9e">
        {_l(
          '如果需要启用系统内短信服务相关的功能(如: 工作流短信通知节点、手机号邀请用户加入产品使用),需自行申请第三方短信服务商账号,然后自主集成或由官方技术团队定制开发',
        )}
        ，
        <a className="pointer" target="_blank" href="https://docs-pd.mingdao.com/faq/sms">
          {_l('查看说明')}
        </a>
      </div>
      <div className="mTop30">
        <Checkbox
          checked={!enableSmsCustomContent}
          text={_l('隐藏短信服务相关的系统功能')}
          onClick={checked => {
            const value = checked;
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
        <div className="Gray_9e mTop8 mLeft25">{_l('如果你未完成自主集成,可以在系统内隐藏这些功能入口')}</div>
      </div>
      <Dialog
        visible={!_.isEmpty(currentSms)}
        anim={false}
        title={_l('%0短信配置服务', currentSms.title)}
        width={680}
        okText={_l('保存')}
        onOk={() => {
          formContent.current.editProviders();
        }}
        onCancel={() => setCurrentSms({})}
      >
        <MessageSettings
          ref={formContent}
          name={currentSms.name}
          onSave={data => {
            setSms(data);
            setCurrentSms({});
          }}
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
      <div className="mBottom15 Gray_9e">{_l('如果你的企业不使用下列第三方平台，你可以取消勾选')}</div>
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
      <MapItem>
        <DragHandle className="alignItemsCenter flexRow">
          <Icon className="mRight10 Font16 Hand Gray_bd" icon="drag" />
        </DragHandle>
        <img src={item.icon} className="iconImg" />
        <div className="flex mLeft6">{item.name}</div>
        <Switch
          size="small"
          checked={item.status === 1 ? true : false}
          onClick={visible => handleEditStatus(visible, item)}
        />

        <Trigger
          popupVisible={popupVisible === item.id}
          onPopupVisibleChange={visible => setPopupVisible(visible ? item.id : undefined)}
          action={['click']}
          popupAlign={{
            points: ['tr', 'br'],
            offset: [-160, 15],
            overflow: { adjustX: true, adjustY: true },
          }}
          popup={() => {
            return (
              <ActionWrap>
                <MenuItem
                  onClick={() => {
                    setPopupVisible(undefined);
                    setMapParams({ ...item.secretObject, id: item.id });
                    setServeType(item.type);
                    setActionType('edit');
                  }}
                >
                  {_l('编辑')}
                </MenuItem>
                <MenuItem
                  className="delete"
                  onClick={() => {
                    setPopupVisible(undefined);
                    setMapList(mapList.filter(v => v.id !== item.id));
                    removeMap(item);
                  }}
                >
                  {_l('删除')}
                </MenuItem>
              </ActionWrap>
            );
          }}
        >
          <Icon icon="moreop" className="Font16 Hand mLeft15" />
        </Trigger>
      </MapItem>
    );
  };

  return (
    <Fragment>
      <div className="privateCardWrap flexColumn">
        <div className="Font17 bold mBottom8">{_l('地图服务')}</div>
        <div className="flexRow">
          <div className="mBottom15 Gray_9e flex mRight20">
            {_l(
              '开启后，将显示地图服务相关系统功能入口（地图视图、定位字段、个人偏好设置-地图）。若要保证功能正常使用，还需要在下方配置并开启地图服务。个人偏好-地图的初始值将跟随列表中第一个开启的服务。如你未完成服务配置，可先关闭功能入口',
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
              <EmptyWrap className="pLeft16 mBottom12">{_l('未添加服务，功能不可用')}</EmptyWrap>
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
                  popupVisible={popupVisible === true}
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
              <div className="mBottom8 mTop8">密钥</div>
              <Input className="w100" value={secret} onChange={value => setMapParams({ ...mapPrams, secret: value })} />
            </Fragment>
          )}
        </Dialog>
      )}
    </Fragment>
  );
};

export default props => {
  return (
    <Fragment>
      <Email {...props} />
      <Message {...props} />
      <MapSetting {...props} />
      <PlatformIntegration {...props} />
    </Fragment>
  );
};
