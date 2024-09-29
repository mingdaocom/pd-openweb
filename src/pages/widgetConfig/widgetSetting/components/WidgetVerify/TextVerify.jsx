import React, { useState, Fragment, useEffect } from 'react';
import { Dialog, Checkbox, Support, Icon, SortableList } from 'ming-ui';
import cx from 'classnames';
import styled from 'styled-components';
import { Input } from 'antd';
import { SettingItem } from '../../../styled';
import 'src/pages/widgetConfig/styled/style.less';
import { getAdvanceSetting, getSortItems } from '../../../util';
import { handleAdvancedSettingChange } from '../../../util/setting';
import renderCustomFilter from '../CustomEvent/CustomFilter';
import { FilterItemTexts } from '../FilterData';
import _ from 'lodash';

const FORMAT_CONFIG = [
  { text: _l('字母'), value: 'char', regExp: '^[A-Za-z]*$' },
  { text: _l('字母数字'), value: 'charNumber', regExp: '^[A-Za-z0-9]*$' },
  { text: _l('数字'), value: 'number', regExp: '^\\d*$' },
  { text: _l('大写字母'), value: 'capital', regExp: '^[A-Z]*$' },
  { text: _l('小写字母'), value: 'lowercase', regExp: '^[a-z]*$' },
  { text: _l('6个字母'), value: 'sixChar', regExp: '^\\w{6}$' },
  { text: _l('6位数字'), value: 'sixNumber', regExp: '^\\d{6}$' },
  { text: _l('邮政编码'), value: 'post', regExp: '^\\d{4,6}$' },
  {
    text: _l('IP地址'),
    value: 'ip',
    regExp: '^((2(5[0-5]|[0-4]\\d))|[0-1]?\\d{1,2})(.((2(5[0-5]|[0-4]\\d))|[0-1]?\\d{1,2})){3}$',
  },
  {
    text: _l('链接'),
    value: 'link',
    regExp: '^https?:\\/\\/\\w+\\.\\w+\\.\\w+.*$',
  },
];

const ConfigWrap = styled.div`
  display: flex;
  .formatList {
    width: 250px;
    padding-top: 16px;
    border-right: 1px solid rgba(0, 0, 0, 0.08);
    .title {
      margin-bottom: 6px;
    }
    li {
      line-height: 28px;
      cursor: pointer;
      transition: color 0.25s;
      &:hover {
        color: #2196f3;
      }
    }
  }
  .display {
    flex: 1;
    padding: 16px 0 0 24px;

    .hint {
      margin-top: 12px;
      i {
        margin-left: 4px;
        font-size: 14px;
      }
    }
    .invalid {
      color: #f44336;
    }
    .isInvalid,
    .invalidInput {
      border-color: #f44336;
      &:focus {
        box-shadow: 0 0 0 2px rgba(244, 67, 54, 0.5);
      }
    }
  }
`;

const FormatInfo = styled.div`
  width: 100%;
  height: auto;
  margin-top: 10px;
  border-radius: 3px;
  cursor: pointer;
  border: 1px solid #e0e0e0;
  z-index: 9;

  .formatHeader {
    height: 36px;
    display: flex;
    align-items: center;
    padding: 0 10px;
    i {
      font-size: 16px;
      color: #9e9e9e;
      margin-right: 10px;
      &:hover {
        color: #2196f3;
      }
    }
    .deleteBtn:hover {
      color: #f44336;
    }
    .filterIcon.active {
      color: #2196f3;
    }
  }
  .textVerifyFilterValue {
    padding: 0 10px 10px 10px;
    & > div {
      border: none;
      margin: 0;
      background: #f8f8f8;
      &:hover {
        background: rgba(33, 150, 243, 0.05);
      }
      .editFilter {
        display: none;
      }
    }
  }
`;

const AddVerify = styled.div`
  height: 21px;
  color: #9e9e9e;
  &:hover {
    color: #2196f3;
  }
  &.disable i {
    cursor: not-allowed;
    color: #bdbdbd;
  }
`;

