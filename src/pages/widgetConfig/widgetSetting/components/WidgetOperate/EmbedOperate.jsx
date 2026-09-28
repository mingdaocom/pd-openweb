import React, { Fragment } from 'react';
import { Checkbox } from 'ming-ui/antd-components';

// 操作设置
export default function EmbedOperate(props) {
  const { data, onChange } = props;
  const { enumDefault2 = 0 } = data;

  return (
    <Fragment>
      <div className="labelWrap">
        <Checkbox
          className="allowSelectRecords "
          checked={enumDefault2 !== 1}
          onChange={event => {
            onChange({
              enumDefault2: !event.target.checked ? 1 : 0,
            });
          }}
          size="small"
        >
          {_l('显示新增记录按钮')}
        </Checkbox>
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
