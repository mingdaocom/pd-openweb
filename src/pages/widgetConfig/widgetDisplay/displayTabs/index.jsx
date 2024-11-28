import React from 'react';
import styled from 'styled-components';
import cx from 'classnames';
import DisplayTile from './displayTile';
import DisplayCollapse from './displayCollapse';
import { AnimationWrap } from '../../styled';

const TAB_DISPLAY_TYPE = [
  { text: _l('平铺'), value: '1' },
  { text: _l('折叠'), value: '2' },
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
    .animaItem {
      height: 24px;
      line-height: 24px;
      width: fit-content;
      padding: 0 10px;
      flex: unset;
    }
  }
`;

export default function DisplayTab(props) {
  const { styleInfo, setStyleInfo } = props;
  const selectTab = _.get(styleInfo, 'info.sectionshow') || '1';

  return (
    <DisplayTabWrap>
      <div className="tabHeaderContent">
        <span className="Gray_9e Font14 Bold">{_l('标签页')}</span>
        <AnimationWrap className="switchStyleWrap" style={{ background: '#ededed', fontSize: 12 }}>
          {TAB_DISPLAY_TYPE.map(item => (
            <div
              className={cx('animaItem', { active: selectTab === item.value })}
              onClick={() => {
                setStyleInfo({ info: Object.assign({}, styleInfo.info, { sectionshow: item.value }) });
              }}
            >
              {item.text}
            </div>
          ))}
        </AnimationWrap>
      </div>
      {selectTab === '1' ? <DisplayTile {...props} /> : <DisplayCollapse {...props} />}
    </DisplayTabWrap>
  );
}
