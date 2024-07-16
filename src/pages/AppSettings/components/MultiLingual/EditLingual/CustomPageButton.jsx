import React, { Fragment, useState, useEffect, useRef } from 'react';
import cx from 'classnames';
import { Icon, LoadDiv, ScrollView } from 'ming-ui';
import { Input } from 'antd';
import EditInput from './EditInput';
import customApi from 'statistics/api/custom';
import { LANG_DATA_TYPE } from '../config';
import { getTranslateInfo } from 'src/util';

export default function CustomPageButton(props) {
  const { app, selectNode, translateData, comparisonLangId, comparisonLangData, onEditAppLang } = props;
  const [loading, setLoading] = useState(true);
  const [list, setList] = useState([]);
  const scrollViewRef = useRef();

  useEffect(() => {
    setLoading(true);
    customApi.getPage({
      appId: selectNode.workSheetId
    }).then(data => {
      const { components } = data;
      setLoading(false);
      setList(components.filter(c => c.type === 4));
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
      <div className="flexRow alignItemsCenter justifyContentCenter h100 Gray_9e Font14">
        {_l('没有按钮')}
      </div>
    );
  }

  const handlePositionReport = item => {
    const el = document.querySelector(`.navItem-${item.id}`);
    const className = 'highlight';
    const highlightEl = el.querySelector('.itemName');
    $(highlightEl).addClass(className).on('webkitAnimationEnd oAnimationEnd MSAnimationEnd animationend', function () {
      $(this).removeClass(className);
    });
    $(scrollViewRef.current.nanoScroller).nanoScroller({ scrollTop: el.offsetTop });
  }

  const renderNav = (item, index) => {
    return (
      <div
        className="navItem flexRow alignItemsCenter pointer"
        key={item.id}
        onClick={() => handlePositionReport(item)}
      >
        <span className="mLeft5 Font13 ellipsis">{_l('按钮组%0', index)}</span>
      </div>
    );
  };

  const renderContent = (item, index) => {
    const { button } = item;
    const data = _.find(translateData, { correlationId: item.id }) || {};
    const translateInfo = data.data || {};
    const comparisonLangInfo = getTranslateInfo(app.id, null, item.id, comparisonLangData);

    const handleSave = info => {
      onEditAppLang({
        id: data.id,
        parentId: selectNode.workSheetId,
        correlationId: item.id,
        type: LANG_DATA_TYPE.customePageButton,
        data: {
          ...translateInfo,
          ...info
        }
      });
    };

    return (
      <div className={cx('flexColumn mBottom30', `navItem-${item.id}`)} key={item.id}>
        <div className="flexRow alignItemsCenter mBottom15 itemName">
          <span className="flex Font14 bold ellipsis">{_l('按钮组%0', index)}</span>
        </div>
        <div className="flexRow alignItemsCenter nodeItem">
          <div className="Font13 mRight20 label">{_l('卡片说明')}</div>
          <Input className="flex mRight20" value={comparisonLangId ? comparisonLangInfo.description : button.explain} disabled={true} />
          <EditInput
            className="flex"
            value={translateInfo.description}
            onChange={value => handleSave({ description: value })}
          />
        </div>
        {item.title && (
          <div className="flexRow alignItemsCenter nodeItem">
            <div className="Font13 mRight20 label">{_l('标题行')}</div>
            <Input className="flex mRight20" value={comparisonLangId ? comparisonLangInfo.title : item.title} disabled={true} />
            <EditInput
              className="flex"
              value={translateInfo.title}
              onChange={value => handleSave({ title: value })}
            />
          </div>
        )}
        {item.mobile.title && (
          <div className="flexRow alignItemsCenter nodeItem">
            <div className="Font13 mRight20 label">{_l('移动端标题行')}</div>
            <Input className="flex mRight20" value={comparisonLangId ? comparisonLangInfo.mobileTitle : item.mobile.title} disabled={true} />
            <EditInput
              className="flex"
              value={translateInfo.mobileTitle}
              onChange={value => handleSave({ mobileTitle: value })}
            />
          </div>
        )}
        <div className="flexRow nodeItem">
          <div className="Font13 mRight20 label">{_l('按钮名称')}</div>
          <div className="flex">
            {button.buttonList.map(item => (
              <div className="flexRow alignItemsCenter mBottom15" key={item.id}>
                <Input className="flex mRight20" value={comparisonLangId ? comparisonLangInfo[item.id] : item.name} disabled={true} />
                <EditInput
                  className="flex"
                  value={translateInfo[item.id]}
                  onChange={value => handleSave({ [item.id]: value })}
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flexRow pAll10 h100">
      <div className="nav flexColumn">
        <ScrollView className="flex">
          {list.map((item, index) => (
            renderNav(item, index + 1)
          ))}
        </ScrollView>
      </div>
      <ScrollView className="flex" ref={scrollViewRef}>
        <div className="pLeft20 pRight20">
          {list.map((item, index) => (
            renderContent(item, index + 1)
          ))}
        </div>
      </ScrollView>
    </div>
  );
}
