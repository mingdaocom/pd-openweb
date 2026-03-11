import React, { useEffect } from 'react';
import DocumentTitle from 'react-document-title';
import { useSetState } from 'react-use';
import cx from 'classnames';
import moment from 'moment';
import { LoadDiv } from 'ming-ui';
import flowNodeAjax from 'src/pages/workflow/api/flowNode';
import packageVersionAjax from 'src/pages/workflow/api/packageVersion';
import processAjax from 'src/pages/workflow/api/process.js';
import { checkPermission } from 'src/components/checkPermission';
import { PERMISSION_ENUM } from 'src/pages/Admin/enum';
import Cite from './Cite';
import Footer from './Footer';
import Header from './Header';
import Log from './Log';
import Set from './Set';
import { Wrap } from './styles';
import TabCon from './TabCon';

//api详情 侧拉层
function APISetting(props) {
  const [{ data, apkInfo, tab, pending, loading, info, curId, isConnectOwner, hasManageAuth }, setState] = useSetState({
    apkInfo: props.connectInfo || {},
    data: props.data,
    tab: props.tab || 0,
    loading: true,
    info: undefined,
    pending: false,
    curId: '',
    isConnectOwner: false,
    hasManageAuth: props.hasManageAuth,
  });

  useEffect(() => {
    const keyDownListener = e => {
      if (
        e.keyCode === 27 // ESC
      ) {
        props.onCancel && props.onCancel();
      }
    };
    window.addEventListener('keydown', keyDownListener, false);
    return () => {
      window.removeEventListener('keydown', keyDownListener, false);
    };
  }, [props.onCancel]);
  useEffect(() => {
    if (!props.listId) {
      createApi();
    } else if (curId !== props.listId) {
      setState({
        curId: props.listId,
      });
      getInfo(props.listId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props.listId, curId]);

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
  const getInfo = async processId => {
    setState({ loading: true });
    if (!processId) {
      return;
    }
    const flowNodeData = await flowNodeAjax.get({ processId }, { isIntegration: true });
    const processPublishInfo = await processAjax.getProcessPublish({ processId }, { isIntegration: true });
    const hasManageAuth = checkPermission(flowNodeData.companyId, PERMISSION_ENUM.MANAGE_API_CONNECTS);
    //后端——>列表上的数据可能不对，需要重新获取
    const apiData = await getAPIDetail(processId);
    const dataNew = { ...apiData, ...processPublishInfo };
    setState({ hasManageAuth, info: flowNodeData, data: dataNew });
    !props.connectInfo //从连接的api管理进来的 参数上带了connectInfo，不需要重新获取
      ? packageVersionAjax
          .getDetail(
            {
              isPublic: true,
              id: flowNodeData.relationId,
            },
            { isIntegration: true },
          )
          .then(
            res => {
              setState({
                apkInfo: res,
                loading: false,
                isConnectOwner: (hasManageAuth || res.isOwner) && !dataNew.parentId,
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
          isConnectOwner: (hasManageAuth || props.connectInfo.isOwner) && !dataNew.parentId,
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
        iconName: md.global.FileStoreConfig.pubHost + '/customIcon/10_13_rocket.svg',
        name: _l('未命名 API'),
        relationId: props.id,
        relationType: 40, //props.startAppType, //startAppType
        startEventAppType: 0,
      },
      { isIntegration: true },
    );
    let newRes = {
      ...res,
      iconColor: '#455a64',
      iconName: md.global.FileStoreConfig.pubHost + '/customIcon/10_13_rocket.svg',
      name: _l('未命名 API'),
      type: 1,
      ownerAccount: {
        ...res.ownerAccount,
        accountId: md.global.Account.accountId,
        fullName: md.global.Account.fullname,
      },
    };
    setState({ data: newRes, curId: newRes.id });
    getInfo(newRes.id);
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
              setState({ data: newData });
              props.onChange && props.onChange(newData);
              getInfo(data.id);
            }}
          />
        );
      case 1:
        return <Cite processId={data.id} connectInfo={apkInfo} />;
      case 2:
        return <Log hasManageAuth={hasManageAuth} processId={data.id} connectInfo={apkInfo} />;
    }
  };
  if (loading) {
    return (
      <Wrap className={props.className}>
        <LoadDiv />
      </Wrap>
    );
  }

  return (
    <Wrap className={cx(props.className, 'flexColumn')}>
      {props.forPage && <DocumentTitle title={`${_l('集成')}-${data.name || _l('未命名 API')}`} />}

      <div className="conSetting flex" style={{ background: tab === 2 ? '#fff' : 'none' }}>
        <Header
          data={data}
          apkInfo={apkInfo}
          isConnectOwner={isConnectOwner}
          forPage={props.forPage}
          listId={props.listId}
          onCancel={props.onCancel}
          onDel={props.onDel}
          updateInfo={updateInfo}
          onDataChange={newData => setState({ data: newData })}
        />
        <TabCon data={data} info={info} tab={tab} setTab={tab => setState({ tab })} forPage={props.forPage} />
        <div className="flex">{renderCon()}</div>
      </div>
      <Footer
        data={data}
        apkInfo={apkInfo}
        isConnectOwner={isConnectOwner}
        pending={pending}
        onCancel={props.onCancel}
        switchStatus={switchStatus}
        setState={setState}
      />
    </Wrap>
  );
}

export default APISetting;
