import React, { Fragment, useCallback, useEffect, useState } from 'react';
import cx from 'classnames';
import _ from 'lodash';
import styled from 'styled-components';
import { Icon, SortableList } from 'ming-ui';
import { Dropdown as AntdDropdown, Checkbox, Radio, Select, Tooltip } from 'ming-ui/antd-components';
import { UserSelectPopover } from 'ming-ui/functions/quickSelectUser';
import sheetAjax from 'src/api/worksheet';
import { buriedUpgradeVersionDialog } from 'src/components/upgradeVersion';
import { VersionProductType } from 'src/utils/domain/shared/productFeatures';
import { getFeatureStatus } from 'src/utils/services/project';
import { NODE_TYPE, OPERATION_TYPE, RELATION_TYPE, USER_TYPE } from '../../../enum';
import { EXPIRE_LIST } from '../../../enum';
import CustomTextarea from '../CustomTextarea';
import EmailApproval from '../EmailApproval';
import Member from '../Member';
import OperatorEmpty from '../OperatorEmpty';
import ProcessDetails from '../ProcessDetails';
import UpdateFields from '../UpdateFields';
import WriteFields from '../WriteFields';

const SELECT_FIELD_NAMES = { label: 'text', value: 'value' };

const renderNodeLabel = (nodes, value) => {
  const item = _.find(nodes, { id: value });

  return (
    <Tooltip title={item ? null : `ID：${value}`}>
      <span className={cx({ errorColor: !item })}>{item ? item.name : _l('节点已删除')}</span>
    </Tooltip>
  );
};

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
      border-bottom: 3px solid var(--color-primary);
    }
  }
