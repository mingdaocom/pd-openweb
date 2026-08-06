import React, { useEffect, useRef, useState } from 'react';
import { Input } from 'antd';
import cx from 'classnames';
import _ from 'lodash';
import { Icon, LoadDiv, ScrollView } from 'ming-ui';
import sheetApi from 'src/api/worksheet';
import { getTranslateInfo } from 'src/utils/app';
import { LANG_DATA_TYPE } from '../config';
import EditInput from './EditInput';

export default function View(props) {
  const { app, selectNode, translateData, comparisonLangId, comparisonLangData, onEditAppLang } = props;
  const [loading, setLoading] = useState(true);
  const [sheetInfo, setSheetInfo] = useState({});
  const [searchValue, setSearchValue] = useState('');
  const scrollViewRef = useRef();

  useEffect(() => {
    setLoading(true);
    sheetApi
      .getWorksheetInfo({
        worksheetId: selectNode.workSheetId,
        getViews: true,
      })
      .then(data => {
        setLoading(false);
        setSheetInfo(data);
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
    const el = document.querySelector(`.navItem-${item.viewId}`);
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

  const { views = [] } = sheetInfo;

  const renderNav = item => {
    const data = _.find(translateData, { correlationId: item.viewId }) || {};
    const translateInfo = data.data || {};
    return (
      <div
        className="navItem flexRow alignItemsCenter pointer"
        key={item.viewId}
        onClick={() => handlePositionItem(item)}
      >
        <span className="mLeft5 Font13 ellipsis">{translateInfo.name || item.name}</span>
      </div>
    );
  };

  const renderContent = item => {
    const data = _.find(translateData, { correlationId: item.viewId }) || {};
    const translateInfo = data.data || {};
    const comparisonLangInfo = getTranslateInfo(app.id, null, item.viewId, comparisonLangData);

    const handleSave = info => {
      onEditAppLang({
        id: data.id,
        parentId: selectNode.workSheetId,
        correlationId: item.viewId,
        type: LANG_DATA_TYPE.wrokSheetView,
        data: {
          ...translateInfo,
          ...info,
        },
      });
    };

    return (
      <div className={cx('flexColumn mBottom30', `navItem-${item.viewId}`)} key={item.viewId}>
        <div className="flexRow alignItemsCenter mBottom15 itemName">
          <span className="flex Font14 bold ellipsis">{translateInfo.name || item.name}</span>
        </div>
        <div className="flexRow alignItemsCenter nodeItem">
          <div className="Font13 mRight20 label">{_l('视图名称')}</div>
          <Input
            className="flex mRight20"
            value={comparisonLangId ? comparisonLangInfo.name : item.name}
            disabled={true}
          />
          <EditInput className="flex" value={translateInfo.name} onChange={value => handleSave({ name: value })} />
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
            placeholder={_l('视图')}
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
          {views.filter(item => item.name.includes(searchValue)).map(item => renderNav(item))}
        </ScrollView>
      </div>
      <ScrollView className="h100" ref={scrollViewRef}>
        <div className="pLeft20 pRight20">{views.map(item => renderContent(item))}</div>
      </ScrollView>
    </div>
  );
}
