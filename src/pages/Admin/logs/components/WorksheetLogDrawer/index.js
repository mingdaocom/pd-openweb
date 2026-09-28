import React, { useEffect, useRef } from 'react';
import { useSetState } from 'react-use';
import cx from 'classnames';
import _ from 'lodash';
import { LoadDiv, SvgIcon } from 'ming-ui';
import { Drawer, Input } from 'ming-ui/antd-components';
import homeAppAjax from 'src/api/homeApp.js';
import { getTranslateInfo } from 'src/utils/services/app';
import WorksheetLog from './WorksheetLog';
import './index.less';

export default function WorksheetLogDrawer(props) {
  const { visible, appId, selectWorksheetId: defaultWorksheetId, onClose = () => {} } = props;
  const worksheetListRef = useRef(null);
  const [{ worksheetLoading, worksheetList, selectWorksheetId, searchValue, searchWorksheetList }, setData] =
    useSetState({
      worksheetLoading: true,
      worksheetList: [],
      selectWorksheetId: '',
      searchValue: '',
      searchWorksheetList: [],
    });

  useEffect(() => {
    homeAppAjax
      .getWorksheetsByAppId({ appId })
      .then(res => {
        const list = res.filter(v => v.type === 0);
        setData({
          worksheetLoading: false,
          worksheetList: list.map(item => {
            return {
              ...item,
              workSheetName: getTranslateInfo(appId, null, item.workSheetId).name || item.workSheetName,
            };
          }),
          selectWorksheetId:
            defaultWorksheetId && (_.find(list, v => v.workSheetId === defaultWorksheetId) || {}).type === 0
              ? defaultWorksheetId
              : _.get(list, '[0].workSheetId'),
        });
      })
      .catch(() => {
        setData({ worksheetLoading: false });
      });
  }, [appId, defaultWorksheetId, setData]);

  const handleSearch = val => {
    const searchValue = _.trim(val);
    const list = worksheetList.filter(item => item.workSheetName.toLowerCase().includes(searchValue.toLowerCase()));
    setData({ searchWorksheetList: list, selectWorksheetId: _.get(list, '[0].workSheetId'), searchValue: val });
  };

  useEffect(() => {
    if (defaultWorksheetId && worksheetListRef.current) {
      const index = _.findIndex(worksheetList, v => v.workSheetId === defaultWorksheetId);
      worksheetListRef.current.scrollTop = index * 36;
    }
  }, [defaultWorksheetId, worksheetList]);

  return (
    <Drawer
      rootClassName="worksheetLogDrawer"
      open={visible}
      title={null}
      closable={false}
      mask={{ closable: true }}
      size="large"
      onClose={onClose}
    >
      <div className="flexRow h100">
        <div className="sheetWrap flexColumn">
          <div className="searchWrap Relative">
            <Input
              className="w100"
              prefix={<i className="icon icon-search Font18 textTertiary" />}
              placeholder={_l('搜索')}
              value={searchValue}
              onChange={e => handleSearch(e.target.value)}
            />
          </div>
          <div className="mTop15 mLeft16 mBottom10">{_l('选择工作表')}</div>
          <div className="worksheetList flex" ref={worksheetListRef}>
            {worksheetLoading ? (
              <LoadDiv className="mTop50" />
            ) : searchValue && _.isEmpty(searchWorksheetList) ? (
              <div className="textTertiary pLeft16">{_l('暂无搜索结果')}</div>
            ) : (
              (_.trim(searchValue) ? searchWorksheetList : worksheetList).map(item => {
                const { workSheetId, workSheetName, iconUrl } = item;
                return (
                  <div
                    className={cx('sheetItem flexRow Hand', { 'isActive bold': workSheetId === selectWorksheetId })}
                    key={workSheetId}
                    onClick={() => setData({ selectWorksheetId: workSheetId })}
                  >
                    <SvgIcon
                      url={iconUrl}
                      fill={workSheetId === selectWorksheetId ? 'var(--color-primary)' : 'var(--color-text-tertiary)'}
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
          <div className="flex logContent minHeight0">
            {selectWorksheetId && <WorksheetLog worksheetId={selectWorksheetId} rowId="" />}
          </div>
        </div>
      </div>
    </Drawer>
  );
}
