import React from 'react';
import { useSetState } from 'react-use';
import cx from 'classnames';
import _ from 'lodash';
import styled from 'styled-components';
import { Modal } from 'ming-ui';
import functionWrap from 'ming-ui/components/FunctionWrap';
import { DisplayTabs, SettingItem } from '../../../../styled';
import { getAdvanceSetting } from '../../../../util/setting';
import DropdownShowControls from './dropdownShowControls';
import FilterConfig from './filterConfig';
import RelateSearchConfig from './relateSearchConfig';
import ShowControls from './showControls';
import SortConfig from './sortConfig';
import ReportConfig from './totalConfig';
import '../../FilterData/FilterDialog.less';

const SelectConfigWrap = styled.div`
  min-height: 440px;
  .hasData > .mTop24 {
    margin-top: 10px !important;
  }
`;

const getTabsDisplay = isDropdown => {
  return [
    { text: _l('过滤选择范围'), value: 0 },
    isDropdown ? { text: _l('下拉框设置'), value: 2 } : { text: _l('弹层设置'), value: 2 },
    { text: _l('用户查询'), value: 1 },
    { text: _l('统计'), value: 3 },
    { text: _l('排序'), value: 4 },
  ];
};

function SelectConfig(props) {
  const { data, onClose = () => {}, onChange } = props;
  const { showtype } = getAdvanceSetting(data);
  const [{ showTab, configData }, setData] = useSetState({
    showTab: 0,
    configData: data,
  });
  const isDropdown = showtype === '3';
  const { controls = [], views = [], sheetInfo = {} } = window.subListSheetConfig[data.controlId] || {};

  const renderDesc = () => {
    switch (showTab) {
      case 1:
        return _l('设置用户在选择记录时如何搜索和筛选记录');
      case 2:
        if (isDropdown) return null;
        return (
          <SettingItem>
            <div className="settingItemTitle">{_l('弹层显示字段')}</div>
            <span className="Gray75">{_l('设置用户在使用弹层选择记录时可以查看的字段')}</span>
          </SettingItem>
        );
      case 3:
        return _l('为用户设置在选择记录时显示字段的统计值，最多添加10个');
      case 4:
        return _l('设置用户在选择记录时查看的顺序');
      default:
        return _l('设置用户可以选择的记录范围，支持使用动态值过滤');
    }
  };

  const renderContent = () => {
    const editProps = {
      ...props,
      data: configData,
      controls,
      views,
      sheetSwitchPermit: sheetInfo.switches,
      handleChange: newData => setData({ configData: newData }),
    };
    if (showTab === 0) {
      return <FilterConfig {...editProps} />;
    } else if (showTab === 1) {
      return <RelateSearchConfig {...editProps} />;
    } else if (showTab === 2) {
      if (isDropdown) {
        return <DropdownShowControls {...editProps} />;
      }
      return <ShowControls {...editProps} />;
    } else if (showTab === 3) {
      return <ReportConfig {...editProps} />;
    } else if (showTab === 4) {
      return <SortConfig {...editProps} />;
    }
  };

  return (
    <Modal
      visible
      width={960}
      destroyOnClose={true}
      title={<span className="Bold">{_l('关联选择设置')}</span>}
      className="filterDialog selectConfigDialog"
      onCancel={onClose}
      onOk={() => {
        onChange(configData);
        onClose();
      }}
    >
      <SelectConfigWrap>
        <DisplayTabs>
          {getTabsDisplay(isDropdown).map(item => {
            const active = showTab === item.value;
            if (_.includes([3, 4], item.value) && (data.enumDefault === 1 || showtype === '3')) return null;
            return (
              <div
                className={cx('tabItem', { active })}
                onClick={() => {
                  if (active) return;
                  setData({ showTab: item.value });
                }}
              >
                {item.text}
              </div>
            );
          })}
        </DisplayTabs>
        <div className="mTop12 textSecondary">{renderDesc()}</div>
        {renderContent()}
      </SelectConfigWrap>
    </Modal>
  );
}

export default function openSelectConfig(props) {
  return functionWrap(SelectConfig, props);
}
