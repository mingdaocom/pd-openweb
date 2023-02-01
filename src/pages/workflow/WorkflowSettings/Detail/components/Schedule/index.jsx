import React, { Fragment, useState, useEffect } from 'react';
import { Dropdown, Dialog, Icon } from 'ming-ui';
import { TIME_TYPE, TIME_TYPE_NAME, EXEC_TIME_TYPE, NODE_TYPE } from '../../../enum';
import styled from 'styled-components';
import { v4 as uuidv4 } from 'uuid';
import { Switch } from 'antd';
import cx from 'classnames';
import SpecificFieldsValue from '../SpecificFieldsValue';
import Member from '../Member';
import SelectUserDropDown from '../SelectUserDropDown';
import MembersName from '../../../EditFlow/components/MembersName';
import _ from 'lodash';
import Deadline from '../Deadline';

const Button = styled.span`
  border: 1px solid #2196f3;
  padding: 0 24px;
  height: 36px;
  line-height: 36px;
  display: inline-block;
  border-radius: 36px;
  cursor: pointer;
`;

const Box = styled.div`
  background: #f4f4f4;
  padding: 10px 12px;
  margin-top: 10px;
  border-radius: 4px;
  position: relative;
  .icon {
    position: absolute;
    top: 10px;
    right: 10px;
  }
`;

