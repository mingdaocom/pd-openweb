import React, { Fragment, useState, useEffect, useRef } from 'react';
import cx from 'classnames';
import { Icon, LoadDiv, ScrollView, Dialog } from 'ming-ui';
import { Input } from 'antd';
import EditInput from './EditInput';
import EditDescription from './EditDescription';
import sheetApi from 'src/api/worksheet';
import { getIconByType } from 'src/pages/widgetConfig/util';
import { ALL_SYS } from 'src/pages/widgetConfig/config/widget';
import { LANG_DATA_TYPE } from '../config';
import { getTranslateInfo } from 'src/util';
import { HAS_EXPLAIN_CONTROL, NO_DES_WIDGET } from 'src/pages/widgetConfig/config/index';
import { filterHtmlTag } from '../util';
import SubTable from './SubTable';

export const ControlContent = props => {
  const { isSubTable = false } = props;
  const { app, control, selectNode = {}, translateData, comparisonLangId, comparisonLangData, onEditAppLang } = props;
  const { setExpandedKeys, onSelectedKeys } = props;
  const { collections } = app;
  const data = _.find(translateData, { correlationId: control.controlId, parentId: selectNode.workSheetId }) || {};
  const translateInfo = data.data || {};
  const comparisonLangInfo = getTranslateInfo(app.id, selectNode.workSheetId, control.controlId, comparisonLangData);
  const { type, relationControls, dataSource, advancedSetting: { showtype = '0', checktype, hinttype = '0', itemnames } = {} } = control;
  const options = (_.get(control, 'options') || []).filter(n => !n.isDeleted);
  const itemNames = itemnames && JSON.parse(itemnames);
  const [optionsEditDialogVisible, setOptionsEditDialogVisible] = useState('');

  const handleSave = info => {
    onEditAppLang({
      id: data.id,
      correlationId: control.controlId,
      parentId: selectNode.workSheetId,
      type: LANG_DATA_TYPE.wrokSheetFiled,
      data: {
        ...translateInfo,
        ...info
      }
    });
  };

  const hint = comparisonLangId ? comparisonLangInfo.hintText : control.hint;
  const desc = comparisonLangId ? comparisonLangInfo.description : control.desc;
  const open = comparisonLangId ? comparisonLangInfo['1'] : _.get(_.find(itemNames, { key: '1' }), 'value');
  const close = comparisonLangId ? comparisonLangInfo['0'] : _.get(_.find(itemNames, { key: '0' }), 'value');
  const suffix = comparisonLangId ? comparisonLangInfo.suffix : _.get(control.advancedSetting, 'suffix') || _.get(control.advancedSetting, 'prefix');
  const otherhint = comparisonLangId ? comparisonLangInfo.otherhint : _.get(control.advancedSetting, 'otherhint');
  const withoutOptions = options.filter(n => n.key !== 'other').filter(item => !translateInfo[item.key]);

  return (
    <div className={cx('flexColumn mBottom30 controlWrap', `navItem-${control.controlId}`)} key={control.controlId}>
      <div className="flexRow alignItemsCenter mBottom15 itemName">
        <Icon icon={getIconByType(control.type)} className="Font16" />
        <span className="flex mLeft5 Font14 bold ellipsis">{translateInfo.name || control.controlName}</span>
      </div>
      <div className="flexRow alignItemsCenter nodeItem">
        <div className="Font13 mRight20 label">{_l('字段名称')}</div>
        <Input className="flex mRight20" value={comparisonLangId ? comparisonLangInfo.name : control.controlName} disabled={true} />
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
      {!NO_DES_WIDGET.includes(type) && !isSubTable && (
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
      {[9, 10, 11].includes(type) && (
        dataSource && _.find(collections, { collectionId: dataSource }) ? (
          <div className="flexRow alignItemsCenter nodeItem">
            <div className="Font13 mRight20 label">{_l('选项')}</div>
            <div className="flex mRight20">
              {_l('选项集')}: {_.get(_.find(collections, { collectionId: dataSource }), 'name')}
            </div>
            <div className="flex">
              <span
                className="ThemeColor pointer"
                onClick={() => {
                  setExpandedKeys(['optionsEntrance']);
                  onSelectedKeys([dataSource], {
                    event: 'select',
                    selected: true,
                    node: {
                      key: dataSource,
                      type: 'collections'
                    }
                  });
                  setTimeout(() => {
                    const el = document.querySelector('.navScroll');
                    el.nanoscroller.scrollBottom(0);
                  }, 0);
                }}
              >
                {_l('前往编辑')}
              </span>
            </div>
          </div>
        ) : (
          <Fragment>
            <div className="flexRow alignItemsCenter nodeItem">
              <div className="Font13 mRight20 label">{_l('选项')}</div>
              {dataSource && !_.find(collections, { collectionId: dataSource }) ? (
                <div className="flex mRight20">
                  <span className="Gray_9e">{_l('暂不支持跨应用数据')}</span>
                </div>
              ) : (
                <Fragment>
                  <div className="flex mRight20">
                    {_l('有%0个选项', options.filter(n => n.key !== 'other').length)}
                    {!!withoutOptions.length && `，${_l('%0个没有译文', withoutOptions.length)}`}
                  </div>
                </Fragment>
              )}
              {dataSource && !_.find(collections, { collectionId: dataSource }) ? null : (
                <div className="flex">
                  <span className="ThemeColor pointer" onClick={() => setOptionsEditDialogVisible(control.controlId)}>{_l('编辑译文')}</span>
                </div>
              )}
            </div>
            {_.find(options, { key: 'other' }) && (
              <div className="flexRow alignItemsCenter nodeItem">
                <div className="Font13 mRight20 label">{_l('补充信息的引导文字')}</div>
                <Input className="flex mRight20" value={otherhint} disabled={true} />
                <EditInput
                  className="flex"
                  disabled={!otherhint}
                  value={translateInfo.otherhint}
                  onChange={value => handleSave({ otherhint: value })}
                />
              </div>
            )}
          </Fragment>
        )
      )}
      {type === 34 && (
        <div className="flexRow alignItemsCenter nodeItem">
          <div className="Font13 mRight20 label">{_l('子表字段')}</div>
          <SubTable
            {...props}
            worksheetId={dataSource}
            control={control}
            translateInfo={translateInfo}
          />
        </div>
      )}
      {type === 10010 && (
        <div className="flexRow nodeItem">
          <div className="Font13 mRight20 label">{_l('备注内容')}</div>
          <Input.TextArea
            style={{ resize: 'none' }}
            className="flex mRight20" value={filterHtmlTag(comparisonLangId ? comparisonLangInfo.remark : control.dataSource)}
            disabled={true}
          />
          <EditDescription
            value={translateInfo.remark}
            originalValue={control.dataSource}
            onChange={value => handleSave({ remark: value })}
          />
        </div>
      )}
      {type === 36 && (
        <Fragment>
          {showtype === '0' && (
            <div className="flexRow alignItemsCenter nodeItem">
              <div className="Font13 mRight20 label">{_l('内容')}</div>
              <Input className="flex mRight20" value={hint} disabled={true} />
              <EditInput
                className="flex"
                disabled={!hint}
                value={translateInfo.hintText}
                onChange={value => handleSave({ hintText: value })}
              />
            </div>
          )}
          {['1', '2'].includes(showtype) && (
            <Fragment>
              <div className="flexRow alignItemsCenter nodeItem">
                <div className="Font13 mRight20 label">{showtype === '1' ? _l('开启') : _l('是')}</div>
                <Input className="flex mRight20" value={open} disabled={true} />
                <EditInput
                  className="flex"
                  disabled={!open}
                  value={translateInfo[1]}
                  onChange={value => handleSave({ 1: value })}
                />
              </div>
              <div className="flexRow alignItemsCenter nodeItem">
                <div className="Font13 mRight20 label">{showtype === '1' ? _l('关闭') : _l('否')}</div>
                <Input className="flex mRight20" value={close} disabled={true} />
                <EditInput
                  className="flex"
                  disabled={!close}
                  value={translateInfo[0]}
                  onChange={value => handleSave({ 0: value })}
                />
              </div>
            </Fragment>
          )}
        </Fragment>
      )}
      {[6, 8, 31].includes(type) && (
        <div className="flexRow alignItemsCenter nodeItem">
          <div className="Font13 mRight20 label">{_l('单位')}</div>
          <Input className="flex mRight20" value={suffix} disabled={true} />
          <EditInput
            className="flex"
            disabled={!suffix}
            value={translateInfo.suffix}
            onChange={value => handleSave({ suffix: value })}
          />
        </div>
      )}
      {optionsEditDialogVisible && optionsEditDialogVisible === control.controlId && [9, 10, 11].includes(type) && (
        <Dialog
          visible={true}
          className="editLingualDialog"
          width={860}
          title={(
            <div className="flexRow alignItemsCenter mBottom10">
              <Icon icon={getIconByType(type)} className="Font20 Gray_9e mRight10" />
              <span>{translateInfo.name || control.controlName}</span>
            </div>
          )}
          showFooter={false}
          onCancel={() => setOptionsEditDialogVisible('')}
        >
          {options.filter(item => item.key !== 'other').map(item => (
            <div className="flexRow alignItemsCenter nodeItem" key={item.key}>
              <Input className="flex mRight20" value={item.value} disabled={true} />
              <EditInput
                className="flex"
                disabled={!item.value}
                value={translateInfo[item.key]}
                onChange={value => handleSave({ [item.key]: value })}
              />
            </div>
          ))}
        </Dialog>
      )}
    </div>
  );
}

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
    const el = document.querySelector(`.navItem-${c.controlId}`);
    const className = 'highlight';
    const highlightEl = el.querySelector('.itemName');
    $(highlightEl).addClass(className).on('webkitAnimationEnd oAnimationEnd MSAnimationEnd animationend', function () {
      $(this).removeClass(className);
    });
    $(scrollViewRef.current.nanoScroller).nanoScroller({ scrollTop: el.offsetTop });
  }

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
  }

  return (
    <div className="flexRow pAll10 h100">
      <div className="nav flexColumn">
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
      <ScrollView className="flex" ref={scrollViewRef}>
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
