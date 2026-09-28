import React, { useCallback, useEffect, useMemo, useRef } from 'react';
import { useSetState } from 'react-use';
import _ from 'lodash';
import { Icon, LoadDiv } from 'ming-ui';
import { Dropdown } from 'ming-ui/antd-components';
import sheetAjax from 'src/api/worksheet';
import { isSameType } from 'src/pages/worksheet/common/ViewConfig/util.js';
import { renderText as renderCellText } from 'src/utils/domain/control/display';
import Option from './Options';

const MENU_STYLE = { minWidth: 180, minHeight: 100, maxHeight: 300, overflowY: 'auto' };
let Ajax = null;

export default function (props) {
  const { children, controlInfo, disabled, onChange, onDelete, currentList = [] } = props;
  const addedValuesRef = useRef(new Set());
  const [{ list, pageIndex, keyWords, controls, count, loading, showMenu }, setState] = useSetState({
    list: [],
    pageIndex: 1,
    keyWords: '',
    controls: [], //字段信息
    count: 0,
    loading: true,
    showMenu: false,
  });
  const getColumns = useCallback(
    ({ pageIndex = 1, keyWords = '' }) => {
      setState({
        loading: true,
      });
      if (isSameType([9, 10, 11], controlInfo)) {
        setState({
          list: controlInfo.options
            .filter(o => !o.isDeleted)
            .filter(o => o.value.toLowerCase().indexOf(keyWords.toLowerCase()) >= 0),
          loading: false,
          count: controlInfo.options.length,
        });
      } else if (isSameType([28], controlInfo)) {
        const list = Array.from(
          { length: parseInt(_.get(controlInfo, ['advancedSetting', 'max']) || '1', 10) },
          (_, index) => JSON.stringify(index + 1),
        );
        const newlist = list.filter(o => o.toLowerCase().indexOf(keyWords.toLowerCase()) >= 0);
        setState({
          list: newlist,
          loading: false,
          count: list.length,
        });
      } else if (controlInfo.type === 29) {
        const worksheetId = controlInfo.dataSource;
        const args = {
          worksheetId,
          viewId: controlInfo.viewId,
          searchType: 1,
          pageSize: 50,
          pageIndex,
          status: 1,
          keyWords,
          isGetWorksheet: true,
          getType: 7,
          filterControls: [],
        };

        if (Ajax) {
          Ajax.abort();
        }

        Ajax = sheetAjax.getFilterRows(args);
        Ajax.then(res => {
          setState(prevState => ({
            list: pageIndex > 1 ? prevState.list.concat(res.data) : res.data,
            pageIndex,
            controls: res.template ? res.template.controls : [],
            count: res.count,
            loading: false,
          }));
        });
      }
    },
    [controlInfo, setState],
  );

  const searchRecords = useMemo(
    () => _.debounce(keyWords => getColumns({ pageIndex: 1, keyWords: keyWords.trim() }), 500),
    [getColumns],
  );

  useEffect(() => {
    return () => searchRecords.cancel();
  }, [searchRecords]);

  const renderItemCon = record => {
    if (isSameType([9, 10, 11], controlInfo)) {
      return <Option controlInfo={props.controlInfo} item={record.key} />;
    }

    if (isSameType([28], controlInfo)) {
      return <span className="flex">{_l('%0 级', parseInt(record, 10))}</span>;
    }

    if (29 === controlInfo.type) {
      const control = controls.find(o => o.attribute === 1);
      return renderCellText({ ...control, value: record[control.controlId] }) || _l('未命名');
    }
  };

  const getRecordValue = record => {
    if (isSameType([9, 10, 11], controlInfo)) {
      return record.key;
    }

    if (isSameType([28], controlInfo)) {
      return record;
    }

    return record.rowid;
  };

  const currentValues = isSameType([9, 10, 11, 28], controlInfo) ? currentList : currentList.map(item => item.rowid);
  const menuItems = list.map(record => {
    const value = getRecordValue(record);
    const isSelected = currentValues.includes(value);

    return {
      key: `record-${value}`,
      label: (
        <div className="flexRow alignItemsCenter">
          <div className="flex WordBreak overflow_ellipsis">{renderItemCon(record)}</div>
          {isSelected && <Icon className="colorPrimary Font18" icon="ok" />}
        </div>
      ),
      onClick: () => {
        if (isSelected) {
          addedValuesRef.current.delete(value);
          onDelete(isSameType([9, 10, 11, 28], controlInfo) ? value : record);
        } else {
          onChange(record, addedValuesRef.current.size);
          addedValuesRef.current.add(value);
        }
      },
    };
  });

  if (loading) {
    menuItems.push({
      key: 'loading',
      disabled: true,
      label: <LoadDiv className="pTop10 pBottom10" />,
    });
  }

  return (
    <Dropdown
      showPopupSearch
      filterOption={false}
      searchValue={keyWords}
      onSearch={value => {
        setState({ keyWords: value });
        searchRecords(value);
      }}
      notFoundContent={keyWords ? _l('无匹配结果') : _l('暂无数据')}
      open={showMenu}
      trigger={['click']}
      placement="bottomLeft"
      menu={{
        items: menuItems,
        multiple: true,
        selectable: true,
        selectedKeys: currentValues.map(value => `record-${value}`),
        style: MENU_STYLE,
        onScroll: event => {
          const { scrollTop, scrollHeight, clientHeight } = event.currentTarget;

          if (!loading && list.length < count && scrollTop + clientHeight >= scrollHeight - 20) {
            getColumns({ pageIndex: pageIndex + 1, keyWords });
          }
        },
      }}
      onOpenChange={open => {
        searchRecords.cancel();
        addedValuesRef.current.clear();
        setState({ showMenu: open, keyWords: '' });
        if (open) {
          getColumns({});
        }
      }}
      disabled={disabled}
    >
      <span className="InlineBlock">{children}</span>
    </Dropdown>
  );
}
