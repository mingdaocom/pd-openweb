import React, { useEffect, useMemo } from 'react';
import { useSetState } from 'react-use';
import _ from 'lodash';
import worksheetAjax from 'src/api/worksheet';
import { PRINT_TEMP } from 'src/pages/Print/core/config';
import { SYS_BTN_LIST } from './config';
import { actionColumnOptionsFromLayouts, getActionColumnKey } from './groupedLayout/actionColumnUtils';
import SortableRowActionList from './rowAction/SortableRowActionList';
import RowBtnList from './RowBtnList.jsx';
import './CustomBtn.less';

export default function (props) {
  const {
    viewId,
    worksheetId,
    onChange = () => {},
    view,
    btnList,
    detailBtnGroupsJson,
    detailFlatBtnOrderJson,
    listBtnGroupsJson,
    listFlatBtnOrderJson,
  } = props;

  const [{ showBtn, actioncolumn, tempList, tempListAll, items, loading }, setState] = useSetState({
    showBtn: false,
    actioncolumn: _.get(view, 'advancedSetting.actioncolumn')
      ? safeParse(_.get(view, 'advancedSetting.actioncolumn'))
      : [],
    tempList: [],
    tempListAll: [],
    items: [],
    loading: true,
  });

  const customActionOptions = useMemo(
    () =>
      actionColumnOptionsFromLayouts(btnList, [
        {
          flatBtnOrderJson: detailFlatBtnOrderJson,
          groupRaw: detailBtnGroupsJson,
          source: 'detail',
          sourceText: _l('详情分组'),
        },
        {
          flatBtnOrderJson: listFlatBtnOrderJson,
          groupRaw: listBtnGroupsJson,
          source: 'list',
          sourceText: _l('批量分组'),
        },
      ]),
    [btnList, detailFlatBtnOrderJson, detailBtnGroupsJson, listFlatBtnOrderJson, listBtnGroupsJson],
  );

  const getItem = (o, printList) => {
    return o.type === 'print'
      ? (printList || tempListAll).find(a => a.id === o.id) || {}
      : o.type === 'btn'
        ? btnList.find(a => a.btnId === o.id) || {}
        : o.type === 'group'
          ? customActionOptions.find(
              a => a.type === 'group' && a.id === o.id && getActionColumnKey(a) === getActionColumnKey(o),
            ) || {}
          : SYS_BTN_LIST.find(a => a.key === o.id) || {};
  };

  const getName = (o, printList) => {
    const data = getItem(o, printList);
    return ['print', 'btn', 'group'].includes(o.type) ? data.name : data.txt;
  };

  const getItems = printList => {
    return actioncolumn.map(o => {
      return {
        ...o,
        ..._.omit(getItem(o), ['key', 'type']),
        name: getName(o, printList),
        actionKey: getActionColumnKey(o),
      };
    });
  };

  const getData = async () => {
    const tempList = await worksheetAjax.getPrintList({ worksheetId, viewId });

    setState({
      tempListAll: tempList,
      tempList: tempList.filter(l => !l.disabled).sort((a, b) => PRINT_TEMP[a.type] - PRINT_TEMP[b.type]),
      items: getItems(tempList),
      loading: false,
    });
  };

  useEffect(() => {
    getData();
  }, []);

  useEffect(() => {
    setState({ items: getItems() });
  }, [actioncolumn, tempListAll, customActionOptions]);

  useEffect(() => {
    setState({
      actioncolumn: _.get(view, 'advancedSetting.actioncolumn')
        ? safeParse(_.get(view, 'advancedSetting.actioncolumn'))
        : [],
    });
  }, [_.get(view, 'advancedSetting.actioncolumn')]);

  const handleMoveApp = list => {
    onChange(
      list.map(o => {
        return _.pick(o, ['id', 'type', 'source']);
      }),
    );
    setState({
      actioncolumn: list.map(o => {
        return _.pick(o, ['id', 'type', 'source']);
      }),
    });
  };

  const onDelete = item => {
    const nextActioncolumn = actioncolumn.filter(o => getActionColumnKey(o) !== getActionColumnKey(item));
    onChange(nextActioncolumn);
    setState({ actioncolumn: nextActioncolumn });
  };

  if (loading) return '';

  return (
    <React.Fragment>
      <div className="customBtnBox mTop13">
        <div>
          {items.length > 0 && <SortableRowActionList items={items} onSortEnd={handleMoveApp} onDelete={onDelete} />}
        </div>
        <div
          className="addBtn Hand mTop10 Relative"
          onClick={() => {
            setState({
              showBtn: !showBtn,
            });
          }}
        >
          <i className="icon icon-add Font18 mRight5 TxtMiddle InlineBlock"></i>
          <span className="Bold TxtMiddle InlineBlock">{_l('按钮')}</span>
          {showBtn && (
            <RowBtnList
              {...props}
              tempList={tempList}
              worksheetId={worksheetId}
              viewId={viewId}
              view={view}
              actioncolumn={actioncolumn}
              detailBtnGroupsJson={detailBtnGroupsJson}
              detailFlatBtnOrderJson={detailFlatBtnOrderJson}
              listBtnGroupsJson={listBtnGroupsJson}
              listFlatBtnOrderJson={listFlatBtnOrderJson}
              onAdd={data => {
                // 分组优先级高于单按钮，避免行内操作里重复显示同一个自定义动作。
                const nextActioncolumn = [
                  ...(data.type === 'group'
                    ? actioncolumn.filter(o => !(o.type === 'btn' && (data.btnIds || []).includes(o.id)))
                    : actioncolumn),
                  _.pick(data, ['id', 'type', 'source']),
                ];
                onChange(nextActioncolumn);
                setState({ actioncolumn: nextActioncolumn });
              }}
              onClickAway={() => setState({ showBtn: false })}
            />
          )}
        </div>
      </div>
    </React.Fragment>
  );
}
