import React, { Fragment, useEffect } from 'react';
import { useSetState } from 'react-use';
import { Drawer } from 'antd';
import _ from 'lodash';
import styled from 'styled-components';
import { Button, Icon, Input, RadioGroup, Switch } from 'ming-ui';
import { Tooltip } from 'ming-ui/antd-components';
import dataLimitAjax from 'src/api/dataLimit';
import { ADVANCED_SETTING_ENUM, POLICY_ACTION_ENUM } from '../enum';
import { arrayToObject } from '../utils';
import AccessConditions from './AccessConditions';
import AppListLimit from './AppListLimit';

const DrawerWrap = styled(Drawer)`
  .ant-drawer-content-wrapper {
    box-shadow: -7px 0px 6px 1px rgba(0, 0, 0, 0.08);
  }
  .ant-drawer-header {
    border-bottom: 0;
    .ant-drawer-header-title {
      flex-direction: row-reverse;
      .ant-drawer-title {
        font-size: 17px;
        font-weight: 600;
      }
      .ant-drawer-close {
        padding: 0;
        margin-top: -24px;
        margin-right: -12px;
      }
    }
  }
  .ant-drawer-body {
    padding-top: 0;
  }
  .ant-drawer-footer {
    border: none;
  }
`;

const ContentWrap = styled.div`
  .w100 {
    width: 100%;
  }
  .accessPass,
  .ming.Menu {
    width: 112px;
  }
  .accessTypeRadioGroup {
    .Radio-box {
      margin-right: 8px !important ;
    }
    .Radio {
      margin-right: 26px !important;
    }
  }
`;

