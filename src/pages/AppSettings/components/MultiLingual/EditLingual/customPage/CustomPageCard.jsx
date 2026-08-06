import React, { useEffect, useRef, useState } from 'react';
import { Input } from 'antd';
import cx from 'classnames';
import _ from 'lodash';
import { LoadDiv, ScrollView } from 'ming-ui';
import customApi from 'statistics/api/custom';
import { getTranslateInfo } from 'src/utils/app';
import { LANG_DATA_TYPE } from '../../config';
import EditInput from '../EditInput';

export default function CustomPageView(props) {
  const { app, selectNode, translateData, comparisonLangId, comparisonLangData, onEditAppLang } = props;
  const [loading, setLoading] = useState(true);
  const [list, setList] = useState([]);
  const scrollViewRef = useRef();

  useEffect(() => {
    setLoading(true);
    customApi
      .getPage({
        appId: selectNode.workSheetId,
      })
      .then(data => {
        const { components } = data;
        setLoading(false);
        setList(components.filter(c => c.type === 10));
      });
  }, [selectNode.key]);

  if (loading) {
    return (
      <div className="flexRow alignItemsCenter justifyContentCenter h100">
        <LoadDiv />
      </div>
    );
  }

  if (!list.length) {
    return (
      <div className="flexRow alignItemsCenter justifyContentCenter h100 textTertiary Font14">{_l('没有卡片')}</div>
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
    return (
      <div
        className="navItem flexRow alignItemsCenter pointer"
        key={item.id}
        onClick={() => handlePositionReport(item)}
      >
        <span className="mLeft5 Font13 ellipsis">{translateInfo.name || item.componentConfig.name}</span>
      </div>
    );
  };

  const renderContent = item => {
    const data = _.find(translateData, { correlationId: item.id }) || {};
    const translateInfo = data.data || {};
    const comparisonLangInfo = getTranslateInfo(app.id, null, item.id, comparisonLangData);

    const handleSave = info => {
      onEditAppLang({
        id: data.id,
        parentId: selectNode.workSheetId,
        correlationId: item.id,
        type: LANG_DATA_TYPE.customePageCard,
        data: {
          ...translateInfo,
          ...info,
        },
      });
    };

    return (
      <div className={cx('flexColumn mBottom30', `navItem-${item.id}`)} key={item.id}>
        <div className="flexRow alignItemsCenter mBottom15 itemName">
          <span className="flex Font14 bold ellipsis">{translateInfo.name || item.componentConfig.name}</span>
        </div>
        <div className="flexRow alignItemsCenter nodeItem">
          <div className="Font13 mRight20 label">{_l('卡片名称')}</div>
          <Input
            className="flex mRight20"
            value={comparisonLangId ? comparisonLangInfo.name : item.componentConfig.name}
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
        <ScrollView className="h100">{list.map(item => renderNav(item))}</ScrollView>
      </div>
      <ScrollView className="h100" ref={scrollViewRef}>
        <div className="pLeft20 pRight20">{list.map(item => renderContent(item))}</div>
      </ScrollView>
    </div>
  );
}
