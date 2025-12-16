import React, { memo, useEffect, useState } from 'react';
import JsonView from 'react-json-view';
import { Empty, Select } from 'antd';
import { Support } from 'ming-ui';

const maskString = (str, startW, endW, middleW) => {
  if (typeof str !== 'string') return '';
  const start = str.slice(0, startW); // 前面保留
  const end = str.slice(-endW); // 后面保留
  const middle = '*'.repeat(middleW); // 中间星号
  return start + middle + end;
};

const formatMcpData = ({ appKey, sign, appName }) => {
  const url = appKey
    ? `${md.global.Config.MCPUrl}?HAP-Appkey=${maskString(appKey, 4, 4, 8)}&HAP-Sign=${maskString(sign, 6, 4, 78)}`
    : `${md.global.Config.MCPUrl}?HAP-Appkey=YOUR_APP_KEY&HAP-Sign=YOUR_SIGN`;

  return { [`hap-mcp-${appName}`]: { url } };
};

const Mcp = ({ authorizes = [] }) => {
  const [appItem, setAppItem] = useState({});

  const handleChange = value => {
    const appItem = authorizes.find(item => item.appKey === value);
    setAppItem(appItem);
  };

  useEffect(() => {
    if (!authorizes.length) {
      setAppItem({});
      return;
    }

    // 如果已有 appKey，则检查它是否在列表中
    const found = appItem?.appKey ? authorizes.find(item => item.appKey === appItem.appKey) : null;

    setAppItem(found || authorizes[0]);
  }, [authorizes]);

  return (
    <div className="flexRow worksheetApiLi" id="mcpServer-content">
      <div className="worksheetApiContent1">
        <div className="Font22 bold">{_l('MCP Server')}</div>
        <div className="mTop24">
          {_l(
            '助力 AI 编程，选择密钥生成 MCP Server 配置，将下方 JSON 配置添加到 IDE 的 MCP 配置文件中，当 API 文档有更新时，Server也会同步更新，提示：必须安装 Node.js 环境（版本号 >= 18.0.0）。',
          )}
          <Support type={3} text={_l('使用帮助')} href="https://help.mingdao.com/ai/mcp/" />
        </div>
        <div className="mTop20 Font17 bold">{_l('应用')}</div>
        <div className="flexRow justifyContentBetween alignItemsCenter mTop10">
          <div>{_l('包含应用、工作表、聚合表、应用角色、选项集 API、工作流')}</div>
          <div className="flexRow alignItemsCenter mLeft30 nowrap flex-shrink-0">
            {_l('选择密钥：')}
            <Select
              value={appItem.appKey}
              style={{ minWidth: 150, maxWidth: 220, fontSize: 13 }}
              notFoundContent={<Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description={_l('请先创建授权密钥')} />}
              onChange={handleChange}
              options={authorizes.map(item => ({ value: item.appKey, label: item.name }))}
            />
          </div>
        </div>
        <div className="worksheetApiContentJsonViewBox mTop15">
          <JsonView
            src={formatMcpData(appItem)}
            theme="brewer"
            displayDataTypes={false}
            displayObjectSize={false}
            name={null}
            enableClipboard={({ namespace = [] }) => {
              let copyData = null;
              const { appKey = 'YOUR_APP_KEY', sign = 'YOUR_SIGN', appName } = appItem;
              let realUrl = `${md.global.Config.MCPUrl}?HAP-Appkey=${appKey}&HAP-Sign=${sign}`;
              switch (namespace.length) {
                case 2:
                  copyData = JSON.stringify({ url: realUrl });
                  break;
                case 3:
                  copyData = realUrl;
                  break;
                default:
                  copyData = JSON.stringify({ [`hap-mcp-${appName}`]: { url: realUrl } });
                  break;
              }
              navigator.clipboard.writeText(copyData);
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default memo(Mcp);
