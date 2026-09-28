import React from 'react';
import { Radio } from 'ming-ui/antd-components';
import { MULTI_SELECT_FILTER_TYPE } from 'src/utils/domain/worksheet/fastFilter';

export default function ShowTypeCom(props) {
  const { updateViewSet, data = {}, advancedSetting = {}, dataType } = props;
  return (
    <React.Fragment>
      <div className="title">{data.txt}</div>
      <Radio.Group
        className="mTop8"
        onChange={e => {
          //  筛选方式默认等于 多选类型的字段
          if (data.key === 'allowitem' && e.target.value === 1 && MULTI_SELECT_FILTER_TYPE.keys.includes(dataType)) {
            updateViewSet({
              [data.key]: e.target.value,
              filterType: MULTI_SELECT_FILTER_TYPE.default,
            });
          } else {
            updateViewSet({ [data.key]: e.target.value });
          }
        }}
        value={safeParse(advancedSetting[data.key]) || data.default}
      >
        {data.types.map(o => {
          return (
            <Radio
              value={o.value}
              // disabled={data.key === 'direction' && Number(advancedSetting.allowitem) === 1 && o.value === 1} // 平铺类型只支持多选
            >
              {o.text}
              {o.txt && <span className="textSecondary">{o.txt}</span>}
            </Radio>
          );
        })}
      </Radio.Group>
    </React.Fragment>
  );
}
