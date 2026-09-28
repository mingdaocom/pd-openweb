import React, { Fragment, useEffect, useMemo, useState } from 'react';
import cx from 'classnames';
import _ from 'lodash';
import { Icon, LoadDiv } from 'ming-ui';
import { Checkbox, Divider, Input, Popover, Space } from 'ming-ui/antd-components';
import reportApi from 'statistics/api/report';
import { AddTagWrap, getFilterObject, TagWrap } from '../filter/FilterObject';

const CallBackRefresh = props => {
  const { pageId, components, refreshObjects = [], onChange } = props;
  const [addTagVisible, setAddTagVisible] = useState(false);
  const [reportState, setReportState] = useState({ loaded: false, pageId: null, data: [] });
  const [search, setSearch] = useState('');
  const { loaded, pageId: loadedPageId, data: reports } = reportState;
  const loading = !loaded || loadedPageId !== pageId;
  const filterObject = useMemo(() => getFilterObject(components, reports), [components, reports]);

  useEffect(() => {
    let active = true;

    reportApi
      .listByPageId({ appId: pageId })
      .then(data => {
        if (active) {
          setReportState({ loaded: true, pageId, data });
        }
      })
      .catch(() => {
        if (active) {
          setReportState({ loaded: true, pageId, data: [] });
        }
      });

    return () => {
      active = false;
    };
  }, [pageId]);

  const addFilterObject = id => {
    const { ...data } = filterObject.filter(item => item.objectId == id)[0];
    const newObjects = refreshObjects.concat({ ...data });
    onChange(newObjects);
  };

  const removeFilterObject = id => {
    const newObjects = refreshObjects.filter(item => item.objectId !== id);
    onChange(newObjects);
  };

  const renderOverlay = () => {
    return (
      <AddTagWrap>
        <div className="valignWrapper">
          <Input
            autoFocus
            variant="borderless"
            prefix={<Icon className="textTertiary Font18" icon="search" />}
            value={search}
            placeholder={_l('搜索')}
            onChange={e => {
              setSearch(e.target.value);
            }}
          />
        </div>
        <Divider className="mTop5 mBottom5" />
        <Space orientation="vertical">
          <Checkbox
            checked={filterObject.length === refreshObjects.length}
            onChange={e => {
              const { checked } = e.target;

              if (checked) {
                const newObjects = filterObject.map(c => {
                  const { ...data } = c;
                  return {
                    ...data,
                  };
                });
                onChange(newObjects);
              } else {
                onChange([]);
              }
            }}
          >
            <span className="Font13">{_l('全选')}</span>
          </Checkbox>
          {filterObject
            .filter(n => (n.name || '').toLocaleLowerCase().includes(search.toLocaleLowerCase()))
            .map(c => (
              <Checkbox
                key={c.objectId}
                checked={_.find(refreshObjects, { objectId: c.objectId }) ? true : false}
                onChange={e => {
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
  };

  const renderObject = item => {
    const object = _.find(filterObject, { objectId: item.objectId });
    const name = _.get(object, 'name');
    return (
      <div key={item.objectId} className={cx('tag valignWrapper', { warning: !object })}>
        <Icon className="textSecondary Font17" icon={item.type === 1 ? 'worksheet_column_chart' : 'view_eye'} />
        {object ? (
          <Fragment>
            <span className="Font13 mLeft5 mRight5 ellipsis" title={name}>
              {name}
            </span>
          </Fragment>
        ) : (
          <span className="Font13 Red mLeft5 mRight5">{_l('该刷新对象已删除')}</span>
        )}
        <Icon
          className="textTertiary Font16 pointer"
          icon="close"
          onClick={() => {
            removeFilterObject(item.objectId);
          }}
        />
      </div>
    );
  };

  if (loading) {
    return <LoadDiv />;
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
        {refreshObjects.map(item => renderObject(item))}
        <Popover
          open={addTagVisible}
          onOpenChange={setAddTagVisible}
          trigger="click"
          placement="bottomLeft"
          noPadding
          content={renderOverlay()}
        >
          <div className="tag add valignWrapper pointer">
            <Icon className="Font17" icon="add" />
            <span className="bold">{_l('组件')}</span>
          </div>
        </Popover>
      </TagWrap>
    </div>
  );
};

export default CallBackRefresh;
