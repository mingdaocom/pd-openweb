import React, { useEffect, useRef } from 'react';
import styled from 'styled-components';
import cx from 'classnames';
import { Icon, Menu, LoadDiv, Tooltip, SvgIcon } from 'ming-ui';
import { useSetState } from 'react-use';
import Trigger from 'rc-trigger';
import SelectIcon from 'src/pages/AppHomepage/components/SelectIcon';
import { RedMenuItemWrap, MenuItemWrap, LogoWrap, ActWrap, BtnWrap } from '../style';
import Switch from 'src/pages/workflow/components/Switch';
import Set from './Set';
import Cite from './Cite';
import Log from './Log';
import packageVersionAjax from 'src/pages/workflow/api/packageVersion';
import flowNodeAjax from 'src/pages/workflow/api/flowNode';
import processAjax from 'src/pages/workflow/api/process.js';
import axios from 'axios';
import moment from 'moment';
import { checkPermission } from 'src/components/checkPermission';
import { PERMISSION_ENUM } from 'src/pages/Admin/enum';

const Wrap = styled.div`
  width: 800px;
  height: 100%;
  position: fixed;
  z-index: 100;
  right: 0;
  top: 0;
  bottom: 0;
  background: #f5f5f5;
  box-shadow: 0 8px 36px rgb(0 0 0 / 24%);
  .w150 {
    width: 150px !important;
  }
  .conSetting {
    height: 100%;
    overflow: auto;
    padding-bottom: 70px;
  }
  .tabCon {
    text-align: center;
    li {
      font-size: 15px;
      font-weight: 600;
      color: #333;
      display: inline-block;
      margin: 0 0;
      padding: 24px 20px 10px;
      box-sizing: border-box;
      border-bottom: 3px solid rgba(0, 0, 0, 0);
      &.disble {
        color: #757575;
      }
      &.isCur {
        color: #2196f3;
        border-bottom: 3px solid #2196f3;
      }
    }
  }
  .headTop {
    background: #ffffff;
    border-bottom: 1px solid #ebebeb;
    padding: 24px 24px 0 40px;
    width: 100%;
    transition: height 0.2s;
    textarea.des {
      height: auto;
      width: 100%;
      border: none;
      resize: none;
    }
    &.isFix {
      padding: 10px 32px 0;
      position: absolute;
      top: 0;
      height: 56px;
      z-index: 1;
      .tabBox {
        li {
          padding: 10px 11px !important;
        }
      }
      .apiTop {
        width: 200px;
        input {
          width: 170px;
        }
        span {
          max-width: 170px;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
      }
    }
    .apiTop {
      position: relative;
      .forTip {
        position: absolute;
        height: 36px;
        width: 1px;
      }
      input {
        border: none;
        width: 90%;
        &:focus {
          color: #333 !important;
        }
      }
    }
    .tabBox {
      text-align: left;
    }
  }
  .footerCon {
    width: 100%;
    height: 70px;
    background: #ffffff;
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    padding: 16px 40px;
    .boc {
      margin: 0 auto;
      max-width: 800px;
      width: 100%;
      .close {
        height: 38px;
        border-radius: 3px;
        line-height: 38px;
        color: #757575;
        padding: 0 30px;
        border: 1px solid #ebebeb;
        &:hover {
          color: #2196f3;
          border: 1px solid #2196f3;
        }
      }
    }
    .apiBtn {
      height: 36px;
      line-height: 36px;
      color: #fff;
      padding: 0 32px;
      border-radius: 3px;
    }
    .update {
      height: 38px;
      border-radius: 3px;
      line-height: 38px;
      color: #2196f3;
      padding: 0 30px;
      border: 1px solid #2196f3;
      &:hover {
        color: #1764c0;
        border: 1px solid #1764c0;
      }
    }
  }
  .node {
    height: 35px;
  }
  .icon-close {
    color: #9e9e9e;
    &:hover {
      color: #2196f3;
    }
  }
`;

const TABLIST = [_l('API设置'), _l('查看引用'), _l('请求日志')];

