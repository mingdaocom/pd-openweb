import React, { useEffect, useRef, useState } from 'react';
import { useSetState } from 'react-use';
import Trigger from 'rc-trigger';
import styled from 'styled-components';
import { Select } from 'antd';
import { Input } from 'ming-ui';
import { enumWidgetType } from 'src/pages/widgetConfig/util';
import Settings from 'src/pages/widgetConfig/widgetSetting/settings';
import { DEFAULT_DATA } from 'src/pages/widgetConfig/config/widget.js';
import _ from 'lodash';

const Wrapper = styled.div`
  width: 348px;
  padding: 20px;
  background: #fff;
  box-shadow: 0px 4px 16px rgba(0, 0, 0, 0.24);
  border-radius: 3px;
  position: relative;

  .selectItem {
    width: 100% !important;
    font-size: 13px;
    .ant-select-selector {
      min-height: 36px;
      padding: 2px 11px !important;
      border: 1px solid #ccc !important;
      border-radius: 3px !important;
      box-shadow: none !important;
    }
    &.ant-select-focused {
      .ant-select-selector {
        border-color: #1e88e5 !important;
      }
    }
    &.disabled {
      .ant-select-selector {
        border: 0;
      }
    }
  }

  .commonInput {
    width: 80px;
  }
`;

export default function SelectType(props) {
  const { options, itemData, updateFieldsMapping, isDestDbType } = props;
  const [visible, setVisible] = useState(false);
  const destField = itemData.destField || {};
  const [settingComponent, setSettingComponent] = useSetState({ component: null, data: {} });
  const selectRef = useRef();
  const selectOptionListRef = useRef();

  const currentOption = options.filter(item => item.value === destField.dataType)[0] || {};

  useEffect(() => {
    //对应类型的可选配置
    if (destField.mdType) {
      const ENUM_TYPE = enumWidgetType[destField.mdType];
      const data =
        ENUM_TYPE === 'DATE_TIME'
          ? { type: destField.mdType, advancedSetting: { showtype: '6' } }
          : { type: destField.mdType, ..._.omit(DEFAULT_DATA[ENUM_TYPE], ['controlName']) };
      setSettingComponent({
        component: Settings[ENUM_TYPE],
        data,
      });
      updateFieldsMapping &&
        updateFieldsMapping({
          ...itemData,
          destField: {
            ...destField,
            controlSetting: _.pick(data, ['advancedSetting', 'enumDefault', 'type', 'dot']),
          },
        });
    }
  }, [destField.mdType]);

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
    <Trigger
      action={['click']}
      popupClassName="moreOption"
      getPopupContainer={() => selectRef.current}
      popupVisible={visible}
      onPopupVisibleChange={onPopupVisibleChange}
      popupAlign={{
        points: ['tr', 'br'],
        offset: [0, 5],
        overflow: { adjustX: true, adjustY: true },
      }}
      popup={
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
                  onChange={value => {
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
                  onChange={value => {
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
                onChange={(value, option) => {
                  updateFieldsMapping &&
                    updateFieldsMapping({
                      ...itemData,
                      destField: {
                        ...destField,
                        dataType: option.typeName,
                        jdbcTypeId: option.dataType,
                        mdType: value,
                      },
                    });
                }}
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
      <div ref={selectRef}>
        <Select
          className="selectItem commonWidth"
          open={false}
          placeholder={_l('请选择')}
          notFoundContent={_l('暂无数据')}
          value={isDestDbType ? destField.dataType : destField.mdType}
          options={options}
        />
      </div>
    </Trigger>
  );
}
