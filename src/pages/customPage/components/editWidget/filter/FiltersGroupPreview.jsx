import React, { useEffect, useState } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import store from 'redux/configureStore';
import cx from 'classnames';
import styled from 'styled-components';
import { LoadDiv } from 'ming-ui';
import errorBoundary from 'ming-ui/decorators/errorBoundary';
import worksheetApi from 'src/api/worksheet';
import { conditionAdapter } from 'worksheet/common/Sheet/QuickFilter/Conditions';
import Filters from 'worksheet/common/Sheet/QuickFilter/Filters';
import { formatFilterValues, formatFilterValuesToServer, validate } from 'worksheet/common/Sheet/QuickFilter/utils';
import { updateFiltersGroup, updatePageInfo } from 'src/pages/customPage/redux/action.js';
import { getTranslateInfo } from 'src/utils/app';
import { replaceControlsTranslateInfo } from 'src/utils/translate';
import { formatFilters } from './util';

const Wrap = styled.div`
  &.disableFiltersGroup {
    pointer-events: none;
  }
  .quickFilterWrap {
    padding-top: 0;
    > div {
      padding: 0;
    }
    .disable {
      cursor: not-allowed;
      .content {
        pointer-events: none;
      }
      .content > div {
        background-color: #f5f5f5;
      }
    }
  }
`;

function FiltersGroupPreview(props) {
  const { appId, projectId, widget, config = {}, className, updateFiltersGroup, updatePageInfo } = props;
  const { id, value } = widget;
  const [loading, setLoading] = useState(true);
  const [filtersGroup, setFiltersGroup] = useState({});
  const filter = filtersGroup;
  const { filters = [] } = filter;
  const isDisable = className.includes('disableFiltersGroup');
  const translateInfo = getTranslateInfo(appId, null, id);
  const isDark = _.get(config, 'pageStyleType') === 'dark';

  useEffect(() => {
    if (value) {
      worksheetApi
        .getFiltersGroupByIds({
          appId,
          filtersGroupIds: [value],
        })
        .then(data => {
          setLoading(false);
          const filtersGroup = data[0];
          const result = {
            ...filtersGroup,
            filters: filtersGroup.filters.map(f => {
              const values = formatFilterValues(f.dataType, f.values);
              f.objectControls.forEach(item => {
                item.control = replaceControlsTranslateInfo(appId, item.worksheetId, item.control ? [item.control] : [])[0];
              });
              return {
                ...f,
                name: translateInfo[f.filterId] || f.name,
                values,
                defaultValues: values,
              };
            }),
          };
          setFiltersGroup(widget.filter ? widget.filter : result);
          const customPage = store.getState().customPage;
          const { components, filterComponents, loadFilterComponentCount } = customPage;
          updatePageInfo({
            filterComponents: filterComponents.map(item => {
              if (item.value === value) {
                const editData = _.find(components, { value: value }) || {};
                const { advancedSetting, filters } = editData.filter || filtersGroup;
                return {
                  value,
                  advancedSetting,
                  filters: _.flatten(filters.map(item => item.objectControls)),
                  mobileVisible: widget.mobile.visible,
                };
              } else {
                return item;
              }
            }),
            loadFilterComponentCount: loadFilterComponentCount + 1,
          });
        })
        .catch(error => {
          const customPage = store.getState().customPage;
          const { loadFilterComponentCount } = customPage;
          updatePageInfo({ loadFilterComponentCount: loadFilterComponentCount + 1 });
        });
    } else {
      const customPage = store.getState().customPage;
      const { loadFilterComponentCount } = customPage;
      updatePageInfo({ loadFilterComponentCount: loadFilterComponentCount + 1 });
      setLoading(false);
    }
    return () => {
      updateFiltersGroup({
        value,
        filters: [],
      });
    };
  }, [value]);

  useEffect(() => {
    // 编辑过，保留的数据
    if (widget.filter) {
      setFiltersGroup(widget.filter);
    }
  }, [widget.filter]);

  return (
    <Wrap className={className}>
      {loading ? (
        <LoadDiv />
      ) : (
        <Filters
          mode={isDisable ? 'config' : ''}
          isDark={isDark}
          projectId={projectId}
          appId={appId}
          enableBtn={filter.enableBtn}
          filters={formatFilters(filters)}
          updateQuickFilter={filters => {
            updateFiltersGroup({
              value,
              filters,
            });
          }}
          resetQuickFilter={() => {
            const filters = filtersGroup.filters.map(f => {
              return {
                ...f,
                values: f.defaultValues,
              };
            });
            updateFiltersGroup({
              value,
              filters: filters
                .map(c => ({ ...c, values: formatFilterValuesToServer(c.dataType, c.values) }))
                .filter(validate)
                .map(conditionAdapter),
            });
            setFiltersGroup({
              ...filtersGroup,
              filters,
            });
          }}
        />
      )}
    </Wrap>
  );
}

export default errorBoundary(
  connect(
    state => ({
      filterComponents: state.customPage.filterComponents,
      loadFilterComponentCount: state.customPage.loadFilterComponentCount,
      config: state.customPage.config,
    }),
    dispatch => bindActionCreators({ updateFiltersGroup, updatePageInfo }, dispatch),
  )(FiltersGroupPreview),
);
