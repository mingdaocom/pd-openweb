import React, { Fragment } from 'react';
import _ from 'lodash';
import { Icon, PriceTip } from 'ming-ui';
import { Checkbox, Switch, Tooltip } from 'ming-ui/antd-components';
import { NODE_TYPE } from '../../../enum';
import SingleControlValue from '../SingleControlValue';

export default ({
  companyId,
  processId,
  relationId,
  selectNodeId,
  selectNodeType,
  title,
  flowNodeMap,
  updateSource,
  showApprovalBtn = false,
}) => {
  const EMAIL_FIELDS = [
    { key: 'sender_name', text: _l('发件人名称') },
    { key: 'attachments', text: _l('设置附件(总大小不超过50M)') },
  ];

  return (
    <Fragment>
      <Checkbox
        className="mTop15 flexRow"
        checked={!!flowNodeMap.accounts.length}
        onChange={event =>
          updateSource({
            accounts: event.target.checked
              ? [
                  {
                    type: 6,
                    entityId: `${selectNodeId}#custom`,
                    roleId: selectNodeType === NODE_TYPE.APPROVAL ? 'approveid' : 'editid',
                    roleTypeId: 0,
                    controlType: 10000001,
                    flowNodeType: selectNodeType,
                    appType: 101,
                  },
                ]
              : [],
          })
        }
      >
        {
          <span>
            {title}
            <Tooltip
              title={
                <PriceTip
                  text={_l('启用后，待办消息同时会以邮件的形式发送给相关负责人。邮件费用自动从组织信用点中扣除')}
                />
              }
            >
              <Icon className="Font16 textTertiary mLeft5" style={{ verticalAlign: 'text-bottom' }} icon="info" />
            </Tooltip>
          </span>
        }
      </Checkbox>

      {!!flowNodeMap.accounts.length && (
        <Fragment>
          <div className="mLeft26">
            <div className="Font13 textSecondary mTop5">{_l('设置为摘要的字段可以邮件中显示')}</div>

            {EMAIL_FIELDS.map(item => {
              return (
                <Fragment key={item.key}>
                  <div className="mTop10">{item.text}</div>
                  <SingleControlValue
                    companyId={companyId}
                    processId={processId}
                    relationId={relationId}
                    selectNodeId={selectNodeId}
                    controls={flowNodeMap.controls}
                    formulaMap={flowNodeMap.formulaMap}
                    fields={flowNodeMap.fields}
                    updateSource={updateSource}
                    item={flowNodeMap.fields.filter(o => o.fieldId === item.key)[0]}
                    i={_.findIndex(flowNodeMap.fields, o => o.fieldId === item.key)}
                  />
                </Fragment>
              );
            })}

            {showApprovalBtn && (
              <Fragment>
                <div className="flexRow mTop15 alignItemsCenter">
                  <Checkbox
                    className="flexRow flex"
                    checked={flowNodeMap.batch}
                    onChange={event =>
                      updateSource({
                        batch: event.target.checked,
                        ...(!event.target.checked
                          ? {
                              encrypt: false,
                            }
                          : {}),
                      })
                    }
                  >
                    {_l('邮件内快速审批')}
                  </Checkbox>
                  {!!flowNodeMap.batch && (
                    <div className="flexRow alignItemsCenter mLeft20">
                      <Switch
                        size="small"
                        checked={!!flowNodeMap.encrypt}
                        onChange={checked => updateSource({ encrypt: checked })}
                      />
                      <span className="mLeft8">{_l('校验登录身份')}</span>
                      <Tooltip
                        title={_l(
                          '开启后，点击邮件中的审批按钮时，需先登录并校验当前账号是否为该审批的可操作人，校验通过后才可完成审批操作',
                        )}
                      >
                        <Icon
                          className="Font16 textTertiary mLeft5"
                          style={{ verticalAlign: 'text-bottom' }}
                          icon="info"
                        />
                      </Tooltip>
                    </div>
                  )}
                </div>
                <div className="Font13 textSecondary mTop5 mLeft26">
                  {_l(
                    '显示通过、否决、退回按钮（根据操作配置）。在邮件内快速审批时不能填写签名、意见和字段，退回时将直接退回到第一个允许退回的节点',
                  )}
                </div>
              </Fragment>
            )}
          </div>
        </Fragment>
      )}
    </Fragment>
  );
};
