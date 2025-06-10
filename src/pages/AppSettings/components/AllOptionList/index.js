import React, { useEffect, useRef, useState } from 'react';
import { useSetState } from 'react-use';
import { Tooltip } from 'antd';
import cx from 'classnames';
import update from 'immutability-helper';
import { groupBy, head, isEmpty, keys, maxBy, sortBy } from 'lodash';
import styled from 'styled-components';
import { Icon, LoadDiv } from 'ming-ui';
import worksheetAjax from 'src/api/worksheet';
import EditOptionList from 'src/pages/widgetConfig/widgetSetting/components/OptionList/EditOptionList';
import { getTranslateInfo } from 'src/utils/app';
import { getOptions } from '../../../widgetConfig/util/setting';
import AppSettingHeader from '../AppSettingHeader';
import EmptyStatus from '../EmptyStatus';
import OperateList from './OperateList';

const MAX_HEIGHT = 530;
const LINE_HEIGHT = 30;
const ITEM_WIDTH = 243;
const MARGIN = 20;
// 标题高度和列表上下padding
const TITLE_AND_PADDING = 45 + 16;

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
  cursor: pointer;
  .operate {
    /* visibility: hidden; */
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
  const { appId, collectionId, name, colorful, handleClick, pos, status, onClick = () => {} } = props;
  const options = getOptions({ options: props.options });
  const getPos = () => {
    if (!pos) return {};
    return { transform: `translate(${pos.left}px,${pos.top}px)` };
  };
  const translateInfo = getTranslateInfo(appId, null, collectionId);
  return (
    <ListItem style={{ ...getPos() }} status={status} onClick={onClick}>
      <div className="title Bold">
        <div className="name ellipsis">
          {translateInfo.name || name}
          {` ( ${options.length} )`}
        </div>
        <div className="operate">
          <Tooltip placement="bottom" title={_l('编辑')}>
            <Icon icon="edit" className="Gray_9e ThemeHoverColor3 Font16 pointer" onClick={() => handleClick('edit')} />
          </Tooltip>
          <OperateList {...props} status={status} />
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
  const [{ createVisible }, setVisible] = useSetState({
    createVisible: false,
  });
  const [{ editIndex }, setIndex] = useSetState({ editIndex: -1 });
  const [loading, setLoading] = useState(false);
  const [posList, setPos] = useState([]);
  const [originalItems, setOriginalItems] = useState([]);
  const [items, setItems] = useState([]);
  const [searchValue, setSearchValue] = useState();
  const [currentTab, setCurrentTab] = useState(1);

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
    getOptionList({ status: 1 });
  }, []);

  const getOptionList = ({ status } = {}) => {
    setLoading(true);
    worksheetAjax
      .getCollectionsByAppId({ appId, status })
      .then(({ data = [] }) => {
        setOriginalItems(data);
        setItems(data);
        waterfallList(data);
        searchValue && handleSearch(searchValue, data);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const handleCreateOption = item => {
    const nextList = items.concat(item);
    if (currentTab === 9) {
      setVisible({ createVisible: false });
      return;
    }
    setOriginalItems(nextList);
    setItems(nextList);
    waterfallList(nextList);
    setVisible({ createVisible: false });
  };

  const handleEdit = data => {
    const nextData = { ...items[editIndex], ...data };
    const nextList = update(items, { [editIndex]: { $set: nextData } });
    setOriginalItems(nextList);
    setItems(nextList);
    waterfallList(nextList);
    setIndex({ editIndex: -1 });
  };

  const handleSearch = (value, data = []) => {
    data = !_.isEmpty(data) ? data : originalItems;
    if (!!_.trim(value)) {
      const temp = _.filter(data, v => v.name.indexOf(_.trim(value)) > -1);
      setItems(temp);
      waterfallList(temp);
    } else {
      setItems(data);
      waterfallList(data);
    }
  };

  const renderContent = () => {
    if (loading) return <LoadDiv />;
    if (isEmpty(items)) {
      return (
        <EmptyStatus
          icon="dropdown"
          radiusSize={130}
          iconClassName="Font50"
          emptyTxt={_l('暂无选项集')}
          emptyTxtClassName="Gray_9e Font17 mTop20"
        />
      );
    }

    return items.map((item, index) => (
      <OptionItem
        {...item}
        status={currentTab}
        index={index}
        projectId={projectId}
        appId={appId}
        pos={posList[index]}
        items={items}
        onClick={() => setIndex({ editIndex: index })}
        handleClick={type => {
          if (type === 'edit') {
            setIndex({ editIndex: index });
          }
        }}
        updateList={data => {
          setOriginalItems(data);
          setItems(data);
          waterfallList(data);
        }}
      />
    ));
  };

  return (
    <div className="h100 flexColumn">
      <AppSettingHeader
        title={_l('选项集')}
        showSearch={true}
        addBtnName={_l('新增选项集')}
        description={_l('将需要在不同工作表间共用的选项创建为选项集，维护选项的一致性')}
        handleSearch={value => {
          setSearchValue(value);
          handleSearch(value);
        }}
        handleAdd={() => setVisible({ createVisible: true })}
        link="https://help.mingdao.com/worksheet/option-set"
      />
      <div className="tabWrap mBottom15">
        {[
          { label: _l('启用'), value: 1 },
          { label: _l('停用'), value: 9 },
        ].map(item => (
          <div
            className={cx('tabItem Hand', { active: item.value === currentTab })}
            onClick={() => {
              setCurrentTab(item.value);
              getOptionList({ status: item.value });
            }}
          >
            {item.label}
          </div>
        ))}
      </div>
      <OptionListWrap className={cx('flex', { emptyWrap: isEmpty(items) })} ref={$ref}>
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
      {editIndex > -1 && (
        <EditOptionList
          {...items[editIndex]}
          appId={appId}
          projectId={projectId}
          onOk={handleEdit}
          onCancel={() => setIndex({ editIndex: -1 })}
        />
      )}
    </div>
  );
}
