import React from 'react';
import { filterData } from 'src/pages/FormSet/components/columnRules/config.js';
import { redefineComplexControl } from 'src/pages/worksheet/common/WorkSheetFilter/util';
import { isEmpty } from 'lodash';
import styled from 'styled-components';
import { getAdvanceSetting } from '../../../util/setting';
import './filterDialog.less';
import './filterText.less';

const FilterTextWrap = styled.div`
  width: 100%;
  border: 1px solid #dddddd;
  border-radius: 3px;
  padding: 0 12px 6px 12px;
  box-sizing: border-box;
  color: #333;
  margin: 10px 0;
  display: flex;
  cursor: pointer;
  &:hover {
    background: #f5f5f5;
    border-color: #d8d8d8;
    .editFilter {
      color: #2196f3;
    }
  }

  .txtFilter {
    flex: 1;
    font-size: 13px;
    color: #333;
    line-height: 20px;

    p {
      line-height: 22px;
      padding: 0;
      margin: 0;
      display: flex;

      .titleTxt {
        width: 100px;
        font-size: 13px;
        line-height: 22px;
        display: inline-block;
      }

      .txt {
        flex: 1;
        font-weight: 500;
        font-size: 13px;
      }
    }
  }

  .flexBox {
    line-height: 22px;
  }

  .editFilter {
    color: #9e9e9e;
    font-size: 15px;
    padding-top: 5px;
  }

  .editWorkflow {
    width: auto;
    color: #2196f3;
  }
`;

export default class FilterItemTexts extends React.Component {
  render() {
    let { data, allControls, controls, editFn, loading = true, globalSheetControls = [] } = this.props;
    const filters = getAdvanceSetting(data, 'filters');
    if (isEmpty(filters)) return null;
    const { sourceControlId } = data;
    const filterItemTexts = filterData(
      allControls.concat(globalSheetControls),
      filters,
      true,
      controls.map(redefineComplexControl), // 日期公式等需转换type匹配
      sourceControlId,
    );
    return (
      <FilterTextWrap
        onClick={() => {
          editFn();
        }}
      >
        <div className="txtFilter fieldEditTxtFilter">
          {filterItemTexts.length > 0 ? (
            filterItemTexts.map((item, index) => (
              <div key={item.id} className="pRight10 mTop6 flexBox">
                {index ? (
                  <span className="mRight10 Gray_75 Font13">
                    {filterItemTexts[index - 1] && filterItemTexts[index - 1].spliceType == 1 ? _l('且') : _l('或')}
                  </span>
                ) : null}
                <span className="mRight10">{item.name}</span>
                {item.type ? <span className="Bold LineHeight19 mRight10 Gray Font13">{item.type.text}</span> : null}
                {item.value && item.value.type === 'dynamicSource' ? (
                  item.value.data.map(it => {
                    if (!it.name) {
                      return <span className="isWrong dynamicsourceSpan">{_l('该字段已删除')}</span>;
                    }
                    return (
                      <span className="dynamicsourceSpan">
                        {it.name}
                        {it.id !== 'current-rowid' && <i>{!it.rName ? _l('当前记录') : it.rName}</i>}
                      </span>
                    );
                  })
                ) : (
                  <span className="WordBreak flexItem">{item.value}</span>
                )}
              </div>
            ))
          ) : (
            <div className="flexRow pRight10 mTop5">
              <span className="mRight10 Gray_9e">{loading ? _l('数据加载中') : _l('设为筛选条件的字段已删除')}</span>
            </div>
          )}
        </div>
        <div className="editFilter">
          <i className="icon-edit"></i>
        </div>
      </FilterTextWrap>
    );
  }
}
