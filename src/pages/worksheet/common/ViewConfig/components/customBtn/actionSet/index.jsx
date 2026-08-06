import React from 'react';
import { DndProvider } from 'react-dnd-latest';
import { useSetState } from 'react-use';
import MouseBackEnd from '@mdfe/react-dnd-mouse-backend';
import _ from 'lodash';
import RowBtn from '../RowBtn';
import { CustomActionPanel, RecordClickAction, ToggleHeader } from './ActionSetSections';
import { Wrap } from './ActionSetStyled';
import RowActionStyleSettings from './RowActionStyleSettings';

const getBtnBySort = (list, ids) => {
  const ordered = ids.map(id => list.find(o => o.btnId === id)).filter(Boolean);
  const others = list.filter(o => !ids.includes(o.btnId));

  return [...ordered, ...others];
};

export default function ActionSet(props) {
  const {
    refreshFn = () => {},
    worksheetId,
    appId,
    projectId,
    rowId,
    updateCurrentView = () => {},
    btnList = [],
    view = {},
    isSheetView,
    worksheetControls = [],
    viewId,
  } = props;

  const [{ openList }, setState] = useSetState({
    openList: ['clickAction', 'recordAction', 'bathAction', 'rowAction'],
  });

  const viewType = _.get(view, 'viewType') + '';
  const advancedSetting = _.get(view, 'advancedSetting') || {};
  const {
    hidebtn,
    clicktype = '0',
    clickcid,
    listbtns,
    detailbtns,
    detailgroup,
    listgroup,
    actioncolumn,
  } = advancedSetting || {};
  const acstyle = safeParse(_.get(view, 'advancedSetting.acstyle')) || {};
  const showClickDetail = !['6'].includes(viewType);
  const showRowAction = !['21', '6', '7'].includes(viewType);
  const isTableRowAction = isSheetView || (viewType === '2' && advancedSetting.hierarchyViewType === '3');
  const batchBtnList = btnList.filter(o => !((o.writeObject === 2 || o.writeType === 2) && o.clickType === 3));

  const toggleOpen = key => {
    setState({
      openList: openList.includes(key) ? openList.filter(o => o !== key) : openList.concat(key),
    });
  };

  const fetchBtnByAll = () => {
    refreshFn(worksheetId, appId, '', rowId);
  };

  const updateViewSet = data => {
    updateCurrentView({
      ...view,
      advancedSetting: {
        ...advancedSetting,
        ...data,
      },
      editAdKeys: Object.keys(data),
      editAttrs: ['advancedSetting'],
    });
  };

  const getActionColumnWithGroupPriority = (layoutItems, source) => {
    const currentActionColumn = safeParse(actioncolumn, 'array');
    const selectedGroupIds = currentActionColumn
      .filter(o => o.type === 'group' && (o.source || 'list') === source)
      .map(o => o.id);

    if (!selectedGroupIds.length) {
      return currentActionColumn;
    }

    const groupBtnIds = _.uniq(
      _.flatMap(layoutItems, item =>
        item && item.type === 'group' && selectedGroupIds.includes(item.id) ? item.btns || [] : [],
      ),
    );

    if (!groupBtnIds.length) {
      return currentActionColumn;
    }

    return currentActionColumn.filter(o => !(o.type === 'btn' && groupBtnIds.includes(o.id)));
  };

  const saveBtnLayout = (key, source, layoutItems) => {
    const nextData = { [key]: JSON.stringify(layoutItems) };
    const currentActionColumn = safeParse(actioncolumn, 'array');
    const nextActionColumn = getActionColumnWithGroupPriority(layoutItems, source);

    if (!_.isEqual(nextActionColumn, currentActionColumn)) {
      nextData.actioncolumn = JSON.stringify(nextActionColumn);
    }

    updateViewSet(nextData);
  };

  const listBtns = getBtnBySort(
    btnList.filter(
      o => safeParse(_.get(o, 'advancedSetting.listviews'), 'array').includes(viewId) || o.isAllView === 1,
    ),
    safeParse(listbtns, 'array'),
  );
  const detailBtns = getBtnBySort(
    btnList.filter(
      o => safeParse(_.get(o, 'advancedSetting.detailviews'), 'array').includes(viewId) || o.isAllView === 1,
    ),
    safeParse(detailbtns, 'array'),
  );

  const onChangeAcStyle = data => {
    updateCurrentView({
      ...view,
      advancedSetting: {
        acstyle: JSON.stringify({ ...acstyle, ...data }),
      },
      editAttrs: ['advancedSetting'],
      editAdKeys: ['acstyle'],
    });
  };

  const baseCustomBtnProps = {
    ...props,
    projectId,
    onFresh: fetchBtnByAll,
  };

  const content = (
    <Wrap>
      <div className="viewSetTitle">{_l('记录操作')}</div>
      {showClickDetail && (
        <ToggleHeader
          open={openList.includes('clickAction')}
          title={_l('点击记录时')}
          onClick={() => toggleOpen('clickAction')}
        />
      )}
      <RecordClickAction
        open={openList.includes('clickAction')}
        show={showClickDetail}
        clicktype={clicktype}
        clickcid={clickcid}
        worksheetControls={worksheetControls}
        updateViewSet={updateViewSet}
      />
      {showClickDetail && <div className="line"></div>}
      <ToggleHeader
        open={openList.includes('recordAction')}
        title={_l('详情操作')}
        count={detailBtns.length}
        onClick={() => toggleOpen('recordAction')}
      />
      {openList.includes('recordAction') && (
        <CustomActionPanel
          title={_l('自定义动作')}
          inlineHeader
          showHideUnavailable={detailBtns.length > 0}
          hideUnavailable={hidebtn === '1'}
          onToggleHideUnavailable={() => updateViewSet({ hidebtn: hidebtn === '1' ? '' : '1' })}
          customBtnProps={{
            ...baseCustomBtnProps,
            isListOption: false,
            btnData: detailBtns,
            btnList,
            btnGroupsJson: detailgroup,
            flatBtnOrderJson: detailbtns,
            onSaveBtnLayout: ({ layoutItems }) => saveBtnLayout('detailgroup', 'detail', layoutItems),
          }}
        />
      )}
      {isSheetView && (
        <React.Fragment>
          <div className="line"></div>
          <ToggleHeader
            open={openList.includes('bathAction')}
            title={_l('批量操作')}
            count={listBtns.length}
            onClick={() => toggleOpen('bathAction')}
          />
          {openList.includes('bathAction') && (
            <CustomActionPanel
              title={_l('自定义动作')}
              customBtnProps={{
                ...baseCustomBtnProps,
                isListOption: true,
                btnData: listBtns,
                btnList: batchBtnList,
                btnGroupsJson: listgroup,
                flatBtnOrderJson: listbtns,
                onSaveBtnLayout: ({ layoutItems }) => saveBtnLayout('listgroup', 'list', layoutItems),
              }}
            />
          )}
        </React.Fragment>
      )}
      {showRowAction && (
        <React.Fragment>
          <div className="line"></div>
          <ToggleHeader
            open={openList.includes('rowAction')}
            title={isTableRowAction ? _l('行内操作') : _l('卡片操作')}
            onClick={() => toggleOpen('rowAction')}
          />
          {openList.includes('rowAction') && (
            <React.Fragment>
              <div className="customBtnBox">
                <p className="Bold Font13 mTop25 textSecondary">
                  {isTableRowAction
                    ? _l('在表格右侧显示操作列，可以对每行记录进行快速操作')
                    : _l('在记录卡片上显示操作按钮，可以对单条记录快速操作')}
                </p>
                <p className="Bold textSecondary Font13 mTop13 mBottom0">{_l('按钮')}</p>
                <RowBtn
                  {...props}
                  isListOption
                  btnList={btnList}
                  detailBtnGroupsJson={detailgroup}
                  detailFlatBtnOrderJson={detailbtns}
                  listBtnGroupsJson={listgroup}
                  listFlatBtnOrderJson={listbtns}
                  onChange={actioncolumn => {
                    updateCurrentView({
                      ...view,
                      advancedSetting: {
                        actioncolumn: JSON.stringify(actioncolumn),
                      },
                      editAttrs: ['advancedSetting'],
                      editAdKeys: ['actioncolumn'],
                    });
                  }}
                />
              </div>
              <RowActionStyleSettings acstyle={acstyle} onChangeAcStyle={onChangeAcStyle} />
            </React.Fragment>
          )}
        </React.Fragment>
      )}
    </Wrap>
  );

  return (
    <DndProvider context={window} backend={MouseBackEnd}>
      {content}
    </DndProvider>
  );
}
