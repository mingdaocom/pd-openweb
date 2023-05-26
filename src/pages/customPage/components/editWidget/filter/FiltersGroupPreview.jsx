import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import cx from 'classnames';
import { LoadDiv } from 'ming-ui';
import worksheetApi from 'src/api/worksheet';
import Filters from 'worksheet/common/Sheet/QuickFilter/Filters';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import errorBoundary from 'ming-ui/decorators/errorBoundary';
import * as actions from 'src/pages/customPage/redux/action.js';
import { formatFilterValues, formatFilterValuesToServer } from 'worksheet/common/Sheet/QuickFilter';
import { validate } from 'worksheet/common/Sheet/QuickFilter/Inputs';
import { formatFilters } from './util';

const Wrap = styled.div`
  &.disableFiltersGroup {
    pointer-events: none;
  }
  .quickFilterWrap {
    padding-top: 0;
    >div {
      padding: 0;
    }
    .disable {
      cursor: not-allowed;
      .content {
        pointer-events: none;
      }
      .content>div {
        background-color: #f5f5f5;
      }
    }
  }
`;

const isPublicShare = location.href.includes('public/page');

function FiltersGroupPreview(props) {
  const { appId, projectId, widget, className, updateFiltersGroup } = props;
  const { value } = widget;
  const [loading, setLoading] = useState(true);
  const [filtersGroup, setFiltersGroup] = useState({});
  const filter = filtersGroup;
  const { filters = [] } = filter;

  useEffect(() => {
    if (value && !isPublicShare) {
      worksheetApi.getFiltersGroupByIds({
        appId,
        filtersGroupIds: [value],
      }).then(data => {
        setLoading(false);
        const filtersGroup = data[0];
        setFiltersGroup({
          ...filtersGroup,
          filters: filtersGroup.filters.map(f => {
            const values = formatFilterValues(f.dataType, f.values)
            return {
              ...f,
              values,
              defaultValues: values
            }
          })
        });
      });
    } else {
      setLoading(false);
    }
    return () => {
      updateFiltersGroup({
        value,
        filters: []
      });
    }
  }, [value]);

  useEffect(() => {
    // 编辑过，保留的数据
    if (widget.filter) {
      setFiltersGroup(widget.filter);
    }
  }, [widget.filter]);

  if (isPublicShare) {
    return (
      <Wrap className={cx('TxtCenter', className)}>
        <div className="Font15 Gray_9e">{_l('暂不支持显示筛选组件')}</div>
      </Wrap>
    );
  }

  return (
    <Wrap className={className}>
      {loading ? (
        <LoadDiv />
      ) : (
        <Filters
          projectId={projectId}
          appId={appId}
          enableBtn={filter.enableBtn}
          filters={formatFilters(filters)}
          updateQuickFilter={filters => {
            updateFiltersGroup({
              value,
              filters
            });
          }}
          resetQuickFilter={() => {
            const filters = filtersGroup.filters.map(f => {
              return {
                ...f,
                values: f.defaultValues
              }
            });
            updateFiltersGroup({
              value,
              filters: filters.map(c => ({ ...c, values: formatFilterValuesToServer(c.dataType, c.values) })).filter(validate)
            });
            setFiltersGroup({
              ...filtersGroup,
              filters
            });
          }}
        />
      )}
    </Wrap>
  );
}

export default errorBoundary(
  connect(
    state => ({}),
    dispatch => bindActionCreators(actions, dispatch),
  )(FiltersGroupPreview),
);