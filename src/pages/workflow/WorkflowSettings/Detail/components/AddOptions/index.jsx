import React, { Fragment } from 'react';
import { Checkbox, Icon } from 'ming-ui';

export default ({ checked, fields, index, updateSource }) => {
  return (
    <Fragment>
      <Checkbox
        checked={checked}
        text={_l('允许新增选项')}
        onClick={checked =>
          updateSource({
            fields: fields.map((o, i) => {
              if (i === index) {
                o.allowAddOptions = !checked;
              }
              return o;
            }),
          })
        }
      />
      <span
        className="mLeft5 Gray_75 workflowDetailTipsWidth tip-bottom-left"
        data-tip={_l('勾选后，如果流程节点对象的值不在备选项中，可以将其自动添加至选项列表')}
      >
        <Icon icon="workflow_help" className="Font16 Gray_9e" style={{ verticalAlign: 'text-top' }} />
      </span>
    </Fragment>
  );
};
