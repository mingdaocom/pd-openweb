import React, { Fragment, useState, useEffect } from 'react';
import styled from 'styled-components';
import cx from 'classnames';
import { Icon, LoadDiv } from 'ming-ui';
import { Dropdown, Checkbox, Tag, Space, Input, Divider, Tooltip } from 'antd';
import { enumWidgetType } from 'src/pages/customPage/util';
import reportApi from 'statistics/api/report';
import _ from 'lodash';

const TagWrap = styled.div`
  .tag {
    display: inline-flex;
    padding: 0 10px;
    height: 32px;
    max-width: 100%;
    border: 1px solid #EAEAEA;
    border-radius: 15px;
    background-color: #FFFFFF;
    margin: 0 10px 10px 0;
    &.add {
      color: #2196F3;
      transition: all 0.3s;
      &:hover {
        color: #1079cc;
      }
    }
    &.warning {
      border-color: #E5A39E;
      background-color: #FFE5E3;
    }
  }
  .icon-close:hover {
    color: #757575 !important;
  }
`;

const AddTagWrap = styled.div`
  box-shadow: 0 3px 6px -4px #0000001f, 0 6px 16px 0 #00000014, 0 9px 28px 8px #0000000d;
  .ant-space {
    gap: 0 !important;
    max-height: 420px;
    overflow-y: auto;
  }
  .ant-checkbox-input {
    position: absolute;
  }
  .ant-input {
    font-size: 13px;
    padding: 7px 11px;
    border-radius: 0 !important;
    border: none !important;
    &:focus, &.ant-input-focused {
      box-shadow: none;
    }
  }
  width: 312px;
  border-radius: 3px;
  padding: 5px 0;
  border: 1px solid #e5e5e5;
  background-color: #fff;
  .ant-radio-group, .ant-space {
    width: 100%;
  }
  .ant-space-item {
    padding: 7px 16px;
    margin-bottom: 0 !important;
    &:hover {
      background-color: #fafafa;
    }
  }
`;

const getFilterObject = (components, reports) => {
  return components.filter(c => [enumWidgetType.analysis, enumWidgetType.view, 'analysis', 'view'].includes(c.type)).map(c => {
    const objectId = _.get(c, 'config.objectId');
    const data = { objectId };
    if (enumWidgetType.analysis === c.type) {
      data.type = 1;
      data.name = c.name;
       // 已经存在的图表
      if (c.value) {
        const report = _.find(reports, { id: c.value }) || {};
        data.worksheetId = report.appId;
      }
      // 刚刚复制的图表
      if (c.sourceValue) {
        const report = _.find(reports, { id: c.sourceValue });
        data.worksheetId = report.appId;
      }
    }
    // 刚刚创建的图表
    if ('analysis' === c.type) {
      data.type = 1;
      data.name = c.name;
      data.worksheetId = c.worksheetId;
    }
    if ([enumWidgetType.view, 'view'].includes(c.type)) {
      data.type = 2;
      data.name = c.config.name;
      data.worksheetId = c.value;
    }
    return data;
  }).filter(c => c.worksheetId);
}

