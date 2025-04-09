import React, { Fragment, useState, useEffect } from 'react';
import { Checkbox, Icon, Dropdown, Radio, Menu, MenuItem, SortableList } from 'ming-ui';
import UpdateFields from '../UpdateFields';
import ProcessDetails from '../ProcessDetails';
import OperatorEmpty from '../OperatorEmpty';
import WriteFields from '../WriteFields';
import CustomTextarea from '../CustomTextarea';
import EmailApproval from '../EmailApproval';
import cx from 'classnames';
import _ from 'lodash';
import styled from 'styled-components';
import { OPERATION_TYPE, USER_TYPE, NODE_TYPE } from '../../../enum';
import Member from '../Member';
import { quickSelectUser } from 'ming-ui/functions';
import { Tooltip } from 'antd';
import sheetAjax from 'src/api/worksheet';
import Trigger from 'rc-trigger';

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

const SortableItemBox = styled.div`
  padding: 1px 0;
  .workflowPrintItem {
    height: 36px;
    padding: 0 10px;
    border: 1px solid #ccc;
    border-radius: 4px;
  }
  .icon-delete2 {
    &:hover {
      color: #f44336 !important;
    }
  }
  .icon-new_word {
    color: #2196f3;
  }
  .icon-new_excel {
    color: #4caf50;
  }
  .icon-doc {
    color: #465a65;
  }
  .red {
    color: #f44336;
  }
`;

