import React, { Fragment, useEffect, useState } from 'react';
import { useSetState } from 'react-use';
import { Tooltip } from 'antd';
import _ from 'lodash';
import { Icon, Support } from 'ming-ui';
import { DISPLAY_TYPE_TEXT, RELATE_COUNT_TEXT } from '../../config/setting';
import { BothRelateInfo } from '../../styled';
import { toEditWidgetPage } from '../../util';

export default function BothWayRelate(props) {
  const { data, globalSheetInfo = {} } = props;
  const { sourceControl = {}, controlId } = data;
  const { controlId: sourceControlId, controlName, enumDefault = 2, advancedSetting = {} } = sourceControl;

  const { sheetInfo = {} } = window.subListSheetConfig[controlId] || {};

  const [sourceName, setSourceName] = useState(globalSheetInfo.name);
  const { name: sheetName, worksheetId } = sheetInfo;
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

  return (
    <Fragment>
      {_.isEmpty(data.sourceControl) ? (
        <div className="Gray_9e">
          <span className="Gray">{_l('未添加')}</span>（
          <span
            className="ThemeColor3 ThemeHoverColor3 pointer mRight5 mLeft5"
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
            autoCloseDelay={0}
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
            <Icon icon="help" className="Font16 Gray_bd mLeft4" />
          </Tooltip>
        </div>
      ) : (
        <BothRelateInfo>
          <div className="relateInfo">
            {_l('在')}
            <span
              className="sourceName pointer Bold"
              onClick={() =>
                toEditWidgetPage({ sourceId: worksheetId, targetControl: sourceControlId, fromURL: 'newPage' })
              }
            >
              {sheetName}
            </span>
            {_l('中显示关联的')}
            <span className="Bold breakAll">{name || sourceName}</span>
          </div>
          <div className="displayType">
            {_l('类型: %0 ( %1 )', DISPLAY_TYPE_TEXT[displayType], RELATE_COUNT_TEXT[enumDefault])}
          </div>
        </BothRelateInfo>
      )}
    </Fragment>
  );
}
