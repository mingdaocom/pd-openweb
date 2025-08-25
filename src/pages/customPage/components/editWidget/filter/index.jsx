import React, { useEffect, useState } from 'react';
import { Button, ConfigProvider, Modal, Tooltip } from 'antd';
import _ from 'lodash';
import styled from 'styled-components';
import { Icon } from 'ming-ui';
import worksheetApi from 'src/api/worksheet';
import { formatFilterValues } from 'worksheet/common/Sheet/QuickFilter/utils';
import { EditWidgetContent, Header } from '../../../styled';
import SideWrap from '../../SideWrap';
import { defaultFilterData } from './enum';
import Preview from './Preview';
import Setting from './Setting';
import './index.less';

const DefaultItem = styled.div`
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  justify-content: center;
  background-color: #fff;
  margin-top: 15px;
  border-radius: 6px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.12);
  cursor: pointer;
  &:hover {
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.16);
  }
  .btnWrap {
    margin: 8px 10px;
  }
`;

const Wrap = styled.div`
  background-color: #eee;
  height: 100%;
  display: flex;
  .Menu.List {
    height: max-content;
  }
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

  const [filter, setFilter] = useState(defaultData);
  const [activeId, setActiveId] = useState(_.get(filter, 'filters[0].filterId'));
  const [loading, setLoading] = useState(true);

  const { filters } = filter;

  const setFilters = filters => {
    setFilter({
      ...filter,
      filters,
    });
  };

  const updateFilter = data => {
    const newFilters = filters.map(itme => {
      if (itme.filterId === activeId) {
        return { ...itme, ...data };
      }
      return itme;
    });
    setFilter({
      ...filter,
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
    if (filtersGroup) {
      setFilter(filtersGroup);
      setActiveId(_.get(filtersGroup, 'filters[0].filterId'));
      setLoading(false);
      return;
    }
    if (value) {
      worksheetApi
        .getFiltersGroupByIds({
          appId: ids.appId,
          filtersGroupIds: [value],
        })
        .then(data => {
          const filtersGroup = data[0];
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
    } else {
      setLoading(false);
    }
  }, [value]);

  // eslint-disable-next-line no-constant-condition
  return false ? (
    <SideWrap headerText={_l('选择筛选方式')} onClose={onClose}>
      <div className="flexRow valignWrapper mTop20">
        <span className="Font17 mRight10">{_l('筛选器')}</span>
        <span className="Font14 Gray_9e">{_l('对本页进行搜索')}</span>
      </div>
      <DefaultItem className="pTop10 pBottom10" onClick={() => {}}>
        {_l('筛选器')}
      </DefaultItem>
    </SideWrap>
  ) : (
    <Modal
      maskStyle={{ zIndex: 999 }}
      wrapClassName="customPageFilterWrap"
      className="editWidgetDialogWrap"
      visible
      transitionName=""
      maskTransitionName=""
      width="100%"
      footer={null}
      centered={true}
      onCancel={onClose}
    >
      <Header>
        <div className="typeName">{_l('筛选器')}</div>
        <div className="flexRow valignWrapper">
          <ConfigProvider autoInsertSpaceInButton={false}>
            <Button block className="save" shape="round" type="primary" onClick={handleSave}>
              {_l('保存')}
            </Button>
          </ConfigProvider>
          <Tooltip title={_l('关闭')} placement="bottom">
            <Icon icon="close" className="Font24 pointer mLeft16 Gray_9e" onClick={onClose} />
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