function SortableItem(props) {
  const { itemData = {}, sortIndex, setIndex, onDelete, changeFilters, fromPortal } = props;
  const filters = itemData.filters || [];
  const name = itemData.name || _l('未命名');
  const isFilterActive = filters.length > 0;

  const editFilterFn = () => {
    renderCustomFilter({
      ...props,
      customTitle: _l('筛选条件'),
      filterData: { valueType: '1', filterItems: filters },
      handleOk: value => {
        changeFilters(_.get(value, 'filterItems') || '', sortIndex);
      },
    });
  };

  return (
    <FormatInfo className="noSelect">
      <div className="formatHeader">
        <Icon className="Hand" icon="drag" />
        <div
          className="flex flexRow flexCenter"
          title={name}
          onClick={e => {
            e.stopPropagation();
            setIndex(sortIndex);
          }}
        >
          <span className="flex overflow_ellipsis mRight10">{name}</span>
          <Icon icon="edit" />
        </div>

        <Icon
          icon="worksheet_filter"
          className={cx('filterIcon', { active: isFilterActive, Hidden: fromPortal })}
          onClick={e => {
            e.stopPropagation();
            if (isFilterActive) {
              changeFilters([], sortIndex);
            } else {
              editFilterFn();
            }
          }}
        />
        <Icon
          className="mRight0 deleteBtn"
          icon="delete1"
          onClick={e => {
            e.stopPropagation();
            onDelete(sortIndex);
          }}
        />
      </div>
      {isFilterActive && (
        <div className="textVerifyFilterValue">
          <FilterItemTexts
            {...props}
            filters={filters}
            loading={false}
            controls={props.allControls}
            editFn={e => {
              e.stopPropagation();
              editFilterFn();
            }}
          />
        </div>
      )}
    </FormatInfo>
  );
}

