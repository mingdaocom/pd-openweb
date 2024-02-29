import React, { Fragment, useState, useEffect } from 'react';
import { Dropdown, Dialog, Icon, Radio, Checkbox } from 'ming-ui';
import { TIME_TYPE, TIME_TYPE_NAME, EXEC_TIME_TYPE, NODE_TYPE, DATE_TYPE } from '../../../enum';
import styled from 'styled-components';
import { v4 as uuidv4 } from 'uuid';
import cx from 'classnames';
import SpecificFieldsValue from '../SpecificFieldsValue';
import Member from '../Member';
import SelectUserDropDown from '../SelectUserDropDown';
import MembersName from '../../../EditFlow/components/MembersName';
import _ from 'lodash';
import Deadline from '../Deadline';

const Button = styled.span`
  border: 1px solid #2196f3;
  padding: 0 16px;
  height: 28px;
  line-height: 28px;
  display: inline-flex;
  border-radius: 28px;
  cursor: pointer;
  align-items: center;
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

const EndBox = styled.div`
  padding: 16px;
  border-radius: 3px 3px 3px 3px;
  border: 1px solid #eaeaea;
`;

const RepeatBox = styled.div`
  height: 36px;
  .actionControlBox {
    min-width: 60px !important;
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
  const TYPE_List = [
    { text: _l('自定义'), value: 1 },
    { text: _l('指定的日期时间'), value: 2 },
  ];
  const UNIT_List = [
    { text: TIME_TYPE_NAME[TIME_TYPE.MINUTE], value: TIME_TYPE.MINUTE },
    { text: TIME_TYPE_NAME[TIME_TYPE.HOUR], value: TIME_TYPE.HOUR },
    { text: TIME_TYPE_NAME[TIME_TYPE.DAY], value: TIME_TYPE.DAY },
  ];
  const FREQUENCY_TYPE = [
    { text: _l('分钟'), value: DATE_TYPE.MINUTE },
    { text: _l('小时'), value: DATE_TYPE.HOUR },
    { text: _l('天'), value: DATE_TYPE.DAY },
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
          roleId: selectNodeType === NODE_TYPE.WRITE ? 'editid' : 'approveidNull',
          roleName: selectNodeType === NODE_TYPE.WRITE ? _l('所有填写人') : _l('未审的审批人'),
          roleTypeId: 0,
          type: 6,
        },
      ],
      executeTime: { fieldValue: '2' },
      executeTimeType: EXEC_TIME_TYPE.BEFORE,
      id: uuidv4(),
      message: _l('请您尽快处理！'),
      type: 1,
      unit: 2,
      repeat: {
        repeatType: 0,
      },
    };
  };
  const EXECUTE_TIME_TYPE_LIST = [
    { text: _l('之前'), value: EXEC_TIME_TYPE.BEFORE },
    { text: _l('当时'), value: EXEC_TIME_TYPE.CURRENT },
    { text: _l('之后'), value: EXEC_TIME_TYPE.AFTER },
  ];
  const OVERDUE_OPTIONS = [
    { text: selectNodeType === NODE_TYPE.WRITE ? _l('自动提交') : _l('自动通过'), value: 2 },
    { text: _l('自动否决'), value: 3 },
    { text: _l('流程中止'), value: 4 },
    { text: _l('什么也不做'), value: 0 },
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
      <div className="mTop10 flexRow alignItemsCenter">
        <div>{_l('在截止时刻')}</div>
        <Dropdown
          className={cx('mLeft10', { flex: item.executeTimeType === EXEC_TIME_TYPE.CURRENT && !autoPass })}
          style={{ width: item.executeTimeType === EXEC_TIME_TYPE.CURRENT && !autoPass ? 'auto' : 110 }}
          data={EXECUTE_TIME_TYPE_LIST.filter(o => o.value !== EXEC_TIME_TYPE.BEFORE || !autoPass)}
          value={item.executeTimeType}
          border
          onChange={executeTimeType => {
            changeAction(item.id, {
              executeTimeType,
              executeTime: { fieldValue: executeTimeType === EXEC_TIME_TYPE.CURRENT ? '' : '2' },
              unit: executeTimeType === EXEC_TIME_TYPE.CURRENT ? undefined : 2,
              repeat: { repeatType: 0 },
            });
          }}
        />
        {item.executeTimeType !== EXEC_TIME_TYPE.CURRENT && (
          <Fragment>
            <div className="flex mLeft10">
              <SpecificFieldsValue
                projectId={companyId}
                processId={processId}
                relationId={relationId}
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
              style={{ width: 110 }}
              data={UNIT_List}
              value={item.unit}
              border
              onChange={unit => {
                changeAction(item.id, { unit, repeat: Object.assign({}, item.repeat, resetRepeatParameter(unit)) });
              }}
            />
          </Fragment>
        )}
        {autoPass && (
          <div className="mLeft10">
            {item.type === 3
              ? _l('自动否决')
              : item.type === 4
              ? _l('流程中止')
              : selectNodeType === NODE_TYPE.WRITE
              ? _l('自动提交')
              : _l('自动通过')}
          </div>
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
              {_.get(item, 'repeat.repeatType') === 6 &&
                _l(
                  '；每%0%1重复提醒',
                  item.repeat.interval,
                  FREQUENCY_TYPE.find(o => o.value === item.repeat.frequency).text,
                )}
            </span>
          </Fragment>
        ) : (
          <span className="mLeft3 Gray_9e">
            {item.type === 3
              ? _l('自动否决')
              : item.type === 4
              ? _l('流程中止')
              : selectNodeType === NODE_TYPE.WRITE
              ? _l('自动提交')
              : _l('自动通过')}
          </span>
        )}
      </div>
    );
  };
  const resetRepeatParameter = unit => {
    return {
      frequency:
        unit === TIME_TYPE.MINUTE ? DATE_TYPE.MINUTE : unit === TIME_TYPE.HOUR ? DATE_TYPE.HOUR : DATE_TYPE.DAY,
      interval: unit === TIME_TYPE.MINUTE ? 30 : 1,
    };
  };

  useEffect(() => {
    changeData(schedule);
  }, [schedule]);

  useEffect(() => {
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
  }, [schedule.enable]);

  if (!schedule.enable) return null;

  return (
    <Fragment>
      {schedule.type && (
        <Box>
          <Icon icon="edit" className="Gray_9e ThemeHoverColor3 pointer" onClick={() => showDialog(true)} />
          <div className="bold">{_l('截止：到达此节点后的%0', getHeaderText())}</div>
          {schedule.actions.filter(o => o.type === 1).map(renderRemindContent)}
          {schedule.actions.filter(o => _.includes([2, 3, 4], o.type)).map(renderRemindContent)}
        </Box>
      )}

      {isShowDialog && (
        <Dialog
          className="workflowDialogBox"
          visible
          width={800}
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
          <div className="bold mTop10">{_l('截止时刻')}</div>
          <div className="mTop10">
            <Dropdown
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
            projectId={companyId}
            processId={processId}
            relationId={relationId}
            selectNodeId={selectNodeId}
            data={data}
            text={_l('到达此节点后的')}
            onChange={changeData}
          />

          <div className="mTop25 bold">{_l('截止提醒')}</div>
          {data.actions
            .filter(o => o.type === 1)
            .map((item, index) => {
              return (
                <EndBox className="mTop10" key={item.id}>
                  <div className="flexRow">
                    <div className="flex bold Gray_75">{_l('提醒%0', index + 1)}</div>
                    <Icon
                      type="delete2"
                      className="Font16 Gray_9e ThemeHoverColor3 mLeft10 pointer"
                      onClick={() => {
                        const actions = [].concat(data.actions);

                        _.remove(actions, o => o.id === item.id);
                        changeData(Object.assign({}, data, { actions }));
                      }}
                    />
                  </div>
                  {renderDeadlineContent(item)}

                  {item.executeTimeType === EXEC_TIME_TYPE.BEFORE && (
                    <RepeatBox className="mTop10 flexRow alignItemsCenter">
                      <Checkbox
                        className="InlineBlock"
                        text={_l('重复提醒')}
                        checked={_.get(item, 'repeat.repeatType') === 6}
                        onClick={checked => {
                          const repeat = {
                            repeatType: checked ? 0 : 6,
                            ...resetRepeatParameter(item.unit),
                          };

                          changeAction(item.id, { repeat });
                        }}
                      />
                      {_.get(item, 'repeat.repeatType') === 6 && (
                        <Fragment>
                          <div className="mLeft25 mRight10">{_l('每')}</div>
                          <div className="flexRow" style={{ width: 80 }}>
                            <SpecificFieldsValue
                              hasOtherField={false}
                              type="number"
                              min={1}
                              data={{ fieldValue: item.repeat.interval }}
                              updateSource={({ fieldValue }) =>
                                changeAction(item.id, {
                                  repeat: Object.assign({}, item.repeat, { interval: fieldValue }),
                                })
                              }
                            />
                          </div>
                          <Dropdown
                            className="mLeft10"
                            style={{ width: 80 }}
                            data={FREQUENCY_TYPE.filter(
                              o =>
                                (item.unit === TIME_TYPE.MINUTE && o.value === DATE_TYPE.MINUTE) ||
                                (item.unit === TIME_TYPE.HOUR &&
                                  _.includes([DATE_TYPE.MINUTE, DATE_TYPE.HOUR], o.value)) ||
                                item.unit === TIME_TYPE.DAY,
                            )}
                            value={item.repeat.frequency}
                            border
                            onChange={frequency =>
                              changeAction(item.id, {
                                repeat: Object.assign({}, item.repeat, {
                                  interval: _.includes([1, 7], frequency) ? 1 : 30,
                                  frequency,
                                }),
                              })
                            }
                          />
                          <div className="mLeft25">{_l('最多重复10次')}</div>
                        </Fragment>
                      )}
                    </RepeatBox>
                  )}

                  <div className="mTop10 flexRow alignItemsCenter">
                    <div>{_l('提醒内容')}</div>
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

                  <div className="flexRow">
                    <div className="pTop16">{_l('提醒人')}</div>
                    <div className="flex mLeft10">
                      <Member
                        companyId={companyId}
                        appId={relationType === 2 ? relationId : ''}
                        accounts={item.accounts}
                        updateSource={accounts => changeAction(item.id, accounts)}
                      />
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
                    </div>
                  </div>
                </EndBox>
              );
            })}

          <div className="mTop15">
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

          <div className="mTop25 bold">{_l('超期后')}</div>

          <div className="flexRow mTop10">
            {OVERDUE_OPTIONS.filter(item => selectNodeType !== NODE_TYPE.WRITE || item.value !== 3).map(
              (item, index) => (
                <Radio
                  key={index}
                  text={item.text}
                  checked={(data.actions.find(o => _.includes([2, 3, 4], o.type)) || { type: 0 }).type === item.value}
                  onClick={() => {
                    changeData(
                      Object.assign({}, data, {
                        actions: item.value
                          ? data.actions
                              .filter(o => o.type === 1)
                              .concat([
                                {
                                  executeTime: {},
                                  executeTimeType: EXEC_TIME_TYPE.CURRENT,
                                  id: uuidv4(),
                                  type: item.value,
                                },
                              ])
                          : data.actions.filter(o => o.type === 1),
                      }),
                    );
                  }}
                />
              ),
            )}
          </div>
          {data.actions.filter(o => _.includes([2, 3, 4], o.type)).map(item => renderDeadlineContent(item, true))}
        </Dialog>
      )}
    </Fragment>
  );
};
