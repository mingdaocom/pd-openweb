import React, { useEffect, useState } from 'react';
import { Switch, Tooltip, SvgIcon, Icon, Radio as MDRadio, Button } from 'ming-ui';
import { Checkbox, List, Radio, Modal } from 'antd';
import lookPng from 'src/pages/Role/component/RoleSet/TooltipSetting/img/look.png';
import editPng from 'src/pages/Role/component/RoleSet/TooltipSetting/img/edit.png';
import delPng from 'src/pages/Role/component/RoleSet/TooltipSetting/img/del.png';
import { useSetState } from 'react-use';
import { sheetActionList, recordActionList } from 'src/pages/Role/config.js';
import cx from 'classnames';
import { Wrap } from './style';

const dataPermissionOptions = [
  { label: _l('全部'), value: 'all' },
  { label: _l('用户加入的'), value: 'user' },
];

const operationPermissionOptions = [
  { label: _l('全部'), value: 'all' },
  { label: _l('用户拥有的'), value: 'user' },
];

const optionsList = [
  { label: _l('修改'), value: 'modify' },
  { label: _l('清空'), value: 'clear' },
];

export default function (props) {
  const { onClose, show, sheets, isForPortal, onOk } = props;
  const recordActionLists = recordActionList.filter(o =>
    isForPortal ? !['recordShare', 'recordLogging'].includes(o.key) : true,
  );
  const sheetActionLists = sheetActionList.filter(o =>
    isForPortal ? !['worksheetShareView', 'worksheetLogging', 'worksheetDiscuss'].includes(o.key) : true,
  );
  const [checkedWorksheets, setCheckedWorksheets] = useState([]);
  const getActions = () => {
    let data = {};
    recordActionLists.map(o => {
      data[o.key] = { enable: false };
    });
    sheetActionLists.map(o => {
      data[o.key] = { enable: false };
    });
    return data;
  };
  const [{ sheet, worksheet, record }, setState] = useSetState({
    sheet: getActions(),
    worksheet: '',
    record: '',
  });

  const worksheets = () => {
    const handleCheckboxChange = (e, sheetId) => {
      const { checked } = e.target;
      if (checked) {
        setCheckedWorksheets([...checkedWorksheets, sheetId]);
      } else {
        setCheckedWorksheets(checkedWorksheets.filter(item => item !== sheetId));
      }
    };
    const isAllSelected = checkedWorksheets.length === sheets.length;
    const isIndeterminate = checkedWorksheets.length > 0 && !isAllSelected;
    return (
      <div className="flex flexColumn mLeft20 h100">
        <h3 className="mTop15 Gray_9e Font14">{_l('请选择工作表')}</h3>
        <Checkbox
          checked={isAllSelected}
          indeterminate={isIndeterminate}
          onChange={e => {
            if (e.target.checked) {
              setCheckedWorksheets(sheets.map(item => item.sheetId));
            } else {
              setCheckedWorksheets([]);
            }
          }}
        >
          {_l('全选')}
        </Checkbox>
        <List
          className="flex w100"
          dataSource={sheets.map(o => {
            return {
              key: o.sheetId,
              label: (
                <Checkbox
                  checked={checkedWorksheets.includes(o.sheetId)}
                  onChange={e => handleCheckboxChange(e, o.sheetId)}
                  className="w100"
                >
                  <span className="flexRow alignItemsCenter w100">
                    <SvgIcon url={o.iconUrl} className="flex-shrink-0 minWidth0" fill={'#757575'} size={18} />
                    <span
                      className="mLeft5 flex overflow_ellipsis WordBreak flex-shrink-0 minWidth0"
                      title={o.sheetName || _l('未命名')}
                    >
                      {o.sheetName || _l('未命名')}
                    </span>
                  </span>
                </Checkbox>
              ),
            };
          })}
          renderItem={item => (
            <List.Item>
              <span className="flexRow w100"> {item.label}</span>
            </List.Item>
          )}
        />
      </div>
    );
  };

  const changeSheetOptionInfo = payload => {
    setState({
      sheet: { ...sheet, ...payload },
    });
  };

  const renderHasSet = () => {
    return (
      <span className="mLeft5 hasSet">
        <Icon type="ok" />
        <span className="mLeft3">{_l('已设置')}</span>
      </span>
    );
  };

  const renderList = actionList => {
    return (
      <React.Fragment>
        <div className="mTop20">
          {actionList.length > 0 &&
            actionList.map((o, i) => {
              return (
                <div className="subCheckbox InlineFlex mRight8 flexRow alignItemsCenter">
                  <Checkbox
                    checked={(sheet[o.key] || {}).enable}
                    onChange={e => {
                      changeSheetOptionInfo({
                        [o.key]: { enable: !(sheet[o.key] || {}).enable },
                      });
                    }}
                  >
                    {o.txt}
                  </Checkbox>
                  {o.tips && (
                    <Tooltip text={<span>{o.tips} </span>} popupPlacement="top">
                      <i className="icon-info_outline Font16 Gray_bd mLeft3 TxtMiddle" />
                    </Tooltip>
                  )}
                </div>
              );
            })}
        </div>
      </React.Fragment>
    );
  };

  const otherSet = type => {
    return (
      <React.Fragment>
        <p className="mBottom0 mTop24 Gray_75">{_l('其他')}</p>
        <div className={'tipItem flexRow alignItemsCenter mTop20'}>
          <Switch
            size="small"
            className="InlineBlock "
            checked={sheet[`${type}Level`] === 30}
            onClick={() => {
              setState({
                sheet: { ...sheet, [`${type}Level`]: sheet[`${type}Level`] === 30 ? 20 : 30 },
              });
            }}
          />
          <span className="mLeft10">
            {type === 'read' ? _l('额外包含下属加入的记录') : _l('额外包含下属拥有的记录')}
          </span>
          {type !== 'read' && (
            <Tooltip text={<span>{_l('在组织管理【汇报关系】中管理用户的下属')}</span>} popupPlacement="top">
              <i className="icon-info_outline Font16 mLeft6 Gray_bd" />
            </Tooltip>
          )}
        </div>
      </React.Fragment>
    );
  };

  const renderCon = type => {
    const value = [20, 30].includes(sheet[`${type}Level`])
      ? 'user'
      : [100].includes(sheet[`${type}Level`])
        ? 'all'
        : '';
    return (
      <React.Fragment>
        <p className={cx('flexRow alignItemsCenter Bold LineHeight26', { mTop30: type !== 'read' })}>
          <img
            src={type === 'read' ? lookPng : type === 'edit' ? editPng : delPng}
            className="mRight5 TxtMiddle"
            height={26}
          />
          {type === 'read' ? _l('可查看哪些记录？') : type === 'edit' ? _l('可修改哪些记录？') : _l('可删除哪些记录？')}
          {!!sheet[`${type}Level`] && renderHasSet()}
        </p>
        <div className="radioCon">
          <div className="conRadioGroup">
            <div className="flexRow alignItemsCenter">
              {(type === 'read' ? dataPermissionOptions : operationPermissionOptions).map(option => (
                <MDRadio
                  className="InlineFlex cascaderRadio Gray"
                  text={option.label}
                  checked={option.value === value}
                  onClick={e => {
                    if (option.value === value) {
                      setState({
                        sheet: {
                          ...sheet,
                          [`${type}Level`]: 0,
                        },
                      });
                      return;
                    }
                    setState({
                      sheet: {
                        ...sheet,
                        [`${type}Level`]: option.value === 'user' ? 20 : option.value === 'all' ? 100 : 0,
                      },
                    });
                  }}
                />
              ))}
            </div>
            {[20, 30].includes(sheet[`${type}Level`]) && !isForPortal && otherSet(type)}
          </div>
        </div>
      </React.Fragment>
    );
  };

  const hasSet = (actionList, value) => {
    if (value === 'clear') return true;
    let isSet = false;
    actionList.map((o, i) => {
      if ((sheet[o.key] || {}).enable) {
        isSet = true;
      }
    });
    return isSet;
  };

  const renderPermissionSection = type => {
    const list = type === 'worksheet' ? sheetActionLists : recordActionLists;
    const key = type === 'worksheet' ? worksheet : record;

    return (
      <React.Fragment>
        <p className="mTop16 Bold">
          {type === 'worksheet' ? _l('工作表') : _l('记录')}
          {hasSet(list, key) && renderHasSet()}
        </p>
        <div className="radioCon">
          <div className="conRadioGroup conRadioGroupForBtn">
            <Radio.Group
              block
              buttonStyle="solid"
              optionType="button"
              value={key || 'modify'}
              onChange={e => {
                let info = sheet;
                if (e.target.value === 'clear') {
                  list.map(o => {
                    info[o.key] = { enable: false };
                  });
                }
                setState({ [type]: e.target.value, sheet: info });
              }}
            >
              {optionsList.map(option => (
                <Radio.Button key={option.value} block value={option.value} optionType="button">
                  {option.label}
                </Radio.Button>
              ))}
            </Radio.Group>
            {key !== 'clear' && renderList(list)}
          </div>
        </div>
      </React.Fragment>
    );
  };

  return (
    <Modal
      className="roleBatchSetDialog"
      visible={show}
      onCancel={onClose}
      title={_l('批量设置数据操作权限')}
      footer={null}
      width={1000}
      bodyStyle={{ overflow: 'hidden', height: '720px', padding: 0 }} // 设置弹层主体高度
    >
      <Wrap className="flexRow h100">
        <div className="sideNav flexColumn h100">{worksheets()}</div>
        <div className="flex h100 flexColumn">
          <div className="flex con">
            <h3 className="Gray_9e Font14">{_l('未设置的权限项，将不会修改')}</h3>
            <h4 className="Font16 Gray Bold mTop8">{_l('数据权限')}</h4>
            {renderCon('read')}
            {renderCon('edit')}
            {renderCon('remove')}
            <h4 className="Font16 Gray Bold mTop50">{_l('操作权限')}</h4>
            {renderPermissionSection('worksheet')}
            {renderPermissionSection('record')}
          </div>
          <div className="footer pAll10 flexRow justifyContentRight pRight20">
            <Button
              key="submit"
              type="primary"
              onClick={() => {
                const hasSetSheet = hasSet(sheetActionLists, worksheet);
                const hasSetRecord = hasSet(recordActionLists, record);
                if (
                  !hasSetSheet &&
                  !hasSetRecord &&
                  (sheet.lookLevel === 0 || !sheet.lookLevel) &&
                  (sheet.editLevel === 0 || !sheet.editLevel) &&
                  (sheet.removeLevel === 0 || !sheet.removeLevel)
                ) {
                  alert(_l('请设置修改的权限项'), 3);
                  return;
                }
                if (checkedWorksheets.length <= 0) {
                  alert(_l('请选择工作表'), 3);
                  return;
                }
                let info = sheet;
                if (sheet.lookLevel === 0 || !sheet.lookLevel) {
                  info = _.omit(info, ['lookLevel']);
                }
                if (sheet.editLevel === 0 || !sheet.editLevel) {
                  info = _.omit(info, ['editLevel']);
                }
                if (sheet.removeLevel === 0 || !sheet.removeLevel) {
                  info = _.omit(info, ['removeLevel']);
                }
                if (!hasSetSheet) {
                  info = _.omit(
                    info,
                    sheetActionLists.map(o => o.key),
                  );
                }
                if (!hasSetRecord) {
                  info = _.omit(
                    info,
                    recordActionLists.map(o => o.key),
                  );
                }
                const newData = sheets
                  .filter(o => checkedWorksheets.includes(o.sheetId))
                  .map(o => {
                    return { ...o, ...info };
                  });
                onOk(newData);
                alert(_l('批量修改成功，保存后生效'));
              }}
            >
              {_l('修改')}
            </Button>
          </div>
        </div>
      </Wrap>
    </Modal>
  );
}
