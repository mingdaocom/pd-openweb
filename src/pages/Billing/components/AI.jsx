import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { Icon, LoadDiv } from 'ming-ui';
import AIService from 'src/api/aIService';
import { getDeveloperInfo } from '../util';
import EditableTable from './EditableTable';

const AITableWrap = styled.div`
  .aiTable {
    .providerCell {
      background-color: #fafafa;
      font-weight: 500;
      color: #262626;
      border-right: 1px solid #e0e0e0;
      vertical-align: middle;
      text-align: left;
      width: 20%;

      &:first-child {
        border-left: 1px solid #e0e0e0;
      }
    }

    .providerName {
      display: flex;
      flex-direction: column;
      align-items: flex-start;
      justify-content: center;
      min-height: 100%;
    }

    .providerSubtext {
      font-size: 12px;
      color: #8c8c8c;
      margin-top: 4px;
    }

    .modelCell {
      width: 15%;
    }

    .priceCell {
      width: 17%;
      text-align: left;
    }

    .emptyCell {
      background-color: #f5f5f5;
      color: #8c8c8c;
      text-align: center;
    }

    // 覆盖 flexRow 在表格行上的影响
    tr.flexRow {
      display: table-row;
    }

    // 确保 flex 类在表格单元格中正确工作
    td.flex1 {
      width: 20%;
    }

    td.flex4 {
      width: 60%;
    }
  }
`;

const AI = () => {
  const [aiModelData, setAiModelData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [useMillionUnit, setUseMillionUnit] = useState(false);

  // 获取vendor名称和描述
  const getVendorInfo = developer => {
    if (!developer || !developer.type) {
      return { name: _l('未命名'), description: '' };
    }

    // 对于自定义开发商(type 100)，使用developer的name
    if (developer.type === 100) {
      return {
        name: developer.name || _l('未命名'),
        description: developer.remark || '',
      };
    }

    // 对于其他开发商，使用getDeveloperInfo获取名称
    const developerInfo = getDeveloperInfo(developer.type);
    return {
      name: developerInfo.name,
      description: developer.remark || '',
    };
  };

  const getAIPricingPolicyDetail = () => {
    setLoading(true);
    AIService.getAIPricingPolicyDetail({})
      .then(res => {
        setAiModelData(res?.aiPricingPolicy?.modelRate || []);
        setLoading(false);
      })
      .catch(error => {
        console.error('获取AI定价策略失败:', error);
        setAiModelData([]);
        setLoading(false);
      });
  };

  useEffect(() => {
    getAIPricingPolicyDetail();
  }, []);

  // 计算每个开发商的行数
  const getProviderRowSpan = item => item.models.length;

  // 渲染价格单元格
  const renderPriceCell = (developer, model, priceType) => {
    const value = model.price?.[priceType];
    const hasValue = value !== null && value !== undefined;

    if (!hasValue) {
      return <td className="emptyCell">-</td>;
    }

    // 根据 useMillionUnit 进行显示转换
    const getDisplayValue = () => {
      if (!value || value <= 0) return '0';
      const numValue = parseFloat(value);
      if (isNaN(numValue)) return '0';

      if (useMillionUnit) {
        return parseFloat((numValue * 1000).toFixed(5));
      }
      return value;
    };

    const displayValue = getDisplayValue();

    return (
      <td className="flex4 priceCell">
        <span>{displayValue}</span>
      </td>
    );
  };

  return (
    <EditableTable className="cardWrap flexColumn">
      <AITableWrap>
        <div className="flexRow alignItemsCenter justifyContentSpaceBetween">
          <div className="flex">
            <div className="Font17 bold mBottom8">{_l('AI模型价格表')}</div>
          </div>
          <div>
            <span
              className="Font13 ThemeColor3 Hand InlineFlex alignItemsCenter mTop8"
              onClick={() => setUseMillionUnit(prev => !prev)}
            >
              <Icon icon="sync1" />
              <span className="InlineBlock mLeft4">{!useMillionUnit ? _l('百万 tokens') : _l('千 tokens')}</span>
            </span>
          </div>
        </div>

        {loading ? (
          <div className="flexRow justifyContentCenter alignItemsCenter minHeight200">
            <LoadDiv />
          </div>
        ) : (
          (() => {
            const filteredData = aiModelData?.filter(item => item.models && item.models.length > 0) || [];
            return filteredData.length > 0 ? (
              <table className="editableTable aiTable">
                <thead>
                  <tr>
                    <th className="flex1">{_l('开发商')}</th>
                    <th className="flex1">{_l('模型名称')}</th>
                    <th className="flex4">
                      {useMillionUnit ? _l('价格 (信用点 / 百万 tokens)') : _l('价格 (信用点 / 千 tokens)')}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredData?.map(item =>
                    item.models.map((model, modelIndex) => {
                      const vendorInfo = getVendorInfo(item.developer);
                      return (
                        <tr key={`${item.developer.id}-${model.id}`}>
                          {modelIndex === 0 && (
                            <td className="flex1 providerCell" rowSpan={getProviderRowSpan(item)}>
                              <div className="providerName">
                                <div className="Font14 FontWeight400 WordBreak">{vendorInfo.name}</div>
                                {vendorInfo.description && (
                                  <div className="providerSubtext WordBreak">{vendorInfo.description}</div>
                                )}
                              </div>
                            </td>
                          )}
                          <td className="flex1 WordBreak">{model.alias || model.name}</td>
                          {renderPriceCell(item.developer, model, 'outputToken')}
                        </tr>
                      );
                    }),
                  )}
                </tbody>
              </table>
            ) : (
              <div className="flexRow justifyContentCenter alignItemsCenter mHeight200 Font14 Gray_9e">
                {_l('暂无AI模型数据')}
              </div>
            );
          })()
        )}
      </AITableWrap>
    </EditableTable>
  );
};

export default AI;
