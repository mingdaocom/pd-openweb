import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { Icon, LoadDiv } from 'ming-ui';
import AIService from 'src/api/aIService';
import { AI_MODEL_MODE } from '../config';
import { getDeveloperInfo } from '../util';
import EditableTable from './EditableTable';

const AITableWrap = styled.div`
  .aiTable {
    .providerCell {
      background-color: var(--color-background-secondary);
      font-weight: 500;
      color: #262626;
      border-right: 1px solid var(--color-border-secondary);
      vertical-align: middle;
      text-align: left;
      width: 20%;

      &:first-child {
        border-left: 1px solid var(--color-border-secondary);
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
      color: var(--color-text-secondary);
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
      background-color: var(--color-background-secondary);
      color: var(--color-text-secondary);
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

  .sectionTitle {
    color: var(--color-text-title);
    margin: 16px 0 8px;
    &:first-child {
      margin-top: 0;
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
      })
      .catch(error => {
        console.error('获取AI定价策略失败:', error);
        setAiModelData([]);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  useEffect(() => {
    getAIPricingPolicyDetail();
  }, []);

  // 按 developer.mode 分组：只保留有 mode 的数据，类型为空的就不显示
  const getDataByMode = () => {
    const base =
      aiModelData?.filter(
        item => item.models && item.models.length > 0 && item.developer?.mode != null && item.developer?.mode !== '',
      ) || [];
    return {
      embedding: base.filter(item => Number(item.developer.mode) === AI_MODEL_MODE.EMBEDDING),
      language: base.filter(item => Number(item.developer.mode) === AI_MODEL_MODE.CHAT),
    };
  };

  const { embedding: embeddingData, language: languageData } = getDataByMode();
  const hasAnyData = embeddingData.length > 0 || languageData.length > 0;

  // 渲染价格单元格
  const renderPriceCell = (developer, model, priceType) => {
    const value = model.price?.[priceType];
    const hasValue = value !== null && value !== undefined;

    if (!hasValue) {
      return <td className="flex4 emptyCell">-</td>;
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

  // 渲染单个类型下的表格
  const renderTable = filteredData => (
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
                  <td className="flex1 providerCell" rowSpan={item.models.length}>
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
  );

  // 整个为空（无任何类型的模型数据）则不显示整块
  if (!loading && !hasAnyData) {
    return null;
  }

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
          <>
            {[
              { title: _l('语言模型'), data: languageData },
              { title: _l('嵌入模型'), data: embeddingData },
            ].map(
              ({ title, data }) =>
                data.length > 0 && (
                  <React.Fragment key={title}>
                    <div className="sectionTitle Font15 Bold">{title}</div>
                    {renderTable(data)}
                  </React.Fragment>
                ),
            )}
          </>
        )}
      </AITableWrap>
    </EditableTable>
  );
};

export default AI;
