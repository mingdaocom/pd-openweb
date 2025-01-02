import React, { Fragment } from 'react';
import { SelectNodeObject, RefreshFieldData } from '../components';
import _ from 'lodash';

export default ({ data, SelectNodeObjectChange, updateSource }) => {
  return (
    <Fragment>
      <div className="Gray_75 workflowDetailDesc pTop15 pBottom15">
        {_l(
          '即时校准刷新工作表单条记录中的公式计算、他表字段和汇总等延迟同步结果，后续节点可使用校准后的值',
        )}
      </div>

      <div className="Font13 bold mTop20">{_l('选择校准对象')}</div>
      <div className="Font13 Gray_75 mTop10">{_l('当前流程中的节点对象')}</div>

      <SelectNodeObject
        appList={data.flowNodeList}
        selectNodeId={data.selectNodeId}
        selectNodeObj={data.selectNodeObj}
        onChange={SelectNodeObjectChange}
      />

      {data.controls && !!data.controls.length && (
        <RefreshFieldData isSingle controls={data.controls} fields={data.fields} updateSource={updateSource} />
      )}
    </Fragment>
  );
};