//api详情 侧拉层
function APISetting(props) {
  const [
    {
      data,
      apkInfo,
      tab,
      isFix,
      showMenu,
      pending,
      loading,
      info,
      editing,
      editingName,
      curId,
      isConnectOwner,
      hasManageAuth,
    },
    setState,
  ] = useSetState({
    apkInfo: props.connectInfo || {},
    data: props.data,
    tab: props.tab || 0,
    isFix: false,
    loading: true,
    info,
    editing: false,
    editingName: false,
    pending: false,
    showMenu: false,
    curId: '',
    isConnectOwner: false,
    hasManageAuth: props.hasManageAuth,
  });
  const headerRef = useRef();
  const WrapRef = useRef();
  const InputRef = useRef();
  const InputDesRef = useRef();
  const TipRef = useRef();
  const cache = useRef({
    isFix: false,
  });

  useEffect(() => {
    window.addEventListener('keydown', keyDownListener, false);
    return () => {
      window.removeEventListener('keydown', keyDownListener, false);
    };
  }, []);
  const keyDownListener = e => {
    if (
      e.keyCode === 27 // ESC
    ) {
      props.onCancel && props.onCancel();
    }
  };
  useEffect(() => {
    if (!props.listId) {
      createApi();
    } else if (curId !== props.listId) {
      setState({
        curId: props.listId,
        isFix: false,
      });
      getInfo(props.listId, props.data);
    }
  }, [props.listId]);

  useEffect(() => {
    editing &&
      setTimeout(() => {
        $(InputDesRef.current).focus();
      }, 300);
  }, [editing]);
  useEffect(() => {
    editingName &&
      setTimeout(() => {
        $(InputRef.current).focus();
      }, 300);
  }, [editingName]);
  //获取这个api的相关信息
  const getAPIDetail = async id => {
    const r = await packageVersionAjax.getApiDetail(
      {
        id,
      },
      { isIntegration: true },
    );
    return r;
  };

  // 获取API详情
  const getInfo = async (processId, data) => {
    setState({ loading: true });
    if (!processId) {
      return;
    }
    const res = await axios.all([
      flowNodeAjax.get(
        {
          processId,
        },
        { isIntegration: true },
      ),
      processAjax.getProcessPublish(
        {
          processId,
        },
        { isIntegration: true },
      ),
    ]);
    const hasManageAuth = checkPermission(res[0].companyId, PERMISSION_ENUM.MANAGE_API_CONNECTS);
    //后端——>列表上的数据可能不对，需要重新获取
    const apiData = await getAPIDetail(processId);
    setState({
      hasManageAuth,
      info: res[0],
      data: { ...apiData, ...res[1] },
    });
    !props.connectInfo //从连接的api管理进来的 参数上带了connectInfo，不需要重新获取
      ? packageVersionAjax
          .getDetail(
            {
              isPublic: true,
              id: res[0].relationId,
            },
            { isIntegration: true },
          )
          .then(
            res => {
              setState({
                apkInfo: res,
                loading: false,
                isConnectOwner: hasManageAuth || res.isOwner,
              });
            },
            () => {
              //无连接权限的页面兼容
              setState({
                apkInfo: {},
                loading: false,
                isConnectOwner: false,
              });
            },
          )
      : setState({
          loading: false,
          isConnectOwner: hasManageAuth || props.connectInfo.isOwner,
          apkInfo: props.connectInfo,
        });
  };
  // 更新基本信息
  const updateInfo = data => {
    processAjax
      .updateProcess(
        {
          companyId: localStorage.getItem('currentProjectId'),
          processId: data.id,
          name: data.name,
          explain: data.explain,
          iconName: data.iconName,
          iconColor: data.iconColor,
        },
        { isIntegration: true },
      )
      .then(res => {
        let newData = {
          ...data,
          ...res,
          iconName: data.iconName,
          iconColor: data.iconColor,
          ownerAccount: data.ownerAccount,
        };
        setState({
          data: newData,
        });
        props.onChange && props.onChange(newData);
      });
  };
  const createApi = async () => {
    const res = await packageVersionAjax.addApi(
      {
        companyId: localStorage.getItem('currentProjectId'),
        explain: '',
        iconColor: '#455a64',
        iconName: md.global.FileStoreConfig.pubHost.replace(/\/$/, '') + '/customIcon/10_13_rocket.svg',
        name: '未命名 API',
        relationId: props.id,
        relationType: 40, //props.startAppType, //startAppType
        startEventAppType: 0,
      },
      { isIntegration: true },
    );
    let newRes = {
      ...res,
      iconColor: '#455a64',
      iconName: md.global.FileStoreConfig.pubHost.replace(/\/$/, '') + '/customIcon/10_13_rocket.svg',
      name: '未命名 API',
      type: 1,
      ownerAccount: {
        ...res.ownerAccount,
        accountId: md.global.Account.accountId,
        fullName: md.global.Account.fullname,
      },
    };
    setState({ data: newRes, curId: newRes.id });
    getInfo(newRes.id, newRes);
    props.onChange && props.onChange(newRes);
  };
  /**
   * 开启关闭
   */
  const switchStatus = (enabled, cb) => {
    setState({
      pending: true,
    });
    processAjax.publish({ isPublish: enabled, processId: data.id }, { isIntegration: true }).then(publishData => {
      const { isPublish } = publishData;
      if (isPublish) {
        let newData = {
          ...data,
          enabled: enabled, //publish: enabled
          publishStatus: cb && enabled ? 2 : 1,
          lastModifiedDate: moment().format('YYYY-MM-DD HH:mm:ss'),
        };
        setState({
          data: newData,
          pending: false,
        });
        props.onChange && props.onChange(newData);
        cb && cb();
        // alert(_l('更新成功'));
      } else {
        setState({
          pending: false,
        });
        alert(_l('发布失败，请完善API信息'), 2);
      }
    });
  };

  const renderCon = () => {
    switch (tab) {
      case 0:
        return (
          <Set
            {...props}
            {...data}
            connectInfo={apkInfo}
            isConnectOwner={isConnectOwner}
            info={info}
            hasChange={() => {
              let newData = {
                ...data,
                publishStatus: 1,
                lastModifiedDate: moment().format('YYYY-MM-DD HH:mm:ss'),
              };
              setState({ data: newData, isFix: false });
              props.onChange && props.onChange(newData);
              getInfo(data.id, newData);
            }}
          />
        );
      case 1:
        return <Cite processId={data.id} connectInfo={apkInfo} />;
      case 2:
        return <Log hasManageAuth={hasManageAuth} processId={data.id} connectInfo={apkInfo} />;
    }
  };
  const renderTabCon = () => {
    return (
      <div className="tabCon tabBox">
        <ul>
          {TABLIST.filter((o, i) => (!info.startEventId ? [0].includes(i) : true)).map((o, i) => {
            return (
              <li
                className={cx('Hand Font15', { isCur: tab === i })}
                onClick={() => {
                  setState({ tab: i });
                }}
              >
                {o}
              </li>
            );
          })}
        </ul>
      </div>
    );
  };
  if (loading) {
    return (
      <Wrap className={props.className}>
        <LoadDiv />
      </Wrap>
    );
  }
  {
    props.forPage ? (document.title = `${_l('集成中心')}-${data.name || _l('未命名 API')}`) : '';
  }
  const renderIcon = () => {
    return data.iconName ? (
      <LogoWrap
        className="logo iconWrap mRight15 flexRow alignItemsCenter justifyContentCenter"
        width={isFix ? 35 : 48}
      >
        <div className="bg" style={{ backgroundColor: data.iconColor }}></div>
        <SvgIcon url={data.iconName} fill={data.iconColor} size={isFix ? 24 : 32} />
      </LogoWrap>
    ) : (
      <LogoWrap className="logo mRight15 flexRow alignItemsCenter justifyContentCenter" width={isFix ? 35 : 48}>
        <Icon icon="rocket_launch" className={isFix ? 'Font24' : 'Font32'} />
      </LogoWrap>
    );
  };
  const renderOption = () => {
    return (
      <React.Fragment>
        {data.ownerAccount && data.ownerAccount.accountId && (
          <div className="Gray_75 node TxtMiddle mLeft10 flexRow alignItemsCenter">
            {(!isFix || props.forPage) && (
              <React.Fragment>
                <span className="Gray mRight8">{data.ownerAccount.fullName}</span>
                <span className="" style={{ color: '#999' }}>
                  {apkInfo.type === 2 ? _l('安装于') : data.lastModifiedDate ? _l('更新于') : _l('创建于')}
                  {apkInfo.type === 2 ? data.createdDate : data.lastModifiedDate || data.createdDate}
                </span>
              </React.Fragment>
            )}
            {(location.href.indexOf('integrationApi') < 0 || (apkInfo.type === 1 && isConnectOwner)) && (
              <Trigger
                action={['click']}
                popup={
                  <Menu>
                    {location.href.indexOf('integrationApi') < 0 && (
                      <MenuItemWrap
                        icon={<Icon icon="launch" className="Font17 mLeft5" />}
                        onClick={() => {
                          window.open(`/integrationApi/${props.listId}`);
                        }}
                      >
                        <span>{_l('新页面打开')}</span>
                      </MenuItemWrap>
                    )}
                    {/* 自定义的api才能有删除的权限 */}
                    {apkInfo.type === 1 && isConnectOwner && (
                      <RedMenuItemWrap
                        icon={<Icon icon="task-new-delete" className="Font17 mLeft5" />}
                        onClick={() => {
                          setState({
                            showMenu: false,
                          });
                          props.onDel && props.onDel(data);
                        }}
                      >
                        <span>{_l('删除')}</span>
                      </RedMenuItemWrap>
                    )}
                  </Menu>
                }
                popupClassName={cx('dropdownTrigger')}
                popupVisible={showMenu}
                onPopupVisibleChange={visible => {
                  setState({
                    showMenu: visible,
                  });
                }}
                popupAlign={{
                  points: ['tl', 'bl'],
                  overflow: {
                    adjustX: true,
                    adjustY: true,
                  },
                }}
              >
                <ActWrap
                  className="act InlineBlock TxtMiddle TxtCenter"
                  onClick={() => {
                    setState({
                      showMenu: true,
                    });
                  }}
                >
                  <i className={'icon-more_vert Font22 TxtMiddle'} />
                </ActWrap>
              </Trigger>
            )}
          </div>
        )}
        {location.href.indexOf('integrationApi') < 0 && (
          <i
            className={'icon-close Font24 TxtMiddle Hand LineHeight35'}
            onClick={() => props.onCancel && props.onCancel()}
          />
        )}
      </React.Fragment>
    );
  };
  return (
    <Wrap
      className={props.className}
      onScroll={() => {
        if (!WrapRef.current) return;
        let toFix = $(WrapRef.current).offset().top <= 50;
        if (toFix !== cache.current.isFix) {
          setState({
            isFix: toFix,
          });
          cache.current.isFix = toFix;
        }
      }}
    >
      <div className="conSetting" style={{ background: tab === 2 ? '#fff' : 'none' }}>
        <div className={cx('headTop', { isFix })} ref={headerRef}>
          <div className="flexRow leftCon">
            {location.href.indexOf('/integrationApi') >= 0 && (
              <ActWrap
                className="act InlineBlock TxtMiddle TxtCenter mLeft0 mRight32 Hand LineHeight36"
                onClick={() => {
                  if (history.length === 1) {
                    location.href = '/integration';
                  } else {
                    history.back();
                  }
                }}
              >
                <Icon icon="knowledge-return" className="Font16" />
              </ActWrap>
            )}
            <div className="Hand apiDes flexRow flex">
              {apkInfo.type === 1 && //自定义
              isConnectOwner ? (
                <Trigger
                  action={['click']}
                  popup={
                    <SelectIcon
                      className={''}
                      hideInput
                      hideCustom
                      iconColor={data.iconColor}
                      icon={''}
                      name={data.iconName}
                      projectId={localStorage.getItem('currentProjectId')}
                      onModify={({ iconColor, icon, iconUrl }) => {
                        if (iconColor) {
                          updateInfo({ ...data, iconColor });
                        } else {
                          updateInfo({ ...data, iconName: iconUrl });
                        }
                      }}
                    />
                  }
                  zIndex={1000}
                  popupAlign={{
                    points: ['tl', 'bl'],
                    overflow: {
                      adjustX: true,
                      adjustY: true,
                    },
                  }}
                >
                  {renderIcon()}
                </Trigger>
              ) : (
                renderIcon()
              )}
              <div className={cx('apiTop', { flex: !isFix, w150: !props.forPage })}>
                <div className="flexRow">
                  <Tooltip
                    text={<span>{_l('API建议命名为动作+名词，如：获取订单列表、删除订单')}</span>}
                    action={['click']}
                    popupPlacement={'bottomLeft'}
                  >
                    <div className="forTip" ref={TipRef}></div>
                  </Tooltip>
                  {!editingName ? (
                    <span
                      className={cx('name LineHeight35 Block WordBreak flex', {
                        Font22: !isFix,
                        Font15: isFix,
                      })}
                      onClick={() => {
                        if (
                          (apkInfo.type === 1 || //自定义
                            apkInfo.type === 2) && // 安装超管和拥有者可以修改描述和名称
                          isConnectOwner
                        ) {
                          setState({ editingName: true });
                        }
                      }}
                    >
                      {data.name || _l('未命名 API')}
                    </span>
                  ) : (
                    <React.Fragment>
                      <input
                        type="text"
                        ref={InputRef}
                        className={cx('name Block flex', {
                          Font22: !isFix,
                          Font15: isFix,
                        })}
                        value={data.name}
                        autofocus="autofocus"
                        placeholder={_l('添加API标题')}
                        onChange={e => {
                          let str = e.target.value;
                          if (e.target.value.trim().length > 40) {
                            str = e.target.value.trim().slice(0, 40);
                          }
                          setState({
                            data: { ...data, name: str },
                          });
                          if (e.target.value.length <= 0) {
                            TipRef.current.click();
                          }
                        }}
                        onBlur={e => {
                          updateInfo({
                            ...data,
                            name: !e.target.value.trim() ? _l('未命名API') : e.target.value.trim().slice(0, 40),
                          });
                          setState({ editingName: false });
                        }}
                      />
                    </React.Fragment>
                  )}
                  {!isFix && renderOption()}
                </div>

                {!isFix &&
                  (!editing ? (
                    <span
                      className="des Gray_9e Block mTop8 WordBreak"
                      onClick={() => {
                        if (
                          (apkInfo.type === 1 || //自定义
                            apkInfo.type === 2) && // 安装超管和拥有者可以修改描述和名称
                          isConnectOwner
                        ) {
                          setState({ editing: true });
                        }
                      }}
                    >
                      {data.explain || _l('添加说明…')}
                    </span>
                  ) : (
                    <textarea
                      type="text"
                      ref={InputDesRef}
                      autofocus="autofocus"
                      placeholder={_l('添加说明…')}
                      className="des Gray_9e Block mTop8"
                      value={data.explain}
                      onChange={e => {
                        let str = e.target.value;
                        if (e.target.value.trim().length > 200) {
                          str = e.target.value.trim().slice(0, 200);
                        }
                        setState({
                          data: { ...data, explain: str },
                        });
                      }}
                      onBlur={e => {
                        updateInfo({ ...data, explain: e.target.value.trim().slice(0, 200) });
                        setState({ editing: false });
                      }}
                    />
                  ))}
              </div>
              {isFix && <div className="flex">{renderTabCon()}</div>}
              {isFix && renderOption()}
            </div>
          </div>
          {!isFix && renderTabCon()}
        </div>
        <div className={cx('listCon')} style={{ 'padding-top': isFix ? 160 : 0 }}>
          <div className="scrollDiv" ref={WrapRef}></div>
          {renderCon()}
        </div>
      </div>
      <div className="footerCon flexRow">
        <div className="boc flexRow">
          <div className="flex">
            <div
              className="InlineBlock close Hand"
              onClick={() => {
                if (location.href.indexOf('/integrationApi') >= 0) {
                  location.href = '/integration';
                } else {
                  props.onCancel && props.onCancel();
                }
              }}
            >
              {_l('关闭')}
            </div>
          </div>
          {isConnectOwner ? (
            // {/* 安装的连接均没有「更新发布」功能。 超级管理员或拥有者 */}
            data.publish || apkInfo.type === 2 ? (
              <React.Fragment>
                {/* data.publishStatus === 1 && data.enabled 有修改未更新 */}
                {data.publishStatus === 1 && data.enabled && apkInfo.type === 1 && (
                  <div
                    className="InlineBlock update mRight10 Hand"
                    onClick={() =>
                      switchStatus(true, () => {
                        setState({
                          data: { ...data, publishStatus: 2 },
                        });
                        alert(_l('更新成功'));
                      })
                    }
                  >
                    {_l('更新发布')}
                  </div>
                )}
                <Switch
                  status={data.enabled ? 'active' : 'close'}
                  pending={pending}
                  isRefresh={false}
                  switchStatus={() => switchStatus(!data.enabled)}
                />
              </React.Fragment>
            ) : (
              apkInfo.type === 1 && (
                <BtnWrap
                  className="apiBtn InlineBlock Hand"
                  onClick={() =>
                    switchStatus(true, () => {
                      setState({
                        data: { ...data, publish: true, enabled: true, publishStatus: 2 },
                      });
                    })
                  }
                >
                  {_l('发布 API')}
                </BtnWrap>
              )
            )
          ) : (
            ''
          )}
        </div>
      </div>
    </Wrap>
  );
}

export default APISetting;
