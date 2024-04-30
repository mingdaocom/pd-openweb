import React, { useState, useEffect, useRef } from 'react';
import { useSetState } from 'react-use';
import { Dialog, Icon, Checkbox, SvgIcon, FunctionWrap } from 'ming-ui';
import styled from 'styled-components';
import _ from 'lodash';
import { getAppOrItemColor } from './utils';
import { getFilterApps } from '../AppCenter/utils';
import homeAppAjax from 'src/api/homeApp';

const ContentWrapper = styled.div`
  height: 100%;
  display: flex;
  flex-direction: column;
  .appSearchInput {
    display: flex;
    position: relative;
    height: 36px;
    margin-top: 8px;

    input {
      flex: 1;
      border: none;
      border-radius: 26px;
      background-color: #f5f5f5;
      padding: 0 18px 0 40px;
      &:hover {
        background-color: #f0f0f0;
      }
      &:focus {
        background-color: #fff;
        box-shadow: 0px 1px 4px rgba(0, 0, 0, 0.2);
      }
    }
    .searchIcon {
      position: absolute;
      top: 10px;
      left: 18px;
    }
    .searchClear {
      display: flex;
      justify-content: center;
      align-items: center;
      position: absolute;
      right: 3px;
      top: 3px;
      width: 30px;
      height: 30px;
      border-radius: 50%;
      cursor: pointer;
      &:hover {
        background: #f8f8f8;
      }
    }
  }
  .emptyText {
    flex: 1;
    display: flex;
    justify-content: center;
    align-items: center;
    color: #757575;
    font-size: 15px;
  }
  .appList {
    flex: 1;
    margin-top: 16px;
    overflow: auto;
  }
`;

const Item = styled.div`
  display: flex;
  align-items: center;
  padding: 8px;
  border-radius: 3px;
  cursor: pointer;
  .expandIcon {
    font-size: 10px;
    margin-right: 8px;
    color: #9d9d9d;
    cursor: pointer;
    &:hover {
      color: #2196f3;
    }
  }
  .ming.Checkbox {
    min-width: 18px;
    .Checkbox-box {
      margin: 0 !important;
    }
  }

  .appIcon {
    width: 24px;
    height: 24px;
    line-height: 16px;
    min-width: 24px;
    border-radius: 50%;
    margin: 0 10px;
    display: flex;
    justify-content: center;
    align-items: center;
    position: relative;
  }
  &.isItem {
    padding-left: 48px;
    line-height: 16px;
  }
  &:hover {
    background: #f8f8f8;
  }
`;

