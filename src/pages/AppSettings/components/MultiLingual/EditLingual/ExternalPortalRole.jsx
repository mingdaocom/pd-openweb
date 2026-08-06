import React, { useEffect, useRef, useState } from 'react';
import { Input } from 'antd';
import cx from 'classnames';
import _ from 'lodash';
import { Icon, LoadDiv, ScrollView } from 'ming-ui';
import externalPortalApi from 'src/api/externalPortal';
import { getTranslateInfo } from 'src/utils/app';
import { LANG_DATA_TYPE } from '../config';
import EditInput from './EditInput';

export default function ExternalPortalRole(props) {
  const { app, selectNode, translateData, comparisonLangId, comparisonLangData, onEditAppLang } = props;
  const [loading, setLoading] = useState(true);
  const [roleInfos, setRoleInfos] = useState([]);
  const [searchValue, setSearchValue] = useState('');
  const scrollViewRef = useRef();

  useEffect(() => {
    setLoading(true);

    externalPortalApi
      .getExRoles({
        appId: app.id,
      })
      .then(data => {
        setRoleInfos(Array.isArray(data) ? data : []);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [selectNode.key]);

  if (loading) {
    return (
      <div className="flexRow alignItemsCenter justifyContentCenter h100">
        <LoadDiv />
      </div>
    );
  }

  const handlePositionItem = item => {
    const el = document.querySelector(`.navItem-${item.roleId}`);
    const className = 'highlight';
    const highlightEl = el.querySelector('.itemName');
    $(highlightEl)
      .addClass(className)
      .on('webkitAnimationEnd oAnimationEnd MSAnimationEnd animationend', function () {
        $(this).removeClass(className);
      });
    if (scrollViewRef.current) {
      scrollViewRef.current.scrollTo({ top: el.offsetTop });
    }
  };

  const renderNav = item => {
    const data = _.find(translateData, { correlationId: item.roleId }) || {};
    const translateInfo = data.data || {};
    return (
      <div
        className="navItem flexRow alignItemsCenter pointer"
        key={item.roleId}
        onClick={() => handlePositionItem(item)}
      >
        <span className="mLeft5 Font13 ellipsis">{translateInfo.name || item.name}</span>
      </div>
    );
  };

  const renderContent = item => {
    const data = _.find(translateData, { correlationId: item.roleId }) || {};
    const translateInfo = data.data || {};
    const comparisonLangInfo = getTranslateInfo(app.id, null, item.roleId, comparisonLangData);

    const handleSave = info => {
      onEditAppLang({
        id: data.id,
        parentId: app.id,
        correlationId: item.roleId,
        type: LANG_DATA_TYPE.appRole,
        data: {
          ...translateInfo,
          ...info,
        },
      });
    };

    return (
      <div className={cx('flexColumn mBottom30', `navItem-${item.roleId}`)} key={item.roleId}>
        <div className="flexRow alignItemsCenter mBottom15 itemName">
          <span className="flex Font14 bold ellipsis">{translateInfo.name || item.name}</span>
        </div>
        <div className="flexRow alignItemsCenter nodeItem">
          <div className="Font13 mRight20 label">{_l('角色名称')}</div>
          <Input
            className="flex mRight20"
            value={comparisonLangId ? comparisonLangInfo.name : item.name}
            disabled={true}
          />
          <EditInput className="flex" value={translateInfo.name} onChange={value => handleSave({ name: value })} />
        </div>
        <div className="flexRow alignItemsCenter nodeItem">
          <div className="Font13 mRight20 label">{_l('角色描述')}</div>
          <Input
            className="flex mRight20"
            value={comparisonLangId ? comparisonLangInfo.description : item.description}
            disabled={true}
          />
          <EditInput
            className="flex"
            value={translateInfo.description}
            onChange={value => handleSave({ description: value })}
          />
        </div>
      </div>
    );
  };

  return (
    <div className="flexRow pAll10 h100">
      <div className="nav flexColumn">
        <div className="searchWrap flexRow alignItemsCenter mBottom10">
          <Icon className="textTertiary Font20 mRight5" icon="search" />
          <input
            placeholder={_l('角色')}
            className="flex"
            value={searchValue}
            onChange={e => {
              setSearchValue(e.target.value);
            }}
          />
          {searchValue && (
            <Icon className="textTertiary pointer Font15" icon="cancel" onClick={() => setSearchValue('')} />
          )}
        </div>
        <ScrollView className="h100">
          {roleInfos.filter(item => (item.name || '').includes(searchValue)).map(item => renderNav(item))}
        </ScrollView>
      </div>
      <ScrollView className="h100" ref={scrollViewRef}>
        <div className="pLeft20 pRight20">{roleInfos.map(item => renderContent(item))}</div>
      </ScrollView>
    </div>
  );
}
