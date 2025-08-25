import React from 'react';
import { useSetState } from 'react-use';
import cx from 'classnames';
import _ from 'lodash';
import styled from 'styled-components';
import { Modal } from 'ming-ui';
import functionWrap from 'ming-ui/components/FunctionWrap';
import { DisplayTabs } from '../../../../styled';
import { getAdvanceSetting } from '../../../../util/setting';
import FilterConfig from './filterConfig';
import RelateSearchConfig from './relateSearchConfig';
import ShowControls from './showControls';
import SortConfig from './sortConfig';
import ReportConfig from './totalConfig';
import '../../FilterData/filterDialog.less';

const SelectConfigWrap = styled.div`
  min-height: 440px;
  .hasData > .mTop24 {
    margin-top: 10px !important;
  }
`;

const TABS_DISPLAY = [
  { text: _l('过滤选择范围'), value: 0 },
  { text: _l('用户查询'), value: 1 },
  { text: _l('显示字段'), value: 2 },
  { text: _l('统计'), value: 3 },
  { text: _l('排序'), value: 4 },
];

function SelectConfig(props) {
  const { data, onClose = () => {}, onChange } = props;
  const { showtype } = getAdvanceSetting(data);
  const [{ showTab, configData }, setData] = useSetState({
    showTab: 0,
    configData: data,
  });
  const openfastfilters = _.get(configData, 'advancedSetting.openfastfilters') || (showtype === '3' ? '0' : '1');
  const { controls = [], views = [] } = window.subListSheetConfig[data.controlId] || {};

  const renderDesc = () => {
    switch (showTab) {
      case 1:
        return _l('设置用户在选择记录时如何搜索和筛选记录');
      case 2:
        return _l('设置用户在选择记录时可以查看的字段');
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
      handleChange: newData => setData({ configData: newData }),
    };
    if (showTab === 0) {
      return <FilterConfig {...editProps} />;
    } else if (showTab === 1) {
      return <RelateSearchConfig {...editProps} />;
    } else if (showTab === 2) {
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
          {TABS_DISPLAY.map(item => {
            const active = showTab === item.value;
            if (item.value === 2 && data.enumDefault === 1 && showtype === '3') return null;
            if (item.value === 2 && openfastfilters === '0') return null;
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
        <div className="mTop12 Gray_75">{renderDesc()}</div>
        {renderContent()}
      </SelectConfigWrap>
    </Modal>
  );
}

export default function openSelectConfig(props) {
  return functionWrap(SelectConfig, props);
}
