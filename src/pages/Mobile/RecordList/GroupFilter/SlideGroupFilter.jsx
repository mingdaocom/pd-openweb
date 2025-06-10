import React, { Fragment, useEffect, useState } from 'react';
import { Popup } from 'antd-mobile';
import styled from 'styled-components';
import GroupFilterList from './GroupFilterList';

const FilterWrap = styled.div`
  height: 40px;
  padding: 0 12px;
  background-color: #fff;
`;
const CloseIcon = styled.i`
  padding: 5px;
  border-radius: 50%;
  background-color: #e6e6e6;
`;

export default function SlideGroupFilter(props) {
  const { base } = props;
  const { appId, viewId } = base;
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [currentGroup, setCurrentGroup] = useState({});

  useEffect(() => {
    setCurrentGroup([]);
  }, [viewId]);

  return (
    <Fragment>
      <FilterWrap className="valignWrapper bold" onClick={() => setDrawerVisible(true)}>
        <i className="icon icon-table_rows Font20" />
        <div className="flex Font17 mLeft10 ellipsis">{currentGroup.txt}</div>
        {currentGroup.count ? <div className="Font17">{currentGroup.count}</div> : ''}
      </FilterWrap>

      <Popup
        className="slideGroupFilterDrawer"
        position="left"
        visible={drawerVisible}
        forceRender={true}
        bodyStyle={{
          borderRadius: '0 10px 10px 0',
          overflow: 'hidden',
        }}
        onClose={() => setDrawerVisible(false)}
        onMaskClick={() => setDrawerVisible(false)}
      >
        <div className="valignWrapper pLeft16 pRight10 pTop15 pBottom15">
          <div className="flex Gray_9e Font13">{_l('筛选列表')}</div>
          <CloseIcon className="icon-close Gray_9e" onClick={() => setDrawerVisible(false)} />
        </div>
        <GroupFilterList
          {...props}
          sliderCurrentGroup={currentGroup}
          className="slideGroupFilterList"
          handleClickItem={item => {
            setDrawerVisible(false);
            setCurrentGroup(item);
          }}
        />
      </Popup>
    </Fragment>
  );
}
