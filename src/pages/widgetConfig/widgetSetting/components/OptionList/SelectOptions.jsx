import React, { useState, useEffect, useCallback, Fragment } from 'react';
import Components from '../../../components';
import { get, has, head, pick } from 'lodash';
import { Support, Dialog, Dropdown } from 'ming-ui';
import styled from 'styled-components';
import worksheetAjax from 'src/api/worksheet';
import { SettingItem } from '../../../styled';
import SelectOptionList from './SelectOptionList';
import EditOptionList from './EditOptionList';
import Options from './Options';
import update from 'immutability-helper';
import { v4 as uuidv4 } from 'uuid';
import {
  getDefaultOptions,
  getDefaultCheckedOption,
  parseOptionValue,
  getAdvanceSetting,
  handleAdvancedSettingChange,
  getOptions,
} from '../../../util/setting';

const Icon = Components.Icon;

const OPTION_TYPE = [
  {
    value: 1,
    text: _l('自定义'),
  },
  {
    value: 2,
    text: _l('使用选项集'),
  },
];

const OptionsWrap = styled.div`
  .title {
    display: flex;
    align-items: center;
    justify-content: space-between;
    line-height: 36px;
  }
  .optionSetting {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding-top: 12px;
    span {
      margin-left: 6px;
    }
  }
`;

const OptionListItem = styled.div`
  margin-top: 12px;
  padding: 0 12px;
  border: 1px solid #ddd;
  background-color: #fff;
  max-height: 535px;
  overflow: hidden;
  border-radius: 3px;
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

  .operate {
    color: #757575;
    .edit {
      margin-right: 12px;
    }
  }

  ul {
    position: relative;
    max-height: 488px;
    overflow: hidden;
    padding: 8px 0;
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
      bottom: 0;
      width: 100%;
      background-color: #fff;
      color: #757575;
    }
  }
`;

