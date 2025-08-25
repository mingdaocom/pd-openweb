import React, { Fragment } from 'react';
import { Checkbox } from 'ming-ui';

// 操作设置
export default function EmbedOperate(props) {
  const { data, onChange } = props;
  const { enumDefault2 = 0 } = data;

  return (
    <Fragment>
      <div className="labelWrap">
        <Checkbox
          className="allowSelectRecords "
          size="small"
          text={_l('显示新增记录按钮')}
          checked={enumDefault2 !== 1}
          onClick={checked => {
            onChange({ enumDefault2: checked ? 1 : 0 });
          }}
        />
      </div>
      {/* <div className="labelWrap mTop8 mBottom8">
        <Checkbox
          size="small"
          text={_l('打开记录')}
          checked={allowlink === '1'}
          onClick={checked => onChange(handleAdvancedSettingChange(data, { allowlink: checked ? '0' : '1' }))}
        />
      </div> */}
    </Fragment>
  );
}
