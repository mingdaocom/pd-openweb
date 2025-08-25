import React, { Fragment, useEffect, useState } from 'react';
import { useSetState } from 'react-use';
import cx from 'classnames';
import _ from 'lodash';
import styled from 'styled-components';
import { Button, Dialog, Dropdown, LoadDiv, Support, SvgIcon, Switch } from 'ming-ui';
import worksheetAjax from 'src/api/worksheet';
import { DEFAULT_CONFIG } from 'src/pages/widgetConfig/config/widget';
import { enumWidgetType } from 'src/pages/widgetConfig/util';
import { AddRelate } from '../relationSearch/styled';
import SelectSheetFromApp from '../SelectSheetFromApp';

const InputWrap = styled.div`
  display: flex;
  align-items: center;
  width: 100%;
  margin-bottom: 12px;
  padding-right: 10px;
  border-bottom: 1px solid #f0f0f0;
  input {
    line-height: 36px;
    flex: 1;
    border: none;
    outline: none;
    padding-left: 8px;
  }
`;

const RELATE_TYPE = [
  { key: 'new', text: _l('新建关联') },
  { key: 'exist', text: _l('已有关联') },
];

export default function ConfigRelate(props) {
  const { globalSheetInfo, value = '', allControls = [], deleteWidget, onOk, fromPortal } = props;
  const { appId: defaultAppId, worksheetId: sourceId, name: sourceName } = globalSheetInfo;
  const [{ appId, sheetId, sheetName }, setSelectedId] = useSetState({
    appId: defaultAppId,
    sheetId: value,
    sheetName: '',
  });
  const [{ relateControls, selectedControl, loading }, setControls] = useSetState({
    relateControls: [],
    selectedControl: {},
    loading: false,
  });
  const [{ relateFields, open }, setFields] = useState({
    relateFields: [],
    open: false,
  });
  const [relateType, setType] = useState('new');
  const [visible, setVisible] = useState(true);
  const [searchValue, setSearchValue] = useState('');

  useEffect(() => {
    if (!_.isEmpty(relateControls) && relateType === 'new') {
      if (sheetId) {
        handleSetSource();
      } else {
        setFields({
          relateFields: [],
          open: false,
        });
        setControls({ selectedControl: {} });
      }
      return;
    }
    if ((relateType === 'exist' && sheetId) || loading || (relateType === 'new' && !sheetId)) return;
    setControls({ loading: true });
    worksheetAjax
      .getWorksheetControls({
        worksheetId: sourceId,
        getControlType: 1,
        resultType: fromPortal ? undefined : 3,
      })
      .then(({ data }) => {
        const filterControls = (data.controls || []).filter(
          i => !_.find(allControls, a => a.controlId === i.controlId),
        );
        setControls({ relateControls: filterControls });
        if (sheetId && relateType === 'new') {
          handleSetSource({ newControls: filterControls });
        }
      })
      .finally(() => setControls({ loading: false }));
  }, [relateType, sheetId]);

  const handleSetSource = ({ newControls, open } = {}) => {
    const controls = (newControls || relateControls || [])
      .filter(i => i.dataSource === sheetId)
      .filter(i => !_.find(allControls, a => a.controlId === i.controlId));
    setFields({ relateFields: controls, open: _.isUndefined(open) ? !_.isEmpty(controls) : open });
    setControls({ selectedControl: _.isUndefined(open) ? controls[0] : {} });
  };

  const closeRelateConfig = () => {
    setVisible(false);
    deleteWidget();
  };

  const renderContent = () => {
    if (relateType === 'new') {
      return (
        <div className="selectSheetWrap">
          <SelectSheetFromApp
            onChange={setSelectedId}
            globalSheetInfo={globalSheetInfo}
            appId={appId}
            sheetId={sheetId}
          />
          {_.isEmpty(relateFields) ? null : (
            <Fragment>
              <div className={cx('relateWarning', { active: open })}>
                {_l('检测到所选表已关联 %0，是否建立', sourceName)}
                <Support type={3} text={_l('双向关联')} href="https://help.mingdao.com/worksheet/associations" />
                {_l('同步数据？')}
                <Switch
                  checked={open}
                  text={''}
                  onClick={checked => handleSetSource({ open: checked ? false : undefined })}
                />
              </div>
              {open ? (
                <Fragment>
                  <div className="selectItem Bold">{_l('%0 中的关联字段', sheetName)}</div>
                  <Dropdown
                    className="w100"
                    menuStyle={{ width: '100%' }}
                    border
                    value={_.get(selectedControl, 'sourceControl.controlId')}
                    data={relateFields.map(i => {
                      return {
                        value: _.get(i, 'sourceControl.controlId'),
                        text: _.get(i, 'sourceControl.controlName'),
                      };
                    })}
                    onChange={value =>
                      setControls({
                        selectedControl: _.find(relateFields, i => _.get(i, 'sourceControl.controlId') === value) || {},
                      })
                    }
                  />
                </Fragment>
              ) : null}
            </Fragment>
          )}
        </div>
      );
    }
    if (loading) return <LoadDiv />;
    const filterData = searchValue
      ? relateControls.filter(i => i.sourceEntityName.includes(searchValue))
      : relateControls;
    return (
      <div className="existRelateWrap">
        {_.isEmpty(relateControls) ? (
          <div className="emptyHint">{_l('没有与当前工作表关联的表')}</div>
        ) : (
          <div className="relateListWrap">
            <div className="title mBottom0">
              {_l('添加关联当前')}
              <span className="Bold mLeft5 mRight5">{sourceName}</span>
              {_l('的')}
              <span className="Gray_9e">
                （{_l('建立')}
                <Support type={3} text={_l('双向关联')} href="https://help.mingdao.com/worksheet/associations" />
                {_l('同步数据')}）
              </span>
            </div>
            <InputWrap>
              <i className="icon-search Gray_75 Font16"></i>
              <input
                autoFocus
                value={searchValue}
                placeholder={_l('搜索')}
                onChange={e => {
                  setSearchValue(e.target.value);
                }}
              />
              {searchValue && <i className="icon-cancel Gray_9e Font16 pointer" onClick={() => setSearchValue('')}></i>}
            </InputWrap>

            {_.isEmpty(filterData) ? (
              <div className="TxtCenter mTop50">{_l('暂无搜索结果')}</div>
            ) : (
              <ul>
                {filterData.map(item => {
                  const { type, controlName } = item.sourceControl || {};
                  return (
                    <li
                      className={cx({ active: item.controlId === selectedControl.controlId })}
                      key={item.controlId}
                      onClick={() => {
                        setControls({ selectedControl: item });
                        setSelectedId({ sheetId: item.dataSource, sheetName: item.controlName });
                      }}
                    >
                      <SvgIcon url={item.iconUrl} fill="#999999" size={18} className="InlineBlock Width18" />
                      <span className="Bold mLeft10">{item.sourceEntityName}</span>
                      <span className="Gray_9e mLeft4 Font14">
                        {` - ${_.get(DEFAULT_CONFIG[enumWidgetType[type]], 'widgetName')}：${controlName}`}
                      </span>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <Dialog
      style={{ width: '640px' }}
      visible={visible}
      title={<span className="Bold">{_l('添加关联记录')}</span>}
      footer={null}
      onCancel={closeRelateConfig}
    >
      <AddRelate>
        <div className="intro">
          {_l('在表单中显示关联的记录。如：订单关联客户')}
          <Support type={3} href="https://help.mingdao.com/worksheet/controls" text={_l('帮助')} />
        </div>
        <div className="relateWrap">
          {!fromPortal && (
            <ul className="relateTypeTab">
              {RELATE_TYPE.map(({ key, text }) => (
                <li
                  key={key}
                  className={cx({ active: relateType === key })}
                  onClick={() => {
                    setType(key);
                    setSelectedId({});
                    setControls({ selectedControl: {} });
                    setFields({ relateFields: [], open: false });
                    setSearchValue('');
                  }}
                >
                  {text}
                </li>
              ))}
            </ul>
          )}
          {renderContent()}
        </div>
        <div className="footerBtn">
          <div className="flex"></div>
          <Button type="link" onClick={closeRelateConfig}>
            {_l('取消')}
          </Button>
          <Button
            type="primary"
            className="Bold"
            disabled={!sheetId}
            onClick={() => onOk({ sheetId, control: selectedControl, sheetName })}
          >
            {_l('确定')}
          </Button>
        </div>
      </AddRelate>
    </Dialog>
  );
}