export default function TextVerify(props) {
  const { data, onChange } = props;
  const filterRegex = getAdvanceSetting(data, 'filterregex') || [];
  const [itemData, setData] = useState({});
  const [activeIndex, setIndex] = useState(-1);
  const [testValue, setTestValue] = useState('');

  useEffect(() => {
    if (activeIndex >= 0) {
      setData(filterRegex[activeIndex] || {});
    } else {
      setData({});
    }
    setTestValue('');
  }, [activeIndex]);

  let reg;
  try {
    reg = new RegExp(itemData.value);
  } catch (error) {
    console.log(error);
  }

  const isInvalid = reg && !reg.test(testValue);

  const renderItems = () => {
    if (!filterRegex.length) return null;

    return (
      <div className="flexColumn">
        <SortableList
          items={getSortItems(filterRegex, true)}
          itemKey="key"
          helperClass="filterRegexSortableList"
          onSortEnd={newItems => {
            onChange(handleAdvancedSettingChange(data, { filterregex: JSON.stringify(getSortItems(newItems, false)) }));
          }}
          renderItem={({ item, index }) => (
            <SortableItem
              {..._.pick(props, ['globalSheetInfo', 'allControls', 'fromPortal'])}
              setIndex={setIndex}
              itemData={item}
              sortIndex={index}
              changeFilters={(value, sortIdx) => {
                const newList = filterRegex.map((i, idx) => {
                  return sortIdx === idx ? { ...i, filters: value } : i;
                });
                onChange(
                  handleAdvancedSettingChange(data, { filterregex: JSON.stringify(getSortItems(newList, false)) }),
                );
              }}
              onDelete={sortIdx => {
                const newList = filterRegex.filter((i, idx) => sortIdx !== idx);
                onChange(
                  handleAdvancedSettingChange(data, { filterregex: JSON.stringify(getSortItems(newList, false)) }),
                );
              }}
            />
          )}
        />
      </div>
    );
  };

  return (
    <Fragment>
      <Dialog
        width={720}
        className="textRegexpVerifyDialog"
        visible={activeIndex >= 0}
        okDisabled={!itemData.value || !itemData.name}
        onOk={() => {
          const newItem = {
            ..._.pick(itemData, ['name', 'value', 'filters']),
            err: itemData.err || _l('请输入有效文本'),
          };
          const newList = filterRegex[activeIndex]
            ? filterRegex.map((i, idx) => (idx === activeIndex ? newItem : i))
            : filterRegex.concat(newItem);

          onChange(
            handleAdvancedSettingChange(data, {
              filterregex: JSON.stringify(newList),
            }),
          );
          setIndex(-1);
        }}
        onCancel={() => {
          setIndex(-1);
        }}
        title={<span className="bold">{_l('限定输入格式')}</span>}
      >
        <ConfigWrap>
          <div className="formatList">
            <div className="title Gray_75">
              {_l('选择下方常用表达式或自定义输入')}
              <Support href="https://help.mingdao.com/worksheet/regular-expression" type={3} text={_l('帮助')} />
            </div>
            <ul className="list">
              {FORMAT_CONFIG.map(item => (
                <li
                  onClick={() =>
                    setData({ ...itemData, name: item.text, err: _l('请输入%0', item.text), value: item.regExp })
                  }
                >
                  {item.text}
                </li>
              ))}
            </ul>
          </div>
          <div className="display">
            <SettingItem style={{ margin: '0' }}>
              <div className="settingItemTitle">{_l('标题')}</div>
              <Input
                placeholder={_l('请输入标题名称')}
                value={itemData.name}
                onChange={e => setData({ ...itemData, name: e.target.value })}
              />
            </SettingItem>
            <SettingItem>
              <div className="settingItemTitle">{_l('正则表达式')}</div>
              <Input.TextArea
                className={cx({ isInvalid: !reg })}
                value={itemData.value}
                onChange={e => {
                  setData({ ...itemData, value: e.target.value, err: _l('请输入有效文本') });
                }}
              />
            </SettingItem>
            <SettingItem>
              <div className="settingItemTitle">{_l('错误时提示')}</div>
              <Input
                placeholder={_l('请输入有效文本')}
                value={itemData.err}
                onChange={e => setData({ ...itemData, err: e.target.value })}
              />
            </SettingItem>
            <SettingItem>
              <div className="settingItemTitle">{_l('测试')}</div>
              <Input
                className={cx({ invalidInput: testValue && isInvalid })}
                placeholder={_l('测试')}
                value={testValue}
                onChange={e => setTestValue(e.target.value)}
              />
              {testValue &&
                (isInvalid ? (
                  <div className="hint invalid breakAll">
                    {itemData.err}
                    <i className="icon-cancel"></i>
                  </div>
                ) : (
                  <div className="hint">
                    {_l('测试通过')}
                    <i className="icon-check_circle" style={{ color: '#00c345' }}></i>
                  </div>
                ))}
            </SettingItem>
          </div>
        </ConfigWrap>
      </Dialog>
      <div className="labelWrap flexCenter" style={{ justifyContent: 'space-between' }}>
        <Checkbox
          size="small"
          checked={!!filterRegex.length}
          onClick={checked => {
            if (checked) {
              onChange(handleAdvancedSettingChange(data, { filterregex: '' }));
              setTestValue('');
              setData({});
              return;
            }
            setIndex(0);
          }}
          text={data.type === 14 ? _l('验证文件名') : _l('限定输入格式')}
        />

        {filterRegex.length > 0 && (
          <AddVerify className={filterRegex.length >= 5 ? 'disable' : ''}>
            <Icon
              icon="add"
              className="Font20 Hand"
              onClick={() => {
                if (filterRegex.length >= 5) return;
                setIndex(filterRegex.length);
              }}
            />
          </AddVerify>
        )}
      </div>

      {filterRegex.length > 0 && renderItems()}
    </Fragment>
  );
}
