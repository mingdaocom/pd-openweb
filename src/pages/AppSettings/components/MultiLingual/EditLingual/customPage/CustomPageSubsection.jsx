import React, { useEffect, useRef, useState } from 'react';
import cx from 'classnames';
import _ from 'lodash';
import { LoadDiv, ScrollView } from 'ming-ui';
import { Input } from 'ming-ui/antd-components';
import customApi from 'statistics/api/custom';
import { getTranslateInfo } from 'src/utils/services/app';
import { LANG_DATA_TYPE } from '../../config';
import EditInput from '../EditInput';

export default function CustomPageSubsection(props) {
  const { app, selectNode, translateData, comparisonLangId, comparisonLangData, onEditAppLang } = props;
  const [componentData, setComponentData] = useState({
    pageId: selectNode.workSheetId,
    loading: true,
    list: [],
  });
  const scrollViewRef = useRef();
  const loading = componentData.pageId !== selectNode.workSheetId || componentData.loading;
  const list = componentData.pageId === selectNode.workSheetId ? componentData.list : [];

  useEffect(() => {
    let disposed = false;

    customApi
      .getPage({
        appId: selectNode.workSheetId,
      })
      .then(data => {
        if (disposed) {
          return;
        }

        const { components } = data;
        setComponentData({
          pageId: selectNode.workSheetId,
          loading: false,
          list: components.filter(c => [12, 'subsection'].includes(c.type)),
        });
      });

    return () => {
      disposed = true;
    };
  }, [selectNode.workSheetId]);

  if (loading) {
    return (
      <div className="flexRow alignItemsCenter justifyContentCenter h100">
        <LoadDiv />
      </div>
    );
  }

  if (!list.length) {
    return (
      <div className="flexRow alignItemsCenter justifyContentCenter h100 textTertiary Font14">{_l('没有分段')}</div>
    );
  }

  const handlePositionReport = item => {
    const el = document.querySelector(`.navItem-${item.id}`);
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
    const data = _.find(translateData, { correlationId: item.id }) || {};
    const translateInfo = data.data || {};
    const name = _.get(item, 'componentConfig.name');

    return (
      <div
        className="navItem flexRow alignItemsCenter pointer"
        key={item.id}
        onClick={() => handlePositionReport(item)}
      >
        <span className="mLeft5 Font13 ellipsis">{translateInfo.name || name}</span>
      </div>
    );
  };

  const renderContent = item => {
    const data = _.find(translateData, { correlationId: item.id }) || {};
    const translateInfo = data.data || {};
    const comparisonLangInfo = getTranslateInfo(app.id, null, item.id, comparisonLangData);
    const name = _.get(item, 'componentConfig.name');

    const handleSave = info => {
      onEditAppLang({
        id: data.id,
        parentId: selectNode.workSheetId,
        correlationId: item.id,
        type: LANG_DATA_TYPE.customePageContent,
        data: {
          ...translateInfo,
          ...info,
        },
      });
    };

    return (
      <div className={cx('flexColumn mBottom30', `navItem-${item.id}`)} key={item.id}>
        <div className="flexRow alignItemsCenter mBottom15 itemName">
          <span className="flex Font14 bold ellipsis">{translateInfo.name || name}</span>
        </div>
        <div className="flexRow alignItemsCenter nodeItem">
          <div className="Font13 mRight20 label">{_l('分段名称')}</div>
          <Input className="flex mRight20" value={comparisonLangId ? comparisonLangInfo.name : name} disabled={true} />
          <EditInput className="flex" value={translateInfo.name} onChange={value => handleSave({ name: value })} />
        </div>
      </div>
    );
  };

  return (
    <div className="flexRow pAll10 h100">
      <div className="nav flexColumn">
        <ScrollView className="h100">{list.map(item => renderNav(item))}</ScrollView>
      </div>
      <ScrollView className="h100" ref={scrollViewRef}>
        <div className="pLeft20 pRight20">{list.map(item => renderContent(item))}</div>
      </ScrollView>
    </div>
  );
}
