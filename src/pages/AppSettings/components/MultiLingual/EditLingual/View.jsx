import React, { useEffect, useRef, useState } from 'react';
import { Input } from 'antd';
import cx from 'classnames';
import _ from 'lodash';
import styled from 'styled-components';
import { Icon, LoadDiv, ScrollView } from 'ming-ui';
import sheetApi from 'src/api/worksheet';
import { getTranslateInfo } from 'src/utils/app';
import { LANG_DATA_TYPE } from '../config';
import EditInput from './EditInput';

const Wrap = styled.div`
  .viewsNav {
    width: 180px;
    .view {
      height: 36px;
      border-radius: 4px;
      padding: 0 10px;
      margin-right: 12px;
      &:hover {
        background-color: #f5f5f5;
      }
    }
  }
  .viewWrap {
    .viewName {
      padding: 3px;
    }
    .nodeItem {
      padding: 0 3px;
    }
  }
`;

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

  const handlePositionView = item => {
    const el = document.querySelector(`.view-${item.viewId}`);
    const className = 'highlight';
    const highlightEl = el.querySelector('.viewName');
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

  const renderViewNav = view => {
    const data = _.find(translateData, { correlationId: view.viewId }) || {};
    const translateInfo = data.data || {};
    return (
      <div className="view flexRow alignItemsCenter pointer" key={view.viewId} onClick={() => handlePositionView(view)}>
        <span className="mLeft5 Font13 ellipsis">{translateInfo.name || view.name}</span>
      </div>
    );
  };

  const renderViewContent = view => {
    const data = _.find(translateData, { correlationId: view.viewId }) || {};
    const translateInfo = data.data || {};
    const comparisonLangInfo = getTranslateInfo(app.id, null, view.viewId, comparisonLangData);

    const handleSave = info => {
      onEditAppLang({
        id: data.id,
        parentId: selectNode.workSheetId,
        correlationId: view.viewId,
        type: LANG_DATA_TYPE.wrokSheetView,
        data: {
          ...translateInfo,
          ...info,
        },
      });
    };

    return (
      <div className={cx('flexColumn mBottom30 viewWrap', `view-${view.viewId}`)} key={view.viewId}>
        <div className="flexRow alignItemsCenter mBottom15 viewName">
          <span className="flex Font14 bold ellipsis">{translateInfo.name || view.name}</span>
        </div>
        <div className="flexRow alignItemsCenter nodeItem">
          <div className="Font13 mRight20 label">{_l('视图名称')}</div>
          <Input
            className="flex mRight20"
            value={comparisonLangId ? comparisonLangInfo.name : view.name}
            disabled={true}
          />
          <EditInput className="flex" value={translateInfo.name} onChange={value => handleSave({ name: value })} />
        </div>
      </div>
    );
  };

  return (
    <Wrap className="flexRow pAll10 h100">
      <div className="viewsNav flexColumn">
        <div className="searchWrap flexRow alignItemsCenter mBottom10">
          <Icon className="Gray_9e Font20 mRight5" icon="search" />
          <input
            placeholder={_l('视图')}
            className="flex"
            value={searchValue}
            onChange={e => {
              setSearchValue(e.target.value);
            }}
          />
          {searchValue && <Icon className="Gray_9e pointer Font15" icon="cancel" onClick={() => setSearchValue('')} />}
        </div>
        <ScrollView className="h100">
          {views.filter(view => view.name.includes(searchValue)).map(view => renderViewNav(view))}
        </ScrollView>
      </div>
      <ScrollView className="h100" ref={scrollViewRef}>
        <div className="pLeft20 pRight20">{views.map(view => renderViewContent(view))}</div>
      </ScrollView>
    </Wrap>
  );
}
