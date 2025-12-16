import React, { Fragment, useEffect, useState } from 'react';
import cx from 'classnames';
import _ from 'lodash';
import styled from 'styled-components';
import { Dropdown } from 'ming-ui';
import fixedDataController from 'src/api/fixedData';
import { getAdvanceSetting, handleAdvancedSettingChange } from 'src/pages/widgetConfig/util/setting';
import {
  AREA_DISPLAY_OPTION,
  AREA_INTERNATION_DISPLAY_OPTION,
  AREA_SPECIAL_DISPLAY_OPTION,
  COMMON_DEFAULT_COUNTRY,
} from '../../config/setting';
import { AnimationWrap, SettingItem } from '../../styled';
import { SelectAreaCountryDialog } from '../components/WidgetHighSetting/ControlSetting/SelectDialog';

const ConfigWrap = styled.div`
  margin: 6px 0;
  height: 36px;
  line-height: 36px;
  padding: 0 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  cursor: pointer;
  &:hover {
    border-color: #1677ff;
  }
`;

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

const isChina = value => _.includes(['CN'], value);

export default function Area(props) {
  const { data, onChange, globalSheetInfo = {} } = props;
  const { enumDefault = 0, enumDefault2, controlId } = data;
  const { chooserange, commcountries } = getAdvanceSetting(data);
  const [originData, setData] = useState([]);
  const [searchData, setSearchData] = useState([]);
  const [visible, setVisible] = useState(false);

  const commonData = _.isUndefined(commcountries)
    ? COMMON_DEFAULT_COUNTRY
    : getAdvanceSetting(data, 'commcountries') || [];
  const filterCommonData = commonData.filter(i => _.find(originData, o => o.id === i));

  useEffect(() => {
    const list = getCityList();
    setData(list);
    setSearchData(list);
  }, []);

  useEffect(() => {
    if (!enumDefault) {
      getDefaultRange();
    }
  }, [controlId, enumDefault]);

  const getAreaDisplay = () => {
    if (enumDefault === 1) return AREA_INTERNATION_DISPLAY_OPTION;
    if (chooserange === 'CN') return AREA_DISPLAY_OPTION;
    return AREA_SPECIAL_DISPLAY_OPTION;
  };

  // 获取地区/国家列表
  const getCityList = (keywords = '') => {
    const { citys = [] } = fixedDataController.getCitysByParentID(
      {
        keywords,
        layer: 0,
        projectId: globalSheetInfo.projectId,
        langType: getCurrentLangCode(),
      },
      { ajaxOptions: { sync: true } },
    );
    let list = citys.map(i => ({ ...i, text: i.name, value: i.id }));
    if (!enumDefault) {
      list = list.filter(l => !l.last);
    }
    return list;
  };

  const handleSearch = _.debounce(value => {
    if (_.isUndefined(value)) return;
    const newList = getCityList(value);
    setSearchData(newList);
  }, 500);

  // 获取层级类型
  const getEnum2 = value => {
    if (enumDefault === 1) {
      return 4;
    } else {
      if (!isChina(value)) {
        return enumDefault2 > 2 ? 2 : enumDefault2 || 2;
      }
      return enumDefault2 > 3 ? 3 : enumDefault2 || 3;
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

  const getCommonDisplayText = () => {
    if (filterCommonData.length > 0) {
      if (
        filterCommonData.length === COMMON_DEFAULT_COUNTRY.length &&
        _.isEqual(filterCommonData, COMMON_DEFAULT_COUNTRY)
      ) {
        return <div className="text Gray_75">{_l('默认')}</div>;
      }
      return <div className="text">{_l('%0个', filterCommonData.length)}</div>;
    }
    return <div className="text Gray_bd">{_l('请选择')}</div>;
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
                      commcountries: item.value === 1 ? JSON.stringify(COMMON_DEFAULT_COUNTRY) : '',
                    }),
                    enumDefault: item.value,
                    enumDefault2: item.value === 1 ? 4 : isChina(item.value) ? 3 : 2,
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
        <SettingItem>
          <div className="settingItemTitle">{_l('国家/地区')}</div>
          <Dropdown
            border
            openSearch
            onSearch={handleSearch}
            value={chooserange || undefined}
            placeholder={_l('请选择地区范围')}
            data={searchData}
            renderTitle={() => {
              return (
                _.get(
                  _.find(originData, a => a.value === chooserange),
                  'text',
                ) || ''
              );
            }}
            onChange={value => {
              onChange({
                ...handleAdvancedSettingChange(data, { chooserange: value }),
                enumDefault2: getEnum2(value),
              });
              setSearchData(originData);
            }}
          />
        </SettingItem>
      )}

      <SettingItem>
        <div className="settingItemTitle">{_l('选择层级')}</div>
        <Dropdown
          border
          data={getAreaDisplay()}
          value={enumDefault2}
          onChange={value => onChange({ enumDefault2: value })}
        />
      </SettingItem>
      {enumDefault === 1 && (
        <SettingItem>
          <div className="settingItemTitle">{_l('常用的国家/地区')}</div>
          <ConfigWrap onClick={() => setVisible(true)}>{getCommonDisplayText()}</ConfigWrap>
        </SettingItem>
      )}

      {visible && (
        <SelectAreaCountryDialog
          title={_l('常用的国家/地区')}
          data={originData}
          selectableData={filterCommonData}
          onOk={list => {
            onChange(handleAdvancedSettingChange(data, { commcountries: JSON.stringify(list) }));
            setVisible(false);
          }}
          onCancel={() => setVisible(false)}
        />
      )}
    </Fragment>
  );
}
