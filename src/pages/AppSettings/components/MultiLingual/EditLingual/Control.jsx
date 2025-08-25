import React, { useEffect, useRef, useState } from 'react';
import _ from 'lodash';
import { Icon, LoadDiv, ScrollView } from 'ming-ui';
import sheetApi from 'src/api/worksheet';
import { ALL_SYS } from 'src/pages/widgetConfig/config/widget';
import { getIconByType } from 'src/pages/widgetConfig/util';
import ControlContent from './ControlContent';

export default function Control(props) {
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
        getTemplate: true,
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

  const handlePositionControl = c => {
    const el = document.querySelector(`.navItem-${c.controlId}`);
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

  const { template = {} } = sheetInfo;
  const controls = (template.controls || []).filter(c => !ALL_SYS.includes(c.controlId));

  const renderControlNav = c => {
    const data = _.find(translateData, { correlationId: c.controlId, parentId: selectNode.workSheetId }) || {};
    const translateInfo = data.data || {};
    return (
      <div
        className="navItem flexRow alignItemsCenter pointer"
        key={c.controlId}
        onClick={() => handlePositionControl(c)}
      >
        <Icon icon={getIconByType(c.type)} className="Gray_9e Font16" />
        <span className="mLeft5 Font13 ellipsis">{translateInfo.name || c.controlName}</span>
      </div>
    );
  };

  return (
    <div className="flexRow pAll10 h100">
      <div className="nav flexColumn">
        <div className="searchWrap flexRow alignItemsCenter mBottom10">
          <Icon className="Gray_9e Font20 mRight5" icon="search" />
          <input
            placeholder={_l('字段')}
            className="flex"
            value={searchValue}
            onChange={e => {
              setSearchValue(e.target.value);
            }}
          />
          {searchValue && <Icon className="Gray_9e pointer Font15" icon="cancel" onClick={() => setSearchValue('')} />}
        </div>
        <ScrollView className="flex">
          {controls.filter(c => c.controlName.includes(searchValue)).map(c => renderControlNav(c))}
        </ScrollView>
      </div>
      <ScrollView className="h100" ref={scrollViewRef}>
        <div className="pLeft20 pRight20">
          {controls.map(c => (
            <ControlContent
              app={app}
              control={c}
              selectNode={selectNode}
              comparisonLangId={comparisonLangId}
              comparisonLangData={comparisonLangData}
              translateData={translateData}
              onSelectedKeys={props.onSelectedKeys}
              setExpandedKeys={props.setExpandedKeys}
              onEditAppLang={onEditAppLang}
            />
          ))}
        </div>
      </ScrollView>
    </div>
  );
}
