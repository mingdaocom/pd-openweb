import React, { Fragment, useEffect, useState } from 'react';
import _ from 'lodash';
import styled from 'styled-components';
import { Dialog, Icon, ScrollView } from 'ming-ui';
import FilterConfig from 'worksheet/common/WorkSheetFilter/common/FilterConfig';
import { checkConditionCanSave } from 'src/pages/FormSet/components/columnRules/config';
import Button from '../../../Button';

const FilterData = styled.div`
  display: flex;
  align-items: center;
  padding: 2px 6px;
  font-weight: 500;
  font-size: 14px;
  color: var(--color-text-secondary);
  border: 1px solid transparent;
  border-radius: 3px;
  white-space: nowrap;
  cursor: pointer;
  .icon {
    margin-right: 5px;
    font-size: 18px;
  }
  &.active {
    color: var(--color-primary);
    border-color: var(--color-primary);
  }
  &.noFilter {
    &:hover {
      background-color: var(--color-background-tertiary);
    }
  }
`;

const FilterConfigWrapper = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  margin: 0 -20px;
  min-height: 300px;
  .tips {
    padding: 0 20px;
    font-size: 14px;
    color: var(--color-text-secondary);
    margin-bottom: 10px;
  }
  .contentBox {
    padding: 0 20px;
  }
`;

const Footer = styled.div`
  display: flex;
  justify-content: flex-end;
  align-items: center;
  gap: 20px;
  margin-top: 20px;
`;

const FieldConditions = props => {
  const {
    appId,
    projectId,
    visible,
    setVisible,
    worksheetInfo = {},
    dataFilterFields,
    filterConditions,
    setDelayOpenFilter,
    onSave,
  } = props;
  const [filter, setFilter] = useState(null);
  const [hasInvalidConditions, setHasInvalidConditions] = useState(false);

  const handleFilterDataClick = e => {
    e.stopPropagation();
    // 第一次展开，等待数据加载完成
    if (_.isEmpty(worksheetInfo)) {
      setDelayOpenFilter(true);
      return;
    }

    setVisible(true);
  };

  useEffect(() => {
    if (visible) {
      setFilter(filterConditions);
    }
  }, [visible]);

  return (
    <Fragment>
      <FilterData className={`${filterConditions?.length ? 'active' : 'noFilter'}`} onClick={handleFilterDataClick}>
        <Icon icon="filter" className="icon" />
        {_l('数据过滤')}
      </FilterData>
      {visible && (
        <Dialog
          visible
          width={800}
          className="fieldConditionsDialog"
          showFooter={false}
          title={<span className="Font18">{_l('配置 “%0” 数据过滤条件', worksheetInfo.name)}</span>}
          onCancel={() => {
            setVisible(false);
          }}
        >
          <FilterConfigWrapper>
            <div className="tips">
              {_l('设置筛选条件，仅当数据符合条件时可进入知识库。支持使用选项、等级、检查项字段。')}
            </div>
            <ScrollView className="flex">
              <div className="contentBox">
                <FilterConfig
                  from="rag"
                  canEdit
                  feOnly
                  supportGroup
                  filterColumnClassName="filterColumn"
                  projectId={projectId}
                  appId={appId}
                  columns={dataFilterFields}
                  sheetSwitchPermit={worksheetInfo.switches}
                  conditions={filterConditions}
                  filterResigned={false}
                  onConditionsChange={conditions => {
                    const hasInvalidConditions = !checkConditionCanSave(conditions);
                    setHasInvalidConditions(hasInvalidConditions);
                    setFilter(conditions);
                  }}
                />
              </div>
            </ScrollView>
          </FilterConfigWrapper>

          <Footer>
            <Button type="text" onClick={() => setVisible(false)}>
              {_l('取消')}
            </Button>
            <Button
              type="primary"
              onClick={() => {
                if (hasInvalidConditions && filter?.length) {
                  alert(_l('请完善过滤条件'), 3);
                  return;
                }

                onSave({
                  filter: filter.filter(item => !item.isGroup || item.groupFilters?.length),
                  worksheetId: worksheetInfo.worksheetId,
                });
                setVisible(false);
              }}
            >
              {_l('保存')}
            </Button>
          </Footer>
        </Dialog>
      )}
    </Fragment>
  );
};

export default FieldConditions;