export default function AddAndEditAppAccess(props) {
  const { projectId, actionType, visible, actionRecord, updateAppLimit, getData, onClose } = props;
  const [state, setState] = useSetState({
    policyName: '',
    accessPass: false,
    ipRule: [],
    hearderRule: [],
    addressRule: [],
    clientRule: [],
    limitAction: 1,
    whiteApps: [],
    blackApps: [],
    isAllowPublicAccess: false,
    isAllowCrossApp: false,
    saveLoading: false,
    appList: actionRecord?.limitAction === 1 ? actionRecord?.whiteApps || [] : actionRecord?.blackApps || [],
  });
  const {
    policyName,
    accessType,
    accessPass,
    ipRule,
    hearderRule,
    addressRule,
    clientRule,
    limitAction,
    appList,
    isAllowPublicAccess,
    isAllowCrossApp,
    saveLoading,
  } = state;
  const isEdit = actionType === 'edit';

  const onSubmit = () => {
    if (!_.trim(policyName)) {
      return alert(_l('策略名称不能为空'), 2);
    }

    const params = {
      projectId,
      name: policyName,
      accessType,
      accessPass: accessPass ? true : false,
      limitAction,
      whiteApps: limitAction === 1 ? appList.map(({ appId }) => ({ appId })) : [],
      blackApps: limitAction === 0 ? appList.map(({ appId }) => ({ appId })) : [],
      isAllowPublicAccess,
      isAllowCrossApp,
      isEnable: isEdit ? actionRecord.isEnable : true,
    };

    if (accessType === 0) {
      if (_.isEmpty(ipRule)) {
        return alert(_l('IP不能为空'), 2);
      }

      if (
        _.find(
          ipRule,
          item =>
            !/^((25[0-5]|2[0-4]\d|[01]?\d\d?)\.){3}(25[0-5]|2[0-4]\d|[01]?\d\d?)(\/([0-9]|[12]\d|3[0-2]))?$/.test(item),
        )
      ) {
        return alert(_l('IP地址格式不正确'), 2);
      }

      params.ipRule = ipRule;
    } else if (accessType === 1) {
      if (_.find(hearderRule, item => !_.trim(item.key) || !_.trim(item.value))) {
        return alert(_l('请求头不能为空'), 2);
      }
      params.hearderRule = arrayToObject(hearderRule);
    } else if (accessType === 2) {
      if (_.some(addressRule, item => !_.trim(item))) {
        return alert(_l('域名不能为空'), 2);
      }
      params.addressRule = addressRule;
    } else {
      if (_.isEmpty(clientRule)) {
        return alert(_l('客户端不能为空'), 2);
      }
      params.clientRule = clientRule;
    }

    if (isEdit) {
      params.id = actionRecord.id;
    }

    setState({ saveLoading: true });

    if (!isEdit) {
      // 新增策略
      dataLimitAjax
        .addAppLimit(params)
        .then(res => {
          if (res) {
            alert(_l('新建成功'));
            getData();
            onClose();
            setState({ saveLoading: false });
          } else {
            alert(_l('新建失败'), 2);
            setState({ saveLoading: false });
          }
        })
        .catch(() => {
          setState({ saveLoading: false });
        });
      return;
    }
    updateAppLimit(
      params,
      () => {
        onClose();
        getData();
        setState({ saveLoading: false });
      },
      () => {
        setState({ saveLoading: false });
      },
    );
  };

  useEffect(() => {
    if (!actionRecord || _.isEmpty(actionRecord)) {
      return;
    }

    setState({
      policyName: actionRecord.name,
      accessType,
      accessPass,
      ipRule,
      ...actionRecord,
      limitAction: actionRecord.limitAction,
      appList: actionRecord?.limitAction === 1 ? actionRecord?.whiteApps || [] : actionRecord?.blackApps || [],
    });
  }, [actionRecord]);

  return (
    <DrawerWrap
      placement="right"
      title={isEdit ? _l('编辑应用访问策略') : _l('新建应用访问策略')}
      visible={visible}
      onClose={onClose}
      width={640}
      destroyOnClose={true}
      closeIcon={<i className="icon-close Font18" />}
      footer={
        <Fragment>
          <Button type="primary" className="mRight15" disabled={saveLoading} onClick={onSubmit}>
            {saveLoading ? (isEdit ? _l('保存中...') : _l('新建中...')) : isEdit ? _l('保存') : _l('新建')}
          </Button>
          <Button type="link" onClick={onClose}>
            {_l('取消')}
          </Button>
        </Fragment>
      }
    >
      <ContentWrap>
        <div className="bold mBottom8">{_l('名称')}</div>
        <Input
          className="w100 mBottom30"
          placeholder={_l('名称')}
          value={policyName}
          onChange={value => setState({ policyName: value })}
        />
        <AccessConditions updateData={data => setState(data)} actionRecord={actionRecord} />
        <div className="bold mBottom16">{_l('动作')}</div>
        <RadioGroup
          className="accessTypeRadioGroup"
          size="middle"
          checkedValue={limitAction}
          data={POLICY_ACTION_ENUM}
          onChange={value => setState({ limitAction: value })}
        />

        <div className="mBottom20 mTop30">
          <span className="bold mRight8 TxtMiddle">{limitAction === 1 ? _l('白名单') : _l('黑名单')}</span>
          <Tooltip
            title={
              limitAction === 1
                ? _l('整体禁止访问，允许访问下方添加的应用')
                : _l('整体允许访问，禁止访问下方添加的应用')
            }
          >
            <Icon icon="info_outline" className="textDisabled Font18 TxtMiddle pointer" />
          </Tooltip>
        </div>
        <AppListLimit projectId={projectId} onChange={data => setState({ appList: data })} appList={appList} />
        <div className="bold mBottom20 mTop30">{_l('高级设置')}</div>
        {ADVANCED_SETTING_ENUM.map(item => {
          return (
            <div key={item.value} className="mBottom20">
              <div className="flexRow alignItemsCenter">
                <Switch
                  size="small"
                  checked={item.value === 'isAllowPublicAccess' ? isAllowPublicAccess : isAllowCrossApp}
                  onClick={value => setState({ [item.value]: !value })}
                />

                <span className="bold mLeft5">{item.text}</span>
              </div>
              <div className="textSecondary mTop8">{item.description}</div>
            </div>
          );
        })}
      </ContentWrap>
    </DrawerWrap>
  );
}
