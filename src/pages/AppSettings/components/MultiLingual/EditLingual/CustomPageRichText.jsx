import React, { useEffect, useRef, useState } from 'react';
import { Input } from 'antd';
import cx from 'classnames';
import _ from 'lodash';
import { LoadDiv, ScrollView } from 'ming-ui';
import customApi from 'statistics/api/custom';
import { getTranslateInfo } from 'src/utils/app';
import { LANG_DATA_TYPE } from '../config';
import { filterHtmlTag } from '../util';
import EditDescription from './EditDescription';
import EditInput from './EditInput';

export default function CustomPageRichText(props) {
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
        setList(components.filter(c => c.type === 2));
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

  if (!list.length) {
    return <div className="flexRow alignItemsCenter justifyContentCenter h100 Gray_9e Font14">{_l('没有富文本')}</div>;
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

  const renderNav = (item, index) => {
    return (
      <div
        className="navItem flexRow alignItemsCenter pointer"
        key={item.id}
        onClick={() => handlePositionReport(item)}
      >
        <span className="mLeft5 Font13 ellipsis">{_l('富文本%0', index)}</span>
      </div>
    );
  };

  const renderContent = (item, index) => {
    const data = _.find(translateData, { correlationId: item.id }) || {};
    const translateInfo = data.data || {};
    const comparisonLangInfo = getTranslateInfo(app.id, null, item.id, comparisonLangData);

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
          <span className="flex Font14 bold ellipsis">{_l('富文本%0', index)}</span>
        </div>
        <div className="flexRow nodeItem">
          <div className="Font13 mRight20 label">{_l('文本内容')}</div>
          <Input.TextArea
            style={{ resize: 'none' }}
            className="flex mRight20"
            value={filterHtmlTag(comparisonLangId ? comparisonLangInfo.description : item.value)}
            disabled={true}
          />
          <EditDescription
            value={translateInfo.description}
            originalValue={item.value}
            onChange={value => handleSave({ description: value })}
          />
        </div>
        {item.title && (
          <div className="flexRow alignItemsCenter nodeItem">
            <div className="Font13 mRight20 label">{_l('标题行')}</div>
            <Input
              className="flex mRight20"
              value={comparisonLangId ? comparisonLangInfo.title : item.title}
              disabled={true}
            />
            <EditInput className="flex" value={translateInfo.title} onChange={value => handleSave({ title: value })} />
          </div>
        )}
        {item.mobile.title && (
          <div className="flexRow alignItemsCenter nodeItem">
            <div className="Font13 mRight20 label">{_l('移动端标题行')}</div>
            <Input
              className="flex mRight20"
              value={comparisonLangId ? comparisonLangInfo.mobileTitle : item.mobile.title}
              disabled={true}
            />
            <EditInput
              className="flex"
              value={translateInfo.mobileTitle}
              onChange={value => handleSave({ mobileTitle: value })}
            />
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="flexRow pAll10 h100">
      <div className="nav flexColumn">
        <ScrollView className="h100">{list.map((item, index) => renderNav(item, index + 1))}</ScrollView>
      </div>
      <ScrollView className="h100" ref={scrollViewRef}>
        <div className="pLeft20 pRight20">{list.map((item, index) => renderContent(item, index + 1))}</div>
      </ScrollView>
    </div>
  );
}
