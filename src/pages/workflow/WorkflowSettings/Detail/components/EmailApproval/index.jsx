import React, { Fragment } from 'react';
import { Checkbox, Icon, Tooltip } from 'ming-ui';
import _ from 'lodash';
import SingleControlValue from '../SingleControlValue';
import { NODE_TYPE } from '../../../enum';

export default ({
  companyId,
  processId,
  relationId,
  selectNodeId,
  selectNodeType,
  title,
  desc,
  flowNodeMap,
  updateSource,
  showApprovalBtn = false,
}) => {
  return (
    <Fragment>
      <Checkbox
        className="mTop15 flexRow"
        text={
          <span>
            {title}
            <Tooltip popupPlacement="bottom" text={<span>{desc}</span>}>
              <Icon className="Font16 Gray_9e mLeft5" style={{ verticalAlign: 'text-bottom' }} icon="info" />
            </Tooltip>
          </span>
        }
        checked={!!flowNodeMap.accounts.length}
        onClick={checked =>
          updateSource({
            accounts: !checked
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
      />

      {!!flowNodeMap.accounts.length && (
        <div className="Gray_75 mTop5" style={{ marginLeft: 26 }}>
          {_l('设置为摘要的字段可以邮件中显示')}
        </div>
      )}

      {!!flowNodeMap.accounts.length && (
        <div className="mLeft25 mTop10">
          {showApprovalBtn && (
            <Fragment>
              <Checkbox
                className="flexRow"
                text={_l('邮件内快速审批')}
                checked={flowNodeMap.batch}
                onClick={checked => updateSource({ batch: !checked })}
              />
              <div className="Gray_75 mTop5" style={{ marginLeft: 26 }}>
                {_l(
                  '显示通过、否决、退回按钮（根据操作配置）。在邮件内快速审批时不能填写签名、意见和字段，退回时将直接退回到第一个允许退回的节点',
                )}
              </div>
            </Fragment>
          )}

          <div className="mTop10">{_l('设置附件(总大小不超过50M)')}</div>
          <div className="mTop10">
            <SingleControlValue
              companyId={companyId}
              processId={processId}
              relationId={relationId}
              selectNodeId={selectNodeId}
              controls={flowNodeMap.controls}
              formulaMap={flowNodeMap.formulaMap}
              fields={flowNodeMap.fields}
              updateSource={obj => updateSource(obj)}
              item={flowNodeMap.fields.filter(o => o.fieldId === 'attachments')[0]}
              i={_.findIndex(flowNodeMap.fields, o => o.fieldId === 'attachments')}
            />
          </div>
        </div>
      )}
    </Fragment>
  );
};
