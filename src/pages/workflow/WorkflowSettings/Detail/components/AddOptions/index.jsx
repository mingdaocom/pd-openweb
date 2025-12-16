import React, { Fragment } from 'react';
import { Checkbox, Icon } from 'ming-ui';
import { Tooltip } from 'ming-ui/antd-components';

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
      <Tooltip title={_l('勾选后，如果流程节点对象的值不在备选项中，可以将其自动添加至选项列表')}>
        <Icon icon="help" className="Font16 Gray_9e mLeft5" />
      </Tooltip>
    </Fragment>
  );
};
