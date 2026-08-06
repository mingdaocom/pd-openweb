import React, { Fragment, useEffect } from 'react';
import { useSetState } from 'react-use';
import { Drawer } from 'antd';
import _ from 'lodash';
import styled from 'styled-components';
import { Button, Icon, Input, LoadDiv, RadioGroup, SvgIcon, UserHead } from 'ming-ui';
import { Tooltip } from 'ming-ui/antd-components';
import aiModelAuthAjax from 'src/api/dataLimit.js';
import dialogSelectApp from 'src/ming-ui/functions/dialogSelectApp';
import selectAIModelDialog from 'src/pages/workflow/components/selectAIModelDialog';

const DrawerWrap = styled(Drawer)`
  .ant-drawer-content-wrapper {
    box-shadow: -7px 0px 6px 1px rgba(0, 0, 0, 0.08);
  }
  .ant-drawer-header {
    border-bottom: 1px solid var(--color-border-secondary);
    padding: 20px 24px;
    .ant-drawer-header-title {
      flex-direction: row-reverse;
      .ant-drawer-title {
        font-size: 17px;
        font-weight: 600;
      }
      .ant-drawer-close {
        padding: 0;
        margin-top: -2px;
        margin-right: 0;
      }
    }
  }
  .ant-drawer-body {
    padding: 24px;
    overflow-y: auto;
  }
  .ant-drawer-footer {
    border: none;
    padding: 16px 24px;
  }
  .Radio {
    margin-right: 26px !important;
  }
`;

const SectionTitle = styled.div`
  font-size: 13px;
  font-weight: 600;
  color: var(--color-text-primary);
`;

const ModelTable = styled.div`
  border: 1px solid var(--color-border-secondary);
  border-radius: 4px;
  margin-top: 10px;
  .tableHeader {
    display: flex;
    align-items: center;
    padding: 0 16px;
    height: 40px;
    background: var(--color-background-secondary);
    border-bottom: 1px solid var(--color-border-secondary);
    font-size: 13px;
    color: var(--color-text-secondary);
    font-weight: 600;
    border-radius: 4px 4px 0 0;
  }
  .tableRow {
    display: flex;
    align-items: center;
    padding: 0 16px;
    height: 44px;
    border-bottom: 1px solid var(--color-border-secondary);
    font-size: 13px;
    &:last-child {
      border-bottom: none;
    }
  }
  .colName {
    flex: 1;
    min-width: 0;
  }
  .colBrand {
    width: 160px;
    display: flex;
    align-items: center;
    gap: 6px;
  }
  .colAction {
    width: 48px;
    text-align: right;
  }
  .emptyTip {
    height: 80px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--color-text-disabled);
    font-size: 13px;
  }
`;

const AppTable = styled.div`
  border: 1px solid var(--color-border-secondary);
  border-radius: 4px;
  margin-top: 10px;
  .tableHeader {
    display: flex;
    align-items: center;
    padding: 0 16px;
    height: 40px;
    background: var(--color-background-secondary);
    border-bottom: 1px solid var(--color-border-secondary);
    font-size: 13px;
    color: var(--color-text-secondary);
    font-weight: 600;
    border-radius: 4px 4px 0 0;
  }
  .tableRow {
    display: flex;
    align-items: center;
    padding: 0 16px;
    height: 52px;
    border-bottom: 1px solid var(--color-border-secondary);
    font-size: 13px;
    &:last-child {
      border-bottom: none;
    }
  }
  .colName {
    flex: 1;
    min-width: 0;
    display: flex;
    align-items: center;
    gap: 8px;
    .appIcon {
      width: 32px;
      height: 32px;
      border-radius: 4px;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }
  }
  .colTime {
    width: 160px;
    color: var(--color-text-secondary);
  }
  .colOwner {
    width: 140px;
    display: flex;
    align-items: center;
    gap: 8px;
  }
  .colAction {
    width: 48px;
    text-align: right;
  }
  .emptyTip {
    height: 80px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--color-text-disabled);
    font-size: 13px;
  }
`;

