import React, { useState, useEffect } from 'react';
import { Dialog, ScrollView, LoadDiv, Icon } from 'ming-ui';
import './index.less';
import { getList } from '../../api/packageVersion';
import { navigateTo } from 'router/navigateTo';

export default ({ appId, companyId, visible, onSave, onClose }) => {
  const [data, setData] = useState(null);
  const [pageIndex, setIndex] = useState(1);
  const [keywords, setKeywords] = useState('');
  const [hasMore, setMore] = useState(false);
  const getListFunc = (index = 1, keyword = '') => {
    getList(
      {
        apkId: appId,
        companyId,
        keyword,
        pageIndex: index,
        pageSize: 20,
        types: [1, 2, 3],
      },
      { isIntegration: true },
    ).then(res => {
      setData(index === 1 ? res : data.concat(res));
      setIndex(index);
      setKeywords(keyword);
      setMore(res.length === 20);
    });
  };
  const onChange = _.debounce(keyword => {
    getListFunc(1, keyword);
  }, 500);
  const renderList = () => {
    return (
      <ScrollView
        onScrollEnd={() => {
          if (hasMore) {
            setMore(false);
            getListFunc(pageIndex + 1, keywords);
          }
        }}
      >
        {!data.length && (
          <div className="selectApiPackageNull h100">
            <div className="selectApiPackageIcon">
              <i className="icon-connect" />
            </div>
            <div className="mTop25 Font14 Gray_9e">{_l('暂无搜索结果')}</div>
          </div>
        )}
        {data.map(item => {
          return (
            <div
              key={item.id}
              className="selectApiPackageList"
              onClick={() => {
                onSave(item);
                onClose();
              }}
            >
              <div className="selectApiPackageListItem flexRow alignItemsCenter flex">
                <div className="selectApiPackageListImg">
                  {item.iconName ? <img src={item.iconName} /> : <Icon icon="connect" className="Font16" />}
                </div>
                <div className="flex mLeft16 flexColumn">
                  <div className="Font15 ellipsis">{item.name}</div>
                  <div className="mTop5 Gray_9e ellipsis">{item.explain}</div>
                </div>
              </div>
            </div>
          );
        })}
      </ScrollView>
    );
  };

  useEffect(
    () => {
      visible && getListFunc();
    },
    [visible],
  );

  if (!visible) return null;

  return (
    <Dialog
      className="selectApiPackageDialog"
      title={_l('选择 API 连接与认证')}
      visible
      width={720}
      showFooter={false}
      onCancel={onClose}
    >
      <div className="flexColumn h100">
        {data !== null && (!!data.length || !!keywords) && (
          <div className="flexRow relative mBottom15 relative alignItemsCenter">
            <input
              type="text"
              placeholder={_l('搜索 API 连接')}
              className="selectApiPackageInput"
              onChange={e => onChange(e.target.value.trim())}
            />
            <div className="flex" />
            <span
              className="Font15 pointer ThemeColor3 ThemeHoverColor2"
              onClick={() => navigateTo('/integration/connect/connectList')}
            >
              + {_l('添加新连接')}
            </span>
            <i className="icon-search1 selectApiPackageSearch Gray_9e" />
          </div>
        )}

        <div className="flex">
          {data === null ? (
            <LoadDiv />
          ) : !data.length && !keywords ? (
            <div className="selectApiPackageNull h100">
              <div className="selectApiPackageIcon">
                <i className="icon-connect" />
              </div>
              <div className="mTop25 Font14 Gray_9e">
                {_l('暂无 API 连接可用，请先到集成中心创建新的 API 连接与认证')}
              </div>
              <span
                className="selectApiPackageBtn ThemeBGColor3 ThemeHoverBGColor2"
                onClick={() => navigateTo('/integration/connect/connectList')}
              >
                {_l('去集成中心创建')}
              </span>
            </div>
          ) : (
            renderList()
          )}
        </div>
      </div>
    </Dialog>
  );
};
