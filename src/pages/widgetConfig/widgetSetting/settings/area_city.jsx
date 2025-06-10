import React, { Fragment, useEffect, useState } from 'react';
import cx from 'classnames';
import { Dropdown } from 'ming-ui';
import fixedDataController from 'src/api/fixedData';
import { getAdvanceSetting, handleAdvancedSettingChange } from 'src/pages/widgetConfig/util/setting';
import { AnimationWrap, SettingItem } from '../../styled';

const AREA_DISPLAY_OPTION = [
  {
    value: 1,
    text: _l('省'),
  },
  { value: 2, text: _l('省-市') },
  { value: 3, text: _l('省-市-县') },
];

const AREA_SPECIAL_DISPLAY_OPTION = [
  { value: 1, text: _l('市') },
  { value: 2, text: _l('市-县') },
];

const INTERNATIONAL_AREA_TYPE = [
  {
    text: _l('指定地区'),
    value: 0,
  },
  {
    text: _l('国际'),
    value: 1,
  },
];

export default function Area(props) {
  const { data, onChange, globalSheetInfo = {} } = props;
  const { enumDefault = 0, enumDefault2, controlId } = data;
  const { chooserange } = getAdvanceSetting(data);
  const [areaData, setData] = useState([]);

  const isChinaArea = value => _.includes(['CN', 'TW', 'MO', 'HK'], value || chooserange);
  const isChinaSpecialArea = value => _.includes(['TW', 'MO', 'HK'], value || chooserange);

  useEffect(() => {
    getCityList();
  }, []);

  useEffect(() => {
    if (!enumDefault) {
      getDefaultRange();
    }
  }, [controlId, enumDefault]);

  const getAreaDisplay = () => {
    if (chooserange === 'CN') return AREA_DISPLAY_OPTION;
    if (_.includes(['TW', 'MO', 'HK'], chooserange)) return AREA_SPECIAL_DISPLAY_OPTION;
    return [];
  };

  // 获取地区/国家列表
  const getCityList = () => {
    fixedDataController
      .getCitysByParentID({
        parentId: '',
        keywords: '',
        layer: 0,
        textSplit: '/',
        isLast: false,
        projectId: globalSheetInfo.projectId,
        langType: getCurrentLangCode(),
      })
      .then(res => {
        setData(res.citys.map(i => ({ ...i, text: i.name, value: i.id })));
      });
  };

  // 获取层级类型
  const getEnum2 = value => {
    if (enumDefault === 1) {
      return 4;
    } else {
      if (isChinaSpecialArea(value)) {
        return enumDefault2 > 2 ? 2 : enumDefault2 || 2;
      } else {
        return !isChinaArea(value) || enumDefault2 > 3 ? 3 : enumDefault2 || 3;
      }
    }
  };

  // 获取默认配置国家
  const getDefaultRange = () => {
    if (!chooserange) {
      fixedDataController.getRegionConfigInfos({ projectId: globalSheetInfo.projectId }).then(res => {
        let code = 'CN';
        if (!_.isEmpty(res)) {
          code = _.get(res, 'code');
        }
        onChange({
          ...handleAdvancedSettingChange(data, { chooserange: code }),
          enumDefault2: getEnum2(code),
        });
      });
    }
  };

  return (
    <Fragment>
      <SettingItem>
        <div className="settingItemTitle">{_l('选择范围')}</div>
        <AnimationWrap>
          {INTERNATIONAL_AREA_TYPE.map(item => {
            const active = enumDefault === item.value;
            return (
              <div
                className={cx('animaItem', { active })}
                onClick={() => {
                  if (active) return;
                  const defsource = getAdvanceSetting(data, 'defsource') || [];
                  onChange({
                    ...handleAdvancedSettingChange(data, {
                      chooserange: '',
                      ...(defsource.length ? { defsource: '' } : {}),
                    }),
                    enumDefault: item.value,
                    enumDefault2: item.value === 1 ? 4 : 3,
                  });
                }}
              >
                {item.text}
              </div>
            );
          })}
        </AnimationWrap>
      </SettingItem>
      {!enumDefault && (
        <Fragment>
          <SettingItem>
            <div className="settingItemTitle">{_l('国家/地区')}</div>
            <Dropdown
              border
              openSearch
              value={chooserange || undefined}
              placeholder={_l('请选择地区范围')}
              data={areaData}
              onChange={value =>
                onChange({
                  ...handleAdvancedSettingChange(data, { chooserange: value }),
                  enumDefault2: getEnum2(value),
                })
              }
            />
          </SettingItem>
          {isChinaArea() && (
            <SettingItem>
              <div className="settingItemTitle">{_l('选择层级')}</div>
              <Dropdown
                border
                data={getAreaDisplay()}
                value={enumDefault2}
                onChange={value => onChange({ enumDefault2: value })}
              />
            </SettingItem>
          )}
        </Fragment>
      )}
    </Fragment>
  );
}
