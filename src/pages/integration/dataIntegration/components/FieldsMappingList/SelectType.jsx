import React, { useEffect, useRef, useState } from 'react';
import { useSetState } from 'react-use';
import _ from 'lodash';
import styled from 'styled-components';
import { Icon } from 'ming-ui';
import { Input, Popover, Select, Tooltip } from 'ming-ui/antd-components';
import Settings from 'src/pages/widgetConfig/widgetSetting/settings';
import { canSetAsTitle } from 'src/utils/domain/control/metadata';
import { DEFAULT_DATA } from 'src/utils/domain/control/widget';
import { enumWidgetType } from 'src/utils/domain/control/widgetTypes';

const Wrapper = styled.div`
  width: 348px;
  padding: 20px;
  background: var(--color-background-primary);
  box-shadow: var(--shadow-lg);
  border-radius: 3px;
  position: relative;

  .selectItem {
    width: 100% !important;
    font-size: 13px;
  }

  .commonInput {
    width: 80px;
  }
`;

export default function SelectType(props) {
  const { options, itemData, updateFieldsMapping, isDestDbType, isExistJoinPk } = props;
  const [visible, setVisible] = useState(false);
  const sourceField = itemData.sourceField || {};
  const destField = itemData.destField || {};
  const [settingComponent, setSettingComponent] = useSetState({ component: null, data: {} });
  const selectRef = useRef();
  const selectOptionListRef = useRef();

  const currentOption = options.filter(item => item.value === destField.dataType)[0] || {};

  useEffect(() => {
    //对应类型的可选配置
    if (destField.mdType) {
      const ENUM_TYPE = enumWidgetType[destField.mdType];
      setSettingComponent({
        component: Settings[ENUM_TYPE],
        data: destField.controlSetting,
      });
    }
  }, [destField.mdType]);

  const onWorkSheetTypeChange = (value, option) => {
    const ENUM_TYPE = enumWidgetType[value];
    const data =
      ENUM_TYPE === 'DATE_TIME'
        ? { type: value, advancedSetting: { showtype: '6' } }
        : { type: value, ..._.omit(DEFAULT_DATA[ENUM_TYPE], ['controlName']) };
    setSettingComponent({
      component: Settings[ENUM_TYPE],
      data,
    });
    const canSetTitle =
      canSetAsTitle({ type: value }) &&
      //如果存在joinPk，joinPk字段不允许设为标题，否则rowid不允许设为标题
      (isExistJoinPk ? !sourceField.isUniquePk : (sourceField.oid || '').split('_')[1] !== 'rowid');

    updateFieldsMapping &&
      updateFieldsMapping({
        ...itemData,
        destField: {
          ...destField,
          dataType: option.typeName,
          jdbcTypeId: option.dataType,
          mdType: value,
          //对应类型的可选配置
          controlSetting: _.pick(data, ['advancedSetting', 'enumDefault', 'type', 'dot']),
          isTitle: canSetTitle ? destField.isTitle : false,
        },
      });
  };

  const onPopupVisibleChange = visible => {
    setVisible(visible);
    if (!visible) {
      const needSetPrecision = !!currentOption.maxLength && !destField.precision;
      const needSetScale = !!currentOption.maximumScale && !destField.scale;
      const isScaleExceedPrecision =
        !!currentOption.maxLength && !!currentOption.maximumScale && destField.scale > destField.precision;

      if (needSetPrecision || needSetScale || isScaleExceedPrecision) {
        updateFieldsMapping({
          ...itemData,
          destField: {
            ...destField,
            precision: needSetPrecision ? currentOption.maxLength : destField.precision,
            scale: needSetScale ? 0 : isScaleExceedPrecision ? destField.precision : destField.scale,
          },
        });
      }
    }
  };

  return (
    <div className="flexRow alignItemsCenter">
      <Popover
        noPadding
        trigger="click"
        getPopupContainer={() => selectRef.current}
        open={visible}
        onOpenChange={onPopupVisibleChange}
        placement="bottomRight"
        content={
          isDestDbType ? (
            <Wrapper>
              <p className="bold mBottom10">{_l('类型')}</p>
              <div ref={selectOptionListRef}>
                <Select
                  className="selectItem"
                  placeholder={_l('请选择')}
                  notFoundContent={_l('暂无数据')}
                  getPopupContainer={() => selectOptionListRef.current}
                  value={destField.dataType}
                  options={options}
                  onChange={(value, option) => {
                    updateFieldsMapping &&
                      updateFieldsMapping({
                        ...itemData,
                        destField: {
                          ...destField,
                          dataType: value,
                          jdbcTypeId: option.dataType,
                          precision: option.maxLength,
                          scale: option.defaultScale,
                        },
                      });
                  }}
                />
              </div>

              {!!currentOption.maxLength && (
                <div>
                  <p className="bold mBottom10 mTop24">{_l('长度')}</p>
                  <Input
                    className="commonInput"
                    value={destField.precision || ''}
                    onChange={event => {
                      const value = event.target.value;
                      const validPrecision =
                        parseInt(value) > currentOption.maxLength
                          ? currentOption.maxLength
                          : parseInt(value) < 1
                            ? 1
                            : parseInt(value);

                      updateFieldsMapping({
                        ...itemData,
                        destField: {
                          ...destField,
                          precision: validPrecision,
                        },
                      });
                    }}
                  />
                </div>
              )}

              {!!currentOption.maximumScale && (
                <div>
                  <p className="bold mBottom10 mTop24">{_l('精度')}</p>
                  <Input
                    className="commonInput"
                    value={destField.scale === 0 ? 0 : destField.scale || ''}
                    onChange={event => {
                      const value = event.target.value;
                      const validScale =
                        parseInt(value) > currentOption.maximumScale
                          ? currentOption.maximumScale
                          : parseInt(value) < currentOption.minimumScale
                            ? 0
                            : parseInt(value);
                      updateFieldsMapping({
                        ...itemData,
                        destField: {
                          ...destField,
                          scale: validScale,
                        },
                      });
                    }}
                  />
                </div>
              )}
            </Wrapper>
          ) : (
            <Wrapper>
              <p className="bold mBottom10">{_l('类型')}</p>
              <div ref={selectOptionListRef}>
                <Select
                  className="selectItem"
                  placeholder={_l('请选择')}
                  notFoundContent={_l('暂无数据')}
                  getPopupContainer={() => selectOptionListRef.current}
                  value={destField.mdType}
                  options={options}
                  onChange={(value, option) => onWorkSheetTypeChange(value, option)}
                />
              </div>

              {destField.mdType && settingComponent.component && (
                <settingComponent.component
                  data={destField.controlSetting}
                  fromExcel={true}
                  onChange={data => {
                    updateFieldsMapping &&
                      updateFieldsMapping({
                        ...itemData,
                        destField: {
                          ...destField,
                          scale: data.dot || 0,
                          controlSetting: {
                            ...destField.controlSetting,
                            ..._.pick(data, ['advancedSetting', 'enumDefault', 'type', 'dot']),
                          },
                        },
                      });
                  }}
                />
              )}
            </Wrapper>
          )
        }
      >
        <div className="flex minWidth0" ref={selectRef}>
          <Select
            className="selectItem commonWidth"
            open={false}
            placeholder={_l('请选择')}
            notFoundContent={_l('暂无数据')}
            value={isDestDbType ? destField.dataType : destField.mdType}
            options={options}
          />
        </div>
      </Popover>
      <div className="numberTips">
        {!isDestDbType && destField.mdType === 6 && (
          <Tooltip title={_l('数值最大支持16位数字')} placement="top">
            <Icon icon="info" className="textDisabled mLeft5" />
          </Tooltip>
        )}
      </div>
    </div>
  );
}
