import React, { Fragment } from 'react';
import { Checkbox, Icon, Tooltip } from 'ming-ui';
import _ from 'lodash';
import SingleControlValue from '../SingleControlValue';
import { NODE_TYPE } from '../../../enum';

export default ({
  companyId,
  processId,
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
        <div className="mLeft25 mTop10">
          {showApprovalBtn && (
            <Fragment>
              <Checkbox
                className="flexRow"
                text={_l('邮件内快速审批')}
                checked={flowNodeMap.batch}
                onClick={checked => updateSource({ batch: !checked })}
              />
              <div className="Gray_9e mTop5" style={{ marginLeft: 26 }}>
                {_l('邮件内附带通过、否决按钮，此种快速审批方式不校验必填的签名、意见和字段')}
              </div>
            </Fragment>
          )}

          <div className="mTop10">{_l('设置附件(总大小不超过50M)')}</div>
          <div className="mTop10">
            <SingleControlValue
              companyId={companyId}
              processId={processId}
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
