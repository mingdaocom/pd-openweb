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
  padding: 2px 12px 8px;
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
    padding-left: 20px;

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

  .filterGroup {
    position: relative;
    .spliceText {
      position: absolute;
      left: -20px;
      top: -2px;
      color: #757575;
    }
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
  renderFilterItem({ item, index, key, spliceText }) {
    let { fromCondition } = this.props;
    return (
      <div key={`${item.id}--${key || index}`} className="pRight10 mTop6 flexBox renderFilterItem">
        {index ? <span className="mRight10 Gray_75 Font13">{spliceText}</span> : null}
        <span className="mRight10" style={{ flexShrink: 0, maxWidth: '100%' }}>
          {item.name}
        </span>
        {item.type ? <span className="Bold LineHeight19 mRight10 Gray Font13">{item.type.text}</span> : null}
        {item.value && item.value.type === 'dynamicSource' ? (
          item.value.data.map(it => {
            if (!it.name) {
              return <span className="isWrong dynamicsourceSpan">{_l('该字段已删除')}</span>;
            }
            return (
              <span className="dynamicsourceSpan">
                {it.name}
                {_.includes(['fastFilter'], fromCondition)
                  ? ''
                  : it.id !== 'current-rowid' && <i>{!it.rName ? _l('当前记录') : it.rName}</i>}
              </span>
            );
          })
        ) : (
          <span className="breakAll">{item.value}</span>
        )}
      </div>
    );
  }
  render() {
    let { data, allControls, controls, editFn, loading = true, globalSheetControls = [], className } = this.props;
    const filters = this.props.filters || getAdvanceSetting(data, 'filters');
    let filterItemTexts;
    if (this.props.filterItemTexts) {
      filterItemTexts = this.props.filterItemTexts;
    } else {
      if (isEmpty(filters)) return null;
      filterItemTexts = filterData(
        allControls.concat(globalSheetControls),
        filters,
        true,
        controls.map(redefineComplexControl), // 日期公式等需转换type匹配
        data.sourceControlId,
      );
    }

    filterItemTexts = filterItemTexts.filter(o => (o.isGroup ? (o.groupFilters || []).length > 0 : true));
    return (
      <FilterTextWrap
        className={className}
        onClick={() => {
          editFn();
        }}
      >
        <div className="txtFilter fieldEditTxtFilter">
          {filterItemTexts.length > 0 ? (
            filterItemTexts.map((item, index) => {
              if (item.isGroup) {
                return (
                  <div className="filterGroup">
                    {index === 0 && <span className="spliceText">{_l('当')}</span>}
                    {index > 0 && <span className="spliceText">{item.spliceType == 1 ? _l('且') : _l('或')}</span>}
                    {item.groupFilters.map((childItem, childIndex) =>
                      this.renderFilterItem({
                        item: childItem,
                        index: childIndex,
                        key: `${index}--${childIndex}`,
                        spliceText:
                          item.groupFilters[childIndex - 1] && item.groupFilters[childIndex - 1].spliceType == 1
                            ? _l('且')
                            : _l('或'),
                      }),
                    )}
                  </div>
                );
              }
              return this.renderFilterItem({
                item,
                index,
                spliceText:
                  filterItemTexts[index - 1] && filterItemTexts[index - 1].spliceType == 1 ? _l('且') : _l('或'),
              });
            })
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
