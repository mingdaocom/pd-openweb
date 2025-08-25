import React, { Fragment, useCallback, useEffect, useState } from 'react';
import ClipboardButton from 'react-clipboard.js';
import { Tooltip } from 'antd';
import cx from 'classnames';
import { has } from 'lodash';
import _ from 'lodash';
import Trigger from 'rc-trigger';
import styled from 'styled-components';
import { Dialog, Dropdown, Menu, MenuItem, Support } from 'ming-ui';
import worksheetAjax from 'src/api/worksheet';
import SelectOtherWorksheetDialog from 'src/pages/worksheet/components/SelectWorksheet/SelectOtherWorksheetDialog';
import { canEditApp } from 'src/pages/worksheet/redux/actions/util.js';
import AutoIcon from '../../../components/Icon';
import { SettingItem } from '../../../styled';
import {
  getAdvanceSetting,
  getDefaultCheckedOption,
  getDefaultOptions,
  getOptions,
  handleAdvancedSettingChange,
} from '../../../util/setting';
import DeleteDialog from './DelateDialog';
import EditOptionList from './EditOptionList';
import Options from './Options';
import SelectOptionList from './SelectOptionList';

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

const MenuWrap = styled(Menu)`
  width: 160px !important;
  position: relative !important;
  &.List--withIconFront {
    .Item-content {
      padding-left: 16px !important;
      &:hover {
        i {
          color: #fff;
        }
      }
      i {
        font-size: 16px;
        margin-right: 5px;
      }
    }
  }
`;

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
    .setColor {
      span {
        margin-left: 6px;
      }
    }
    .setOption {
      display: flex;
      align-items: center;
      color: #9e9e9e;
      span:hover,
      i:hover {
        color: #1677ff;
      }
    }
  }
`;

const OptionListItem = styled.div`
  margin-top: 12px;
  padding: 0 12px;
  border: 1px solid #ddd;
  background-color: #fff;
  border-radius: 3px;
  .title {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    border-bottom: 1px solid #ddd;
    line-height: 24px;
    padding: 10px 0;
    .delete {
      margin-left: 8px;
    }
  }

  .operate {
    i {
      cursor: pointer;
      color: #9e9e9e;
      font-size: 16px;
      &:hover {
        color: #1677ff;
      }
    }
  }

  ul {
    position: relative;
    ${props => (props.isMore ? 'max-height: 289px;overflow: hidden;' : '')}
    padding: 8px 0;
  }
  li {
    display: flex;
    align-items: center;
    justify-content: space-between;
    line-height: 30px;
    .colorWrap {
      width: 16px;
      height: 16px;
      border-radius: 50%;
      margin-right: 6px;
    }
    i {
      &:hover {
        color: #1677ff !important;
      }
    }
    .hideIcon {
      visibility: hidden;
      &.showIcon {
        visibility: visible;
      }
    }
    &:hover {
      .hideIcon {
        visibility: visible;
      }
    }
    &.more {
      position: absolute;
      bottom: 0;
      width: 100%;
      background-color: #fff;
      color: #1677ff;
      cursor: pointer;
      font-weight: 600;
      &:hover {
        color: rgba(33, 150, 243, 0.8);
      }
    }
  }