const MODEL_SCOPE_OPTIONS = [
  {
    value: 'all',
    text: (
      <span style={{ display: 'inline-flex', alignItems: 'center' }}>
        {_l('全部模型')}
        <Tooltip
          title={_l('包含当前所有及未来新增模型。若选择范围过大，可能导致高成本模型被批量开放。')}
          placement="top"
        >
          <Icon icon="help" className="Font14 mLeft4 textSecondary" />
        </Tooltip>
      </span>
    ),
  },
  {
    value: 'specific',
    text: (
      <span style={{ display: 'inline-flex', alignItems: 'center' }}>
        {_l('指定模型')}
        <Tooltip title={_l('仅下方模型进入本规则授权范围')} placement="top">
          <Icon icon="help" className="Font14 mLeft4 textSecondary" />
        </Tooltip>
      </span>
    ),
  },
];

const APP_SCOPE_OPTIONS = [
  {
    value: 'all',
    text: (
      <span style={{ display: 'inline-flex', alignItems: 'center' }}>
        {_l('全部应用')}
        <Tooltip title={_l('包含当前所有及未来新增应用')} placement="top">
          <Icon icon="help" className="Font14 mLeft4 textSecondary" />
        </Tooltip>
      </span>
    ),
  },
  {
    value: 'specific',
    text: (
      <span style={{ display: 'inline-flex', alignItems: 'center' }}>
        {_l('指定应用')}
        <Tooltip title={_l('仅下方应用可使用本规则模型；多规则命中时取并集。')} placement="top">
          <Icon icon="help" className="Font14 mLeft4 textSecondary" />
        </Tooltip>
      </span>
    ),
  },
];

const BRAND_ICONS = {
  1: { icon: 'icon-chatgpt', color: '#000' },
  2: { icon: 'icon-Qwen', color: '#615ced' },
  3: { icon: 'icon-deepseek', color: '#4d6bfe' },
  100: { icon: 'icon-construction', color: '#2196f3' },
};

function formatModel(model) {
  return {
    ...model,
    modelId: model.modelId || model.id,
    modelName: model.modelName || model.alias || model.name,
  };
}

function formatApp(app) {
  return {
    ...app,
    iconUrl: app.iconUrl || app.icon,
    createAccountInfo: app.createAccountInfo || {},
  };
}

function renderBrandIcon(item) {
  if (item.developerType === 100 && item.developerIcon) {
    return <img src={item.developerIcon} style={{ width: 18, height: 18, borderRadius: '50%' }} />;
  }

  const cfg = BRAND_ICONS[item.developerType] || BRAND_ICONS[100];
  return <i className={`Font18 ${cfg.icon}`} style={{ color: cfg.color }} />;
}

function getRuleSnapshot(data) {
  const { name, modelScope, models = [], appScope, apps = [] } = data;

  return {
    name: _.trim(name),
    modelScope,
    modelIds: modelScope === 'all' ? [] : _.sortBy(models.map(m => m.modelId || m.id)),
    appScope,
    appIds: appScope === 'all' ? [] : _.sortBy(apps.map(a => a.appId)),
  };
}

