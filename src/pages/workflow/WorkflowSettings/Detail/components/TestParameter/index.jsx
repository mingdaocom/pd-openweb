import React, { useState } from 'react';
import { Dialog, Input } from 'ming-ui';

export default ({
  title = _l('测试数据'),
  onOk = () => {},
  onClose = () => {},
  testArray = [],
  formulaMap = {},
  testMap = {},
}) => {
  const [cacheTestMap, setTestMap] = useState(testMap);

  return (
    <Dialog visible width={720} title={title} onCancel={onClose} onOk={() => onOk(cacheTestMap)}>
      <div className="flexRow alignItemsCenter Height36 Gray_75">
        <div className="Width190 mRight10 ellipsis">{_l('参数名称')}</div>
        <div className="flex">{_l('参数值')}</div>
      </div>
      {testArray.map((key, index) => {
        const [nodeId, controlId] = key
          .replace(/\$/g, '')
          .split(/([a-zA-Z0-9#]{24,32})-/)
          .filter(item => item);

        return (
          <div key={index} className="flexRow alignItemsCenter Height36 mTop10">
            <div className="Width190 mRight10 ellipsis bold">
              {`${formulaMap[nodeId].name}.${formulaMap[controlId].name}`}
            </div>
            <Input
              type="text"
              className="flex"
              placeholder={_l('请输入测试值')}
              value={cacheTestMap[key]}
              onChange={value => setTestMap(Object.assign({}, cacheTestMap, { [key]: value }))}
              onBlur={e => setTestMap(Object.assign({}, cacheTestMap, { [key]: e.target.value.trim() }))}
            />
          </div>
        );
      })}
    </Dialog>
  );
};
