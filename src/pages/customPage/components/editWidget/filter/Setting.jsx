import React, { Fragment, useCallback, useState, useEffect } from 'react';
import styled from 'styled-components';
import { Icon, Dialog } from 'ming-ui';
import { Input, Checkbox, Space, Divider, Tooltip } from 'antd';
import { connect } from 'react-redux';
import FilterObject from './FilterObject';
import FilterControl from './FilterControl';
import _ from 'lodash';

const Wrap = styled.div`
  box-sizing: border-box;
  width: 360px;
  padding: 24px;
  display: flex;
  flex-direction: column;
  background-color: #f8f8f8;
  overflow: auto;
  position: relative;

  .ant-checkbox-input {
    position: absolute;
  }
  .ant-input {
    font-size: 13px;
    padding: 5px 11px;
    border-radius: 3px !important;
    &:focus, &.ant-input-focused {
      box-shadow: none;
    }
  }
  .icon-delete2:hover {
    color: #2196F3;
  }
`;

function Setting(props) {
  const { filter = {}, setFilter } = props;
  const { filters = [], setFilters, setActiveId } = props;
  const { appId, appPkg = {}, ids = {}, components } = props;

  const changeGlobal = (e) => {
    const { checked } = e.target;
    const { filterId, objectControls } = filter;
    const newFilters = filters.map(f => {
      const data = {
        ...f,
        global: checked,
      }
      if (checked) {
        data.objectControls = filterId === f.filterId ? objectControls : objectControls.map(c => {
          const target =  _.find(data.objectControls, { worksheetId: c.worksheetId });
          if (target) {
            return target;
          } else {
            return {
              ...c,
              controlId: ''
            }
          }
        });
      }
      return data;
    });

    if (checked) {
      Dialog.confirm({
        title: null,
        description: <span className="Gray Font17" style={{ lineHeight: '26px' }}>{_l('将当前所选的筛选对象用于整个组件，其他筛选器的对象将会被重置。')}</span>,
        onOk: () => {
          setFilters(newFilters);
        }
      });
    } else {
      setFilters(newFilters);
    }
  }

  const changeAllFilterObjectControls = (objectControls) => {
    const { filterId } = filter;
    const newFilters = filters.map(f => {
      const data = {
        ...f,
        objectControls: filterId === f.filterId ? objectControls : objectControls.map(o => {
          const target = _.find(f.objectControls, { worksheetId: o.worksheetId });
          return {
            ...o,
            controlId: target ? target.controlId : '',
            control: target ? target.control : undefined
          }
        })
      }
      return data;
    });
    setFilters(newFilters);
  }

  const removeFilter = () => {
    const { filterId } = filter;
    if (filters.length === 1) {
      alert(_l('至少保留一个筛选器'), 3);
      return;
    }
    const newFilters = filters.filter(f => f.filterId !== filterId);
    setFilters(newFilters);
    setActiveId(newFilters[0].filterId);
  }

  return (
    <Wrap className="setting">
      <div className="flexRow valignWrapper Gray_9e">
        <div className="flex Font13">{_l('设置筛选器')}</div>
        <div data-tip={_l('删除')}>
          <Icon
            icon="delete2"
            className="Font20 pointer"
            onClick={removeFilter}
          />
        </div>
      </div>
      <Divider className="mTop15 mBottom15" />
      <div className="Font13 bold mBottom10">{_l('筛选器名称')}</div>
      <Input
        className="w100 Font13"
        placeholder={_l('未命名')}
        value={filter.name}
        onChange={(e) => {
          setFilter({ name: e.target.value });
        }}
      />
      <Divider className="mTop16 mBottom14" />
      <FilterObject
        ids={ids}
        components={components}
        filter={filter}
        setFilter={setFilter}
        changeGlobal={changeGlobal}
        changeAllFilterObjectControls={changeAllFilterObjectControls}
      />
      {!!_.get(filter, 'objectControls.length') && (
        <Fragment>
          <Divider className="mTop5 mBottom14" />
          <FilterControl
            filter={filter}
            setFilter={setFilter}
          />
        </Fragment>
      )}
    </Wrap>
  );
}

export default connect(state => ({
  appPkg: state.appPkg
}))(Setting);