`;

export default function SelectOptions(props) {
  const { data, onChange, globalSheetInfo = {}, fromPortal = false } = props;
  const { type, controlName, controlId, strDefault, enumDefault, enumDefault2, options, dataSource } = data;
  const { appId, projectId } = globalSheetInfo;
  const { showtype } = getAdvanceSetting(data);
  const colorful = enumDefault2 === 1;
  // 是新增控件
  const isNewControl = controlId.includes('-');

  const [{ selectVisible, editVisible, optionVisible, recoverVisible, deleteVisible }, setVisible] = useState({
    selectVisible: false,
    editVisible: false,
    optionVisible: false,
    recoverVisible: false,
    deleteVisible: false,
  });

  const [optionList, setOptionList] = useState(
    useCallback(() => {
      if (dataSource) {
        return { name: strDefault, options: options, colorful: enumDefault2 === 1, enableScore: enumDefault };
      }
      return { options: [] };
    }, []),
  );

  const [isMore, setMore] = useState(getOptions(data).length > 9);
  const [deleteStatus, setStatus] = useState(false);

  const getOptionDetail = () => {
    worksheetAjax.getCollectionByCollectId({ collectionId: dataSource }).then(({ msg, data, code }) => {
      if (code === 1) {
        setMore(getOptions(data).length > 9);
        setOptionList(data);
        setStatus(!data.appName);
      } else {
        alert(msg);
      }
    });
  };

  useEffect(() => {
    if (!dataSource) return;
    getOptionDetail();
  }, [controlId, dataSource]);

  const genDefaultOptionsAndChecked = () => {
    const defaultOptions = getDefaultOptions();
    return { options: defaultOptions, default: getDefaultCheckedOption(defaultOptions) };
  };

  // 合并hide
  const formatData = (tempData = []) => {
    return tempData.map(i => ({
      ...i,
      hide: _.get(
        _.find(options, o => o.key === i.key),
        'hide',
      ),
    }));
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
          {_l('转为选项集后，在其他工作表也可以使用这组选项。')}
          <Support href="https://help.mingdao.com/worksheet/option-set" type={3} text={_l('帮助')} />
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

  // 转自定义
  const handleToCustom = () => {
    const newData = { dataSource: '', options: options.map(i => ({ ...i, hide: false })) };
    if (isNewControl) {
      onChange(newData);
      return;
    }
    Dialog.confirm({
      title: <span className="Bold">{_l('转为自定义选项')}</span>,
      width: 480,
      description: (
        <span>
          {_l('转换后将解除与原选项集的引用关系，并基于原选项集创建一组自定义选项，所有历史数据也将转为自定义选项。')}
          <span className="Red">{_l('该操作不可逆，请谨慎。')}</span>
        </span>
      ),
      onOk: () => {
        onChange(newData);
      },
    });
  };

  const getCopyValue = () => {
    const copyOptions = options.filter(i => !i.isDeleted);
    return copyOptions.reduce((p, c, i) => (i === options.length - 1 ? `${p}${c.value}` : `${p}${c.value}\n`), '');
  };

  // 已删除控件
  const deleteOptions = options.filter(i => i.isDeleted);

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
                className={`Font24 pointer icon-${colorful ? 'ic_toggle_on' : 'ic_toggle_off'}`}
                onClick={e => {
                  e.stopPropagation();
                  let newData = { enumDefault2: +!enumDefault2 };
                  if (_.find(options, i => !i.color)) {
                    newData.options = options.map(i => ({ ...i, color: i.color || '#1677ff' }));
                  }
                  onChange(newData);
                }}
              ></i>
              <span>{_l('彩色')}</span>
            </div>
            <div className="setOption">
              <ClipboardButton
                component="span"
                data-clipboard-text={getCopyValue()}
                onSuccess={() => alert(_l('复制成功，请去批量添加选项'))}
                data-tip={_l('复制')}
              >
                <AutoIcon icon="content-copy" className="mRight15" />
              </ClipboardButton>
              {!dataSource && showtype !== '2' && (
                <Fragment>
                  <Tooltip title={_l('转为选项集')} placement="bottom">
                    <AutoIcon icon="swap_horiz" onClick={toOptionList} />
                  </Tooltip>
                  {deleteOptions.length > 0 && (
                    <Tooltip title={_l('恢复选项')} placement="bottom">
                      <span className="mLeft15 flexCenter pointer" onClick={() => setVisible({ deleteVisible: true })}>
                        <AutoIcon icon="trash-loop" className="Font20" />
                      </span>
                    </Tooltip>
                  )}
                </Fragment>
              )}
            </div>
          </div>
        )}
        {dataSource ? (
          <Fragment>
            <OptionListItem isMore={isMore}>
              <div className="title Bold">
                <div className="name flexColumn breakAll">
                  <span>
                    {(optionList || {}).name}
                    {` ( ${(getOptions(optionList) || []).length} )`}
                  </span>
                  {!deleteStatus ? (
                    <span className="Gray_75">{optionList.appName}</span>
                  ) : (
                    <span className="Gray_bd">{_l('无所属应用')}</span>
                  )}
                </div>
                <div className="operate flexCenter">
                  {canEditApp(optionList.permissionType) && (
                    <Tooltip title={_l('编辑')} placement="bottom">
                      <AutoIcon icon="edit" onClick={() => setVisible({ editVisible: true })} />
                    </Tooltip>
                  )}
                  <Trigger
                    action={['click']}
                    popupAlign={{
                      points: ['tr', 'br'],
                      offset: [5, 5],
                      overflow: { adjustX: true, adjustY: true },
                    }}
                    popupVisible={optionVisible}
                    onPopupVisibleChange={visible => setVisible({ optionVisible: visible })}
                    popup={
                      <MenuWrap>
                        {isNewControl && (
                          <MenuItem
                            key="newSelect"
                            icon={<AutoIcon icon="refresh1" />}
                            onClick={e => {
                              e.stopPropagation();
                              setVisible({ selectVisible: true, optionVisible: false });
                            }}
                          >
                            {_l('重新选择')}
                          </MenuItem>
                        )}
                        {deleteStatus && !isNewControl && (
                          <MenuItem
                            key="recover"
                            icon={<AutoIcon icon="repeal-o" />}
                            onClick={e => {
                              e.stopPropagation();
                              setVisible({ recoverVisible: true, optionVisible: false });
                            }}
                          >
                            {_l('恢复')}
                          </MenuItem>
                        )}
                        <MenuItem
                          key="custom"
                          icon={<AutoIcon icon="swap_horiz" />}
                          onClick={e => {
                            e.stopPropagation();
                            setVisible({ optionVisible: false });
                            handleToCustom();
                          }}
                        >
                          {_l('转为自定义')}
                        </MenuItem>
                      </MenuWrap>
                    }
                  >
                    <AutoIcon icon="more_horiz" className="mLeft15" />
                  </Trigger>
                </div>
              </div>
              <ul>
                {optionList.options
                  .filter(item => !item.isDeleted)
                  .map(({ color, value, score, key }) => {
                    // 从options里取值，选项集不变
                    const hide = _.get(
                      _.find(options, i => i.key === key),
                      'hide',
                    );
                    return (
                      <li>
                        <div className="flexCenter flex overflow_ellipsis">
                          {optionList.colorful && <div className="colorWrap" style={{ backgroundColor: color }}></div>}
                          <div className="name flex overflow_ellipsis">{value}</div>
                        </div>
                        <div className="flexCenter">
                          {fromPortal ? null : (
                            <Tooltip title={hide ? _l('隐藏不影响已选选项') : _l('显示')} placement="bottom">
                              <AutoIcon
                                className={cx('hideIcon', { showIcon: hide })}
                                icon={hide ? 'workflow_hide ' : 'visibility'}
                                onClick={() => {
                                  const newOptions = options.map(i => {
                                    return i.key === key ? { ...i, hide: !hide } : i;
                                  });
                                  onChange({ options: newOptions });
                                }}
                              />
                            </Tooltip>
                          )}
                          {optionList.enableScore ? <span className="Gray_75 mLeft15">{score || 0}</span> : null}
                        </div>
                      </li>
                    );
                  })}
                {isMore && (
                  <li className="more" onClick={() => setMore(false)}>
                    {_l('更多')}
                  </li>
                )}
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
            onChange({
              dataSource: listId,
              default: '',
              options: listItem.options,
              enumDefault2: +listItem.colorful,
              controlName: listItem.name || data.controlName,
            });
            setOptionList({ ...optionList, ...listItem });
            setVisible({ selectVisible: false });
          }}
          onCancel={() => setVisible({ selectVisible: false })}
        />
      )}
      {editVisible && (
        <EditOptionList
          originOptions={options}
          {...optionList}
          globalSheetInfo={globalSheetInfo}
          onOk={data => {
            setOptionList({ ...optionList, ...data });
            setVisible({ editVisible: false });
            onChange({ enumDefault2: data.colorful ? 1 : 0, options: formatData(data.options) });
          }}
          onCancel={() => setVisible({ editVisible: false })}
        />
      )}
      {recoverVisible && (
        <SelectOtherWorksheetDialog
          visible={recoverVisible}
          disabled={true}
          title={_l('恢复至本应用')}
          description={
            <span className="Gray_75">
              {_l('将选项集恢复到当前应用下。恢复后，应用管理员和开发者可以管理、引用选项集。')}
            </span>
          }
          onlyApp
          hideAppLabel
          projectId={projectId}
          selectedAppId={appId}
          onHide={() => setVisible({ recoverVisible: false })}
          onOk={() => {
            worksheetAjax.updateOptionsCollectionAppId({ appId, collectionId: optionList.collectionId }).then(res => {
              if (res) {
                setStatus(false);
                getOptionDetail();
                alert('恢复成功');
              }
            });
          }}
        />
      )}
      {deleteVisible && (
        <DeleteDialog
          options={options}
          colorful={colorful}
          onCancel={() => setVisible({ deleteVisible: false })}
          onOk={newOptions => {
            onChange({ options: newOptions });
          }}
        />
      )}
    </SettingItem>
  );
}
