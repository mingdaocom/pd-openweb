import React, { memo } from 'react';

const Summary = () => {
  return (
    <div className="flexRow worksheetApiLi" id="summary-content">
      <div className="worksheetApiContent1">
        <div className="Font22 bold">{_l('概述')}</div>
        <div className="Font14 mTop15">
          {_l(
            '本文档提供了一个简单的方法来实现实现应用数据和任何外部数据的集成。API严格遵循REST语义，使用JSON编码对象，并依赖标准HTTP代码来指示操作结果。',
          )}
        </div>
      </div>
      <div className="worksheetApiContent2" />
    </div>
  );
};

export default memo(Summary);