`;

const SortableItemBox = styled.div`
  padding: 1px 0;
  .workflowPrintItem {
    height: 36px;
    padding: 0 10px;
    border: 1px solid var(--color-border-tertiary);
    border-radius: 4px;
  }
  .icon-trash {
    &:hover {
      color: var(--color-error) !important;
    }
  }
  .icon-new_word {
    color: var(--color-primary);
  }
  .icon-new_excel {
    color: var(--color-success);
  }
  .icon-doc {
    color: #465a65;
  }
  .red {
    color: var(--color-error);
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
    { label: _l('自动进入下一个节点'), value: 4 },
    { label: _l('由流程拥有者代理'), value: 2 },
    { label: _l('由指定人员代理'), value: 5 },
    { label: _l('流程结束'), value: 3 },
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
  const SOURCE_HANDLE_LIST = [
    {
      title: _l('回到发起节点时'),
      desc: _l('当流程退回至此节点时触发更新'),
      key: OPERATION_TYPE.BEFORE,
    },
    {
      title: _l('流程中止时更新'),
      desc: _l('流程中止后，更新数据对象的字段值'),
      key: OPERATION_TYPE.SUSPEND,
    },
  ];
  const initiator = data.processConfig.initiatorMaps ? parseInt(Object.keys(data.processConfig.initiatorMaps)[0]) : 0;
  const autoClear = !!data.processConfig.expireType;
  const featureType = getFeatureStatus(companyId, VersionProductType.encapsulatingBusinessProcess);

  const renderUserSelect = (children, callback) => (
    <UserSelectPopover
      offset={{ top: 10, left: 0 }}
      projectId={companyId}
      unique
      filterAll
      filterFriend
      filterOthers
      filterOtherProject
      onSelect={users =>
        callback(
          users.map(item => ({
            type: USER_TYPE.USER,
            entityId: '',
            entityName: '',
            roleId: item.accountId,
            roleName: item.fullname,
            avatar: item.avatar,
          })),
        )
      }
    >
      {children}
    </UserSelectPopover>
  );

  const list = data.processConfig.revokeFlowNodes
    .filter(item => item.typeId === NODE_TYPE.APPROVAL)
    .map(item => {
      return {
        label: item.name,
        value: item.id,
      };
    });

  // 渲染撤回节点
  const renderRevokeNode = () => {
    const { revokeFlowNodes, revokeNodeIds } = data.processConfig;
    const revokeNodes = revokeFlowNodes.map(item => {
      return {
        label: item.name,
        value: item.id,
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
          <Select
            className="mLeft10 flex flowDropdown flowDropdownMoreSelect"
            mode="multiple"
            options={revokeNodes}
            value={revokeNodeIds}
            showSearch
            optionFilterProp="label"
            labelRender={({ value }) => renderNodeLabel(revokeFlowNodes, value)}
            onChange={revokeNodeIds =>
              updateSource({
                processConfig: Object.assign({}, data.processConfig, {
                  revokeNodeIds,
                }),
              })
            }
          />
          <div className="mLeft10">{_l('通过后不允许撤回')}</div>
        </div>
        <div className="mTop15 mLeft25">
          <Checkbox
            checked={data.processConfig.callBackType !== -1}
            onChange={event =>
              updateSource({
                processConfig: Object.assign({}, data.processConfig, {
                  callBackType: event.target.checked ? 0 : -1,
                }),
              })
            }
          >
            {_l('允许重新发起')}
          </Checkbox>
          {data.processConfig.callBackType !== -1 && (
            <div className="mLeft26 flexRow mTop15 alignItemsCenter">
              {CALLBACK_TYPES.map((item, index) => {
                return (
                  <Fragment key={index}>
                    <Radio
                      className="mRight40"
                      checked={data.processConfig.callBackType === item.value}
                      onChange={() =>
                        updateSource({
                          processConfig: Object.assign({}, data.processConfig, {
                            callBackType: item.value,
                          }),
                        })
                      }
                      title={item.text}
                    >
                      {item.text}
                    </Radio>
                    {item.desc && (
                      <Tooltip title={item.desc}>
                        <span style={{ height: 16, marginLeft: -35 }}>
                          <Icon className="Font16 textTertiary" icon="info" />
                        </span>
                      </Tooltip>
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

  const getPrintList = useCallback(() => {
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
  }, [worksheetId]);

  const renderPrintItem = ({ items, item, DragHandle, dragging }) => {
    const selectItem = _.find(printList, o => o.id === item);

    return (
      <SortableItemBox className="flexRow mTop10 alignItemsCenter">
        <DragHandle>
          <Tooltip title={dragging ? '' : _l('拖拽调整排序')}>
            <i className="icon-drag Font16 textSecondary hoverColorPrimary" style={{ cursor: 'move' }} />
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
            className="icon-trash Font16 textSecondary pointer mLeft10"
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
        label: item.name,
        value: item.id,
      };
    });
    const opinionOptions = opinionNodes.concat({
      label: _l('所有审批节点'),
      value: 'all',
      disabled: viewNodeIds === null,
    });

    return (
      <div className="mTop10 mLeft25 flexRow alignItemsCenter">
        <div>{_l('节点')}</div>
        <Select
          className="mLeft10 flex flowDropdown flowDropdownMoreSelect"
          mode="multiple"
          options={opinionOptions}
          value={viewNodeIds === null ? ['all'] : viewNodeIds}
          showSearch
          optionFilterProp="label"
          labelRender={({ value }) =>
            value === 'all' ? <span>{_l('所有审批节点')}</span> : renderNodeLabel(revokeFlowNodes, value)
          }
          onChange={nodeIds => {
            const nextNodeIds = viewNodeIds === null ? nodeIds.filter(id => id !== 'all') : nodeIds;
            updateSource({
              processConfig: Object.assign({}, data.processConfig, {
                viewNodeIds: nextNodeIds.includes('all') ? null : nextNodeIds,
              }),
            });
          }}
        />
      </div>
    );
  };

  useEffect(() => {
    setSelected(!!data.processConfig.requiredIds.length);
  }, [cacheKey, data.processConfig.requiredIds.length]);

  useEffect(() => {
    worksheetId && getPrintList();
  }, [getPrintList, worksheetId]);

  return (
    <Fragment>
      <div className="Font13 mTop20">
        <span className="bold">{_l('待办标题')}</span>
        <span className="textSecondary">{_l('（未设置时显示记录的标题）')}</span>
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
        onChange={(err, value) =>
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
            checked={data.processConfig[item.key]}
            onChange={event =>
              updateSource({
                processConfig: Object.assign(
                  {},
                  data.processConfig,
                  {
                    [item.key]: event.target.checked,
                  },
                  item.key === 'allowRevoke' && !event.target.checked
                    ? {
                        callBackType: -1,
                      }
                    : {},
                ),
              })
            }
          >
            {item.text}
          </Checkbox>
          {item.key === 'allowRevoke' && data.processConfig.allowRevoke && renderRevokeNode()}
        </Fragment>
      ))}

      <Checkbox
        className="mTop15 flexRow"
        checked={
          _.isArray(data.processConfig.viewNodeIds)
            ? !!data.processConfig.viewNodeIds.length
            : data.processConfig.viewNodeIds === null
        }
        onChange={event =>
          updateSource({
            processConfig: Object.assign({}, data.processConfig, {
              viewNodeIds: event.target.checked ? null : [],
            }),
          })
        }
      >
        {_l('允许发起人查看审批意见')}
      </Checkbox>
      {(_.isArray(data.processConfig.viewNodeIds)
        ? !!data.processConfig.viewNodeIds.length
        : data.processConfig.viewNodeIds === null) && renderOpinionNode()}

      <div className="Font13 mTop20 bold flexRow alignItemsCenter">
        {_l('发起人为空时')}
        <Tooltip
          title={_l(
            '设置发起人为空时的处理方式。当设为自动进行下一节点时，如果退回到流程发起节点，也会自动由下一个节点进行处理',
          )}
        >
          <Icon className="Font16 textTertiary mLeft5" icon="info" />
        </Tooltip>
      </div>
      <Select
        className="flowDropdown mTop10"
        options={INITIATOR_TYPE}
        value={initiator || undefined}
        placeholder={_l('流程结束')}
        onChange={initiator =>
          updateSource({
            processConfig: Object.assign({}, data.processConfig, { initiatorMaps: { [initiator]: [] } }),
          })
        }
      />

      {initiator === 2 && !data.processConfig.agents.length && (
        <div className="Font13 textSecondary mTop5">{_l('当前流程还没有流程拥有者，请在 流程发起节点 中配置')}</div>
      )}

      {initiator === 5 && (
        <div className="flexRow alignItemsCenter">
          <div className="mRight10 mTop12">{_l('代理人')}</div>
          <Member companyId={companyId} leastOne accounts={data.processConfig.initiatorMaps[initiator]} />
          {renderUserSelect(
            <div
              className={cx('textPlaceholder hoverColorPrimary mTop12 pointer', {
                mLeft8: data.processConfig.initiatorMaps[initiator].length,
              })}
              style={{ height: 28 }}
            >
              <i
                className={cx(
                  'Font28',
                  data.processConfig.initiatorMaps[initiator].length
                    ? 'icon-add-member3'
                    : 'icon-task-add-member-circle',
                )}
              />
            </div>,
            accounts => {
              updateSource({
                processConfig: Object.assign({}, data.processConfig, {
                  initiatorMaps: {
                    [initiator]: accounts,
                  },
                }),
              });
            },
          )}
        </div>
      )}

      <div className="mTop25" style={{ borderBottom: '1px solid var(--color-border-primary)' }}>
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
            <span className="textSecondary">{_l('（代理审批流程中负责人为空时的发起、审批、填写节点）')}</span>
          </div>
          <div className="flexRow alignItemsCenter">
            <Member companyId={companyId} leastOne accounts={data.processConfig.agents} />
            {renderUserSelect(
              <div
                className={cx('textPlaceholder hoverColorPrimary mTop12 pointer', {
                  mLeft8: data.processConfig.agents.length,
                })}
                style={{ height: 28 }}
              >
                <i
                  className={cx(
                    'Font28',
                    data.processConfig.agents.length ? 'icon-add-member3' : 'icon-task-add-member-circle',
                  )}
                />
              </div>,
              accounts => {
                updateSource({ processConfig: Object.assign({}, data.processConfig, { agents: accounts }) });
              },
            )}
          </div>

          <div className="Font13 mTop20 bold">{_l('自动通过')}</div>
          {AutoPass.map((item, i) => (
            <div key={i} className="flexRow mTop15 alignItemsCenter">
              <Checkbox
                checked={data.processConfig[item.key]}
                onChange={event =>
                  updateSource({
                    processConfig: Object.assign({}, data.processConfig, {
                      [item.key]: event.target.checked,
                    }),
                  })
                }
              >
                {item.text}
              </Checkbox>
            </div>
          ))}

          {(data.processConfig.startEventPass || data.processConfig.userTaskPass) && (
            <div className="mTop15 mLeft25">
              <div className="textSecondary">{_l('以下情况不自动通过')}</div>
              <div className="flexRow mTop15 alignItemsCenter">
                <Checkbox
                  checked={data.processConfig.required}
                  onChange={event =>
                    updateSource({
                      processConfig: Object.assign({}, data.processConfig, {
                        required: event.target.checked,
                      }),
                    })
                  }
                >
                  {_l('必填字段为空时')}
                </Checkbox>
                <Tooltip title={_l('勾选后，当有必填字段为空时不自动通过，仍需进行审批操作。')}>
                  <Icon icon="info" className="textTertiary Font16 mLeft5" />
                </Tooltip>
              </div>
              <div className="flexRow mTop15 alignItemsCenter">
                <Checkbox
                  checked={selected}
                  onChange={event => {
                    setSelected(event.target.checked);
                    !event.target.checked &&
                      updateSource({
                        processConfig: Object.assign({}, data.processConfig, {
                          requiredIds: [],
                        }),
                      });
                  }}
                >
                  {_l('设置为必须审批的节点')}
                </Checkbox>
              </div>
              {selected && (
                <Select
                  className="flowDropdown flowDropdownMoreSelect mTop10"
                  mode="multiple"
                  options={list}
                  value={data.processConfig.requiredIds}
                  showSearch
                  optionFilterProp="label"
                  labelRender={({ value }) => renderNodeLabel(data.processConfig.revokeFlowNodes, value)}
                  onChange={requiredIds => {
                    updateSource({
                      processConfig: Object.assign({}, data.processConfig, {
                        requiredIds,
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
            appId={props.relationType === RELATION_TYPE.APP ? props.relationId : ''}
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
              checked={!data.processConfig.disabledPrint}
              onChange={event =>
                updateSource({
                  processConfig: Object.assign({}, data.processConfig, {
                    disabledPrint: !event.target.checked,
                  }),
                })
              }
            >
              {_l('系统打印模板')}
            </Checkbox>
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
            <AntdDropdown
              disabled={!printList.length}
              trigger={['click']}
              placement="bottomLeft"
              menu={{
                style: { width: 752, maxHeight: 200, overflowY: 'auto' },
                items: printList.map(o => ({
                  key: o.id,
                  disabled: _.includes(data.processConfig.printIds, o.id),
                  icon: (
                    <Icon
                      icon={o.type === 2 ? 'new_word' : o.type === 5 ? 'new_excel' : 'doc'}
                      className={cx('Font20', {
                        colorPrimary: o.type === 2,
                        Green: o.type === 5,
                        textSecondary: !_.includes([2, 5], o.type),
                      })}
                    />
                  ),
                  label: o.text,
                  onClick: () => {
                    if (_.includes(data.processConfig.printIds, o.id)) return;

                    updateSource({
                      processConfig: Object.assign({}, data.processConfig, {
                        printIds: data.processConfig.printIds.concat(o.id),
                      }),
                    });
                  },
                })),
              }}
            >
              <span className={cx('textSecondary', { 'pointer hoverColorPrimary': !!printList.length })}>
                {printList.length ? `+ ${_l('添加打印模板')}` : _l('无打印模板')}
              </span>
            </AntdDropdown>
          </div>

          <div className="Font13 mTop20 bold">{_l('其他')}</div>
          <div className="flexRow mTop15 alignItemsCenter">
            <Checkbox
              checked={data.processConfig.allowTaskRevoke}
              onChange={event =>
                updateSource({
                  processConfig: Object.assign({}, data.processConfig, {
                    allowTaskRevoke: event.target.checked,
                  }),
                })
              }
            >
              {_l('允许审批人撤回上次审批结果')}
            </Checkbox>
          </div>
          <div className="flexRow mTop15 alignItemsCenter">
            <Checkbox
              checked={data.processConfig.defaultCandidateUser}
              onChange={event =>
                updateSource({
                  processConfig: Object.assign({}, data.processConfig, {
                    defaultCandidateUser: event.target.checked,
                  }),
                })
              }
            >
              {_l('当没有上级负责人时，由当前人员进行处理')}
            </Checkbox>
            <Tooltip
              title={_l(
                '指在审批流程中当人员设置为直属上级、上级部门负责人时。如果当前人员没有直属上级，则由本人自己处理；如果当前人员、部门没有上级部门，则由本部门负责人处理。未勾选时，则按照为空处理。',
              )}
            >
              <Icon icon="info" className="textTertiary Font16 mLeft5" />
            </Tooltip>
          </div>
          <div className="flexRow mTop15 alignItemsCenter">
            <Checkbox
              checked={data.processConfig.permissionLevel === 1}
              onChange={event =>
                updateSource({
                  processConfig: Object.assign({}, data.processConfig, {
                    permissionLevel: event.target.checked ? 1 : 0,
                  }),
                })
              }
            >
              {_l('验证节点负责人的记录查看权限')}
            </Checkbox>
            <Tooltip
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
              <Icon icon="info" className="textTertiary Font16 mLeft5" />
            </Tooltip>
          </div>

          <div className="flexRow mTop15 alignItemsCenter">
            <Checkbox
              checked={data.processConfig.allowShare}
              onChange={event =>
                updateSource({
                  processConfig: Object.assign({}, data.processConfig, {
                    allowShare: event.target.checked,
                  }),
                })
              }
            >
              {_l('允许审批/填写人添加抄送人')}
            </Checkbox>
            <Tooltip
              title={_l(
                '开启后，审批人或填写人在处理当前节点时，可手动添加抄送人；被添加的抄送人可查看当前记录的相关内容。',
              )}
            >
              <Icon icon="info" className="textTertiary Font16 mLeft5" />
            </Tooltip>
          </div>

          {data.flowNodeMap && (
            <EmailApproval
              {...props}
              title={_l('启用邮件通知')}
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
          )}

          <div className="flexRow mTop15 alignItemsCenter">
            <Checkbox
              checked={data.processConfig.allowUpdateView}
              onChange={event =>
                updateSource({
                  processConfig: Object.assign({}, data.processConfig, {
                    allowUpdateView: event.target.checked,
                  }),
                })
              }
            >
              {_l('审批流程中允许查看他人填写字段')}
            </Checkbox>
            <Tooltip title={_l('审批和填写节点中查看他人填写内容')}>
              <Icon icon="info" className="textTertiary Font16 mLeft5" />
            </Tooltip>
          </div>

          {featureType && (
            <div className="flexRow mTop15 alignItemsCenter">
              <Checkbox
                checked={autoClear}
                onChange={() => {
                  if (featureType === '2') {
                    buriedUpgradeVersionDialog(companyId, VersionProductType.workflowLog);
                    return;
                  }

                  updateSource({
                    processConfig: Object.assign({}, data.processConfig, {
                      expireType: autoClear ? 0 : 1,
                    }),
                  });
                }}
              >
                {_l('自动清理执行历史')}
              </Checkbox>
              <Tooltip title={_l('勾选后，超过保留周期的执行历史将自动删除且不可找回，请谨慎使用。')}>
                <Icon icon="info" className="textTertiary Font16 mLeft5" />
              </Tooltip>
            </div>
          )}
          {autoClear && (
            <div className="mTop10 flexRow alignItemsCenter mLeft26">
              <div>{_l('执行后')}</div>
              <Select
                className="mLeft10 mRight10"
                style={{ width: 100 }}
                options={EXPIRE_LIST}
                fieldNames={SELECT_FIELD_NAMES}
                value={data.processConfig.expireType}
                onChange={expireType =>
                  updateSource({ processConfig: Object.assign({}, data.processConfig, { expireType }) })
                }
              />
              <div>{_l('自动删除')}</div>
            </div>
          )}
        </Fragment>
      )}

      {tabIndex === 2 && (
        <Fragment>
          <div className="textSecondary mTop20">
            {_l('设置发起人撤回或被退回重新处理时可以查看、编辑、必填的字段。未设置时按照发起人在应用中的原始记录权限')}
          </div>

          {props.selectNodeId && (
            <div className="Font13 mTop15">
              <WriteFields
                data={data.formProperties}
                addNotAllowView={!!data.addNotAllowView}
                updateSource={updateSource}
                showCard={true}
              />
            </div>
          )}
        </Fragment>
      )}

      {tabIndex === 3 && (
        <Fragment>
          {data.flowNodeMap ? (
            <Fragment>
              {SOURCE_HANDLE_LIST.map((item, index) => {
                const sourceData = data.flowNodeMap[item.key] || {};

                return (
                  <Fragment key={index}>
                    <div className={cx('Font13 bold', index === 0 ? 'mTop20' : 'mTop25')}>{item.title}</div>
                    <div className="Font13 textSecondary mTop10">{item.desc}</div>
                    <UpdateFields
                      type={1}
                      companyId={companyId}
                      processId={processId}
                      relationId={props.relationId}
                      selectNodeId={props.selectNodeId}
                      nodeId={sourceData.selectNodeId}
                      controls={sourceData.controls.filter(o => o.type !== 29)}
                      fields={sourceData.fields}
                      showCurrent
                      formulaMap={sourceData.formulaMap}
                      updateSource={(obj, callback = () => {}) =>
                        updateSource(
                          {
                            flowNodeMap: Object.assign({}, data.flowNodeMap, {
                              [item.key]: Object.assign({}, data.flowNodeMap[item.key], obj),
                            }),
                          },
                          callback,
                        )
                      }
                    />
                  </Fragment>
                );
              })}

              <ProcessDetails {...props} />
            </Fragment>
          ) : (
            <div className="mTop20 textSecondary">{_l('节点异常，无法配置')}</div>
          )}
        </Fragment>
      )}
    </Fragment>
  );
};
