import React, { Fragment, useEffect, useState } from 'react';
import { useSetState } from 'react-use';
import _ from 'lodash';
import { Icon, Support } from 'ming-ui';
import { Checkbox, Modal, Tooltip } from 'ming-ui/antd-components';
import { toEditWidgetPage } from 'src/pages/widgetConfig/navigation';
import { handleAdvancedSettingChange } from 'src/utils/domain/control/advancedSetting';
import { parseDataSource } from 'src/utils/domain/control/metadata';
import { DISPLAY_TYPE_TEXT, RELATE_COUNT_TEXT } from 'src/utils/domain/control/setting';
import { WIDGETS_TO_API_TYPE_ENUM } from 'src/utils/domain/control/widgetTypes';
import AutoIcon from '../../components/Icon';
import { BothRelateInfo } from '../../styled';

const getAffectedControls = (controls = [], relateControlId) => {
  const affectedControls = controls.filter(control => parseDataSource(control.dataSource) === relateControlId);

  return {
    subtotalControls: affectedControls.filter(control => control.type === WIDGETS_TO_API_TYPE_ENUM.SUBTOTAL),
    sheetFieldControls: affectedControls.filter(
      control => control.type === WIDGETS_TO_API_TYPE_ENUM.SHEET_FIELD && _.get(control, 'strDefault.0') !== '1',
    ),
  };
};

const formatControlNames = controls => controls.map(control => `【${control.controlName}】`).join('、');

export default function BothWayRelate(props) {
  const { data, globalSheetInfo = {}, onChange, allControls = [] } = props;
  const { sourceControl = {}, controlId } = data;
  const { controlId: sourceControlId, controlName, enumDefault = 2, advancedSetting = {} } = sourceControl;

  const { sheetInfo = {} } = window.subListSheetConfig[controlId] || {};

  const [sourceName, setSourceName] = useState(globalSheetInfo.name);
  const { name: sheetName, worksheetId } = sheetInfo;
  const isLightweightRelate = _.get(data, 'advancedSetting.notautopassive') === '1';
  const [{ name, displayType }, setConfig] = useSetState({
    name: controlName || sourceName,
    count: enumDefault || 2,
    displayType: advancedSetting.showtype || '2',
  });

  useEffect(() => {
    setSourceName(globalSheetInfo.name);
    setConfig({
      name: controlName || sourceName,
      count: enumDefault || 2,
      displayType: advancedSetting.showtype || '2',
    });
  }, [controlId]);

  const updateLightweightRelate = checked => {
    onChange(
      handleAdvancedSettingChange(data, {
        notautopassive: checked ? '1' : '0',
      }),
    );
  };

  const handleLightweightRelateChange = event => {
    if (!event.target.checked) {
      updateLightweightRelate(false);
      return;
    }

    const { subtotalControls, sheetFieldControls } = getAffectedControls(allControls, controlId);

    if (_.isEmpty(subtotalControls) && _.isEmpty(sheetFieldControls)) {
      updateLightweightRelate(true);
      return;
    }

    Modal.confirm({
      width: 500,
      title: _l('开启轻量级单向关联'),
      content: (
        <div>
          <div>{_l('检测到当前表已配置以下依赖项，开启后将影响引用字段的实时性：')}</div>
          <div className="Bold mTop12 textPrimary">{_l('已有影响项')}</div>
          {!_.isEmpty(subtotalControls) && (
            <div className="mTop8 flexRow">
              <div className="textPrimary Bold">· {_l('汇总字段：')}</div>
              <div className="flex">{formatControlNames(subtotalControls)}</div>
            </div>
          )}
          {!_.isEmpty(sheetFieldControls) && (
            <div className="mTop8 flexRow">
              <div className="textPrimary Bold">· {_l('他表字段：')}</div>
              <div className="flex">{formatControlNames(sheetFieldControls)}</div>
            </div>
          )}
          <div className="mTop12">{_l('以上字段引用的数据之后如果发生变更，将不会自动更新，只能手动刷新。')}</div>
        </div>
      ),
      okText: _l('确定'),
      cancelText: _l('取消'),
      onOk: () => updateLightweightRelate(true),
    });
  };

  return (
    <Fragment>
      {_.isEmpty(data.sourceControl) ? (
        <div className="textTertiary">
          <span className="textPrimary">{_l('未添加')}</span>（
          <span
            className="colorPrimary hoverColorPrimary pointer mRight5 mLeft5"
            onClick={() => {
              const toPage = () => toEditWidgetPage({ sourceId: worksheetId, fromURL: 'newPage' });
              props.relateToNewPage(toPage);
            }}
          >
            {sheetName}
          </span>
          <span className=" mRight5">{_l('关联的%0', name || sourceName)}</span>）
          <Tooltip
            placement="bottom"
            title={
              <span>
                {_l(
                  '新版本如果要建立双向关联，需要前往关联表（%0）中添加关联本表（%1）的关联记录',
                  sheetName,
                  name || sourceName,
                )}
                <Support type={3} text={_l('什么是双向关联?')} href="https://help.mingdao.com/worksheet/associations" />
              </span>
            }
          >
            <Icon icon="help" className="Font16 textDisabled mLeft4" />
          </Tooltip>
        </div>
      ) : (
        <Fragment>
          <BothRelateInfo>
            <div className="relateInfo">
              {!sourceControl.controlId ? (
                <Fragment>
                  <span className="relateTitle Bold">{_l('单向关联：')}</span>
                  <span>{_l('仅在当前表维护关联关系')}</span>
                </Fragment>
              ) : (
                <Fragment>
                  <span className="relateTitle Bold">{_l('双向关联：')}</span>
                  <span className="breakAll">{name || sourceName}－</span>
                  <span
                    className="relateSheetName pointer"
                    onClick={() =>
                      toEditWidgetPage({ sourceId: worksheetId, targetControl: sourceControlId, fromURL: 'newPage' })
                    }
                  >
                    {sheetName}
                  </span>
                  <Support
                    type={1}
                    className="relateHelp"
                    title={_l('什么是双向关联？')}
                    href="https://help.mingdao.com/worksheet/associations"
                  />
                  <div className="displayType">
                    {_l('类型: %0 ( %1 )', DISPLAY_TYPE_TEXT[displayType], RELATE_COUNT_TEXT[enumDefault])}
                  </div>
                </Fragment>
              )}
            </div>
          </BothRelateInfo>
          {!sourceControl.controlId && (
            <div className="mTop10">
              <Checkbox size="small" checked={isLightweightRelate} onChange={handleLightweightRelateChange}>
                <span className="mRight4">{_l('开启轻量级单向关联')}</span>
                <Tooltip
                  placement="bottom"
                  title={
                    <div>
                      <div>
                        {_l(
                          '💡 适用于被高频引用的标签、省市区、费用科目等字典表。开启后，关联时不向目标表写入反向数据，从而提升表单性能。',
                        )}
                      </div>
                      <div className="mTop8">{_l('勾选后：')}</div>
                      <div>{_l('- 汇总、他表字段（存储数据类型）不会自动更新，只能手动刷新。')}</div>
                      <div>{_l('- 当关联的记录被删除时，不会自动取消关联，将显示为已删除。')}</div>
                    </div>
                  }
                >
                  <AutoIcon icon="help" />
                </Tooltip>
              </Checkbox>
            </div>
          )}
        </Fragment>
      )}
    </Fragment>
  );
}
