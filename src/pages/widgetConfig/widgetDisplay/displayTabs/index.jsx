import React from 'react';
import _ from 'lodash';
import styled from 'styled-components';
import { Segmented } from 'ming-ui/antd-components';
import DisplayCollapse from './displayCollapse';
import DisplayTile from './displayTile';

const getTabDisplayTypeOptions = () => [
  { label: _l('平铺'), value: '1' },
  { label: _l('折叠'), value: '2' },
];

const DisplayTabWrap = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  .tabHeaderContent {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-top: 24px;
  }
`;

export default function DisplayTab(props) {
  const { styleInfo, setStyleInfo } = props;
  const selectTab = _.get(styleInfo, 'info.sectionshow') || '1';

  return (
    <DisplayTabWrap>
      <div className="tabHeaderContent">
        <span className="textTertiary Font14 Bold">{_l('标签页')}</span>
        <Segmented
          size="small"
          value={selectTab}
          options={getTabDisplayTypeOptions()}
          onChange={value => setStyleInfo({ info: Object.assign({}, styleInfo.info, { sectionshow: value }) })}
        />
      </div>
      {selectTab === '1' ? <DisplayTile {...props} /> : <DisplayCollapse {...props} />}
    </DisplayTabWrap>
  );
}