export default function FilterObject(props) {
  const { ids, components, filter, setFilter } = props;
  const { changeGlobal, changeAllFilterObjectControls } = props;
  const { objectControls = [] } = filter;
  const [addTagVisible, setAddTagVisible] = useState(false);
  const [filterObject, setFilterObject] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    setLoading(true);
    reportApi.listByPageId({ appId: ids.pageId }).then(data => {
      setFilterObject(getFilterObject(components, data));
    }).always(() => setLoading(false));
  }, []);

  const addFilterObject = id => {
    const { name, ...data } = filterObject.filter(item => item.objectId == id)[0];
    const same = _.find(objectControls, { worksheetId: data.worksheetId });
    const newObjects = objectControls.concat({ ...data, controlId: same ? same.controlId : '' });
    changeObjects(newObjects);
  }
  const removeFilterObject = id => {
    const newObjects = objectControls.filter(item => item.objectId !== id);
    changeObjects(newObjects);
  }
  const changeObjects = objectControls => {
    if (filter.global) {
      changeAllFilterObjectControls(objectControls);
    } else {
      setFilter({
        objectControls,
      });
    }
  }

  const renderOverlay = () => {
    return (
      <AddTagWrap>
        <div className="valignWrapper pLeft10 pRight10">
          <Icon className="Gray_9e Font20" icon="search" />
          <Input
            autoFocus
            value={search}
            placeholder={_l('搜索')}
            onChange={e => { setSearch(e.target.value) }}
          />
        </div>
        <Divider className="mTop5 mBottom5" />
        <Space direction="vertical">
          <Checkbox
            checked={filterObject.length === objectControls.length}
            onChange={e => {
              const { checked } = e.target;
              if (checked) {
                const newObjects = filterObject.map(c => {
                  const { name, ...data } = c;
                  return { ...data, controlId: '' };
                });
                changeObjects(newObjects);
              } else  {
                changeObjects([]);
              }
            }}
          >
            <span className="Font13">{_l('全选')}</span>
          </Checkbox>
          {filterObject.filter(n => n.name.includes(search)).map(c => (
            <Checkbox
              key={c.objectId}
              checked={_.find(objectControls, { objectId: c.objectId }) ? true : false}
              onChange={(e) => {
                const { checked } = e.target;
                if (checked) {
                  addFilterObject(c.objectId);
                } else {
                  removeFilterObject(c.objectId);
                }
              }}
            >
              <span className="Font13">{c.name}</span>
            </Checkbox>
          ))}
        </Space>
      </AddTagWrap>
    );
  }

  const renderObject = item => {
    const object = _.find(filterObject, { objectId: item.objectId });
    const sameWorksheet = item.worksheetId == _.get(object, 'worksheetId');
    const name = _.get(object, 'name');
    return (
      <div key={item.objectId} className={cx('tag valignWrapper', { warning: !sameWorksheet || !object })}>
        <Icon className="Gray_75 Font17" icon={item.type === 1 ? 'worksheet_column_chart' : 'view_eye'} />
        {object ? (
          <Fragment>
            <span className="Font13 mLeft5 mRight5 ellipsis" title={name}>
              {name}
            </span>
            {!sameWorksheet && (
              <Tooltip title={_l('此对象的数据源工作表已更改，无法筛选。请删除后重新添加')} placement="bottom">
                <Icon className="Red Font17 pointer mRight2" icon="knowledge-message" />
              </Tooltip>
            )}
          </Fragment>
        ) : (
          <span className="Font13 Red mLeft5 mRight5">
            {_l('该筛选对象已删除')}
          </span>
        )}
        <Icon className="Gray_9e Font16 pointer" icon="close" onClick={() => { removeFilterObject(item.objectId) }} />
      </div>
    );
  }

  if (loading) {
    return (
      <LoadDiv />
    );
  }

  return (
    <Fragment>
      <div className="valignWrapper mBottom8">
        <div className="flex Font13 bold">{_l('筛选对象')}</div>
        <div className="valignWrapper">
          <Tooltip title={_l('勾选时，组件内的筛选器使用相同的筛选对象；取消勾选后，可以为每个筛选器设置单独的筛选对象。')}>
            <Checkbox
              checked={filter.global}
              onChange={changeGlobal}
            >
              <span className="Font13">{_l('作为全局配置')}</span>
            </Checkbox>
          </Tooltip>
        </div>
      </div>
      <div className="Gray_9e Font13 mBottom12 Font13">{_l('选择统计图表或视图组件')}</div>
      <TagWrap>
        {objectControls.map(item => (
          renderObject(item)
        ))}
        <div
          className="tag add valignWrapper pointer"
          onClick={() => {
            setAddTagVisible(true);
          }}
        >
          <Icon className="Font17" icon="add" />
          <span className="bold">{_l('组件')}</span>
        </div>
      </TagWrap>
      <Dropdown
        visible={addTagVisible}
        destroyPopupOnHide={true}
        onVisibleChange={visible => {
          setAddTagVisible(visible);
        }}
        getPopupContainer={() => document.querySelector('.customPageFilterWrap .setting')}
        trigger={['click']}
        overlay={renderOverlay()}
      >
        <div className="Relative" style={{ top: '-15px' }}></div>
      </Dropdown>
    </Fragment>
  );
}
