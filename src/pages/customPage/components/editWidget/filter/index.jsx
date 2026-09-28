import React, { useEffect, useState } from 'react';
import _ from 'lodash';
import styled from 'styled-components';
import { Icon } from 'ming-ui';
import { Button, Modal, Tooltip } from 'ming-ui/antd-components';
import worksheetApi from 'src/api/worksheet';
import { formatFilterValues } from 'src/utils/services/worksheet/quickFilter';
import { EditWidgetContent, Header } from '../../../styled';
import { defaultFilterData } from './enum';
import Preview from './Preview';
import Setting from './Setting';
import './index.less';

const Wrap = styled.div`
  height: 100%;
  display: flex;
`;

const defaultData = {
  filtersGroupId: '',
  name: '',
  enableBtn: false,
  filters: [defaultFilterData],
};

export default function Filter(props) {
  const { ids, widget, onEdit, onClose } = props;
  const { value, filter: filtersGroup } = widget;
  const initialFilter = filtersGroup || defaultData;

  const [filter, setFilter] = useState(initialFilter);
  const [activeId, setActiveId] = useState(_.get(initialFilter, 'filters[0].filterId'));
  const [loading, setLoading] = useState(!filtersGroup && !!value);

  const { filters } = filter;

  const setFilters = filters => {
    setFilter({
      ...filter,
      filters,
    });
  };

  const updateFilter = (data, otherFilter = {}) => {
    const newFilters = filters.map(itme => {
      if (itme.filterId === activeId) {
        return { ...itme, ...data };
      }

      return itme;
    });
    setFilter({
      ...filter,
      ...otherFilter,
      filters: newFilters,
    });
  };

  const handleSave = () => {
    const { filters } = filter;

    if (_.isEmpty(filters[0].objectControls)) {
      alert(_l('请配置筛选对象'), 3);
      return;
    }

    if (!_.get(filters[0].objectControls[0], 'controlId')) {
      alert(_l('请为筛选对象添加字段'), 3);
      return;
    }

    onEdit({
      filter,
    });
  };

  useEffect(() => {
    if (filtersGroup || !value) {
      return;
    }

    let cancelled = false;
    worksheetApi
      .getFiltersGroupByIds({
        appId: ids.appId,
        filtersGroupIds: [value],
      })
      .then(data => {
        if (cancelled) return;

        const filtersGroup = data[0];

        if (!filtersGroup || !filtersGroup.filters) {
          setLoading(false);
          return;
        }

        setFilter({
          ...filtersGroup,
          filters: filtersGroup.filters.map(f => {
            return {
              ...f,
              values: formatFilterValues(f.dataType, f.values),
              showDefsource: f.values,
            };
          }),
        });
        setActiveId(_.get(filtersGroup, 'filters[0].filterId'));
        setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [filtersGroup, ids.appId, value]);

  return (
    <Modal
      className="editWidgetDialogWrap"
      classNames={{ container: 'pAll0', body: 'pAll0' }}
      styles={{ body: { padding: 0, position: 'relative' } }}
      verticalAlign="bottom"
      open
      width="100%"
      type="fixed"
      footer={null}
      closable={false}
      centered={true}
      onCancel={onClose}
    >
      <Header>
        <div className="typeName">{_l('筛选器')}</div>
        <div className="flexRow valignWrapper">
          <Button block className="save" shape="round" type="primary" onClick={handleSave}>
            {_l('保存')}
          </Button>
          <Tooltip title={_l('关闭')} placement="bottom">
            <Icon icon="close" className="Font24 pointer mLeft16 textTertiary" onClick={onClose} />
          </Tooltip>
        </div>
      </Header>
      <EditWidgetContent>
        <Wrap>
          <Preview
            loading={loading}
            filter={filter}
            setFilter={setFilter}
            filters={filters}
            setFilters={setFilters}
            activeId={activeId}
            setActiveId={setActiveId}
          />
          <Setting
            filterInfo={filter}
            setFilterInfo={setFilter}
            filter={_.find(filters, { filterId: activeId }) || {}}
            updateFilter={updateFilter}
            filters={filters}
            setFilters={setFilters}
            setActiveId={setActiveId}
            {...props}
          />
        </Wrap>
      </EditWidgetContent>
    </Modal>
  );
}