export default function EditRuleDrawer(props) {
  const { visible, actionType, actionRecord = {}, projectId, onClose, onSave } = props;
  const isEdit = actionType === 'edit';

  const [state, setState] = useSetState({
    name: '',
    modelScope: 'all', // 'all' | 'specific'
    models: [], // [{ modelId, modelName, developerId, developerName, developerType, developerIcon }]
    appScope: 'all', // 'all' | 'specific'
    apps: [], // [{ appId, appName, iconUrl, iconColor, ctime, createAccountInfo }]
    initialRuleSnapshot: null,
    detailLoading: false,
    saveLoading: false,
  });

  const { name, modelScope, models, appScope, apps, initialRuleSnapshot, detailLoading, saveLoading } = state;

  useEffect(() => {
    if (!visible) {
      return;
    }

    if (!isEdit) {
      setState({
        name: '',
        modelScope: 'all',
        models: [],
        appScope: 'all',
        apps: [],
        initialRuleSnapshot: null,
        detailLoading: false,
      });
      return;
    }

    let ignore = false;
    setState({ detailLoading: true, initialRuleSnapshot: null });
    aiModelAuthAjax
      .getAIModelAuthRule({ projectId, ruleId: actionRecord.id })
      .then(res => {
        if (ignore) return;
        const ruleData = {
          name: res?.name || '',
          modelScope: res?.allModels ? 'all' : 'specific',
          models: (res?.models || []).map(formatModel),
          appScope: res?.allApps ? 'all' : 'specific',
          apps: (res?.apps || []).map(formatApp),
        };

        setState({
          ...ruleData,
          initialRuleSnapshot: getRuleSnapshot(ruleData),
          detailLoading: false,
        });
      })
      .catch(() => {
        if (!ignore) setState({ detailLoading: false });
      });

    return () => {
      ignore = true;
    };
  }, [visible, actionType, actionRecord.id]);

  const handleAddModel = () => {
    selectAIModelDialog({
      isMultiple: true,
      selectedModels: models,
      onOk: selected => {
        setState({ models: selected });
      },
    });
  };

  const handleRemoveModel = modelId => {
    setState({ models: models.filter(m => m.modelId !== modelId) });
  };

  const handleAddApp = () => {
    dialogSelectApp({
      projectId,
      title: _l('添加应用'),
      filterFun: app => !apps.find(a => a.appId === app.appId),
      onOk: selected => {
        setState({ apps: apps.concat(selected) });
      },
    });
  };

  const handleRemoveApp = appId => {
    setState({ apps: apps.filter(a => a.appId !== appId) });
  };

  const handleSave = () => {
    if (!_.trim(name)) {
      alert(_l('规则名称不能为空'), 2);
      return;
    }

    if (modelScope === 'specific' && !models.length) {
      alert(_l('请至少添加一个模型'), 2);
      return;
    }

    if (appScope === 'specific' && !apps.length) {
      alert(_l('请至少添加一个应用'), 2);
      return;
    }

    setState({ saveLoading: true });
    onSave({ name: _.trim(name), modelScope, models, appScope, apps }, () => setState({ saveLoading: false }));
  };

  const title = isEdit ? _l('编辑规则') : _l('新建规则');
  const isChanged = initialRuleSnapshot
    ? !_.isEqual(getRuleSnapshot({ name, modelScope, models, appScope, apps }), initialRuleSnapshot)
    : false;
  const saveDisabled = saveLoading || detailLoading || (isEdit && !isChanged);

  return (
    <DrawerWrap
      title={title}
      width={660}
      visible={visible}
      onClose={onClose}
      destroyOnClose
      footer={
        <div className="flexRow">
          <Button type="primary" disabled={saveDisabled} onClick={handleSave}>
            {saveLoading ? _l('保存中...') : _l('保存')}
          </Button>
          <Button type="link" onClick={onClose}>
            {_l('取消')}
          </Button>
        </div>
      }
    >
      {detailLoading ? (
        <LoadDiv className="mTop40" />
      ) : (
        <Fragment>
          {/* 名称 */}
          <div className="mBottom24">
            <SectionTitle className="mBottom12">{_l('名称')}</SectionTitle>
            <Input
              value={name}
              className="w100"
              placeholder={_l('请输入规则名称')}
              onChange={val => setState({ name: val })}
            />
          </div>

          {/* 可用模型范围 */}
          <div className="mBottom24">
            <SectionTitle className="mBottom5">{_l('可用模型范围')}</SectionTitle>
            <div className="mBottom12">{_l('指的是本规则授权哪些模型；未被任何生效规则授权的模型不可用。')}</div>
            <RadioGroup
              size="middle"
              checkedValue={modelScope}
              data={MODEL_SCOPE_OPTIONS}
              onChange={val => setState({ modelScope: val })}
              disableTitle
            />
            {modelScope === 'specific' && (
              <div className="mTop12">
                <span className="colorPrimary Hand Font13" onClick={handleAddModel}>
                  <Icon icon="add" className="Font14 mRight3 TxtMiddle" />
                  <span className="TxtMiddle">{_l('添加模型')}</span>
                </span>
                <ModelTable>
                  <div className="tableHeader">
                    <div className="colName">{_l('模型名称')}</div>
                    <div className="colBrand">{_l('模型品牌')}</div>
                    <div className="colAction" />
                  </div>
                  {models.length === 0 ? (
                    <div className="emptyTip">{_l('请添加模型')}</div>
                  ) : (
                    models.map(m => (
                      <div key={m.modelId} className="tableRow">
                        <div className="colName ellipsis">{m.modelName}</div>
                        <div className="colBrand">
                          {renderBrandIcon(m)}
                          <span className="ellipsis">{m.developerName}</span>
                        </div>
                        <div className="colAction">
                          <span className="Red Hand Font13" onClick={() => handleRemoveModel(m.modelId)}>
                            {_l('移除')}
                          </span>
                        </div>
                      </div>
                    ))
                  )}
                </ModelTable>
              </div>
            )}
          </div>

          {/* 适用应用范围 */}
          <div className="mBottom24">
            <SectionTitle className="mBottom5">{_l('适用应用范围')}</SectionTitle>
            <div className="mBottom12">
              {_l('指的是哪些应用可使用本规则内的模型；未被任何生效规则授权的应用不可使用 AI 模型。')}
            </div>
            <RadioGroup
              size="middle"
              checkedValue={appScope}
              data={APP_SCOPE_OPTIONS}
              onChange={val => setState({ appScope: val })}
              disableTitle
            />
            {appScope === 'specific' && (
              <div className="mTop12">
                <div className="textSecondary Font13 mBottom10">
                  {_l('仅下方添加的应用可使用该规则分配的模型，其它应用则禁用')}
                </div>
                <span className="colorPrimary Hand Font13" onClick={handleAddApp}>
                  <Icon icon="add" className="Font14 mRight3 TxtMiddle" />
                  <span className="TxtMiddle">{_l('添加应用')}</span>
                </span>
                <AppTable>
                  <div className="tableHeader">
                    <div className="colName">{_l('应用名称')}</div>
                    <div className="colTime">{_l('创建时间')}</div>
                    <div className="colOwner">{_l('拥有者')}</div>
                    <div className="colAction" />
                  </div>
                  {apps.length === 0 ? (
                    <div className="emptyTip">{_l('请添加应用')}</div>
                  ) : (
                    apps.map(app => (
                      <div key={app.appId} className="tableRow">
                        <div className="colName">
                          <div className="appIcon" style={{ background: app.iconColor }}>
                            <SvgIcon url={app.iconUrl} fill="#fff" size={20} />
                          </div>
                          <span className="ellipsis">{app.appName}</span>
                        </div>
                        <div className="colTime">{app.ctime}</div>
                        <div className="colOwner">
                          <UserHead
                            user={{
                              userHead: app.createAccountInfo?.avatar,
                              accountId: app.createAccountInfo?.accountId,
                            }}
                            size={24}
                          />
                          <span className="ellipsis">
                            {app.createAccountInfo?.fullName || app.createAccountInfo?.fullname}
                          </span>
                        </div>
                        <div className="colAction">
                          <span className="Red Hand Font13" onClick={() => handleRemoveApp(app.appId)}>
                            {_l('移除')}
                          </span>
                        </div>
                      </div>
                    ))
                  )}
                </AppTable>
              </div>
            )}
          </div>
        </Fragment>
      )}
    </DrawerWrap>
  );
}
