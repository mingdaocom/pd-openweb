import React, { useEffect, useRef } from 'react';
import { useSetState } from 'react-use';
import { Drawer } from 'antd';
import { Input, SvgIcon, LoadDiv } from 'ming-ui';
import homeAppAjax from 'src/api/homeApp.js';
import WorksheetLog from './WorksheetLog';
import cx from 'classnames';
import './index.less';
import _ from 'lodash';

export default function WorksheetLogDrawer(props) {
  const { visible, projectId, appId, onClose = () => {} } = props;
  const worksheetListRef = useRef(null);
  const [{ worksheetLoading, worksheetList, selectWorksheetId, searchValue, searchWorksheetList }, setData] =
    useSetState({
      worksheetLoading: true,
      worksheetList: [],
      selectWorksheetId: '',
      searchValue: '',
      searchWorksheetList: [],
    });

  const getWorksheets = () => {
    homeAppAjax
      .getWorksheetsByAppId({ appId })
      .then(res => {
        const list = res.filter(v => v.type === 0);
        setData({
          worksheetLoading: false,
          worksheetList: list,
          selectWorksheetId: props.selectWorksheetId || _.get(list, '[0].workSheetId'),
        });
      })
      .catch(err => {
        setData({ worksheetLoading: false });
      });
  };

  const handleSearch = val => {
    const searchValue = _.trim(val);
    const list = worksheetList.filter(item => item.workSheetName.toLowerCase().includes(searchValue.toLowerCase()));
    setData({ searchWorksheetList: list, selectWorksheetId: _.get(list, '[0].workSheetId'), searchValue: val });
  };

  useEffect(() => {
    getWorksheets();
  }, []);

  useEffect(() => {
    if (!!props.selectWorksheetId && worksheetListRef) {
      const index = _.findIndex(worksheetList, v => v.workSheetId === props.selectWorksheetId);
      worksheetListRef.current.scrollTop = index * 36;
    }
  }, [worksheetList]);

  return (
    <Drawer
      className="worksheetLogDrawer"
      visible={visible}
      title={null}
      closable={false}
      maskClosable={true}
      destroyOnClose={true}
      size="large"
      onClose={onClose}
    >
      <div className="flexRow h100">
        <div className="sheetWrap flexColumn">
          <div className="searchWrap Relative">
            <i className="icon icon-search Font18 Gray_9d TxtMiddle" />
            <Input placeholder={_l('搜索')} value={searchValue} onChange={handleSearch} />
          </div>
          <div className="mTop15 mLeft16 mBottom10">{_l('选择工作表')}</div>
          <div className="worksheetList flex" ref={worksheetListRef}>
            {worksheetLoading ? (
              <LoadDiv className="mTop50" />
            ) : searchValue && _.isEmpty(searchWorksheetList) ? (
              <div className="Gray_9e pLeft16">{_l('暂无搜索结果')}</div>
            ) : (
              (!!_.trim(searchValue) ? searchWorksheetList : worksheetList).map(item => {
                const { workSheetId, workSheetName, iconUrl } = item;
                return (
                  <div
                    className={cx('sheetItem flexRow Hand', { 'isActive bold': workSheetId === selectWorksheetId })}
                    key={workSheetId}
                    onClick={() => setData({ selectWorksheetId: workSheetId })}
                  >
                    <SvgIcon
                      url={iconUrl}
                      fill={workSheetId === selectWorksheetId ? '#108ee9' : '#9e9e9e'}
                      size={16}
                      addClassName="TxtMiddle mRight5"
                    />
                    <div className="flex ellipsis" title={workSheetName}>
                      {workSheetName}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
        <div className="logWrap flex flexColumn">
          <div className="header flexRow pLeft20 pRight20 alignItemsCenter">
            <div className="InlineBlock Font16 title Relative">{_l('日志')}</div>
            <div className="flex"></div>
            <i className="icon icon-close Font18 Hand" onClick={onClose} />
          </div>
          <div className="flex logContent">
            {selectWorksheetId && <WorksheetLog worksheetId={selectWorksheetId} rowId="" />}
          </div>
        </div>
      </div>
    </Drawer>
  );
}
