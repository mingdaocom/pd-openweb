import React, { Fragment, useEffect, useState } from 'react';
import { useSetState } from 'react-use';
import cx from 'classnames';
import _ from 'lodash';
import styled from 'styled-components';
import { LoadDiv, Support, SvgIcon } from 'ming-ui';
import { Input, Modal, Radio, Select, Tooltip } from 'ming-ui/antd-components';
import worksheetAjax from 'src/api/worksheet';
import { DEFAULT_CONFIG } from 'src/utils/domain/control/widget';
import { enumWidgetType } from 'src/utils/domain/control/widgetTypes';
import AutoIcon from '../../../components/Icon';
import { AddRelate } from '../relationSearch/styled';
import SelectSheetFromApp from '../SelectSheetFromApp';

const InputWrap = styled.div`
  display: flex;
  align-items: center;
  width: 100%;
  margin-bottom: 12px;
  padding-right: 10px;
  border-bottom: 1px solid var(--color-background-disabled);
`;

const RelateWarning = styled.div`
  min-height: 70px;
  margin-top: 16px;
  padding: 10px 14px;
  display: flex;
  align-items: center;
  background: var(--color-background-secondary);
  border: 1px solid var(--color-border-primary);

  &.active {
    background: var(--color-primary-transparent);
    border-color: var(--color-primary);
  }

  .warningContent {
    flex: 1;
    min-width: 0;
    padding-right: 16px;
  }

  .warningTitle {
    line-height: 20px;
  }

  .warningDescription {
    margin-top: 5px;
    line-height: 20px;
  }
`;

const RELATE_TYPE = [
  { key: 'new', text: _l('新建关联') },
  { key: 'exist', text: _l('建立双向关联') },
];

const getRelateSheetSelectConfig = () => [
  { key: 'app', text: _l('应用') },
  { key: 'sheet', text: _l('关联工作表') },
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
            config={getRelateSheetSelectConfig()}
            onChange={setSelectedId}
            globalSheetInfo={globalSheetInfo}
            appId={appId}
            sheetId={sheetId}
          />
          {_.isEmpty(relateFields) ? null : (
            <Fragment>
              <RelateWarning className={cx({ active: open })}>
                <div className="warningContent">
                  <div className="warningTitle Bold">{_l('检测到有可建立的双向关联')}</div>
                  <div className="warningDescription">
                    {_l(
                      '“%0”中存在可添加到当前工作表的反向字段，是否使用已有关系添加反向字段？关闭后将会创建一组新的关联关系。',
                      sourceName,
                    )}
                  </div>
                </div>
                <Radio
                  checked={open}
                  onClick={event => {
                    event.stopPropagation();
                    return handleSetSource({
                      open: open ? false : undefined,
                    });
                  }}
                />
              </RelateWarning>
              {open ? (
                <Fragment>
                  <div className="selectItem Bold">{_l('%0 中的已有关联关系', sheetName)}</div>
                  <Select
                    className="w100"
                    loading={loading}
                    value={_.get(selectedControl, 'sourceControl.controlId')}
                    options={relateFields.map(i => {
                      return {
                        value: _.get(i, 'sourceControl.controlId'),
                        label: _.get(i, 'sourceControl.controlName'),
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
            <div className="title">
              {_l(
                '选择其他工作表中已关联 "%0" 的字段建立双向关联。建立后，可在两个工作表中维护同一关联关系',
                sourceName,
              )}

              <Tooltip
                placement="bottom"
                title={
                  <div>
                    <div>{_l('配置建议：')}</div>
                    <div>
                      {_l(
                        '如仅需在当前表中查看记录，可使用“查询记录”字段，无需创建双向关联。如：在客户表中查看关联当前客户的订单。',
                      )}
                    </div>
                    <div>
                      {_l('如需在两个工作表中同时维护关联关系。如：项目与成员、用户与角色。则需创建为双向关联。')}
                    </div>
                  </div>
                }
              >
                <AutoIcon icon="help" className="mLeft6" />
              </Tooltip>
            </div>
            <InputWrap>
              <Input
                allowClear
                autoFocus
                className="flex"
                variant="borderless"
                prefix={<i className="icon-search textSecondary Font16" />}
                value={searchValue}
                placeholder={_l('搜索')}
                onChange={e => {
                  setSearchValue(e.target.value);
                }}
              />
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
                        setControls({
                          selectedControl: {
                            ...item,
                            controlName: item.sourceEntityName || item.controlName,
                            advancedSetting: { ...item.advancedSetting, showtype: '5' },
                          },
                        });
                        setSelectedId({ sheetId: item.dataSource, sheetName: item.controlName });
                      }}
                    >
                      <SvgIcon
                        url={item.iconUrl}
                        fill="var(--color-text-tertiary)"
                        size={18}
                        className="InlineBlock Width18"
                      />
                      <span className="Bold mLeft10">{item.sourceEntityName}</span>
                      <span className="textTertiary mLeft4 Font14">
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
    <Modal
      width={640}
      open={visible}
      mask={{ closable: true }}
      keyboard
      title={<span className="Bold">{_l('添加关联记录字段')}</span>}
      onCancel={closeRelateConfig}
      okButtonProps={{ disabled: !sheetId }}
      onOk={() => onOk({ sheetId, control: selectedControl, sheetName })}
    >
      <AddRelate>
        <div className="intro">
          {_l('关联其他工作表中的记录，并保存记录之间的关系。如：订单关联客户。')}
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
      </AddRelate>
    </Modal>
  );
}
