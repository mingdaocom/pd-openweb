import React, { Fragment, useState, useEffect, useRef } from 'react';
import styled from 'styled-components';
import { LoadDiv, Dialog, Button, Icon } from 'ming-ui';
import cx from 'classnames';
import { Tooltip } from 'antd';
import update from 'immutability-helper';
import { groupBy, maxBy, head, keys, sortBy, isEmpty } from 'lodash';
import worksheetAjax from 'src/api/worksheet';
import EditOptionList from 'src/pages/widgetConfig/widgetSetting/components/OptionList/EditOptionList';
import { getOptions } from '../../../widgetConfig/util/setting';
import { useSetState } from 'react-use';
import DeleteOptionList from './DeleteOptionList';

const MAX_HEIGHT = 530;
const LINE_HEIGHT = 30;
const ITEM_WIDTH = 243;
const MARGIN = 20;
// 标题高度和列表上下padding
const TITLE_AND_PADDING = 45 + 16;

const AllOptionHeader = styled.header`
  display: flex;
  justify-content: space-between;
  margin-bottom: 20px;
  p {
    margin: 0;
  }
`;

const OptionListWrap = styled.div`
  position: relative;
  overflow: auto;
  flex: 1;
  &.emptyWrap {
    display: flex;
    align-items: center;
    justify-content: center;
  }
`;

const ListItem = styled.div`
  position: absolute;
  width: 243px;
  padding: 0 12px;
  transition: transform 0.25s;
  background-color: #fff;
  max-height: 550px;
  overflow: hidden;
  transition: all 0.25s;
  border: 1px solid #eaeaea;
  border-radius: 8px;
  .operate {
    visibility: hidden;
  }
  &:hover {
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.08);
    .operate {
      visibility: visible;
    }
  }
  .icon-trash {
    &:hover {
      color: #f44336 !important;
    }
  }

  .title {
    display: flex;
    align-items: center;
    justify-content: space-between;
    border-bottom: 1px solid #ddd;
    line-height: 24px;
    padding: 10px 0;
    .delete {
      margin-left: 8px;
    }
  }
  ul {
    padding: 8px 0;
    max-height: 485px;
  }

  li {
    display: flex;
    align-items: center;
    line-height: 30px;

    .colorWrap {
      width: 16px;
      height: 16px;
      border-radius: 50%;
      margin-right: 6px;
    }
    &.more {
      position: absolute;
      width: 100%;
      bottom: 0;
      background-color: #fff;
      color: #757575;
    }
  }
`;

const OptionItem = props => {
  const { name, colorful, handleClick, pos } = props;
  const options = getOptions({ options: props.options });
  const getPos = () => {
    if (!pos) return {};
    return { transform: `translate(${pos.left}px,${pos.top}px)` };
  };
  return (
    <ListItem style={{ ...getPos() }}>
      <div className="title Bold">
        <div className="name ellipsis">
          {name}
          {` ( ${options.length} )`}
        </div>
        <div className="operate">
          <Tooltip placement="bottom" title={_l('编辑')}>
            <Icon icon="edit" className="Gray_9e ThemeHoverColor3 Font16 pointer" onClick={() => handleClick('edit')} />
          </Tooltip>
          <Tooltip placement="bottom" title={_l('删除')} className="mLeft8">
            <Icon icon="trash" className="Gray_9e Font16 pointer" onClick={() => handleClick('delete')} />
          </Tooltip>
        </div>
      </div>
      <ul>
        {options
          .filter(item => !item.isDeleted)
          .map(({ color, value }) => (
            <li>
              {colorful && <div className="colorWrap" style={{ backgroundColor: color }}></div>}
              <div className="name ellipsis flex">{value}</div>
            </li>
          ))}
        {options.length > 15 && <li className="more">{_l('更多 ...')}</li>}
      </ul>
    </ListItem>
  );
};