export default ({
  schedule,
  companyId,
  processId,
  selectNodeId,
  selectNodeName,
  selectNodeType,
  relationType,
  relationId,
  updateSource,
}) => {
  const [data, changeData] = useState(schedule);
  const [isShowDialog, showDialog] = useState(false);
  const [userDialogState, showUserDialog] = useState({});
  const TYPE_List = [{ text: _l('自定义'), value: 1 }, { text: _l('指定的日期时间'), value: 2 }];
  const UNIT_List = [
    { text: TIME_TYPE_NAME[TIME_TYPE.MINUTE], value: TIME_TYPE.MINUTE },
    { text: TIME_TYPE_NAME[TIME_TYPE.HOUR], value: TIME_TYPE.HOUR },
    { text: TIME_TYPE_NAME[TIME_TYPE.DAY], value: TIME_TYPE.DAY },
  ];
  const getDefaultAction = () => {
    return {
      accounts: [
        {
          appType: 101,
          avatar: '',
          controlType: 10000001,
          count: 0,
          entityId: `${selectNodeId}#custom`,
          entityName: selectNodeName,
          flowNodeType: selectNodeType,
          roleId: selectNodeType === NODE_TYPE.WRITE ? 'editid' : 'approveid',
          roleName: selectNodeType === NODE_TYPE.WRITE ? _l('填写人') : _l('审批人'),
          roleTypeId: 0,
          type: 6,
        },
      ],
      executeTime: { fieldValue: '2' },
      executeTimeType: 1,
      id: uuidv4(),
      message: _l('请您尽快处理！'),
      type: 1,
      unit: 2,
    };
  };
  const EXECUTE_TIME_TYPE_LIST = [
    { text: _l('之前'), value: EXEC_TIME_TYPE.BEFORE },
    { text: _l('当时'), value: EXEC_TIME_TYPE.CURRENT },
    { text: _l('之后'), value: EXEC_TIME_TYPE.AFTER },
  ];
  const changeAction = (id, obj) => {
    const newActions = [].concat(data.actions);

    newActions.forEach(item => {
      if (item.id === id) {
        Object.keys(obj).forEach(key => {
          item[key] = obj[key];
        });
      }
    });

    changeData(Object.assign({}, data, { actions: newActions }));
  };
  const renderDeadlineContent = (item, autoPass) => {
    return (
      <div className="mTop15 flexRow alignItemsCenter">
        <div>{_l('在截止时刻')}</div>
        <Dropdown
          className={cx('mLeft10', { flex: item.executeTimeType === 0 && !autoPass })}
          style={{ width: item.executeTimeType === 0 && !autoPass ? 'auto' : 100 }}
          data={EXECUTE_TIME_TYPE_LIST.filter(o => o.value !== EXEC_TIME_TYPE.BEFORE || !autoPass)}
          value={item.executeTimeType}
          border
          onChange={executeTimeType => {
            changeAction(item.id, {
              executeTimeType,
              executeTime: { fieldValue: executeTimeType === 0 ? '' : '2' },
              unit: executeTimeType === 0 ? undefined : 2,
            });
          }}
        />
        {item.executeTimeType !== 0 && (
          <Fragment>
            <div className="flex mLeft10">
              <SpecificFieldsValue
                processId={processId}
                selectNodeId={selectNodeId}
                type="number"
                min={1}
                allowedEmpty
                data={item.executeTime}
                updateSource={executeTime => changeAction(item.id, { executeTime })}
              />
            </div>
            <Dropdown
              className="mLeft10"
              style={{ width: 100 }}
              data={UNIT_List}
              value={item.unit}
              border
              onChange={unit => changeAction(item.id, { unit })}
            />
          </Fragment>
        )}
        {!autoPass ? (
          <Icon
            type="delete2"
            className="Font16 Gray_9e ThemeHoverColor3 mLeft10 pointer"
            onClick={() => {
              const actions = [].concat(data.actions);

              _.remove(actions, o => o.id === item.id);
              changeData(Object.assign({}, data, { actions }));
            }}
          />
        ) : (
          <div className="mLeft10">{selectNodeType === NODE_TYPE.WRITE ? _l('自动提交') : _l('自动通过')}</div>
        )}
      </div>
    );
  };
  const getHeaderText = () => {
    return (
      (schedule.executeTime.fieldValue ||
        (schedule.executeTime.fieldNodeName || '') + '-' + (schedule.executeTime.fieldControlName || '')) +
      (schedule.type === 1 ? TIME_TYPE_NAME[schedule.unit] : '') +
      (schedule.dayTime ? _l('的%0', schedule.dayTime) : '')
    );
  };
  const renderRemindContent = (item, index) => {
    return (
      <div className={index === 0 ? 'mTop8' : 'mTop3'} key={item.id}>
        <span className="Gray_9e">{_l('在截止时刻')}</span>
        <span className="mLeft3">{EXECUTE_TIME_TYPE_LIST.find(o => o.value === item.executeTimeType).text}</span>
        {item.unit && item.unit !== EXEC_TIME_TYPE.CURRENT && (
          <span className="Gray_9e mLeft3">{item.executeTime.fieldValue + TIME_TYPE_NAME[item.unit]}</span>
        )}
        {item.type === 1 ? (
          <Fragment>
            <span className="mLeft3 mRight2">{_l('提醒')}</span>
            <span className="Gray_9e">
              <MembersName accounts={item.accounts} />
            </span>
          </Fragment>
        ) : (
          <span className="mLeft3 Gray_9e">{selectNodeType === NODE_TYPE.WRITE ? _l('自动提交') : _l('自动通过')}</span>
        )}
      </div>
    );
  };

  useEffect(
    () => {
      changeData(schedule);
    },
    [schedule],
  );

  useEffect(
    () => {
      if (!schedule.type) {
        changeData(
          Object.assign({}, data, {
            type: 1,
            unit: 3,
            executeTime: { fieldValue: '1' },
            actions: [getDefaultAction()],
          }),
        );
        showDialog(true);
      }
    },
    [schedule.enable],
  );

  if (!schedule.enable) return null;

  return (
    <Fragment>
      {schedule.type && (
        <Box>
          <Icon icon="edit" className="Gray_9e ThemeHoverColor3 pointer" onClick={() => showDialog(true)} />
          <div className="bold">{_l('截止：到达此节点后的%0', getHeaderText())}</div>
          {schedule.actions.filter(o => o.type === 1).map(renderRemindContent)}
          {schedule.actions.filter(o => o.type === 2).map(renderRemindContent)}
        </Box>
      )}

      {isShowDialog && (
        <Dialog
          className="workflowDialogBox"
          visible
          width={640}
          title={_l('限时处理')}
          onCancel={() => {
            if (schedule.type) {
              changeData(schedule);
            } else {
              updateSource({ schedule: Object.assign({}, schedule, { enable: false }) });
            }
            showDialog(false);
          }}
          onOk={() => {
            const accountNullIndex = [];

            data.actions
              .filter(o => o.type === 1)
              .forEach((item, index) => {
                if (!item.accounts.length) {
                  accountNullIndex.push(index + 1);
                }
              });

            if (!!accountNullIndex.length) {
              alert(_l('第%0条截止提醒规则的提醒人为空！', accountNullIndex.join('、')), 2);
            } else {
              updateSource({ schedule: Object.assign({}, data, { enable: true }) });
              showDialog(false);
            }
          }}
        >
          <div className="flexRow alignItemsCenter">
            <div>{_l('截止时刻是')}</div>
            <Dropdown
              className="mLeft10"
              style={{ width: 240 }}
              data={TYPE_List}
              value={data.type}
              border
              onChange={type => {
                changeData(
                  Object.assign({}, data, {
                    type,
                    executeTime: { fieldValue: type === 1 ? '1' : '' },
                    unit: type === 1 ? 3 : undefined,
                  }),
                );
              }}
            />
          </div>

          <Deadline
            processId={processId}
            selectNodeId={selectNodeId}
            data={data}
            text={_l('到达此节点后的')}
            onChange={changeData}
          />

          <div className="mTop25 flexRow alignItemsCenter">
            <div className="bold">{_l('截止提醒')}</div>
            <Switch
              className="mLeft10"
              size="small"
              checked={!!data.actions.filter(o => o.type === 1).length}
              onChange={checked =>
                changeData(
                  Object.assign({}, data, {
                    actions: checked
                      ? data.actions.concat([getDefaultAction()])
                      : data.actions.filter(o => o.type === 2),
                  }),
                )
              }
            />
          </div>
          <div className="mTop10 Gray_9e">{_l('设置提醒规则，在停留时间到达某时刻时提醒相关人员查看')}</div>

          {data.actions
            .filter(o => o.type === 1)
            .map((item, index) => {
              return (
                <Fragment key={item.id}>
                  {renderDeadlineContent(item)}
                  <Member accounts={item.accounts} updateSource={accounts => changeAction(item.id, accounts)} />
                  <div
                    className="flexRow ThemeColor3 workflowDetailAddBtn mTop15"
                    onClick={() => showUserDialog(Object.assign({}, userDialogState, { [item.id]: true }))}
                  >
                    <i className="Font28 icon-task-add-member-circle mRight10" />
                    {_l('添加提醒人')}
                    <SelectUserDropDown
                      appId={relationType === 2 ? relationId : ''}
                      visible={userDialogState[item.id]}
                      companyId={companyId}
                      processId={processId}
                      nodeId={selectNodeId}
                      unique={false}
                      schedule={true}
                      accounts={item.accounts}
                      updateSource={accounts => changeAction(item.id, accounts)}
                      onClose={() => showUserDialog(Object.assign({}, userDialogState, { [item.id]: false }))}
                    />
                  </div>

                  <div className="mTop15 flexRow alignItemsCenter">
                    <div>{_l('通知内容')}</div>
                    <input
                      type="text"
                      className="mLeft10 flex ThemeBorderColor3 actionControlBox pLeft10 pRight10"
                      value={item.message}
                      onChange={evt => changeAction(item.id, { message: evt.target.value })}
                      onBlur={evt => {
                        if (!evt.target.value.trim()) {
                          evt.target.value = _l('请您尽快处理！');
                        }

                        changeAction(item.id, { message: evt.target.value.trim() });
                      }}
                    />
                  </div>

                  {index !== data.actions.length - 1 && (
                    <div className="mTop20 mBottom20" style={{ backgroundColor: '#ddd', height: 1 }} />
                  )}
                </Fragment>
              );
            })}

          <div className="mTop25">
            <Button
              className="ThemeColor3 ThemeHoverColor2 ThemeBorderColor3 ThemeHoverBorderColor2"
              onClick={() =>
                changeData(
                  Object.assign({}, data, {
                    actions: data.actions.concat([getDefaultAction()]),
                  }),
                )
              }
            >
              + {_l('提醒')}
            </Button>
          </div>

          <div className="mTop25 flexRow alignItemsCenter">
            <div className="bold">{selectNodeType === NODE_TYPE.WRITE ? _l('自动提交') : _l('自动通过')}</div>
            <Switch
              className="mLeft10"
              size="small"
              checked={!!data.actions.filter(o => o.type === 2).length}
              onChange={checked =>
                changeData(
                  Object.assign({}, data, {
                    actions: checked
                      ? data.actions.concat([
                          {
                            executeTime: {},
                            executeTimeType: 0,
                            id: uuidv4(),
                            type: 2,
                          },
                        ])
                      : data.actions.filter(o => o.type === 1),
                  }),
                )
              }
            />
          </div>
          <div className="mTop10 Gray_9e">
            {selectNodeType === NODE_TYPE.WRITE
              ? _l('设置自动提交规则，当节点超时后进行自动提交')
              : _l('设置自动通过规则，当节点超时后进行自动通过')}
          </div>
          {data.actions.filter(o => o.type === 2).map(item => renderDeadlineContent(item, true))}
        </Dialog>
      )}
    </Fragment>
  );
};
