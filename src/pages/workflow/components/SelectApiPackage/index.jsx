import React, { useEffect, useState } from 'react';
import _ from 'lodash';
import { navigateTo } from 'router/navigation/navigateTo';
import { Icon, LoadDiv, ScrollView } from 'ming-ui';
import { Input, Modal } from 'ming-ui/antd-components';
import packageVersion from '../../api/packageVersion';
import './index.less';

export default ({
  appId,
  companyId,
  title = _l('选择 API 连接与认证'),
  types = [1, 2, 3],
  visible,
  allowAdd = true,
  onSave,
  onClose,
}) => {
  const [data, setData] = useState(null);
  const [pageIndex, setIndex] = useState(1);
  const [keywords, setKeywords] = useState('');
  const [hasMore, setMore] = useState(false);

  const getListFunc = (index = 1, keyword = '') => {
    packageVersion
      .getList(
        {
          apkId: appId,
          companyId,
          keyword,
          pageIndex: index,
          pageSize: 20,
          types,
        },
        { isIntegration: true },
      )
      .then(res => {
        setKeywords(keyword);
        setData(index === 1 ? res.filter(o => !o.hasAuth) : data.concat(res.filter(o => !o.hasAuth)));
        setIndex(index);
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
            <div className="mTop25 Font14 textSecondary">{_l('暂无搜索结果')}</div>
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
                  <div className="mTop5 textSecondary ellipsis">{item.explain}</div>
                </div>
              </div>
            </div>
          );
        })}
      </ScrollView>
    );
  };

  useEffect(() => {
    visible && getListFunc();
  }, [visible]);

  if (!visible) return null;

  return (
    <Modal
      className="selectApiPackageDialog"
      title={title}
      open
      width={720}
      mask={{ closable: true }}
      keyboard
      onCancel={onClose}
    >
      <div className="flexColumn h100">
        {data !== null && (!!data.length || !!keywords) && (
          <div className="flexRow relative mBottom15 alignItemsCenter">
            <Input
              radius
              placeholder={_l('搜索 API 连接')}
              className="selectApiPackageInput"
              variant="filled"
              prefix={<Icon icon="search" className="Font16 textSecondary" />}
              onChange={e => onChange(e.target.value.trim())}
            />
            <div className="flex" />
            {allowAdd && !md.global.SysSettings.hideIntegration && (
              <span
                className="Font15 pointer colorPrimary hoverColorPrimaryDark"
                onClick={() => navigateTo('/integration/connectList')}
              >
                + {_l('添加新连接')}
              </span>
            )}
          </div>
        )}

        <div className="flex overflowHidden">
          {data === null ? (
            <LoadDiv />
          ) : !data.length && !keywords ? (
            <div className="selectApiPackageNull h100">
              <div className="selectApiPackageIcon">
                <i className="icon-connect" />
              </div>
              <div className="mTop25 Font14 textSecondary">
                {_l('暂无 API 连接可用，请先到集成中心创建新的 API 连接与认证')}
              </div>
              {allowAdd && (
                <span
                  className="selectApiPackageBtn bgColorPrimary hoverBgColorPrimaryDark"
                  onClick={() => navigateTo('/integration/connectList')}
                >
                  {_l('去集成中心创建')}
                </span>
              )}
            </div>
          ) : (
            renderList()
          )}
        </div>
      </div>
    </Modal>
  );
};
