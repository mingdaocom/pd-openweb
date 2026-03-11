import React, { useEffect, useMemo } from 'react';
import { useSetState } from 'react-use';
import _ from 'lodash';
import Trigger from 'rc-trigger';
import styled from 'styled-components';
import { Button, Dialog, Icon, Menu, MenuItem, Switch } from 'ming-ui';
import dataLimitAjax from 'src/api/dataLimit';
import PageTableCon from 'src/pages/Admin/components/PageTableCon';
import Search from 'src/pages/workflow/components/Search';
import { ACCESS_CONDITION_ENUM, ADVANCED_SETTING_ENUM, DEVICE_ENUM, POLICY_ACTION_ENUM, YES_NO_ENUM } from '../enum';
import { arrayToObject, objectToArray } from '../utils';
import AddAndEditAppAccess from './AddAndEditAppAccess';

const Description = styled.div`
  background: rgba(33, 150, 243, 0.1);
  border-radius: 4px;
  padding: 10px 12px;
  margin-bottom: 20px;
`;

const ContentWrap = styled.div`
  flex: 1;
  min-height: 0;
`;

export default function AppAccess(props) {
  const { projectId, onClose = () => {} } = props;
  const [state, setState] = useSetState({
    loading: false,
    keyword: '',
    list: [],
    showAddEditDialog: false,
    actionRecord: {},
    saveLoading: false,
  });
  const { loading, keyword, list, actionId, actionType, showAddEditDialog, actionRecord, saveLoading } = state;

  const columns = useMemo(() => {
    return [
      {
        dataIndex: 'name',
        title: _l('名称'),
        ellipsis: true,
        width: 200,
      },
      {
        dataIndex: 'condition',
        title: _l('条件'),
        width: 300,
        render: (text, record) => {
          const { accessType, accessPass, ipRule, hearderRule, addressRule, clientRule } = record;
          return (
            <div className="w100 ellipsis">
              <span>{_.find(ACCESS_CONDITION_ENUM, { value: accessType })?.text}</span>
              <span className="mLeft3 mRight3">{_.find(YES_NO_ENUM, { value: accessPass ? 1 : 0 })?.text}</span>
              <span>
                {accessType === 0
                  ? ipRule.join(',')
                  : accessType === 1
                    ? hearderRule.map(item => `${item.key}:${item.value}`).join(',')
                    : accessType === 2
                      ? addressRule.join(',')
                      : DEVICE_ENUM.filter(v => _.includes(clientRule, v.value))
                          .map(v => v.label)
                          .join('、')}
              </span>
            </div>
          );
        },
      },
      {
        dataIndex: 'limitAction',
        title: _l('动作'),
        width: 120,
        render: (text, record) => {
          return _.find(POLICY_ACTION_ENUM, { value: record.limitAction })?.text;
        },
      },
      {
        dataIndex: 'extraSetting',
        title: _l('黑/白名单'),
        width: 130,
        render: (text, record) => {
          const { limitAction, whiteApps = [], blackApps = [] } = record;
          return (
            <div className="w100 ellipsis">
              {whiteApps.length || blackApps.length
                ? limitAction === 1
                  ? _l('白名单:%0个应用', whiteApps.length)
                  : _l('黑名单:%0个应用', blackApps.length)
                : ''}
            </div>
          );
        },
      },
      {
        dataIndex: 'advancedSetting',
        title: _l('高级配置'),
        width: 220,
        render: (text, record) => {
          return (
            <div className="w100 ellipsis">
              {ADVANCED_SETTING_ENUM.filter(item => record[item.value])
                .map(v => v.text)
                .join('、')}
            </div>
          );
        },
      },
      {
        dataIndex: 'status',
        title: _l('状态'),
        width: 80,
        fixed: 'right',
        render: (text, record) => {
          return (
            <Switch
              checked={record.isEnable}
              onClick={() =>
                updateAppLimit(
                  {
                    id: record.id,
                    isEnable: !record.isEnable,
                    name: record.name,
                    accessType: record.accessType,
                    accessPass: record.accessPass,
                    limitAction: record.limitAction,
                    whiteApps: (record.whiteApps || []).map(({ appId }) => ({ appId })),
                    blackApps: (record.blackApps || []).map(({ appId }) => ({ appId })),
                    isAllowPublicAccess: record.isAllowPublicAccess,
                    isAllowCrossApp: record.isAllowCrossApp,
                    ipRule: record.ipRule,
                    hearderRule: arrayToObject(record.hearderRule),
                    addressRule: record.addressRule,
                    clientRule: record.clientRule,
                  },
                  () => {
                    const tempList = _.cloneDeep(list);
                    const index = _.findIndex(tempList, item => item.id === record.id);
                    tempList[index].isEnable = !record.isEnable;
                    setState({ list: tempList });
                    alert(!record.isEnable ? _l('开启成功') : _l('关闭成功'));
                  },
                  () => {
                    alert(!record.isEnable ? _l('开启失败') : _l('关闭失败'), 2);
                  },
                )
              }
            />
          );
        },
      },
      {
        dataIndex: 'action',
        title: '',
        width: 50,
        fixed: 'right',
        render: (text, record) => {
          return (
            <Trigger
              action={['click']}
              popupVisible={actionId === record.limitId}
              onPopupVisibleChange={visible => setState({ actionId: visible ? record.limitId : false })}
              popupAlign={{
                points: ['tl', 'bl'],
                offset: [-110, 2],
                overflow: { adjustX: true, adjustY: true },
              }}
              popup={
                <Menu className="Static" style={{ width: 118 }}>
                  <MenuItem
                    onClick={() =>
                      setState({ showAddEditDialog: true, actionType: 'edit', actionId: false, actionRecord: record })
                    }
                  >
                    {_l('编辑')}
                  </MenuItem>
                  <MenuItem onClick={() => handleDelete(record)}>{_l('删除')}</MenuItem>
                </Menu>
              }
            >
              <Icon
                icon="moreop"
                className="textTertiary Hand Font18 hoverTextPrimaryLight"
                onClick={() => setState({ actionId: record.limitId })}
              />
            </Trigger>
          );
        },
      },
    ];
  }, [actionId, list]);

  const getData = (params = {}) => {
    setState({ loading: true });
    dataLimitAjax
      .getAppLimitList({
        projectId,
        limitName: _.isUndefined(params.limitName) ? keyword : params.limitName,
      })
      .then(res => {
        if (res) {
          setState({
            list: res.map(item => ({
              ...item,
              limitId: item.id,
              hearderRule: objectToArray(item.hearderRule),
              appList: (item.limitAction === 1 ? item.whiteApps : item.blackApps).map(({ appId }) => ({ appId })),
            })),
            loading: false,
          });
        }
      });
  };

  const updateAppLimit = (params, updateSuccess = () => {}, fail) => {
    if (saveLoading) {
      return;
    }

    setState({ saveLoading: true });

    dataLimitAjax
      .updateAppLimit({
        projectId,
        ...params,
      })
      .then(res => {
        if (res) {
          _.isFunction(updateSuccess) ? updateSuccess() : alert(_l('保存成功'));
          setState({ showAddEditDialog: false, actionRecord: {}, saveLoading: false });
        } else {
          _.isFunction(fail) ? fail() : alert(_l('保存失败'), 2);
          setState({ saveLoading: false });
        }
      })
      .catch(() => {
        setState({ saveLoading: false });
        _.isFunction(fail) && fail();
      });
  };

  const handleDelete = record => {
    setState({ actionId: false });
    Dialog.confirm({
      title: _l('确认删除策略“%0”', record.name),
      children: <div>{_l('删除后无法恢复，请谨慎操作')}</div>,
      okText: _l('删除'),
      buttonType: 'danger',
      onOk: () => {
        dataLimitAjax
          .deleteAppLimit({ projectId, limitId: record.limitId })
          .then(res => {
            if (res) {
              setState({ list: list.filter(item => item.limitId !== record.limitId) });
              alert(_l('删除成功'));
            } else {
              alert(_l('删除失败'), 2);
            }
          })
          .catch(() => {
            alert(_l('删除失败'), 2);
          });
      },
    });
  };

  const addPolicy = () => {
    if (list.length >= 10) {
      alert(_l('最多创建10个策略'), 2);
      return;
    }
    setState({ showAddEditDialog: true, actionType: 'add' });
  };

  useEffect(() => {
    getData();
  }, []);

  return (
    <div className="orgManagementWrap">
      <div className="orgManagementHeader">
        <div className="flexRow alignItemsCenter">
          <Icon icon="backspace" className="Font22 ThemeHoverColor3 pointer" onClick={onClose} />
          <div className="Font17 bold flex mLeft10">{_l('应用访问')}</div>
        </div>
      </div>
      <div className="orgManagementContent pTop16 flexColumn">
        <Description>
          <span className="bold">{_l('组织默认策略：允许访问应用')}</span>
          <span className="textSecondary mLeft3">
            {_l('当成员未命中其他策略时将正常访问其有权限的全部应用。建议创建禁止访问应用的策略，限制特定访问场景')}
          </span>
        </Description>
        <div className="flexRow">
          <Search
            placeholder={_l('策略名称')}
            handleChange={_.debounce(keyword => {
              setState({ keyword });
              getData({ limitName: keyword });
            }, 500)}
          />
          <div className="flex"></div>
          <Button className="pLeft16 pRight16" onClick={addPolicy}>
            <Icon icon="add" className="Font18 mRight3 TxtMiddle" />
            <span className="TxtMiddle">{_l('策略')}</span>
          </Button>
        </div>

        <ContentWrap>
          <PageTableCon loading={loading} columns={columns} dataSource={list} />
        </ContentWrap>
      </div>

      {showAddEditDialog && (
        <AddAndEditAppAccess
          actionType={actionType}
          actionRecord={actionRecord}
          projectId={projectId}
          visible={showAddEditDialog}
          onClose={() => setState({ showAddEditDialog: false, actionRecord: {} })}
          updateAppLimit={updateAppLimit}
          getData={getData}
        />
      )}
    </div>
  );
}
