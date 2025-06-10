import React, { useEffect } from 'react';
import { useSetState } from 'react-use';
import cx from 'classnames';
import _ from 'lodash';
import { Icon, SortableList, SvgIcon } from 'ming-ui';
import worksheetAjax from 'src/api/worksheet';
import { PRINT_TEMP, PRINT_TYPE } from 'src/pages/Print/config.js';
import { BTN_LIST, SYS_BTN_LIST } from './config';
import RowBtnList from './RowBtnList.jsx';
import './CustomBtn.less';

const Item = ({ onDelete, DragHandle, item }) => {
  // type说明 btn：按钮 print：打印模板 copy:复制 share：分享 sysprint:系统打印 delete：删除

  const renderIcon = (data, key) => {
    if (key === 'sys') {
      return <Icon icon={data.icon} style={{ color: data.color }} className={cx('mRight12 Font18 InlineFlex')} />;
    }
    if (key === 'btn') {
      const { color, icon, iconUrl } = data;
      return (
        <React.Fragment>
          {!!iconUrl && !!icon && icon.endsWith('_svg') ? (
            <SvgIcon
              className="mRight12 svgIconForBtn InlineFlex"
              addClassName="TxtMiddle"
              url={iconUrl}
              fill={!color ? '#2196f3' : color === 'transparent' ? '#151515' : color}
              size={18}
            />
          ) : (
            <Icon
              icon={icon || 'custom_actions'}
              style={{ color: color }}
              className={cx(
                'mRight12 Font18 InlineFlex',
                !icon ? 'Gray_bd' : !color ? 'ThemeColor3' : color === 'transparent' ? 'Gray' : '',
              )}
            />
          )}
        </React.Fragment>
      );
    }
    return <Icon icon="print" className={cx('mRight12 Font18 Gray_75 InlineFlex')} />;
  };

  return (
    <React.Fragment>
      <DragHandle className="alignItemsCenter flexRow">
        <Icon className="mRight10 Font16 mLeft7 Hand" icon="drag" />
      </DragHandle>
      <span className="Hand con overflow_ellipsis alignItemsCenter">
        <span className="Font13 WordBreak Gray Bold flexRow alignItemsCenter">
          {renderIcon(item, SYS_BTN_LIST.map(o => o.key).includes(item.type) ? 'sys' : item.type)}
          <span className={cx('flex overflow_ellipsis')}>{item.name || _l('已删除')}</span>
        </span>
      </span>
      <Icon className="Font16 Hand mLeft15 mRight15" icon="delete2" onClick={() => onDelete(item.id)} />
    </React.Fragment>
  );
};

export default function (props) {
  const { viewId, worksheetId, onChange = () => {}, view, btnList } = props;

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

  const getItem = (o, printList) => {
    return o.type === 'print'
      ? (printList || tempListAll).find(a => a.id === o.id) || {}
      : o.type === 'btn'
        ? btnList.find(a => a.btnId === o.id) || {}
        : SYS_BTN_LIST.find(a => a.key === o.id) || {};
  };

  const getName = (o, printList) => {
    const data = getItem(o, printList);
    return o.type === 'print' ? data.name : o.type === 'btn' ? data.name : data.txt;
  };

  const getItems = printList => {
    return actioncolumn.map(o => {
      return {
        ...o,
        ..._.omit(getItem(o), ['key', 'type']),
        name: getName(o, printList),
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
  }, [actioncolumn, tempListAll]);

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
        return _.pick(o, ['id', 'type']);
      }),
    );
    setState({
      actioncolumn: list.map(o => {
        return _.pick(o, ['id', 'type']);
      }),
    });
  };

  const onDelete = id => {
    onChange(actioncolumn.filter(o => o.id !== id));
  };
  if (loading) return '';

  return (
    <React.Fragment>
      <div className="customBtnBox mTop13">
        <div>
          {items.length > 0 && (
            <SortableList
              items={items}
              itemKey="id"
              useDragHandle
              onSortEnd={list => handleMoveApp(list)}
              helperClass={'customBtnSortableList'}
              itemClassName="customBtn alignItemsCenter"
              renderItem={options => (
                <Item {...options} {...options.item} onDelete={onDelete} key={'item_' + options.index} />
              )}
            />
          )}
        </div>
        <div
          className="addBtn Hand mTop20 Relative"
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
              onAdd={data => {
                onChange([...actioncolumn, data]);
              }}
              onClickAway={() => setState({ showBtn: false })}
            />
          )}
        </div>
      </div>
    </React.Fragment>
  );
}
