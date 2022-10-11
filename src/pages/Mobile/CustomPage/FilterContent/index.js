import React, { useEffect, useState, Fragment } from 'react';
import { Flex, ActivityIndicator } from 'antd-mobile';
import { Drawer } from 'antd';
import { Icon } from 'ming-ui';
import styled from 'styled-components';
import cx from 'classnames';
import worksheetApi from 'src/api/worksheet';
import QuickFilter from 'mobile/RecordList/QuickFilter';
import Search from './Search';
import Filters from './Filters';
import { validate, TextTypes } from 'worksheet/common/Sheet/QuickFilter/Inputs';
import { connect } from 'react-redux';
import * as actions from '../redux/actions';
import { bindActionCreators } from 'redux';
import { formatFilters } from 'src/pages/customPage/components/editWidget/filter/util';
import { formatFilterValues } from 'worksheet/common/Sheet/QuickFilter';
import { conditionAdapter, formatQuickFilter } from 'mobile/RecordList/QuickFilter/Inputs';

const Wrap = styled.div`
  &.disableFiltersGroup {
    pointer-events: none;
  }
`;

const FilterEntry = styled.div`
  background-color: #fff;
  border-radius: 3px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.16);
  padding: 0 7px 0 10px;
  height: 100%;
  &.big {
    width: 100%;
  }
  &.highlight {
    color: #2196f3;
    .icon {
      color: #2196f3 !important;
    }
  }
`;

const DrawerWrap = styled(Drawer)`
  z-index: 100 !important;
  .ant-drawer-body {
    padding: 10px 0 0 0;
  }
`;

const isPublicShare = location.href.includes('public/page');

function FilterContent(props) {
  const { ids = {}, apk = {}, widget, className } = props;
  const { value } = widget;
  const [loading, setLoading] = useState(true);
  const [filtersGroup, setFiltersGroup] = useState({});
  const [visible, setVisible] = useState(false);
  const [textFiltersGroup, setTextFiltersGroup] = useState([]);
  const [otherFiltersGroup, setOtherFiltersGroup] = useState([]);

  const filters = formatFilters(filtersGroup.filters || []).filter(c => !c.className.includes('disable'));
  const textFilters = filters.filter(item => TextTypes.includes(item.dataType));
  const otherFilters = filters.filter(item => !TextTypes.includes(item.dataType));

  useEffect(() => {
    if (value && !isPublicShare) {
      worksheetApi.getFiltersGroupByIds({
        appId: ids.appId,
        filtersGroupIds: [value],
      }).then(data => {
        setLoading(false);
        const filtersGroup = data[0];
        setFiltersGroup({
          ...filtersGroup,
          filters: filtersGroup.filters.map(f => {
            return {
              ...f,
              values: formatFilterValues(f.dataType, f.values)
            }
          })
        });
      });
    } else {
      setLoading(false);
    }
  }, [value]);

  useEffect(() => {
    const { updateFiltersGroup } = props;
    const filters = textFiltersGroup.concat(otherFiltersGroup);
    updateFiltersGroup(value, filters);
  }, [textFiltersGroup, otherFiltersGroup]);

  useEffect(() => {
    const { updateFiltersGroup } = props;
    const quickFilter = filters.map((filter, i) => ({
      ...filter,
      filterType: filter.filterType || 1,
      spliceType: filter.spliceType || 1,
    })).filter(validate).map(conditionAdapter);
    const filtersGroup = formatQuickFilter(quickFilter);
    const textFilters = filtersGroup.filter(item => TextTypes.includes(item.dataType));
    const otherFilters = filtersGroup.filter(item => !TextTypes.includes(item.dataType));
    setTextFiltersGroup(textFilters);
    setOtherFiltersGroup(otherFilters);
  }, [filtersGroup]);

  if (loading) {
    return (
      <Flex justify="center" align="center" className="h100">
        <ActivityIndicator size="large" />
      </Flex>
    );
  }

  if (isPublicShare) {
    return (
      <Wrap className={cx('flexRow valignWrapper WhiteBG h100', className)}>
        <div className="Font15 Gray_9e w100 TxtCenter">{_l('暂不支持显示筛选组件')}</div>
      </Wrap>
    );
  }

  return (
    <Wrap className={cx('flexRow valignWrapper w100', className)} style={{ height: 40 }}>
      {!!textFilters.length && (
        <Search
          textFilters={textFilters}
          updateQuickFilter={(values) => {
            setTextFiltersGroup(values);
          }}
        />
      )}
      {!!otherFilters.length && (
        <FilterEntry
          className={cx('flexRow valignWrapper', {
            big: !textFilters.length,
            mLeft10: textFilters.length,
            highlight: otherFiltersGroup.length
          })}
          onClick={() => { setVisible(true) }}
        >
          <Icon className="Font20 Gray_9e" icon="filter" />
          {!textFilters.length && (
            <div className="flexRow valignWrapper w100">
              <span className="Font15 flex mLeft5">{_l('筛选')}</span>
              {!!otherFiltersGroup.length && <span className="mLeft5 mRight6">{_l('已筛%0项', otherFiltersGroup.length)}</span>}
              <Icon className="Font18 Gray_9e" icon="arrow-right-border" />
            </div>
          )}
        </FilterEntry>
      )}
      <DrawerWrap
        placement="right"
        visible={visible}
        closable={false}
        width="90%"
        onClose={() => {
          setVisible(false);
        }}
      >
        <Filters
          appId={ids.appId}
          // worksheetId={ids.worksheetId}
          projectId={apk.projectId}
          enableBtn={filtersGroup.enableBtn}
          filters={otherFilters}
          updateQuickFilter={(values) => {
            setOtherFiltersGroup(values);
          }}
          onCloseDrawer={() => {
            setVisible(false);
          }}
        />
      </DrawerWrap>
    </Wrap>
  );
}

export default connect(
  state => ({
    filtersGroup: state.mobile.filtersGroup
  }),
  dispatch => bindActionCreators(_.pick(actions, ['updateFiltersGroup']), dispatch),
)(FilterContent);