export default props => {
  const { companyId, processId, data, updateSource, cacheKey, selectNodeType } = props;
  const [tabIndex, setTabIndex] = useState(1);
  const [selected, setSelected] = useState(!!data.processConfig.requiredIds.length);
  const [printList, setPrintList] = useState([]);
  const worksheetId = selectNodeType === NODE_TYPE.FIRST ? data.appId : _.get(data, 'selectNodeObj.appId');
  const InitiatorAction = [
    { text: _l('允许发起人撤回流程'), key: 'allowRevoke' },
    { text: _l('允许发起人催办'), key: 'allowUrge' },
  ];
  const INITIATOR_TYPE = [
    { text: _l('自动进入下一个节点'), value: 4 },
    { text: _l('由流程拥有者代理'), value: 2 },
    { text: _l('由指定人员代理'), value: 5 },
    { text: _l('流程结束'), value: 3 },
  ];
  const TABS = [
    { text: _l('流程设置'), value: 1 },
    { text: _l('字段设置'), value: 2 },
    { text: _l('数据更新'), value: 3 },
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
  // 渲染撤回节点
  const renderRevokeNode = () => {
    const { revokeFlowNodes, revokeNodeIds } = data.processConfig;
    const revokeNodes = revokeFlowNodes.map(item => {
      return {
        text: item.name,
        value: item.id,
        disabled: _.includes(revokeNodeIds, item.id),
      };
    });
    const CALLBACK_TYPES = [
      { text: _l('重新执行流程'), value: 0 },
      { text: _l('回到当时撤回节点'), value: 1, desc: _l('撤回节点需没有并行分支') },
    ];

    return (
      <Fragment>
        <div className="mTop10 mLeft25 flexRow alignItemsCenter">
          <div>{_l('节点')}</div>
          <Dropdown
            className="mLeft10 flex flowDropdown flowDropdownMoreSelect"
            menuStyle={{ width: '100%' }}
            data={revokeNodes}
            value={revokeNodeIds.length || undefined}
            border
            openSearch
            renderTitle={() =>
              !!revokeNodeIds.length && (
                <ul className="tagWrap">
                  {revokeNodeIds.map(id => {
                    const item = _.find(revokeFlowNodes, item => item.id === id);

                    return (
                      <li key={id} className={cx('tagItem flexRow', { error: !item })}>
                        <Tooltip title={item ? null : `ID：${id}`}>
                          <span className="tag">{item ? item.name : _l('节点已删除')}</span>
                        </Tooltip>
                        <span
                          className="delTag"
                          onClick={e => {
                            e.stopPropagation();
                            const ids = [].concat(revokeNodeIds);
                            _.remove(ids, item => item === id);

                            updateSource({
                              processConfig: Object.assign({}, data.processConfig, { revokeNodeIds: ids }),
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
            onChange={revokeNodeId =>
              updateSource({
                processConfig: Object.assign({}, data.processConfig, {
                  revokeNodeIds: revokeNodeIds.concat(revokeNodeId),
                }),
              })
            }
          />
          <div className="mLeft10">{_l('通过后不允许撤回')}</div>
        </div>
        <div className="mTop15 mLeft25">
          <Checkbox
            className="InlineBlock"
            text={_l('允许重新发起')}
            checked={data.processConfig.callBackType !== -1}
            onClick={checked =>
              updateSource({
                processConfig: Object.assign({}, data.processConfig, { callBackType: !checked ? 0 : -1 }),
              })
            }
          />
          {data.processConfig.callBackType !== -1 && (
            <div className="mLeft15 flexRow mTop10 alignItemsCenter">
              {CALLBACK_TYPES.map((item, index) => {
                return (
                  <Fragment key={index}>
                    <Radio
                      className="mRight40"
                      text={item.text}
                      checked={data.processConfig.callBackType === item.value}
                      onClick={() =>
                        updateSource({
                          processConfig: Object.assign({}, data.processConfig, { callBackType: item.value }),
                        })
                      }
                    />
                    {item.desc && (
                      <span style={{ height: 16, marginLeft: -35 }} data-tip={item.desc}>
                        <Icon className="Font16 Gray_9e" icon="info" />
                      </span>
                    )}
                  </Fragment>
                );
              })}
            </div>
          )}
        </div>
      </Fragment>
    );
  };
  const getPrintList = () => {
    sheetAjax.getPrintList({ worksheetId }).then(data => {
      setPrintList(
        data
          .filter(o => _.includes([0, 2, 5], o.type))
          .map(o => {
            return {
              id: o.id,
              type: o.type,
              text: o.name,
            };
          }),
      );
    });
  };
  const renderPrintItem = ({ items, item, DragHandle, dragging }) => {
    const selectItem = _.find(printList, o => o.id === item);

    return (
      <SortableItemBox className="flexRow mTop10 alignItemsCenter">
        <DragHandle>
          <Tooltip title={dragging ? '' : _l('拖拽调整排序')}>
            <i className="icon-drag Font16 Gray_75 ThemeHoverColor3" style={{ cursor: 'move' }} />
          </Tooltip>
        </DragHandle>
        <div className="flex mLeft10 Font13 workflowPrintItem flexRow alignItemsCenter">
          {selectItem ? (
            <Fragment>
              <Icon
                icon={selectItem.type === 2 ? 'new_word' : selectItem.type === 5 ? 'new_excel' : 'doc'}
                className="Font20"
              />
              <span className="mLeft6 Font12">{selectItem.text}</span>
            </Fragment>
          ) : (
            <span className="red">{_l('模板已删除')}</span>
          )}
        </div>
        <Tooltip title={_l('删除')}>
          <i
            className="icon-delete2 Font16 Gray_75 pointer mLeft10"
            onClick={() =>
              updateSource({
                processConfig: Object.assign({}, data.processConfig, { printIds: items.filter(id => id !== item) }),
              })
            }
          />
        </Tooltip>
      </SortableItemBox>
    );
  };
  const renderOpinionNode = () => {
    const { revokeFlowNodes, viewNodeIds } = data.processConfig;
    const opinionNodes = revokeFlowNodes.map(item => {
      return {
        text: item.name,
        value: item.id,
        disabled: _.includes(viewNodeIds || [], item.id),
      };
    });

    return (
      <div className="mTop10 mLeft25 flexRow alignItemsCenter">
        <div>{_l('节点')}</div>
        <Dropdown
          className="mLeft10 flex flowDropdown flowDropdownMoreSelect"
          menuStyle={{ width: '100%' }}
          data={[opinionNodes, [{ text: _l('所有审批节点'), value: null, disabled: viewNodeIds === null }]]}
          value={viewNodeIds || 'all'}
          border
          openSearch
          renderTitle={
            viewNodeIds === null
              ? () => <span>{_l('所有审批节点')}</span>
              : () => (
                  <ul className="tagWrap">
                    {viewNodeIds.map(id => {
                      const item = _.find(revokeFlowNodes, item => item.id === id);

                      return (
                        <li key={id} className={cx('tagItem flexRow', { error: !item })}>
                          <Tooltip title={item ? null : `ID：${id}`}>
                            <span className="tag">{item ? item.name : _l('节点已删除')}</span>
                          </Tooltip>
                          <span
                            className="delTag"
                            onClick={e => {
                              e.stopPropagation();
                              const ids = [].concat(viewNodeIds);
                              _.remove(ids, item => item === id);

                              updateSource({
                                processConfig: Object.assign({}, data.processConfig, { viewNodeIds: ids }),
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
          onChange={nodeId =>
            updateSource({
              processConfig: Object.assign({}, data.processConfig, {
                viewNodeIds: nodeId === null ? null : (viewNodeIds || []).concat(nodeId),
              }),
            })
          }
        />
      </div>
    );
  };

  useEffect(() => {
    setSelected(!!data.processConfig.requiredIds.length);
  }, [cacheKey]);

  useEffect(() => {
    worksheetId && getPrintList();
  }, [worksheetId]);

  return (
    <Fragment>
      <div className="Font13 mTop20">
        <span className="bold">{_l('待办标题')}</span>
        <span className="Gray_75">{_l('（未设置时显示记录的标题）')}</span>
      </div>
      <CustomTextarea
        projectId={companyId}
        processId={processId}
        relationId={props.relationId}
        selectNodeId={props.selectNodeId}
        type={2}
        height={0}
        showCurrent
        content={data.processConfig.recordTitle}
        formulaMap={data.processConfig.formulaMap}
        onChange={(err, value, obj) =>
          updateSource({
            processConfig: Object.assign({}, data.processConfig, { recordTitle: value }),
          })
        }
        updateSource={(obj, callback = () => {}) =>
          updateSource({ processConfig: Object.assign({}, data.processConfig, obj) }, callback)
        }
      />

      <div className="Font13 mTop20 bold">{_l('发起人操作')}</div>
      {InitiatorAction.map((item, i) => (
        <Fragment key={i}>
          <Checkbox
            className="mTop15 flexRow"
            text={item.text}
            checked={data.processConfig[item.key]}
            onClick={checked =>
              updateSource({
                processConfig: Object.assign(
                  {},
                  data.processConfig,
                  { [item.key]: !checked },
                  item.key === 'allowRevoke' && checked ? { callBackType: -1 } : {},
                ),
              })
            }
          />
          {item.key === 'allowRevoke' && data.processConfig.allowRevoke && renderRevokeNode()}
        </Fragment>
      ))}

      <Checkbox
        className="mTop15 flexRow"
        text={_l('允许发起人查看审批意见')}
        checked={
          _.isArray(data.processConfig.viewNodeIds)
            ? !!data.processConfig.viewNodeIds.length
            : data.processConfig.viewNodeIds === null
        }
        onClick={checked =>
          updateSource({
            processConfig: Object.assign({}, data.processConfig, { viewNodeIds: !checked ? null : [] }),
          })
        }
      />
      {(_.isArray(data.processConfig.viewNodeIds)
        ? !!data.processConfig.viewNodeIds.length
        : data.processConfig.viewNodeIds === null) && renderOpinionNode()}

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
          <Member companyId={companyId} leastOne accounts={data.processConfig.initiatorMaps[initiator]} />
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
            <span className="Gray_75">{_l('（代理审批流程中负责人为空时的发起、审批、填写节点）')}</span>
          </div>
          <div className="flexRow alignItemsCenter">
            <Member companyId={companyId} leastOne accounts={data.processConfig.agents} />
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

          <div className="Font13 mTop20 bold">{_l('自动通过')}</div>
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
            appId={props.relationType === 2 ? props.relationId : ''}
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

          <div className="Font13 mTop20 flexRow alignItemsCenter">
            <div className="bold flex">{_l('打印模板')}</div>
            <Checkbox
              text={_l('系统打印模板')}
              checked={!data.processConfig.disabledPrint}
              onClick={disabledPrint =>
                updateSource({ processConfig: Object.assign({}, data.processConfig, { disabledPrint }) })
              }
            />
          </div>
          <div></div>

          <SortableList
            useDragHandle
            renderBody
            items={data.processConfig.printIds}
            renderItem={renderPrintItem}
            onSortEnd={newItems => {
              updateSource({ processConfig: Object.assign({}, data.processConfig, { printIds: newItems }) });
            }}
          />

          <div className="mTop10">
            <Trigger
              popup={() => (
                <Menu className="workflowPrintTrigger">
                  {printList.map(o => (
                    <MenuItem
                      key={o.id}
                      disabled={_.includes(data.processConfig.printIds, o.id)}
                      onClick={() => {
                        if (_.includes(data.processConfig.printIds, o.id)) return;

                        updateSource({
                          processConfig: Object.assign({}, data.processConfig, {
                            printIds: data.processConfig.printIds.concat(o.id),
                          }),
                        });
                      }}
                    >
                      <Icon icon={o.type === 2 ? 'new_word' : o.type === 5 ? 'new_excel' : 'doc'} className="Font20" />
                      <span>{o.text}</span>
                    </MenuItem>
                  ))}
                </Menu>
              )}
              action={printList.length ? ['click'] : []}
              popupAlign={{
                points: ['tl', 'bl'],
                offset: [5, 5],
                overflow: { adjustX: true, adjustY: true },
              }}
            >
              <span className={cx('Gray_75', { 'pointer ThemeHoverColor3': !!printList.length })}>
                {printList.length ? `+ ${_l('添加打印模板')}` : _l('无打印模板')}
              </span>
            </Trigger>
          </div>

          <div className="Font13 mTop20 bold">{_l('其他')}</div>
          <div className="flexRow mTop15 alignItemsCenter">
            <Checkbox
              text={_l('允许审批人撤回上次审批结果')}
              checked={data.processConfig.allowTaskRevoke}
              onClick={checked =>
                updateSource({
                  processConfig: Object.assign({}, data.processConfig, { allowTaskRevoke: !checked }),
                })
              }
            />
          </div>
          <div className="flexRow mTop15 alignItemsCenter">
            <Checkbox
              text={_l('当没有上级负责人时，由当前人员进行处理')}
              checked={data.processConfig.defaultCandidateUser}
              onClick={checked =>
                updateSource({
                  processConfig: Object.assign({}, data.processConfig, { defaultCandidateUser: !checked }),
                })
              }
            />
            <Tooltip
              overlayStyle={{ maxWidth: 320 }}
              title={_l(
                '指在审批流程中当人员设置为直属上级、上级部门负责人时。如果当前人员没有直属上级，则由本人自己处理；如果当前人员、部门没有上级部门，则由本部门负责人处理。未勾选时，则按照为空处理。',
              )}
            >
              <Icon icon="info" className="Gray_9e Font16 TxtTop InlineBlock mTop3 mLeft5" />
            </Tooltip>
          </div>
          <div className="flexRow mTop15 alignItemsCenter">
            <Checkbox
              text={_l('验证节点负责人的记录查看权限')}
              checked={data.processConfig.permissionLevel === 1}
              onClick={checked =>
                updateSource({
                  processConfig: Object.assign({}, data.processConfig, { permissionLevel: !checked ? 1 : 0 }),
                })
              }
            />
            <Tooltip
              overlayStyle={{ maxWidth: 320 }}
              title={
                <div>
                  <div>
                    {_l(
                      '未勾选时：在审批流程中，不验证审批、填写、抄送人在工作表中的记录权限，只按照流程节点设置的权限进行查看和操作',
                    )}
                  </div>
                  <div>
                    {_l(
                      '勾选后：节点负责人必须在工作表中也对记录有查看权限时才能继续操作；无权限时不可见记录内容且不能进行审批、填写',
                    )}
                  </div>
                  <div>{_l('提醒：批量操作不受影响')}</div>
                </div>
              }
            >
              <Icon icon="info" className="Gray_9e Font16 TxtTop InlineBlock mTop3 mLeft5" />
            </Tooltip>
          </div>

          <EmailApproval
            {...props}
            title={_l('启用邮件通知')}
            desc={
              <span>
                {_l('启用后，审批结果会以邮件的形式发送给发起人。')}
                {(!_.get(md, 'global.Config.IsLocal') || _.get(md, 'global.Config.IsPlatformLocal')) &&
                  _l('邮件%0/封，将自动从企业账户扣除。', _.get(md, 'global.PriceConfig.EmailPrice'))}
              </span>
            }
            flowNodeMap={data.flowNodeMap[OPERATION_TYPE.EMAIL]}
            updateSource={(obj, callback) =>
              updateSource(
                {
                  flowNodeMap: Object.assign({}, data.flowNodeMap, {
                    [OPERATION_TYPE.EMAIL]: Object.assign({}, data.flowNodeMap[OPERATION_TYPE.EMAIL], obj),
                  }),
                },
                callback,
              )
            }
          />
        </Fragment>
      )}

      {tabIndex === 2 && (
        <Fragment>
          <div className="Gray_75 mTop20">
            {_l('设置发起人撤回或被退回重新处理时可以查看、编辑、必填的字段。未设置时按照发起人在应用中的原始记录权限')}
          </div>

          {props.selectNodeId ? (
            <div className="Font13 mTop15">
              <WriteFields
                data={data.formProperties}
                addNotAllowView={!!data.addNotAllowView}
                updateSource={updateSource}
                showCard={true}
              />
            </div>
          ) : (
            <div className="Gray_75 Font13 flexRow flowDetailTips mTop15">
              <i className="icon-task-setting_promet Font16 Gray_9e" />
              <div className="flex mLeft10">{_l('必须先选择一个对象后，才能设置字段权限')}</div>
            </div>
          )}
        </Fragment>
      )}

      {tabIndex === 3 && (
        <Fragment>
          {data.flowNodeMap ? (
            <Fragment>
              <div className="Font13 bold mTop20">{_l('回到发起节点时')}</div>
              <div className="Font13 Gray_75 mTop10">{_l('当流程退回至此节点时触发更新')}</div>
              <UpdateFields
                type={1}
                companyId={companyId}
                processId={processId}
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
            <div className="mTop20 Gray_75">{_l('节点异常，无法配置')}</div>
          )}
        </Fragment>
      )}
    </Fragment>
  );
};