export default function AllOptionList(props) {
  const { projectId, appId } = props;
  const $ref = useRef(null);
  const [{ createVisible, deleteConfirmVisible }, setVisible] = useSetState({
    createVisible: false,
    deleteConfirmVisible: false,
  });
  const [{ editIndex, deleteIndex }, setIndex] = useSetState({ editIndex: -1, deleteIndex: -1 });
  const [loading, setLoading] = useState(false);
  const [posList, setPos] = useState([]);
  const [items, setItems] = useState([]);

  // 计算单个高度
  const computeHeight = item => {
    return Math.min(MAX_HEIGHT + MARGIN, (getOptions(item) || []).length * LINE_HEIGHT + TITLE_AND_PADDING + MARGIN);
  };

  const waterfallList = list => {
    const $dom = $ref.current;
    if (!$dom) return [];
    const wrapWidth = $dom.offsetWidth;
    const itemWidth = ITEM_WIDTH + MARGIN;
    const maxCol = wrapWidth / itemWidth;
    const firstLine = list.slice(0, maxCol);
    const others = list.slice(maxCol);

    let pos = firstLine.map((item, index) => ({ top: 0, left: index * itemWidth, y: computeHeight(item) }));

    const findPrevItem = () => {
      const cols = groupBy(pos, 'left');
      return head(
        sortBy(
          keys(cols).map(key => maxBy(cols[key], 'y')),
          'y',
        ),
      );
    };

    others.forEach(item => {
      const { left, y } = findPrevItem();
      pos.push({ top: y, left, y: y + computeHeight(item) });
    });

    setPos(pos);
  };
  useEffect(() => {
    setLoading(true);
    worksheetAjax
      .getCollectionsByAppId({ appId })
      .then(({ data }) => {
        setItems(data);
        waterfallList(data);
      })
      .always(() => {
        setLoading(false);
      });
  }, []);
  const deleteOptions = () => {
    const { collectionId } = items[deleteIndex] || {};
    worksheetAjax.deleteOptionsCollection({ appId, collectionId }).then(({ data }) => {
      if (data) {
        const nextItems = update(items, { $splice: [[deleteIndex, 1]] });
        setItems(nextItems);
        waterfallList(nextItems);
      } else {
        alert(_l('删除失败'), 2);
      }
    });
  };
  const onDelete = index => {
    const { name, collectionId, worksheetIds } = items[index] || {};

    // 没有字段引用的选项集直接删,否则需要二次确认
    if (isEmpty(worksheetIds)) {
      Dialog.confirm({
        title: (
          <span className="Bold" style={{ color: '#f44336' }}>
            {_l('删除选项集 “%0”', name)}
          </span>
        ),
        buttonType: 'danger',
        description: _l('此选项集未被任何选项使用'),
        onOk: () => {
          worksheetAjax.deleteOptionsCollection({ appId, collectionId }).then(({ data }) => {
            if (data) {
              const nextItems = update(items, { $splice: [[index, 1]] });
              setItems(nextItems);
              waterfallList(nextItems);
            } else {
              alert(_l('删除失败'), 2);
            }
          });
        },
      });
    } else {
      setVisible({ deleteConfirmVisible: true });
    }
  };

  const handleCreateOption = item => {
    const nextList = items.concat(item);
    setItems(nextList);
    waterfallList(nextList);
    setVisible({ createVisible: false });
  };

  const handleEdit = data => {
    const nextData = { ...items[editIndex], ...data };
    const nextList = update(items, { [editIndex]: { $set: nextData } });
    setItems(nextList);
    waterfallList(nextList);
    setIndex({ editIndex: -1 });
  };

  const renderContent = () => {
    if (loading) return <LoadDiv />;
    if (isEmpty(items)) return <div className="emptyHint Gray_9e Font14">{_l('此应用下还没有添加选项集')}</div>;
    return items.map((item, index) => (
      <OptionItem
        {...item}
        pos={posList[index]}
        handleClick={type => {
          if (type === 'delete') {
            onDelete(index);
            setIndex({ deleteIndex: index });
            return;
          }
          if (type === 'edit') {
            setIndex({ editIndex: index });
          }
        }}
      />
    ));
  };

  return (
    <Fragment>
      <AllOptionHeader>
        <p className="Font17 Bold">{_l('选项集')}</p>
        <Button className="pLeft20 pRight20" type="primary" radius onClick={() => setVisible({ createVisible: true })}>
          {_l('+ 新增选项集')}
        </Button>
      </AllOptionHeader>
      <OptionListWrap className={cx({ emptyWrap: isEmpty(items) })} ref={$ref}>
        {renderContent()}
      </OptionListWrap>
      {createVisible && (
        <EditOptionList
          projectId={projectId}
          appId={appId}
          onOk={handleCreateOption}
          onCancel={() => setVisible({ createVisible: false })}
        />
      )}
      {deleteConfirmVisible && (
        <DeleteOptionList
          {...items[deleteIndex]}
          onOk={() => {
            deleteOptions();
            setVisible({ deleteConfirmVisible: false });
          }}
          onCancel={() => setVisible({ deleteConfirmVisible: false })}
        />
      )}
      {editIndex > -1 && (
        <EditOptionList
          {...items[editIndex]}
          appId={appId}
          projectId={projectId}
          onOk={handleEdit}
          onCancel={() => setIndex({ editIndex: -1 })}
        />
      )}
    </Fragment>
  );
}
