import React, { memo } from 'react';

const RequestFormat = () => {
  return (
    <div className="flexRow worksheetApiLi" id="requestFormat-content">
      <div className="worksheetApiContent1">
        <div className="Font22 bold">{_l('请求格式')}</div>
        <div className="Font14 mTop15">{_l('对于 GET 请求，所有参数通过拼接在 URL 之后传递。')}</div>
        <div className="Font14 mTop10">
          {_l(
            '对于 POST 请求，请求的主体必须是 JSON 格式，而且 HTTP header 的 Content-Type 需要设置为 application/json。',
          )}
        </div>
      </div>
      <div className="worksheetApiContent2" />
    </div>
  );
};

export default memo(RequestFormat);
