import React from 'react';
import { Icon } from 'ming-ui';
import { filterData } from 'src/pages/FormSet/components/columnRules/config.js';
import { isEmpty } from 'lodash';
import styled from 'styled-components';
import { getAdvanceSetting } from '../../../util/setting';
import './filterDialog.less';
import './filterText.less';

const FilterTextWrap = styled.div`
  width: 100%;
  background: #f5f5f5;
  border: 1px solid #dddddd;
  border-radius: 3px;
  padding: 8px 16px 10px;
  box-sizing: border-box;
  color: #333;
  margin: 10px 0;
  display: flex;

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

  .editFilter {
    width: 20px;

    &:hover {
      color: #2196f3 !important;
    }
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
      controls,
      sourceControlId,
    );
    return (
      <FilterTextWrap>
        <div className="txtFilter fieldEditTxtFilter">
          {filterItemTexts.length > 0 ? (
            filterItemTexts.map((item, index) => (
              <div key={item.id} className="pRight10 mTop5 flexBox">
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
                        <i>{!it.rName ? _l('当前记录') : it.rName}</i>
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
        <Icon
          icon="hr_edit"
          className="Gray_9d Font18 editFilter Hand"
          onClick={() => {
            editFn();
          }}
        />
      </FilterTextWrap>
    );
  }
}
