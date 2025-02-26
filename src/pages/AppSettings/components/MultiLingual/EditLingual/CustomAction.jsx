import React, { Fragment, useState, useEffect, useRef } from 'react';
import cx from 'classnames';
import { Icon, LoadDiv, ScrollView, Dialog } from 'ming-ui';
import { Input } from 'antd';
import EditInput from './EditInput';
import sheetApi from 'src/api/worksheet';
import styled from 'styled-components';
import { LANG_DATA_TYPE } from '../config';
import { getTranslateInfo } from 'src/util';

const Wrap = styled.div`
  .customActionNav {
    width: 180px;
    .customAction {
      height: 36px;
      border-radius: 4px;
      padding: 0 10px;
      margin-right: 12px;
      &:hover {
        background-color: #F5F5F5;
      }
    }
  }
  .customActionContent {
    flex: 1;
  }
  .customActionWrap {
    .customActionName {
      padding: 3px;
    }
    .nodeItem {
      padding: 0 3px;
    }
  }
`;

export default function CustomAction(props) {
  const { app, selectNode, translateData, comparisonLangId, comparisonLangData, onEditAppLang } = props;
  const [loading, setLoading] = useState(true);
  const [sheetBtns, setSheetBtns] = useState([]);
  const [searchValue, setSearchValue] = useState('');
  const scrollViewRef = useRef();
  const [optionsEditDialogVisible, setOptionsEditDialogVisible] = useState('');

  useEffect(() => {
    setLoading(true);
    sheetApi.getWorksheetBtns({
      worksheetId: selectNode.workSheetId,
    }).then(data => {
      setLoading(false);
      setSheetBtns(data);
    });
  }, [selectNode.key]);

  if (loading) {
    return (
      <div className="flexRow alignItemsCenter justifyContentCenter h100">
        <LoadDiv />
      </div>
    );
  }

  if (!sheetBtns.length) {
    return (
      <div className="flexRow alignItemsCenter justifyContentCenter h100 Gray_9e Font14">
        {_l('没有自定义动作')}
      </div>
    );
  }

  const handlePositionBtn = item => {
    const el = document.querySelector(`.customAction-${item.btnId}`);
    const className = 'highlight';
    const highlightEl = el.querySelector('.customActionName');
    $(highlightEl).addClass(className).on('webkitAnimationEnd oAnimationEnd MSAnimationEnd animationend', function () {
      $(this).removeClass(className);
    });
    $(scrollViewRef.current.nanoScroller).nanoScroller({ scrollTop: el.offsetTop });
  }

  const renderBtnNav = btn => {
    const data = _.find(translateData, { correlationId: btn.btnId }) || {};
    const translateInfo = data.data || {};
    return (
      <div
        className="customAction flexRow alignItemsCenter pointer"
        key={btn.btnId}
        onClick={() => handlePositionBtn(btn)}
      >
        <span className="mLeft5 Font13 ellipsis">{translateInfo.name || btn.name}</span>
      </div>
    );
  };

  const renderBtnContent = btn => {
    const data = _.find(translateData, { correlationId: btn.btnId }) || {};
    const translateInfo = data.data || {};
    const comparisonLangInfo = getTranslateInfo(app.id, null, btn.btnId, comparisonLangData);
    const name = comparisonLangId ? comparisonLangInfo.name : btn.name;
    const desc = comparisonLangId ? comparisonLangInfo.description : btn.desc;
    const completeText = comparisonLangId ? comparisonLangInfo.completeText : _.get(btn.advancedSetting, 'tiptext');
    const confirmMsg = comparisonLangId ? comparisonLangInfo.confirmMsg : _.get(btn, 'confirmMsg');
    const confirmContent = comparisonLangId ? comparisonLangInfo.confirmContent : _.get(btn.advancedSetting, 'confirmcontent');
    const sureName = comparisonLangId ? comparisonLangInfo.sureName : _.get(btn, 'sureName');
    const cancelName = comparisonLangId ? comparisonLangInfo.cancelName : _.get(btn, 'cancelName');
    const remark = comparisonLangId ? comparisonLangInfo.remark : _.get(btn.advancedSetting, 'remarkname');
    const hintText = comparisonLangId ? comparisonLangInfo.hintText : _.get(btn.advancedSetting, 'remarkhint');
    const remarkoptions = _.get(JSON.parse(_.get(btn.advancedSetting, 'remarkoptions') || '{}'), 'template') || [];
    const withoutRemarkoptions = remarkoptions.filter((item, index) => !translateInfo[`templateName_${index}`]);

    const handleSave = info => {
      onEditAppLang({
        id: data.id,
        parentId: selectNode.workSheetId,
        correlationId: btn.btnId,
        type: LANG_DATA_TYPE.wrokSheetCustomAction,
        data: {
          ...translateInfo,
          ...info
        }
      });
    };

    return (
      <div className={cx('flexColumn mBottom30 customActionWrap', `customAction-${btn.btnId}`)} key={btn.btnId}>
        <div className="flexRow alignItemsCenter mBottom15 customActionName">
          <span className="flex Font14 bold ellipsis">{translateInfo.name || btn.name}</span>
        </div>
        <div className="flexRow alignItemsCenter nodeItem">
          <div className="Font13 mRight20 label">{_l('按钮名称')}</div>
          <Input className="flex mRight20" value={name} disabled={true} />
          <EditInput
            className="flex"
            disabled={!name}
            value={translateInfo.name}
            onChange={value => handleSave({ name: value })}
          />
        </div>
        <div className="flexRow nodeItem">
          <div className="Font13 mRight20 label">{_l('按钮说明')}</div>
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
        {completeText && (
          <div className="flexRow alignItemsCenter nodeItem">
            <div className="Font13 mRight20 label">{_l('流程执行完后提示')}</div>
            <Input className="flex mRight20" value={completeText} disabled={true} />
            <EditInput
              className="flex"
              disabled={!completeText}
              value={translateInfo.completeText}
              onChange={value => handleSave({ completeText: value })}
            />
          </div>
        )}
        {confirmMsg && (
          <div className="flexRow alignItemsCenter nodeItem">
            <div className="Font13 mRight20 label">{_l('二次确认标题')}</div>
            <Input className="flex mRight20" value={confirmMsg} disabled={true} />
            <EditInput
              className="flex"
              disabled={!confirmMsg}
              value={translateInfo.confirmMsg}
              onChange={value => handleSave({ confirmMsg: value })}
            />
          </div>
        )}
        {confirmContent && (
          <div className="flexRow alignItemsCenter nodeItem">
            <div className="Font13 mRight20 label">{_l('二次确认说明')}</div>
            <Input className="flex mRight20" value={confirmContent} disabled={true} />
            <EditInput
              className="flex"
              disabled={!confirmContent}
              value={translateInfo.confirmContent}
              onChange={value => handleSave({ confirmContent: value })}
            />
          </div>
        )}
        {sureName && (
          <div className="flexRow alignItemsCenter nodeItem">
            <div className="Font13 mRight20 label">{_l('二次确认提交按钮')}</div>
            <Input className="flex mRight20" value={sureName} disabled={true} />
            <EditInput
              className="flex"
              disabled={!sureName}
              value={translateInfo.sureName}
              onChange={value => handleSave({ sureName: value })}
            />
          </div>
        )}
        {cancelName && (
          <div className="flexRow alignItemsCenter nodeItem">
            <div className="Font13 mRight20 label">{_l('二次确认取消按钮')}</div>
            <Input className="flex mRight20" value={cancelName} disabled={true} />
            <EditInput
              className="flex"
              disabled={!cancelName}
              value={translateInfo.cancelName}
              onChange={value => handleSave({ cancelName: value })}
            />
          </div>
        )}
        {remark && (
          <div className="flexRow alignItemsCenter nodeItem">
            <div className="Font13 mRight20 label">{_l('二次确认备注名称')}</div>
            <Input className="flex mRight20" value={remark} disabled={true} />
            <EditInput
              className="flex"
              disabled={!remark}
              value={translateInfo.remark}
              onChange={value => handleSave({ remark: value })}
            />
          </div>
        )}
        {hintText && (
          <div className="flexRow alignItemsCenter nodeItem">
            <div className="Font13 mRight20 label">{_l('二次确认备注引导文字')}</div>
            <Input className="flex mRight20" value={hintText} disabled={true} />
            <EditInput
              className="flex"
              disabled={!hintText}
              value={translateInfo.hintText}
              onChange={value => handleSave({ hintText: value })}
            />
          </div>
        )}
        {!!remarkoptions.length && (
          <div className="flexRow nodeItem">
            <div className="Font13 mRight20 label">{_l('二次确认备注模版')}</div>
            <div className="flex mRight20">
              {_l('有%0个模版', remarkoptions.length)}
              {!!withoutRemarkoptions.length && `，${_l('%0个没有译文', withoutRemarkoptions.length)}`}
            </div>
            <div className="flex">
              <span className="ThemeColor pointer" onClick={() => setOptionsEditDialogVisible(btn.btnId)}>{_l('编辑译文')}</span>
            </div>
          </div>
        )}
        {optionsEditDialogVisible && optionsEditDialogVisible === btn.btnId && (
          <Dialog
            visible={true}
            className="editLingualDialog"
            width={860}
            title={(
              <div className="flexRow alignItemsCenter mBottom10">
                <span>{_l('模版')}</span>
              </div>
            )}
            showFooter={false}
            onCancel={() => setOptionsEditDialogVisible('')}
          >
            {remarkoptions.map((item, index) => (
              <div className="flexRow alignItemsCenter nodeItem" key={index}>
                <Input className="flex mRight20" value={item.value} disabled={true} />
                <EditInput
                  className="flex"
                  disabled={!item.value}
                  value={translateInfo[`templateName_${index}`]}
                  onChange={value => handleSave({ [`templateName_${index}`]: value })}
                />
              </div>
            ))}
          </Dialog>
        )}
      </div>
    );
  }

  return (
    <Wrap className="flexRow pAll10 h100">
      <div className="customActionNav flexColumn">
        <div className="searchWrap flexRow alignItemsCenter mBottom10">
          <Icon className="Gray_9e Font20 mRight5" icon="search" />
          <input
            placeholder={_l('自定义动作')}
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
          {sheetBtns.filter(btn => btn.name.includes(searchValue)).map(btn => (
            renderBtnNav(btn)
          ))}
        </ScrollView>
      </div>
      <ScrollView className="customActionContent" ref={scrollViewRef}>
        <div className="pLeft20 pRight20">
          {sheetBtns.map(btn => (
            renderBtnContent(btn)
          ))}
        </div>
      </ScrollView>
    </Wrap>
  );
}

