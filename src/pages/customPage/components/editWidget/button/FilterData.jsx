import React, { Fragment, useState, useEffect } from 'react';
import { Dialog, LoadDiv } from 'ming-ui';
import { Checkbox } from 'antd';
import styled from 'styled-components';
import SingleFilter from 'src/pages/worksheet/common/WorkSheetFilter/common/SingleFilter';
import { filterData } from 'src/pages/FormSet/components/columnRules/config';
import { formatValuesOfOriginConditions } from 'src/pages/worksheet/common/WorkSheetFilter/util';
import worksheetApi from 'src/api/worksheet';

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
  background-color: #fff;

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

export default function FilterData(props) {
  const { projectId, appId, worksheetId, filterId, controls, config, onChangeConfig } = props;
  const { isFilter, filterConditions = [] } = config;
  const [visible, setVisible] = useState(false);
  const [filter, setFilter] = useState([]);
  const filterItemTexts = filterData(controls, filterConditions);

  const handleChangeConfig = (data) =>{
    onChangeConfig({
      ...config,
      ...data
    });
  }

  useEffect(() => {
    if (filterId) {
      worksheetApi.getWorksheetFilterById({
        filterId
      }).then(data => {
        const { items = [] } = data;
        setFilter(items);
        handleChangeConfig({
          filterConditions: items
        });
      });
    }
  }, [filterId]);

  return (
    <Fragment>
      <Checkbox
        checked={isFilter}
        onChange={(e) => {
          if (filterConditions.length > 0) {
            handleChangeConfig({
              isFilter: e.target.checked
            });
          } else if (e.target.checked) {
            setVisible(true);
          }
        }}
      >
        {_l('筛选')}
      </Checkbox>
      <Dialog
        visible={visible}
        title={_l('筛选')}
        okText={_l('确定')}
        cancelText={_l('取消')}
        onCancel={() => {
          setVisible(false);
        }}
        onOk={() => {
          if (filter.length) {
            handleChangeConfig({
              filterConditions: filter,
              isFilter: true,
            });
            setVisible(false);
          } else {
            if (filter.length) {
              setVisible(false);
            } else {
              alert(_l('请选择筛选条件'), 3);
            }
          }
        }}
      >
        <SingleFilter
          canEdit
          feOnly
          filterDept={true}
          filterColumnClassName="showBtnFilter"
          projectId={projectId}
          appId={appId}
          columns={controls}
          conditions={filterConditions}
          onConditionsChange={conditions => {
            setFilter(conditions);
          }}
        />
      </Dialog>
      {isFilter && (
        <FilterTextWrap onClick={() => { setVisible(true); }}>
          <div className="txtFilter fieldEditTxtFilter">
            {filterItemTexts.map((item, index) => (
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
                        <i>{!it.rName ? _l('当前记录') : it.rName}</i>
                      </span>
                    );
                  })
                ) : (
                  <span className="WordBreak flexItem">{item.value}</span>
                )}
              </div>
            ))}
          </div>
          <div className="editFilter valignWrapper">
            <i className="icon-edit"></i>
          </div>
        </FilterTextWrap>
      )}
    </Fragment>
  );
}