export default function SelectOptions(props) {
  const { data, onChange, globalSheetInfo = {}, fromPortal = false } = props;
  const { type, controlName, controlId, strDefault, enumDefault, enumDefault2, options, dataSource } = data;
  const { appId } = globalSheetInfo;
  const colorful = enumDefault2 === 1;
  const { showtype } = getAdvanceSetting(data);

  // 是新增控件
  const isNewControl = controlId.includes('-');

  const [{ selectVisible, editVisible }, setVisible] = useState({ selectVisible: false, editVisible: false });

  const [optionList, setOptionList] = useState(
    useCallback(() => {
      if (dataSource) {
        return { name: strDefault, options: options, colorful: enumDefault2 === 1, enableScore: enumDefault };
      }
      return { options: [] };
    }, []),
  );

  useEffect(() => {
    if (!dataSource) return;
    worksheetAjax.getCollectionsByCollectIds({ appId, collectionIds: [dataSource] }).then(({ msg, data, code }) => {
      if (code === 1) {
        setOptionList(head(data));
      } else {
        alert(msg);
      }
    });
  }, [dataSource]);

  const genDefaultOptionsAndChecked = () => {
    const defaultOptions = getDefaultOptions();
    return { options: defaultOptions, default: getDefaultCheckedOption(defaultOptions) };
  };

  useEffect(() => {
    if (!options) {
      onChange(genDefaultOptionsAndChecked());
    }
  }, [controlId]);

  const toOptionList = () => {
    Dialog.confirm({
      title: <span className="Bold">{_l('转为选项集')}</span>,
      width: 480,
      description: (
        <span>
          {_l('转为选项集后，可以使选项在其他工作表中共用。此过程不可逆，转换后无法再恢复为自定义选项')}
          <Support href="https://help.mingdao.com/sheet30" type={3} text={_l('帮助')} />
        </span>
      ),
      onOk: () => {
        worksheetAjax
          .saveOptionsCollection({ appId, colorful, options, name: controlName })
          .then(({ code, data, msg }) => {
            if (code === 1) {
              const { collectionId } = data;
              setOptionList(data);
              onChange({ dataSource: collectionId });
            } else {
              alert(msg);
            }
          });
      },
    });
  };

  const handleCopy = () => {
    const copyOptions = options
      .filter(i => !i.isDeleted)
      .map((item, index) => ({
        key: uuidv4(),
        value: item.value,
        checked: false,
        isDeleted: false,
        index: options.length + index + 1,
        color: item.color,
      }));
    const findOther = _.findIndex(options, i => i.key === 'other');
    const newOptions = update(options, {
      $splice: [[findOther > -1 ? findOther : options.length, 0, ...copyOptions]],
    });
    onChange({ options: newOptions.map((item, idx) => ({ ...item, index: idx + 1 })) });
    alert(_l('已复制'));
  };

  return (
    <SettingItem>
      <OptionsWrap>
        <div className="title Bold">{_l('选项')}</div>
        <Dropdown
          border
          disabled={!isNewControl}
          value={dataSource ? 2 : 1}
          data={OPTION_TYPE}
          onChange={value => {
            if (value === 2) {
              setVisible({ selectVisible: true });
            }
            if (value === 1) {
              onChange({
                // 非选项集清空动态默认值
                ...handleAdvancedSettingChange(data, { defsource: '' }),
                dataSource: '',
                ...genDefaultOptionsAndChecked(),
              });
            }
          }}
        />
        {!dataSource && (
          <div className="optionSetting">
            <div className="setColor flexCenter">
              <i
                style={{ color: colorful ? '#43bd36' : '#bdbdbd' }}
                className={`Font24 pointer icon-${colorful ? 'toggle_on' : 'toggle_off'}`}
                onClick={e => {
                  e.stopPropagation();
                  let newData = { enumDefault2: +!enumDefault2 };
                  if (_.find(options, i => !i.color)) {
                    newData.options = options.map(i => ({ ...i, color: i.color || '#2196f3' }));
                  }
                  onChange(newData);
                }}
              ></i>
              <span>{_l('彩色')}</span>
            </div>
            <div className="flexCenter">
              <div className="flexCenter hoverText" onClick={handleCopy}>
                <Icon icon="content-copy" className="Font13" />
                <span>{_l('复制')}</span>
              </div>
              {!dataSource && showtype !== '2' && (
                <div className="toOptionList flexCenter mLeft10 hoverText" onClick={toOptionList}>
                  <Icon icon="swap_horiz" />
                  <span>{_l('转为选项集')}</span>
                </div>
              )}
            </div>
          </div>
        )}
        {dataSource ? (
          <Fragment>
            <OptionListItem>
              <div className="title Bold">
                <div className="name">
                  {(optionList || {}).name}
                  {` ( ${(getOptions(optionList) || []).length} )`}
                </div>
                <div className="operate flexCenter">
                  <div className="edit pointer hoverText" onClick={() => setVisible({ editVisible: true })}>
                    {_l('编辑')}
                  </div>
                  {isNewControl && (
                    <div className="reSelect pointer hoverText" onClick={() => setVisible({ selectVisible: true })}>
                      {_l('重新选择')}
                    </div>
                  )}
                </div>
              </div>
              <ul>
                {optionList.options
                  .filter(item => !item.isDeleted)
                  .map(({ color, value }) => (
                    <li>
                      {optionList.colorful && <div className="colorWrap" style={{ backgroundColor: color }}></div>}
                      <div className="name">{value}</div>
                    </li>
                  ))}
                {optionList.options.length > 15 && <li className="more">...</li>}
              </ul>
            </OptionListItem>
          </Fragment>
        ) : (
          <Options
            mode={data.controlId.includes('-') ? 'edit' : 'add'}
            data={data}
            options={data.options}
            colorful={colorful}
            enableScore={enumDefault === 1}
            isMulti={type === 10}
            fromPortal={fromPortal}
            onChange={obj => {
              if (has(obj, 'enableScore')) {
                const { enableScore, ...rest } = obj;
                onChange({ ...rest, enumDefault: +enableScore });
              } else {
                onChange(obj);
              }
            }}
          />
        )}
      </OptionsWrap>
      {selectVisible && (
        <SelectOptionList
          {...props}
          onOk={({ listId, listItem }) => {
            onChange({ dataSource: listId, default: '', options: listItem.options, enumDefault2: +listItem.colorful });
            setOptionList(listItem);
            setVisible({ selectVisible: false });
          }}
          onCancel={() => setVisible({ selectVisible: false })}
        />
      )}
      {editVisible && (
        <EditOptionList
          {...optionList}
          globalSheetInfo={globalSheetInfo}
          onOk={data => {
            setOptionList({ ...optionList, ...data });
            setVisible({ editVisible: false });
            onChange({ ...data });
          }}
          onCancel={() => setVisible({ editVisible: false })}
        />
      )}
    </SettingItem>
  );
}
