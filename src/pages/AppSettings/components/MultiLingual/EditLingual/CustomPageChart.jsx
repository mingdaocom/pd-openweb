import React, { Fragment, useEffect, useRef, useState } from 'react';
import { Input } from 'antd';
import cx from 'classnames';
import { Icon, LoadDiv, ScrollView } from 'ming-ui';
import customApi from 'statistics/api/custom';
import reportApi from 'statistics/api/report';
import { getTranslateInfo } from 'src/utils/app';
import { LANG_DATA_TYPE } from '../config';
import EditInput from './EditInput';

export default function CustomPageChart(props) {
  const { app, selectNode, translateData, comparisonLangId, comparisonLangData, onEditAppLang } = props;
  const [loading, setLoading] = useState(true);
  const [list, setList] = useState([]);
  const [searchValue, setSearchValue] = useState('');
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
        setList(components.filter(c => c.type === 1));
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
      <div className="flexRow alignItemsCenter justifyContentCenter h100 Gray_9e Font14">{_l('没有统计图表')}</div>
    );
  }

  const handlePositionReport = item => {
    const el = document.querySelector(`.navItem-${item.value}`);
    const className = 'highlight';
    const highlightEl = el.querySelector('.itemName');
    $(highlightEl)
      .addClass(className)
      .on('webkitAnimationEnd oAnimationEnd MSAnimationEnd animationend', function () {
        $(this).removeClass(className);
      });
    $(scrollViewRef.current.nanoScroller).nanoScroller({ scrollTop: el.offsetTop });
  };

  const renderNav = item => {
    const data = _.find(translateData, { correlationId: item.value }) || {};
    const translateInfo = data.data || {};
    return (
      <div
        className="navItem flexRow alignItemsCenter pointer"
        key={item.value}
        onClick={() => handlePositionReport(item)}
      >
        <span className="mLeft5 Font13 ellipsis">{translateInfo.name || item.name}</span>
      </div>
    );
  };

  const renderContent = item => {
    const data = _.find(translateData, { correlationId: item.value }) || {};
    const translateInfo = data.data || {};
    const comparisonLangInfo = getTranslateInfo(app.id, null, item.value, comparisonLangData);

    const handleSave = info => {
      onEditAppLang({
        id: data.id,
        parentId: selectNode.workSheetId,
        correlationId: item.value,
        type: LANG_DATA_TYPE.customePageStatistics,
        data: {
          ...translateInfo,
          ...info,
        },
      });
    };

    return (
      <div className={cx('flexColumn mBottom30', `navItem-${item.value}`)} key={item.value}>
        <div className="flexRow alignItemsCenter mBottom15 itemName">
          <span className="flex Font14 bold ellipsis">{translateInfo.name || item.name}</span>
        </div>
        <div className="flexRow alignItemsCenter nodeItem">
          <div className="Font13 mRight20 label">{_l('图表名称')}</div>
          <Input
            className="flex mRight20"
            value={comparisonLangId ? comparisonLangInfo.name : item.name}
            disabled={true}
          />
          <EditInput className="flex" value={translateInfo.name} onChange={value => handleSave({ name: value })} />
        </div>
        <div className="flexRow alignItemsCenter nodeItem">
          <div className="Font13 mRight20 label">{_l('图表说明')}</div>
          <Input
            className="flex mRight20"
            value={comparisonLangId ? comparisonLangInfo.description : item.reportDesc}
            disabled={true}
          />
          <EditInput
            className="flex"
            disabled={!item.reportDesc}
            value={translateInfo.description}
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
        <div className="searchWrap flexRow alignItemsCenter mBottom10">
          <Icon className="Gray_9e Font20 mRight5" icon="search" />
          <input
            placeholder={_l('统计图')}
            className="flex"
            value={searchValue}
            onChange={e => {
              setSearchValue(e.target.value);
            }}
          />
          {searchValue && (
            <Icon className="Gray_9e pointer Font15" icon="closeelement-bg-circle" onClick={() => setSearchValue('')} />
          )}
        </div>
        <ScrollView className="flex">
          {list.filter(item => item.name.includes(searchValue)).map(item => renderNav(item))}
        </ScrollView>
      </div>
      <ScrollView className="flex" ref={scrollViewRef}>
        <div className="pLeft20 pRight20">{list.map(item => renderContent(item))}</div>
      </ScrollView>
    </div>
  );
}
