import React, { Fragment, useState, useEffect } from 'react';
import cx from 'classnames';
import { Icon, LoadDiv } from 'ming-ui';
import { Dropdown, Checkbox, Space, Input, Divider } from 'antd';
import { TagWrap, AddTagWrap, getFilterObject } from '../filter/FilterObject';
import reportApi from 'statistics/api/report';

const CallBackRefresh = (props) => {
  const { pageId, components, refreshObjects = [], onChange } = props;
  const [filterObject, setFilterObject] = useState([]);
  const [addTagVisible, setAddTagVisible] = useState(false);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    setLoading(true);
    reportApi.listByPageId({ appId: pageId }).then(data => {
      setFilterObject(getFilterObject(components, data));
    }).finally(() => setLoading(false));
  }, []);

  const addFilterObject = id => {
    const { name, worksheetId, ...data } = filterObject.filter(item => item.objectId == id)[0];
    const newObjects = refreshObjects.concat({ ...data });
    onChange(newObjects);
  }
  const removeFilterObject = id => {
    const newObjects = refreshObjects.filter(item => item.objectId !== id);
    onChange(newObjects);
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
            checked={filterObject.length === refreshObjects.length}
            onChange={e => {
              const { checked } = e.target;
              if (checked) {
                const newObjects = filterObject.map(c => {
                  const { name, worksheetId, ...data } = c;
                  return {
                    ...data,
                  };
                });
                onChange(newObjects);
              } else  {
                onChange([]);
              }
            }}
          >
            <span className="Font13">{_l('全选')}</span>
          </Checkbox>
          {filterObject.filter(n => (n.name || '').toLocaleLowerCase().includes(search.toLocaleLowerCase())).map(c => (
            <Checkbox
              key={c.objectId}
              checked={_.find(refreshObjects, { objectId: c.objectId }) ? true : false}
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
    const name = _.get(object, 'name');
    return (
      <div key={item.objectId} className={cx('tag valignWrapper', { warning: !object })}>
        <Icon className="Gray_75 Font17" icon={item.type === 1 ? 'worksheet_column_chart' : 'view_eye'} />
        {object ? (
          <Fragment>
            <span className="Font13 mLeft5 mRight5 ellipsis" title={name}>
              {name}
            </span>
          </Fragment>
        ) : (
          <span className="Font13 Red mLeft5 mRight5">
            {_l('该刷新对象已删除')}
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

  if (!filterObject.length) {
    return null;
  }

  return (
    <div className="settingItem">
      <div className="settingTitle valignWrapper mBottom10">
        <span>{_l('创建完成后刷新组件')}</span>
      </div>
      <TagWrap>
        {refreshObjects.map(item => (
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
        getPopupContainer={() => document.querySelector('.editWidgetDialogWrap .settingsBox')}
        trigger={['click']}
        overlay={renderOverlay()}
      >
        <div className="Relative" style={{ top: '-15px' }}></div>
      </Dropdown>
    </div>
  );
};

export default CallBackRefresh;
