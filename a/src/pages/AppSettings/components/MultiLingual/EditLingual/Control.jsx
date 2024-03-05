import React, { Fragment, useState, useEffect, useRef } from 'react';
import cx from 'classnames';
import { Icon, LoadDiv, ScrollView } from 'ming-ui';
import { Input } from 'antd';
import EditInput from './EditInput';
import EditDescription from './EditDescription';
import sheetApi from 'src/api/worksheet';
import styled from 'styled-components';
import { getIconByType } from 'src/pages/widgetConfig/util';
import { ALL_SYS } from 'src/pages/widgetConfig/config/widget';
import { LANG_DATA_TYPE } from '../config';
import { getTranslateInfo } from 'src/util';
import { HAS_EXPLAIN_CONTROL, NO_DES_WIDGET } from 'src/pages/widgetConfig/config/index';
import { filterHtmlTag } from '../util';

const Wrap = styled.div`
  .controlsNav {
    width: 180px;
    .control {
      height: 36px;
      border-radius: 4px;
      padding: 0 10px;
      margin-right: 12px;
      &:hover {
        background-color: #F5F5F5;
      }
    }
  }
  .controlsContent {
    flex: 1;
    .controlName .icon {
      color: #9e9e9e;
    }
  }
  .controlWrap {
    .controlName {
      padding: 3px;
    }
    .nodeItem {
      padding: 0 3px;
    }
  }
`;

export default function Control(props) {
  const { app, selectNode, translateData, comparisonLangId, comparisonLangData, onEditAppLang } = props;
  const [loading, setLoading] = useState(true);
  const [sheetInfo, setSheetInfo] = useState({});
  const [searchValue, setSearchValue] = useState('');
  const scrollViewRef = useRef();

  useEffect(() => {
    setLoading(true);
    sheetApi.getWorksheetInfo({
      worksheetId: selectNode.workSheetId,
      getTemplate: true
    }).then(data => {
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
    const el = document.querySelector(`.control-${c.controlId}`);
    const className = 'highlight';
    const highlightEl = el.querySelector('.controlName');
    $(highlightEl).addClass(className).on('webkitAnimationEnd oAnimationEnd MSAnimationEnd animationend', function () {
      $(this).removeClass(className);
    });
    $(scrollViewRef.current.nanoScroller).nanoScroller({ scrollTop: el.offsetTop });
  }

  const { template = {} } = sheetInfo;
  const controls = (template.controls || []).filter(c => !ALL_SYS.includes(c.controlId));

  const renderControlNav = c => {
    const data = _.find(translateData, { correlationId: c.controlId }) || {};
    const translateInfo = data.data || {};
    return (
      <div
        className="control flexRow alignItemsCenter pointer"
        key={c.controlId}
        onClick={() => handlePositionControl(c)}
      >
        <Icon icon={getIconByType(c.type)} className="Gray_9e Font16" />
        <span className="mLeft5 Font13 ellipsis">{translateInfo.name || c.controlName}</span>
      </div>
    );
  };

  const renderControlContent = c => {
    const data = _.find(translateData, { correlationId: c.controlId }) || {};
    const translateInfo = data.data || {};
    const comparisonLangInfo = getTranslateInfo(app.id, c.controlId, comparisonLangData);
    const { type, advancedSetting: { showtype, checktype, hinttype = '0' } = {} } = c;

    const handleSave = info => {
      onEditAppLang({
        id: data.id,
        parentId: selectNode.workSheetId,
        correlationId: c.controlId,
        type: LANG_DATA_TYPE.wrokSheetFiled,
        data: {
          ...translateInfo,
          ...info
        }
      });
    };

    const hint = comparisonLangId ? comparisonLangInfo.hintText : c.hint;
    const desc = comparisonLangId ? comparisonLangInfo.description : c.desc;

    return (
      <div className={cx('flexColumn mBottom30 controlWrap', `control-${c.controlId}`)} key={c.controlId}>
        <div className="flexRow alignItemsCenter mBottom15 controlName">
          <Icon icon={getIconByType(c.type)} className="Font16" />
          <span className="flex mLeft5 Font14 bold ellipsis">{translateInfo.name || c.controlName}</span>
        </div>
        <div className="flexRow alignItemsCenter nodeItem">
          <div className="Font13 mRight20 label">{_l('字段名称')}</div>
          <Input className="flex mRight20" value={comparisonLangId ? comparisonLangInfo.name : c.controlName} disabled={true} />
          <EditInput
            className="flex"
            value={translateInfo.name}
            onChange={value => handleSave({ name: value })}
          />
        </div>
        {
          (HAS_EXPLAIN_CONTROL.includes(type) ||
          (type === 11 && showtype !== '2') ||
          (type === 10 && checktype === '1') ||
          (type === 29 && showtype === '3')) && (
            <div className="flexRow alignItemsCenter nodeItem">
              <div className="Font13 mRight20 label">{_.includes([14, 43, 49], type) ? _l('按钮名称') : _l('引导文字')}</div>
              <Input className="flex mRight20" value={hint} disabled={true} />
              <EditInput
                className="flex"
                disabled={!hint}
                value={translateInfo.hintText}
                onChange={value => handleSave({ hintText: value })}
              />
            </div>
          )
        }
        {!NO_DES_WIDGET.includes(type) && (
          <div className="flexRow nodeItem">
            <div className="Font13 mRight20 label">{_l('字段说明')}</div>
            <Input.TextArea style={{ resize: 'none' }} className="flex mRight20" value={desc} disabled={true} />
            <EditInput
              type="textArea"
              className="flex"
              disabled={!desc}
              style={{ resize: 'none' }}
              value={translateInfo.description}
              onChange={value => handleSave({ description: value })}
            />
          </div>
        )}
        {c.type === 10010 && (
          <div className="flexRow nodeItem">
            <div className="Font13 mRight20 label">{_l('备注内容')}</div>
            <Input.TextArea
              style={{ resize: 'none' }}
              className="flex mRight20" value={filterHtmlTag(comparisonLangId ? comparisonLangInfo.remark : c.dataSource)}
              disabled={true}
            />
            <EditDescription
              value={translateInfo.remark}
              originalValue={c.dataSource}
              onChange={value => handleSave({ remark: value })}
            />
          </div>
        )}
      </div>
    );
  }

  return (
    <Wrap className="flexRow pAll10 h100">
      <div className="controlsNav flexColumn">
        <div className="searchWrap flexRow alignItemsCenter mBottom10">
          <Icon className="Gray_9e Font20 mRight5" icon="search" />
          <input
            placeholder={_l('字段')}
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
          {controls.filter(c => c.controlName.includes(searchValue)).map(c => (
            renderControlNav(c)
          ))}
        </ScrollView>
      </div>
      <ScrollView className="controlsContent" ref={scrollViewRef}>
        <div className="pLeft20 pRight20">
          {controls.map(c => (
            renderControlContent(c)
          ))}
        </div>
      </ScrollView>
    </Wrap>
  );
}
