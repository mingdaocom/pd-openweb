import React, { useEffect, useState } from 'react';
import { LoadDiv } from 'ming-ui';
import AIService from 'src/api/aIService';
import { initialFunctionData } from '../config';
import EditableTable from './EditableTable';

const Base = () => {
  const [originalData, setOriginalData] = useState([]);
  const [loading, setLoading] = useState(false);

  //获取基础功能价格
  const getBasePricingPolicy = () => {
    setLoading(true);
    AIService.getBasePricingPolicy({})
      .then(res => {
        setOriginalData(res?.basePricingPolicy?.basicRate || []);
      })
      .catch(error => {
        console.error('获取基础功能定价策略失败:', error);
        setOriginalData([]);
        setLoading(false);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  useEffect(() => {
    getBasePricingPolicy();
  }, []);

  return (
    <EditableTable className="cardWrap flexColumn">
      <div className="flexRow alignItemsCenter justifyContentSpaceBetween">
        <div className="Font17 bold mBottom8 flex">{_l('基础功能')}</div>
      </div>

      {loading ? (
        <div className="flexRow justifyContentCenter alignItemsCenter minHeight200">
          <LoadDiv />
        </div>
      ) : initialFunctionData.length > 0 ? (
        <table className="editableTable">
          <thead>
            <tr className="flexRow">
              <th className="flex1">{_l('功能名称')}</th>
              <th className="flex1">{_l('价格 (信用点/单位)')}</th>
              <th className="flex2">{_l('说明')}</th>
              <th className="flex2">{_l('费用产生的地方')}</th>
            </tr>
          </thead>
          <tbody>
            {initialFunctionData.map(item => {
              const priceData = (originalData || []).find(o => o.type === item.id);
              const priceValue = priceData?.price ?? '';
              const formattedPrice = priceValue !== '' ? `${priceValue} / ${item.unit}` : `-- / ${item.unit}`;
              const description = priceData?.description || item.description || '-';
              const chargeLocation = priceData?.chargeLocation || item.chargeLocation || '-';
              return (
                <tr key={item.id} className="flexRow">
                  <td className="flex1">{item.name}</td>
                  <td className="flex1">
                    <span>{formattedPrice}</span>
                  </td>
                  <td className="flex2">{description}</td>
                  <td className="flex2">{chargeLocation}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      ) : (
        <div className="flexRow justifyContentCenter alignItemsCenter mHeight200 Font14 Gray_9e">
          {_l('暂无基础功能数据')}
        </div>
      )}
    </EditableTable>
  );
};

export default Base;