function AddCollectApp(props) {
  const { onClose, apps = [], markedApps = [], onMarkApps, projectId } = props;
  const searchRef = useRef();
  const [keywords, setKeywords] = useState('');
  const [expandIds, setExpandIds] = useState([]);
  const [items, setItems] = useSetState({});
  const [selectedItems, setSelectItems] = useState([]);

  useEffect(() => {
    setSelectItems(
      markedApps.map(item => ({
        appId: item.id,
        isMark: true,
        ..._.pick(item, ['type', 'itemId', 'itemName', 'itemUrl']),
      })),
    );
  }, []);

  const fetchItemList = appId => {
    homeAppAjax.getAppItems({ appId }).then(res => {
      if (res) {
        const markedItems = res.filter(item => item.isMarked);
        setItems({ [appId]: res });
        setSelectItems(
          selectedItems.concat(
            markedItems.map(item => {
              return {
                appId,
                isMark: true,
                type: item.type === 0 ? 2 : item.type,
                itemId: item.workSheetId,
                itemName: item.workSheetName,
                itemUrl: item.iconUrl,
              };
            }),
          ),
        );
      }
    });
  };

  const onAddMarkedApps = () => {
    const addedItems = _.differenceWith(selectedItems, markedApps, (s, m) =>
      !!s.type ? s.itemId === m.itemId : s.appId === m.id && s.itemId === m.itemId,
    );
    const delItems = _.differenceWith(markedApps, selectedItems, (m, s) =>
      !!m.type ? s.itemId === m.itemId : s.appId === m.id && s.itemId === m.itemId,
    ).map(item => ({ appId: item.id, itemId: item.itemId, type: item.type, isMark: false }));

    if (!addedItems.length && !delItems.length) {
      return;
    }

    onMarkApps({ items: addedItems.concat(delItems), projectId });
  };

  const renderAppList = () => {
    const appList = getFilterApps(apps, keywords);
    if (!appList.length) {
      return keywords ? (
        <div className="emptyText">{_l('无搜索结果')}</div>
      ) : (
        <div className="emptyText">{_l('没有可选择的应用')}</div>
      );
    }
    return (
      <div className="appList">
        {appList.map((app, index) => {
          const isExpand = _.includes(expandIds, app.id);
          const isAppChecked = !!_.find(selectedItems, item => item.appId === app.id && !item.type);
          return (
            <React.Fragment>
              <Item
                key={index}
                onClick={() => {
                  const newSelected = isAppChecked
                    ? selectedItems.filter(i => !!i.type || i.appId !== app.id)
                    : selectedItems.concat({ appId: app.id, type: 0, isMark: true });
                  setSelectItems(newSelected);
                }}
              >
                <Icon
                  icon={isExpand ? 'arrow-down' : 'arrow-right-tip'}
                  className="expandIcon"
                  onClick={e => {
                    e.stopPropagation();
                    const newIds = isExpand ? expandIds.filter(item => item !== app.id) : expandIds.concat(app.id);
                    setExpandIds(newIds);
                    !items[app.id] && fetchItemList(app.id);
                  }}
                />
                <Checkbox checked={isAppChecked} />
                <div className="appIcon" style={{ backgroundColor: getAppOrItemColor(app).bg }}>
                  <SvgIcon url={app.iconUrl} fill={getAppOrItemColor(app).iconColor} size={20} />
                </div>
                <div className="overflow_ellipsis">{app.name}</div>
              </Item>
              {isExpand &&
                (items[app.id] || []).map(item => {
                  const isItemChecked = !!_.find(selectedItems, i => i.itemId === item.workSheetId);
                  const itemType = item.type === 0 ? 2 : item.type; // 转换类型--0传2(工作表),1传1(自定义页面)
                  return (
                    <Item
                      className="isItem"
                      onClick={() => {
                        const newSelected = isItemChecked
                          ? selectedItems.filter(i => i.itemId !== item.workSheetId)
                          : selectedItems.concat({
                              appId: app.id,
                              isMark: true,
                              type: itemType,
                              itemId: item.workSheetId,
                              itemName: item.workSheetName,
                              itemUrl: item.iconUrl,
                            });
                        setSelectItems(newSelected);
                      }}
                    >
                      <Checkbox className="mRight10" checked={isItemChecked} />
                      <SvgIcon url={item.iconUrl} fill={getAppOrItemColor(app).bg} size={16} />
                      <div className="overflow_ellipsis mLeft6">{item.workSheetName}</div>
                    </Item>
                  );
                })}
            </React.Fragment>
          );
        })}
      </div>
    );
  };

  return (
    <Dialog
      visible={true}
      type="fixed"
      width={480}
      title={_l('添加')}
      okText={_l('确认')}
      onOk={() => {
        onAddMarkedApps();
        onClose();
      }}
      onCancel={onClose}
    >
      <ContentWrapper>
        <div className="appSearchInput">
          <Icon icon="search" className="searchIcon Font16 Gray_75" />
          <input
            type="text"
            autoFocus
            value={keywords}
            onChange={e => setKeywords(e.target.value.trim())}
            ref={searchRef}
            placeholder={_l('搜索应用名称')}
          />
          {keywords && (
            <div
              className="searchClear"
              onClick={() => {
                searchRef.current.value = '';
                setKeywords('');
              }}
            >
              <Icon type="cancel" className="Gray_9e Font16" />
            </div>
          )}
        </div>

        {renderAppList()}
      </ContentWrapper>
    </Dialog>
  );
}

export default props => FunctionWrap(AddCollectApp, { ...props });
