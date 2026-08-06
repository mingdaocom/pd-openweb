import React, { Fragment, useEffect, useMemo } from 'react';
import { useSetState } from 'react-use';
import _ from 'lodash';
import styled from 'styled-components';
import { Button, Dialog, Icon, Switch } from 'ming-ui';
import aiModelAuthAjax from 'src/api/dataLimit.js';
import PageTableCon from 'src/pages/Admin/components/PageTableCon';
import Search from 'src/pages/workflow/components/Search';
import EditRuleDrawer from './EditRuleDrawer';

const Description = styled.div`
  background: rgba(33, 150, 243, 0.1);
  border-radius: 4px;
  padding: 12px 16px;
  margin-bottom: 20px;
  font-size: 13px;
  .statusTitle {
    font-weight: 600;
    font-size: 14px;
    margin-bottom: 6px;
  }
  .tipItem {
    color: var(--color-text-secondary);
    line-height: 22px;
  }
`;

const ContentWrap = styled.div`
  flex: 1;
  min-height: 0;
`;

export default function AIModelRule(props) {
  const {
    projectId,
    onClose = () => {},
    aiModelRuleList = [],
    aiModelRuleListLoaded = false,
    aiModelRuleListLoading = false,
    loadAIModelRuleList = () => Promise.resolve([]),
    updateAIModelRuleList = () => {},
  } = props;

  const [state, setState] = useSetState({
    loading: !aiModelRuleListLoaded && aiModelRuleListLoading,
    keyword: '',
    list: aiModelRuleList,
    showDrawer: false,
    actionType: 'add',
    actionRecord: {},
  });

  const { loading, keyword, list, showDrawer, actionType, actionRecord } = state;

  const getData = (params = {}) => {
    const ruleName = _.isUndefined(params.ruleName) ? keyword : params.ruleName;

    setState({ loading: true });

    const request = ruleName
      ? aiModelAuthAjax.getAIModelAuthRuleList({ projectId, ruleName })
      : loadAIModelRuleList({ force: params.force });

    return request
      .then(res => {
        const nextList = res || [];

        setState({ list: nextList, loading: false });
        return nextList;
      })
      .catch(() => {
        setState({ loading: false });
        return [];
      });
  };

  useEffect(() => {
    if (aiModelRuleListLoaded) return;

    getData();
  }, []);

  const updateDefaultList = nextList => {
    updateAIModelRuleList(nextList);
  };

  const refreshAfterSave = () => {
    if (keyword) {
      getData({ ruleName: keyword });
      loadAIModelRuleList({ force: true });
      return;
    }

    getData({ force: true }).then(updateDefaultList);
  };

  const handleSave = (data, onFinally) => {
    const isAllModels = data.modelScope === 'all';
    const isAllApps = data.appScope === 'all';
    const params = {
      projectId,
      name: data.name,
      allModels: isAllModels,
      modelIds: isAllModels ? [] : data.models.map(m => m.modelId || m.id),
      allApps: isAllApps,
      appIds: isAllApps ? [] : data.apps.map(a => a.appId),
      ...(actionType === 'edit' ? { id: actionRecord.id } : {}),
    };
    const request = actionType === 'edit' ? aiModelAuthAjax.updateAIModelAuthRule : aiModelAuthAjax.addAIModelAuthRule;

    request(params)
      .then(res => {
        if (res) {
          alert(_l('保存成功'));
          setState({ showDrawer: false, actionRecord: {} });
          refreshAfterSave();
        } else {
          alert(_l('保存失败'), 2);
        }
      })
      .finally(() => onFinally && onFinally());
  };

  const handleDelete = record => {
    Dialog.confirm({
      title: <div className="ellipsis">{_l('确认删除规则"%0"', record.name)}</div>,
      children: <div>{_l('删除后无法恢复，请谨慎操作')}</div>,
      okText: _l('删除'),
      buttonType: 'danger',
      onOk: () => {
        aiModelAuthAjax
          .deleteAIModelAuthRule({ projectId, ruleId: record.id })
          .then(res => {
            if (res) {
              const nextList = list.filter(r => r.id !== record.id);

              setState({ list: nextList });
              updateDefaultList(aiModelRuleList.filter(r => r.id !== record.id));
              alert(_l('删除成功'));
            } else {
              alert(_l('删除失败'), 2);
            }
          })
          .catch(() => alert(_l('删除失败'), 2));
      },
    });
  };

  const handleToggleStatus = record => {
    const isEnable = !record.isEnable;
    aiModelAuthAjax
      .editAIModelAuthRuleStatus({ projectId, ruleId: record.id, isEnable })
      .then(res => {
        if (res) {
          const nextList = list.map(item => (item.id === record.id ? { ...item, isEnable } : item));
          const nextDefaultList = aiModelRuleList.map(item => (item.id === record.id ? { ...item, isEnable } : item));

          setState({ list: nextList });
          updateDefaultList(nextDefaultList);
          alert(isEnable ? _l('开启成功') : _l('关闭成功'));
        } else {
          alert(isEnable ? _l('开启失败') : _l('关闭失败'), 2);
        }
      })
      .catch(() => alert(isEnable ? _l('开启失败') : _l('关闭失败'), 2));
  };

  const columns = useMemo(
    () => [
      {
        dataIndex: 'name',
        title: _l('规则名称'),
        ellipsis: true,
      },
      // {
      //   dataIndex: 'modelCount',
      //   title: _l('模型'),
      //   width: 160,
      //   render: (text, record) => {
      //     return record.allModels ? _l('全部模型') : _l('%0 个模型', record.modelCount || 0);
      //   },
      // },
      // {
      //   dataIndex: 'appCount',
      //   title: _l('授权应用'),
      //   width: 160,
      //   render: (text, record) => {
      //     return record.allApps ? _l('全部应用') : _l('%0 个应用', record.appCount || 0);
      //   },
      // },
      {
        dataIndex: 'status',
        title: _l('状态'),
        width: 100,
        render: (text, record) => <Switch checked={record.isEnable} onClick={() => handleToggleStatus(record)} />,
      },
      {
        dataIndex: 'action',
        title: _l('操作'),
        width: 120,
        render: (text, record) => (
          <div className="flexRow" style={{ gap: 16 }}>
            <span
              className="colorPrimary Hand Font13"
              onClick={() => setState({ showDrawer: true, actionType: 'edit', actionRecord: record })}
            >
              {_l('编辑')}
            </span>
            <span className="Red Hand Font13" onClick={() => handleDelete(record)}>
              {_l('删除')}
            </span>
          </div>
        ),
      },
    ],
    [list],
  );

  const isCustomRule = (list || []).some(r => r.isEnable);
  const globalStatus = isCustomRule ? _l('按自定义规则控制') : _l('全部应用可用全部模型');

  return (
    <div className="orgManagementWrap">
      <div className="orgManagementHeader">
        <div className="flexRow alignItemsCenter">
          <Icon icon="backspace" className="Font22 hoverColorPrimary pointer" onClick={onClose} />
          <div className="Font17 bold flex mLeft10">{_l('AI模型')}</div>
        </div>
      </div>

      <div className="orgManagementContent pTop16 flexColumn">
        <Description>
          <div className="statusTitle">{_l('当前状态：%0', globalStatus)}</div>
          {isCustomRule ? (
            <Fragment>
              <div className="tipItem">
                {_l('1、仅启用规则内授权的「模型 × 应用」组合可用，不在规则内的应用不可使用AI 模型')}
              </div>
              <div className="tipItem">{_l('2、存在多条生效规则时，各规则的授权范围取并集生效')}</div>
            </Fragment>
          ) : (
            <Fragment>
              <div className="tipItem">{_l('1 、未创建规则或所有规则均已关闭时，默认全部模型的使用权限')}</div>
              <div className="tipItem">{_l('2 、创建并启用规则后，仅规则内授权的「模型 x 应用」组合可用')}</div>
            </Fragment>
          )}
        </Description>

        <div className="flexRow mBottom16">
          <Search
            placeholder={_l('规则名称')}
            handleChange={_.debounce(val => {
              setState({ keyword: val });
              getData({ ruleName: val });
            }, 500)}
          />
          <div className="flex" />
          <Button
            className="pLeft16 pRight16"
            onClick={() => setState({ showDrawer: true, actionType: 'add', actionRecord: {} })}
          >
            <Icon icon="add" className="Font18 mRight3 TxtMiddle" />
            <span className="TxtMiddle">{_l('规则')}</span>
          </Button>
        </div>

        <ContentWrap>
          <PageTableCon loading={loading} columns={columns} dataSource={list} tableSetting={{ rowKey: 'id' }} />
        </ContentWrap>
      </div>

      <EditRuleDrawer
        visible={showDrawer}
        actionType={actionType}
        actionRecord={actionRecord}
        projectId={projectId}
        onClose={() => setState({ showDrawer: false, actionRecord: {} })}
        onSave={handleSave}
      />
    </div>
  );
}
