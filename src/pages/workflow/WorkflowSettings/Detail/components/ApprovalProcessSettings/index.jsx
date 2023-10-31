import React, { Fragment, useState, useEffect } from 'react';
import { Checkbox, Icon, Dropdown } from 'ming-ui';
import UpdateFields from '../UpdateFields';
import ProcessDetails from '../ProcessDetails';
import OperatorEmpty from '../OperatorEmpty';
import cx from 'classnames';
import _ from 'lodash';
import styled from 'styled-components';
import { OPERATION_TYPE, USER_TYPE, NODE_TYPE } from '../../../enum';
import Member from '../Member';
import quickSelectUser from 'ming-ui/functions/quickSelectUser';
import { Tooltip } from 'antd';

const TABS_ITEM = styled.div`
  display: inline-flex;
  padding: 0 12px 12px 12px;
  margin-right: 36px;
  font-weight: bold;
  font-size: 15px;
  cursor: pointer;
  position: relative;
  &.active {
    &::before {
      position: absolute;
      bottom: -2px;
      left: 0;
      right: 0;
      content: '';
      height: 0;
      border-bottom: 3px solid #2196f3;
    }
  }
`;

export default props => {
  const { companyId, processId, data, updateSource, cacheKey } = props;
  const [tabIndex, setTabIndex] = useState(1);
  const [selected, setSelected] = useState(!!data.processConfig.requiredIds.length);
  const INITIATOR_TYPE = [
    { text: _l('自动进入下一个节点'), value: 4 },
    { text: _l('由流程拥有者代理'), value: 2 },
    { text: _l('由指定人员代理'), value: 5 },
    { text: _l('流程结束'), value: 3 },
  ];
  const TABS = [
    { text: _l('流程设置'), value: 1 },
    { text: _l('数据更新'), value: 2 },
  ];
  const AutoPass = [
    { text: _l('发起人无需审批自动通过'), key: 'startEventPass' },
    { text: _l('已审批过的审批人自动通过'), key: 'userTaskPass' },
  ];
  const initiator = data.processConfig.initiatorMaps ? parseInt(Object.keys(data.processConfig.initiatorMaps)[0]) : 0;
  const selectCharge = (event, callback) => {
    quickSelectUser(event.target, {
      offset: {
        top: 10,
        left: 0,
      },
      projectId: companyId,
      unique: true,
      filterAll: true,
      filterFriend: true,
      filterOthers: true,
      filterOtherProject: true,
      onSelect: users => {
        callback(
          users.map(item => {
            return {
              type: USER_TYPE.USER,
              entityId: '',
              entityName: '',
              roleId: item.accountId,
              roleName: item.fullname,
              avatar: item.avatar,
            };
          }),
        );
      },
    });
  };
  const list = data.processConfig.revokeFlowNodes
    .filter(item => item.typeId === NODE_TYPE.APPROVAL)
    .map(item => {
      return {
        text: item.name,
        value: item.id,
        disabled: _.includes(data.processConfig.requiredIds, item.id),
      };
    });

  useEffect(() => {
    setSelected(!!data.processConfig.requiredIds.length);
  }, [cacheKey]);

  return (
    <Fragment>
      <div className="Font13 mTop20 bold">
        {_l('发起人为空时')}
        <span
          className="workflowDetailTipsWidth mLeft5 tip-bottom-right"
          data-tip={_l(
            '设置发起人为空时的处理方式。当设为自动进行下一节点时，如果退回到流程发起节点，也会自动由下一个节点进行处理',
          )}
        >
          <Icon className="Font16 Gray_9e" icon="info" />
        </span>
      </div>
      <Dropdown
        className="flowDropdown mTop10"
        data={INITIATOR_TYPE}
        value={initiator || undefined}
        border
        placeholder={_l('流程结束')}
        onChange={initiator =>
          updateSource({
            processConfig: Object.assign({}, data.processConfig, { initiatorMaps: { [initiator]: [] } }),
          })
        }
      />

      {initiator === 2 && !data.processConfig.agents.length && (
        <div className="Gray_75 mTop5">{_l('当前流程还没有流程拥有者，请在 流程发起节点 中配置')}</div>
      )}

      {initiator === 5 && (
        <div className="flexRow alignItemsCenter">
          <div className="mRight10 mTop12">{_l('代理人')}</div>
          <Member leastOne accounts={data.processConfig.initiatorMaps[initiator]} />
          <div
            className={cx('Gray_c ThemeHoverColor3 mTop12 pointer', {
              mLeft8: data.processConfig.initiatorMaps[initiator].length,
            })}
            style={{ height: 28 }}
            onClick={event =>
              selectCharge(event, accounts => {
                updateSource({
                  processConfig: Object.assign({}, data.processConfig, {
                    initiatorMaps: {
                      [initiator]: accounts,
                    },
                  }),
                });
              })
            }
          >
            <i
              className={cx(
                'Font28',
                data.processConfig.initiatorMaps[initiator].length ? 'icon-add-member3' : 'icon-task-add-member-circle',
              )}
            />
          </div>
        </div>
      )}

      <div className="mTop25" style={{ borderBottom: '1px solid #ddd' }}>
        {TABS.map(item => {
          return (
            <TABS_ITEM
              key={item.value}
              className={cx('pointerEventsAuto', { active: item.value === tabIndex })}
              onClick={() => setTabIndex(item.value)}
            >
              {item.text}
            </TABS_ITEM>
          );
        })}
      </div>

      {tabIndex === 1 && (
        <Fragment>
          <div className="Font13 mTop20">
            <span className="bold">{_l('流程拥有者')}</span>
            <span className="Gray_9e">{_l('（代理审批流程中负责人为空时的发起、审批、填写节点）')}</span>
          </div>
          <div className="flexRow alignItemsCenter">
            <Member leastOne accounts={data.processConfig.agents} />
            <div
              className={cx('Gray_c ThemeHoverColor3 mTop12 pointer', { mLeft8: data.processConfig.agents.length })}
              style={{ height: 28 }}
              onClick={event =>
                selectCharge(event, accounts => {
                  updateSource({ processConfig: Object.assign({}, data.processConfig, { agents: accounts }) });
                })
              }
            >
              <i
                className={cx(
                  'Font28',
                  data.processConfig.agents.length ? 'icon-add-member3' : 'icon-task-add-member-circle',
                )}
              />
            </div>
          </div>

          <div className="Font13 mTop20 bold">{_l('自动通过（默认设置）')}</div>
          {AutoPass.map((item, i) => (
            <div key={i} className="flexRow mTop15 alignItemsCenter">
              <Checkbox
                text={item.text}
                checked={data.processConfig[item.key]}
                onClick={checked =>
                  updateSource({
                    processConfig: Object.assign({}, data.processConfig, { [item.key]: !checked }),
                  })
                }
              />
            </div>
          ))}

          {(data.processConfig.startEventPass || data.processConfig.userTaskPass) && (
            <div className="mTop15 mLeft25">
              <div className="Gray_75">{_l('以下情况不自动通过')}</div>
              <div className="flexRow mTop15 alignItemsCenter">
                <Checkbox
                  text={_l('必填字段为空时')}
                  checked={data.processConfig.required}
                  onClick={checked =>
                    updateSource({
                      processConfig: Object.assign({}, data.processConfig, { required: !checked }),
                    })
                  }
                />
                <span
                  className="workflowDetailTipsWidth mLeft5"
                  data-tip={_l('勾选后，当有必填字段为空时不自动通过，仍需进行审批操作。')}
                >
                  <Icon icon="info" className="Gray_9e Font16 TxtTop InlineBlock mTop3" />
                </span>
              </div>
              <div className="flexRow mTop15 alignItemsCenter">
                <Checkbox
                  text={_l('设置为必须审批的节点')}
                  checked={selected}
                  onClick={checked => {
                    setSelected(!checked);
                    checked &&
                      updateSource({
                        processConfig: Object.assign({}, data.processConfig, { requiredIds: [] }),
                      });
                  }}
                />
              </div>
              {selected && (
                <Dropdown
                  className="flowDropdown flowDropdownMoreSelect mTop10"
                  menuStyle={{ width: '100%' }}
                  data={list}
                  value={data.processConfig.requiredIds.length || undefined}
                  border
                  openSearch
                  renderTitle={() =>
                    !!data.processConfig.requiredIds.length && (
                      <ul className="tagWrap">
                        {data.processConfig.requiredIds.map(id => {
                          const item = _.find(data.processConfig.revokeFlowNodes, item => item.id === id);

                          return (
                            <li key={id} className={cx('tagItem flexRow', { error: !item })}>
                              <Tooltip title={item ? null : `ID：${id}`}>
                                <span className="tag">{item ? item.name : _l('节点已删除')}</span>
                              </Tooltip>
                              <span
                                className="delTag"
                                onClick={e => {
                                  e.stopPropagation();
                                  const ids = [].concat(data.processConfig.requiredIds);
                                  _.remove(ids, item => item === id);

                                  updateSource({
                                    processConfig: Object.assign({}, data.processConfig, { requiredIds: ids }),
                                  });
                                }}
                              >
                                <Icon icon="close" className="pointer" />
                              </span>
                            </li>
                          );
                        })}
                      </ul>
                    )
                  }
                  onChange={id => {
                    updateSource({
                      processConfig: Object.assign({}, data.processConfig, {
                        requiredIds: data.processConfig.requiredIds.concat(id),
                      }),
                    });
                    setSelected(true);
                  }}
                />
              )}
            </div>
          )}

          <OperatorEmpty
            hideGoToSettings
            projectId={companyId}
            processId={!data.processConfig.agents.length ? processId : ''}
            title={_l('审批/填写人为空时（默认设置）')}
            titleInfo={_l('设置节点负责人为空时的默认处理方式，在每个节点中也可单独设置。')}
            userTaskNullMap={data.processConfig.userTaskNullMaps}
            updateSource={userTaskNullMaps =>
              updateSource({
                processConfig: Object.assign({}, data.processConfig, { userTaskNullMaps }),
              })
            }
          />
        </Fragment>
      )}

      {tabIndex === 2 && (
        <Fragment>
          {data.flowNodeMap ? (
            <Fragment>
              <div className="Font13 bold mTop25">{_l('回到发起节点时')}</div>
              <div className="Font13 Gray_9e mTop10">{_l('当流程退回至此节点时触发更新')}</div>
              <UpdateFields
                type={1}
                companyId={props.companyId}
                processId={props.processId}
                relationId={props.relationId}
                selectNodeId={props.selectNodeId}
                nodeId={data.flowNodeMap[OPERATION_TYPE.BEFORE].selectNodeId}
                controls={data.flowNodeMap[OPERATION_TYPE.BEFORE].controls.filter(o => o.type !== 29)}
                fields={data.flowNodeMap[OPERATION_TYPE.BEFORE].fields}
                showCurrent
                formulaMap={data.flowNodeMap[OPERATION_TYPE.BEFORE].formulaMap}
                updateSource={(obj, callback = () => {}) =>
                  updateSource(
                    {
                      flowNodeMap: Object.assign({}, data.flowNodeMap, {
                        [OPERATION_TYPE.BEFORE]: Object.assign({}, data.flowNodeMap[OPERATION_TYPE.BEFORE], obj),
                      }),
                    },
                    callback,
                  )
                }
              />

              <ProcessDetails {...props} />
            </Fragment>
          ) : (
            <div className="mTop25 Gray_9e">{_l('节点异常，无法配置')}</div>
          )}
        </Fragment>
      )}
    </Fragment>
  );
};
