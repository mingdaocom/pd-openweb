import React, { Fragment, useEffect } from 'react';
import { Select } from 'antd';
import { Icon, SortableList, Switch } from 'ming-ui';
import homeAppApi from 'src/api/homeApp';
import { useSetState } from 'react-use';
import _ from 'lodash';

const getWorksheetList = (sections = [], viewHideNavi, isAuthorityApp) => {
  let list = _.reduce(
    sections,
    (result, item) => {
      let sheets = [];
      item.workSheetInfo.forEach(v => {
        if (v.type === 2) {
          // 二级分组
          sheets = sheets.concat(
            (_.find(item.childSections, c => c.appSectionId === v.workSheetId) || {}).workSheetInfo,
          );
        } else {
          sheets.push(v);
        }
      });

      return result.concat(sheets);
    },
    [],
  );

  list = list.filter(
    item =>
      item.type !== 2 && (viewHideNavi && isAuthorityApp ? true : [1, 3].includes(item.status) && !item.navigateHide),
  );

  return list;
};

export default function MobileCustomNav(props) {
  const { app, onChangeApp = () => {} } = props;
  const [{ appItemList, appNavItemIds, searchValue }, setData] = useSetState({
    appItemList: [],
    appNavItemIds: [],
    searchValue: '',
  });
  const selectedAppNavList = appNavItemIds.map(id => _.find(appItemList, v => v.workSheetId === id)).filter(_.identity);
  const searchList = !_.trim(searchValue)
    ? []
    : _.filter(appItemList, v => v.workSheetName.toLowerCase().indexOf(_.trim(searchValue).toLowerCase()) > -1);

  const getApp = () => {
    homeAppApi
      .getApp({
        appId: app.id,
        getSection: true,
      })
      .then(res => {
        setData({
          appItemList: getWorksheetList(res.sections, app.viewHideNavi, true),
          appNavItemIds: res.appNavItemIds || [],
        });
      });
  };

  useEffect(() => {
    getApp();
  }, []);

  const renderAppItem = options => {
    const { item, DragHandle } = options;
    const checked = _.includes(appNavItemIds, item.workSheetId);
    const disabled = selectedAppNavList.length === 4 && !checked;
    return (
      <div className="item valignWrapper" key={item.workSheetId}>
        <Switch
          className="mRight10"
          disabled={disabled}
          size="small"
          checked={checked}
          onClick={checked => {
            const selectIds = checked
              ? _.filter(appNavItemIds, v => v !== item.workSheetId)
              : appNavItemIds.concat(item.workSheetId);

            setData({ appNavItemIds: selectIds });
            onChangeApp({ appNavItemIds: selectIds });
          }}
        />
        {DragHandle ? (
          <div className="flex Hand dragItem">
            <DragHandle>
              <div className="Hand ellipsis Gray flexRow">
                <span className="flex ellipsis"> {item.workSheetName}</span>
                <i className="icon Gray_9e Font16 Right ThemeHoverColor3 dragHandle icon-drag"></i>
              </div>
            </DragHandle>
          </div>
        ) : (
          <div className="flex ellipsis Gray">{item.workSheetName}</div>
        )}
      </div>
    );
  };

  const handleSearch = e => {
    const val = e.target.value;

    setData({ searchValue: val });
  };

  return (
    <div className="pLeft24 pRight24">
      <div className="bold mBottom12">{_l('显示应用项')}</div>
      <Select
        className="w100 customAppNavSelect"
        mode="multiple"
        placeholder={_l('可选择需要展示的自定义应用项')}
        options={selectedAppNavList.map(({ workSheetId, workSheetName }) => ({
          value: workSheetId,
          label: workSheetName,
        }))}
        showArrow={true}
        removeIcon={null}
        value={selectedAppNavList.map(item => item.workSheetId)}
        showSearch={false}
        suffixIcon={<i className="icon icon-arrow-down-border Gray_9e" />}
        dropdownRender={() => {
          const unselectList = appItemList.filter(it => !_.includes(appNavItemIds, it.workSheetId));

          return (
            <div className="mobileAppItemsWrap flexColumn">
              <div className="searchWrap valignWrapper pBottom10">
                <Icon icon="search" className="mLeft12 Gray_75 Font20" />
                <input className="flex pLeft10 pRight10" placeholder={_l('搜索')} onChange={handleSearch} />
              </div>
              <div className="line mTop0 mBottom10"></div>
              <div className="listWrap flex">
                {_.trim(searchValue) ? (
                  !_.isEmpty(searchList) ? (
                    searchList.map(item => renderAppItem({ item }))
                  ) : (
                    <div className="Gray_bd mTop20 mBottom30 TxtCenter">{_l('没有搜索结果')}</div>
                  )
                ) : (
                  <Fragment>
                    {!_.isEmpty(appNavItemIds) && (
                      <Fragment>
                        <div>
                          <SortableList
                            useDragHandle
                            items={selectedAppNavList}
                            itemKey="workSheetId"
                            onSortEnd={(newItems, newIndex) => {
                              const ids = newItems.map(v => v.workSheetId);
                              setData({ appNavItemIds: ids });
                              onChangeApp({ appNavItemIds: ids });
                            }}
                            renderItem={options => renderAppItem({ ...options })}
                          />
                        </div>
                        {!_.isEmpty(unselectList) && <div className="line"></div>}
                      </Fragment>
                    )}
                    <div>{unselectList.map(item => renderAppItem({ item }))}</div>
                  </Fragment>
                )}
              </div>
            </div>
          );
        }}
      ></Select>
    </div>
  );
}
