import React, { Fragment, useState, useEffect, useRef } from 'react';
import cx from 'classnames';
import { Icon, LoadDiv, ScrollView } from 'ming-ui';
import { Input } from 'antd';
import EditInput from './EditInput';
import sheetApi from 'src/api/worksheet';
import styled from 'styled-components';
import { LANG_DATA_TYPE } from '../config';
import { getTranslateInfo } from 'src/util';

export default function ControlRules(props) {
  const { app, selectNode, translateData, comparisonLangId, comparisonLangData, onEditAppLang } = props;
  const [loading, setLoading] = useState(true);
  const [rules, setRules] = useState([]);
  const [searchValue, setSearchValue] = useState('');
  const scrollViewRef = useRef();

  useEffect(() => {
    setLoading(true);
    sheetApi.getControlRules({
      type: 1,
      worksheetId: selectNode.workSheetId
    }).then(rules => {
      setLoading(false);
      setRules(rules.filter(c => c.type === 1));
    });
  }, [selectNode.key]);

  if (loading) {
    return (
      <div className="flexRow alignItemsCenter justifyContentCenter h100">
        <LoadDiv />
      </div>
    );
  }

  if (!rules.length) {
    return (
      <div className="flexRow alignItemsCenter justifyContentCenter h100 Gray_9e Font14">
        {_l('没有验证规则')}
      </div>
    );
  }

  const handlePositionItem = (item) => {
    const el = document.querySelector(`.navItem-${item.ruleId}`);
    const className = 'highlight';
    const highlightEl = el.querySelector('.itemName');
    $(highlightEl).addClass(className).on('webkitAnimationEnd oAnimationEnd MSAnimationEnd animationend', function () {
      $(this).removeClass(className);
    });
    $(scrollViewRef.current.nanoScroller).nanoScroller({ scrollTop: el.offsetTop });
  }

  const renderNav = item => {
    return (
      <div
        className="navItem flexRow alignItemsCenter pointer"
        key={item.ruleId}
        onClick={() => handlePositionItem(item)}
      >
        <span className="mLeft5 Font13 ellipsis">{item.name}</span>
      </div>
    );
  };

  const renderContent = item => {
    const data = _.find(translateData, { correlationId: item.ruleId }) || {};
    const translateInfo = data.data || {};
    const comparisonLangInfo = getTranslateInfo(app.id, selectNode.workSheetId, item.ruleId, comparisonLangData);

    const handleSave = info => {
      onEditAppLang({
        id: data.id,
        parentId: selectNode.workSheetId,
        correlationId: item.ruleId,
        type: LANG_DATA_TYPE.wrokSheetControlRules,
        data: {
          ...translateInfo,
          ...info
        }
      });
    };

    return (
      <div className={cx('flexColumn mBottom30', `navItem-${item.ruleId}`)} key={item.ruleId}>
        <div className="flexRow alignItemsCenter mBottom15 itemName">
          <span className="flex Font14 bold ellipsis">{item.name}</span>
        </div>
        <div className="flexRow alignItemsCenter nodeItem">
            <div className="Font13 mRight20 label">{_l('验证规则提示内容')}</div>
            <Input className="flex mRight20" value={comparisonLangId ? comparisonLangInfo.message : _.get(item.ruleItems[0], 'message')} disabled={true} />
            <EditInput
              className="flex"
              value={translateInfo.message}
              onChange={value => handleSave({ message: value })}
            />
          </div>
      </div>
    );
  }

  return (
    <div className="flexRow pAll10 h100">
      <div className="nav flexColumn">
        <div className="searchWrap flexRow alignItemsCenter mBottom10">
          <Icon className="Gray_9e Font20 mRight5" icon="search" />
          <input
            placeholder={_l('验证规则')}
            className="flex"
            value={searchValue}
            onChange={(e) => {
              setSearchValue(e.target.value);
            }}
          />
          {searchValue && (
            <Icon className="Gray_9e pointer Font15" icon="closeelement-bg-circle" onClick={() => setSearchValue('')} />
          )}
        </div>
        <ScrollView className="flex">
          {rules.filter(item => item.name.includes(searchValue)).map((item) => (
            renderNav(item)
          ))}
        </ScrollView>
      </div>
      <ScrollView className="flex" ref={scrollViewRef}>
        <div className="pLeft20 pRight20">
          {rules.map((item) => (
            renderContent(item)
          ))}
        </div>
      </ScrollView>
    </div>
  );
}