import React, { Fragment, useState } from 'react';
import _ from 'lodash';
import styled from 'styled-components';
import { Icon, ScrollView } from 'ming-ui';
import { Button, Modal } from 'ming-ui/antd-components';
import FilterConfig from 'worksheet/common/WorkSheetFilter/common/FilterConfig';
import { checkConditionCanSave } from 'src/pages/FormSet/components/columnRules/config';

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
  const [filter, setFilter] = useState(filterConditions);
  const [hasInvalidConditions, setHasInvalidConditions] = useState(false);

  const handleFilterDataClick = e => {
    e.stopPropagation();
    // 第一次展开，等待数据加载完成
    if (_.isEmpty(worksheetInfo)) {
      setDelayOpenFilter(true);
      return;
    }

    setFilter(filterConditions);
    setHasInvalidConditions(false);
    setVisible(true);
  };

  const handleCancel = () => {
    setFilter(filterConditions);
    setHasInvalidConditions(false);
    setVisible(false);
  };

  const handleSave = () => {
    if (hasInvalidConditions && filter?.length) {
      alert(_l('请完善过滤条件'), 3);
      return;
    }

    onSave({
      filter: (filter || []).filter(item => !item.isGroup || item.groupFilters?.length),
      worksheetId: worksheetInfo.worksheetId,
    });
    setVisible(false);
  };

  return (
    <Fragment>
      <Button
        size="small"
        color={filterConditions?.length ? 'primary' : 'default'}
        variant={filterConditions?.length ? 'outlined' : 'text'}
        icon={<Icon icon="filter" />}
        onClick={handleFilterDataClick}
      >
        {_l('数据过滤')}
      </Button>
      {visible && (
        <Modal
          open
          width={800}
          className="fieldConditionsDialog"
          title={_l('配置 “%0” 数据过滤条件', worksheetInfo.name)}
          okText={_l('保存')}
          keyboard
          onCancel={handleCancel}
          onOk={handleSave}
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
        </Modal>
      )}
    </Fragment>
  );
};

export default FieldConditions;
