import React, { Fragment, useEffect, useState } from 'react';
import WidgetIcon from '../components/WidgetIcon';
import AttachmentConfig from '../components/AttachmentConfig';
import WidgetColor from '../components/WidgetColor';
import { Dropdown, Dialog } from 'ming-ui';
import { SettingItem } from '../../styled';
import { getDefaultData, getColor, getDynamicColors } from '../../config/score';
import { handleAdvancedSettingChange, getAdvanceSetting } from '../../util/setting';
import 'src/pages/worksheet/components/DialogImportExcelCreate/SetImportExcelCreateWorksheetOrApp/index.less';
import _ from 'lodash';

const SCORE_COLOR_TYPE = [
  { text: _l('固定'), value: 1 },
  { text: _l('动态%04028'), value: 2 },
];

export default function Score({ data, onChange }) {
  const [visible, setVisible] = useState(false);
  const [colors, setColors] = useState([]);
  const { controlId } = data;
  const itemcolor = getAdvanceSetting(data, 'itemcolor');
  const max = getAdvanceSetting(data, 'max');

  useEffect(() => {
    // 老数据用新配置填充
    if (data.advancedSetting && (!data.advancedSetting.itemicon || !data.advancedSetting.itemcolor)) {
      const defaultConfig = getDefaultData(data);
      onChange(handleAdvancedSettingChange(data, { ...defaultConfig, showvalue: '1' }));
    }
  }, [controlId]);

  useEffect(() => {
    handleChangeColor();
  }, [max]);

  const handleChangeColor = ({ type, maxVal } = {}) => {
    if (!max || !itemcolor) return;
    const currentType = type || itemcolor.type || 1;
    const currentColor = currentType === 1 ? itemcolor.color : '';
    const currentColors = currentType === 1 ? [] : getDynamicColors(itemcolor.colors, maxVal || max);
    let tempData = {
      itemcolor: JSON.stringify({
        type: currentType,
        color: currentColor,
        colors: currentColors,
      }),
    };
    if (maxVal) {
      tempData.max = maxVal;
    }
    setColors(currentColors);
    onChange(handleAdvancedSettingChange(data, tempData));
  };

  return (
    <Fragment>
      <WidgetIcon data={data} onChange={onChange} />
      <SettingItem>
        <div className="settingItemTitle">{_l('最大值')}</div>
        <AttachmentConfig
          data={data}
          onChange={value => {
            handleChangeColor({ maxVal: getAdvanceSetting(value, 'max') });
          }}
          attr="max"
        />
      </SettingItem>
      <SettingItem>
        <div className="settingItemTitle">{_l('颜色')}</div>
        <div className="labelWrap flexRow">
          <Dropdown
            border
            isAppendToBody
            style={{ width: '90px', marginRight: '10px' }}
            data={SCORE_COLOR_TYPE}
            value={_.get(itemcolor, 'type') || 1}
            onChange={type => {
              handleChangeColor({ type });
            }}
          />
          {itemcolor.type !== 2 ? (
            <WidgetColor
              type="normal"
              color={getColor(data)}
              handleChange={color => {
                onChange(handleAdvancedSettingChange(data, { itemcolor: JSON.stringify({ ...itemcolor, color }) }));
              }}
            />
          ) : (
            <span className="ThemeColor3 ThemeHoverColor2 pointer LineHeight36" onClick={() => setVisible(true)}>
              {_l('设置')}
            </span>
          )}
        </div>
      </SettingItem>

      <Dialog
        width={500}
        visible={visible}
        title={_l('动态颜色')}
        dialogClasses="dynamicSettingColorDialog"
        onCancel={() => {
          setColors(itemcolor.colors);
          setVisible(false);
        }}
        onOk={() => {
          onChange(handleAdvancedSettingChange(data, { itemcolor: JSON.stringify({ ...itemcolor, colors }) }));
          setVisible(false);
        }}
      >
        <Fragment>
          <div className="Gray_9e mBottom24">
            {_l('为每个等级设置颜色。当鼠标悬停或选中对应等级后，图标将显示为该等级设置的颜色')}
          </div>
          <div className="flexRow">
            <span className="LineHeight32 mRight10">{_l('等级')}</span>
            {colors.map((item, index) => {
              return (
                <WidgetColor
                  color={item.value}
                  text={`${index + 1}`}
                  handleChange={color => {
                    const newColors = colors.map((co, idx) =>
                      idx === index ? { key: `${index + 1}`, value: color } : co,
                    );
                    setColors(newColors);
                  }}
                />
              );
            })}
          </div>
        </Fragment>
      </Dialog>
    </Fragment>
  );
}
