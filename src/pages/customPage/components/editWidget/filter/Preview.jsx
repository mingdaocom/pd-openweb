import React from 'react';
import { Button, Divider } from 'antd';
import _ from 'lodash';
import styled from 'styled-components';
import { v4 as uuidv4 } from 'uuid';
import { Icon, LoadDiv } from 'ming-ui';
import Filters from 'worksheet/common/Sheet/QuickFilter/Filters';
import ErrorBoundary from 'src/ming-ui/components/ErrorWrapper';
import { defaultFilterData } from './enum';
import { formatFilters } from './util';

const Wrap = styled.div`
  display: flex;
  flex: 1;
  background-color: var(--color-background-tertiary);
  padding: 11px 24px;
  min-width: 0;

  .addFilterItem {
    height: 36px;
    padding: 0 15px;
    color: var(--color-primary);
    border: none;
    border-radius: 24px;
    background-color: var(--color-background-card);
    box-shadow: var(--shadow-sm);
    &:hover {
      color: var(--color-primary-dark);
      background-color: var(--color-background-hover);
    }
  }

  .header {
    justify-content: space-between;
  }
  .body {
    border-radius: 4px;
    box-shadow: 0px 1px 4px #00000029;
    padding: 10px;
    overflow: auto;
    background-color: var(--color-background-card);

    .container {
      display: block;
      overflow: auto;
    }
    .gridItem {
      float: left;
      width: 200px;
      height: 100px;
      padding: 5px;
      display: flex;
      align-items: center;
      .innerGridItem {
        width: 100%;
        height: 100%;
        background: var(--color-background-primary);
        border: 1px solid var(--color-border-secondary);
      }
      .active {
        border-color: var(--color-primary);
      }
    }
  }

  .quickFilterWrap {
    padding-top: 0;
    > div {
      padding: 0;
    }
    .disable {
      .content > div {
        background-color: var(--color-background-input);
      }
    }
    .buttons {
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 0;
      margin: 0 0 0 16px;
      height: auto;
    }
  }
`;

export default function Preview(props) {
  const { loading, activeId, setActiveId, filters, setFilters } = props;
  const { filter } = props;
  const requiredcids = _.get(filter.advancedSetting, 'requiredcids') || [];

  const add = () => {
    const filterId = uuidv4();
    const filter = _.find(filters, { filterId: activeId });
    const data = {
      ...defaultFilterData,
      filterId,
      global: filter.global,
    };

    if (filter.global) {
      data.objectControls = filter.objectControls.map(c => {
        return {
          ...c,
          controlId: '',
          control: undefined,
        };
      });
    }

    setActiveId(filterId);
    setFilters(filters.concat(data));
  };

  return (
    <Wrap className="flexColumn">
      <div className="flexRow valignWrapper header">
        <div className="flex valignWrapper">
          <div className="Font13 textTertiary">{_l('选择下方预览卡片中的筛选器进行设置')}</div>
        </div>
        <Button className="addFilterItem" onClick={add}>
          <Icon icon="add" />
          <span className="bold">{_l('添加筛选器')}</span>
        </Button>
      </div>
      <Divider className="mTop15 mBottom15" />
      <div className="body">
        <div className="container">
          <ErrorBoundary>
            {loading ? (
              <LoadDiv />
            ) : (
              <Filters
                mode="config"
                defaultTriggerUpdate={false}
                advancedSetting={{
                  requiredcids,
                  fastrequired: requiredcids.length ? '1' : '0',
                  enablebtn: filter.enableBtn ? '1' : '0',
                }}
                filters={formatFilters(filters)}
                activeFilterId={activeId}
                onFilterClick={id => {
                  setActiveId(id);
                }}
              />
            )}
          </ErrorBoundary>
        </div>
      </div>
    </Wrap>
  );
}
