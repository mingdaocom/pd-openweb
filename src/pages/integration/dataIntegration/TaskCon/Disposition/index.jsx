import React, { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';
import { LoadDiv, Checkbox, Dropdown } from 'ming-ui';
import { useSetState } from 'react-use';
import dialogSelectUser from 'src/components/dialogSelectUser/dialogSelectUser';
import { NODE_TYPE, USER_TYPE } from 'src/pages/workflow/WorkflowSettings/enum.js';
import Member from 'src/pages/workflow/WorkflowSettings/Detail/components/Member/index.jsx';
import _ from 'lodash';
import TaskFlow from 'src/pages/integration/api/taskFlow.js';
import Account from 'src/pages/integration/api/account';
import cx from 'classnames';
import { DATABASE_TYPE } from 'src/pages/integration/dataIntegration/constant.js';
// const TRIGGER_TYPE = {
//   ALLOW: 0,
//   ONLY_WORKFLOW: 1,
//   NO_ALLOW: 2,
// };
const Wrap = styled.div`
  flex: 1;
  overflow: auto;
`;
const Con = styled.div`
  width: 880px;
  margin: 22px auto;
  background: #ffffff;
  padding: 32px 24px;
  // border: 1px solid #dddddd;
  border-radius: 4px;
  .saveBtn {
    background: #2196f3;
    color: #fff;
    height: 36px;
    line-height: 36px;
    border: 1px solid #2196f3;
    border-radius: 3px;
    padding: 0 36px;
  }
`;
const WrapCon = styled.div`
  .conCheckbox {
    .ming.Checkbox {
      display: inline-block;
      margin-right: 32px;
    }
  }
  .owerItem {
    border-radius: 26px;
    background: #f5f5f5;
    height: 26px;
    line-height: 26px;
    display: inline-block;
    position: relative;
    margin-bottom: 4px;
    margin-right: 6px;
    img {
      width: 26px;
      height: 26px;
      background: #ffffff;
      border-radius: 50%;
      overflow: hidden;
    }
    .tagDel {
      display: none;
      right: -5px;
      top: -5px;
      position: absolute;
    }
    &:hover {
      .tagDel {
        display: block;
        color: #757575;
        cursor: pointer;
        &:hover {
          color: red;
        }
      }
    }
  }
  .addApp {
    color: #2196f3;
    &:hover {
      color: #1764c0;
    }
  }
  .ant-table-thead > tr > th {
    color: #757575 !important;
  }
  .iconWrap {
    border-radius: 3px;
    width: 36px;
    height: 36px;
  }
  .ant-table.ant-table-small .ant-table-title,
  .ant-table.ant-table-small .ant-table-footer,
  .ant-table.ant-table-small .ant-table-thead > tr > th,
  .ant-table.ant-table-small .ant-table-tbody > tr > td,
  .ant-table.ant-table-small tfoot > tr > th,
  .ant-table.ant-table-small tfoot > tr > td {
    padding: 15px 8px;
    align-items: center;
    display: flex;
  }
  tr {
    display: flex;
  }
  td,
  th {
    flex: 3;
    &:last-child {
      flex: 1;
    }
  }
  .flowDetailMembers {
    display: inline-block;
  }
  .startConditionWrap {
    position: absolute;
    right: initial;
    width: 200px;
    left: 0;
    z-index: 100;
    padding-bottom: 24px;
    top: 26px;
  }
  ul.flowDetailUserList {
    text-align: left;
    i {
      font-size: 18px;
      display: inline-block;
      vertical-align: top;
      margin-top: 9px;
      margin-right: 5px;
      color: #9e9e9e;
    }
    li {
      &:hover {
        i {
          color: #fff !important;
        }
      }
    }
  }
  .ownerInfo img {
    border-radius: 50%;
  }
  .timeDrop {
    width: 85px;
  }
  .logo {
    border-radius: 7px;
    & > div {
      margin: 0 auto;
    }
  }
  .boderRadAll_7 {
    border-radius: 7px !important;
  }
  .disable {
    background: #bdbdbd;
    border: 1px solid #bdbdbd;
    cursor: not-allowed;
  }
`;
//配置
function Disposition(props) {
  const [{ loading, flowId, flowData, ownerInfoList, flowConfigClone, cloneFlowData }, setState] = useSetState({
    loading: false,
    flowId: props.flowId,
    flowData: props.flowData || {},
    ownerInfoList: [],
    flowConfigClone: (props.flowData || {}).workflowConfig,
    cloneFlowData: {
      workflowConfig: _.get(props.flowData || {}, 'workflowConfig'),
      ownerList: _.get(props.flowData || {}, 'ownerList'),
    },
  });

  const { flowNodes } = flowData;
  const destData = _.values(flowNodes).find(o => _.get(o, 'nodeType') === 'DEST_TABLE') || {};
  const showFlowSet = _.get(destData, 'nodeConfig.config.dsType') === DATABASE_TYPE.APPLICATION_WORKSHEET;
  const saveProcessConfigInfo = () => {
    const { currentProjectId: projectId } = props;
    const data = {
      insertTrigger: !!_.get(flowData, 'workflowConfig.insertTrigger'),
      updateTrigger: !!_.get(flowData, 'workflowConfig.updateTrigger'),
      deleteTrigger: !!_.get(flowData, 'workflowConfig.deleteTrigger'),
    };
    TaskFlow.saveConfig({
      flowId,
      projectId,
      accountIds: !_.get(flowData, 'ownerList') ? [] : _.get(flowData, 'ownerList'),
      ...data,
    }).then(res => {
      if (res) {
        props.onUpdate(flowData, !_.isEqual(flowConfigClone, data));
        setState({
          flowConfigClone: data,
          cloneFlowData: {
            workflowConfig: data,
            ownerList: !_.get(flowData, 'ownerList') ? [] : _.get(flowData, 'ownerList'),
          },
        });
        alert(_l('保存成功！'));
      } else {
        alert(_l('保存失败，请稍后再试'), 2);
      }
    });
  };

  useEffect(() => {
    getAccountInfos(_.get(flowData, 'ownerList'));
  }, [_.get(flowData, 'ownerList')]);

  const getAccountInfos = accountIds => {
    const { currentProjectId: projectId } = props;
    Account.getAccounts({
      accountIds,
      projectId,
    }).then(res => {
      setState({
        ownerInfoList: res.map(item => {
          return {
            type: USER_TYPE.USER,
            roleId: item.accountId,
            roleName: item.fullname,
            avatar: item.avatarUrl,
          };
        }),
      });
    });
  };

  // const dateArr = [
  //   { text: _l('始终通知'), value: 0 },
  //   { text: _l('15分钟'), value: 15 },
  //   { text: _l('1小时'), value: 60 },
  //   { text: _l('2小时'), value: 120 },
  //   { text: _l('6小时'), value: 360 },
  //   { text: _l('12小时'), value: 720 },
  //   { text: _l('24小时'), value: 1440 },
  // ];

  const updateSource = data => {
    setState({ flowData: { ...flowData, ...data } });
  };
  /**
   * 添加普通成员
   */
  const addMembers = evt => {
    evt.stopPropagation();

    dialogSelectUser({
      title: _l('选择人员'),
      showMoreInvite: false,
      SelectUserSettings: {
        filterAccountIds: !_.get(flowData, 'ownerList') ? [] : _.get(flowData, 'ownerList'),
        projectId: props.currentProjectId,
        filterOtherProject: true, //目前只能选当前网络下的成员
        dataRange: 2,
        unique: false,
        callback: users => {
          let members = [];
          users.map(item => {
            members.push(item.accountId);
          });
          updateSource({
            ownerList: (!_.get(flowData, 'ownerList') ? [] : _.get(flowData, 'ownerList')).concat(members),
          });
        },
      },
    });
  };
  if (loading) {
    return <LoadDiv />;
  }
  return (
    <Wrap className="">
      <Con>
        <WrapCon>
          {/* 只能选择组织下的内部成员；
拥有者可以编辑该连接；
发送失败消息通知和N小时内不发送同类错误通知与现有工作流配置相同； */}
          <div className="title Bold Font16">{_l('拥有者')}</div>
          <div className="owerCon mTop6">
            <Member
              type={NODE_TYPE.MESSAGE}
              accounts={ownerInfoList}
              updateSource={({ accounts }) => {
                let members = [];
                accounts.map(item => {
                  members.push(item.roleId);
                });
                updateSource({ ownerList: members });
              }}
              leastOne
              inline
            />
            <br />
            <span
              className="Relative Gray_9e pointer addBtn mTop12 ThemeHoverColor3 InlineBlock"
              onClick={e => {
                addMembers(e);
              }}
            >
              <i className="Font28 icon-task-add-member-circle mRight10" />
              <span className="LineHeight28 InlineBlock TxtTop">{_l('添加拥有者')}</span>
            </span>
          </div>
          {/* <div className="title Bold Font15 mTop24">{_l('错误通知')}</div>
        <div className="topSet flexRow mTop15 LineHeight36">
          <Checkbox
            size="small"
            text={_l('同步任务发生错误时发送错误消息通知给拥有者')}
            checked={info.triggerType === TRIGGER_TYPE.ALLOW}
            onClick={() => {
              //   updateSource({
              //     triggerType: info.triggerType === TRIGGER_TYPE.ALLOW ? TRIGGER_TYPE.NO_ALLOW : TRIGGER_TYPE.ALLOW,
              //   });
            }}
          />
          <Dropdown
            className="timeDrop mLeft20"
            menuStyle={{ width: '100%' }}
            data={dateArr}
            value={info.errorInterval}
            border
            onChange={errorInterval => updateSource({ errorInterval: errorInterval })}
          />
          <span className="mLeft16">{_l('内不发送同类错误通知')}</span>
        </div> */}

          {showFlowSet && (
            <React.Fragment>
              <div className="title Bold Font16 mTop24">{_l('触发工作流')}</div>
              <div className="des Gray_9e mTop10">{_l('同步数据时，是否触发工作表绑定的自动化工作流')}</div>
              <div className="mTop16 conCheckbox">
                <Checkbox
                  size="small"
                  text={_l('新增记录时触发')}
                  className={'flex'}
                  checked={_.get(flowData, 'workflowConfig.insertTrigger')}
                  onClick={() => {
                    updateSource({
                      workflowConfig: {
                        ..._.get(flowData, 'workflowConfig'),
                        insertTrigger: !_.get(flowData, 'workflowConfig.insertTrigger'),
                      },
                    });
                  }}
                />
                <Checkbox
                  className={'flex'}
                  size="small"
                  text={_l('更新记录时触发')}
                  checked={_.get(flowData, 'workflowConfig.updateTrigger')}
                  onClick={() => {
                    updateSource({
                      workflowConfig: {
                        ..._.get(flowData, 'workflowConfig'),
                        updateTrigger: !_.get(flowData, 'workflowConfig.updateTrigger'),
                      },
                    });
                  }}
                />
                <Checkbox
                  className={'flex'}
                  size="small"
                  text={_l('删除记录时触发')}
                  checked={_.get(flowData, 'workflowConfig.deleteTrigger')}
                  onClick={() => {
                    updateSource({
                      workflowConfig: {
                        ..._.get(flowData, 'workflowConfig'),
                        deleteTrigger: !_.get(flowData, 'workflowConfig.deleteTrigger'),
                      },
                    });
                  }}
                />
              </div>
            </React.Fragment>
          )}
          <div className="TxtCenter mTop50">
            <span
              className={cx('btnCon Hand InlineBlock saveBtn', {
                disable: _.isEqual(cloneFlowData, {
                  workflowConfig: _.get(flowData || {}, 'workflowConfig'),
                  ownerList: _.get(flowData || {}, 'ownerList'),
                }),
              })}
              onClick={() => {
                if (
                  _.isEqual(cloneFlowData, {
                    workflowConfig: _.get(flowData || {}, 'workflowConfig'),
                    ownerList: _.get(flowData || {}, 'ownerList'),
                  })
                ) {
                  return;
                }
                saveProcessConfigInfo();
              }}
            >
              {_l('保存')}
            </span>
          </div>
        </WrapCon>
      </Con>
    </Wrap>
  );
}

export default Disposition;
