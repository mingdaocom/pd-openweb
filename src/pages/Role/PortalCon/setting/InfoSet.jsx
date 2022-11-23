import React, { useState, useEffect } from 'react';
import './portalSort.less';
import styled from 'styled-components';
import { Icon, Dropdown, Checkbox } from 'ming-ui';
import cx from 'classnames';
import { DEFAULT_DATA, DEFAULT_CONFIG } from 'src/pages/widgetConfig/config/widget';
import { v4 as uuidv4 } from 'uuid';
import { enumWidgetType } from 'src/pages/widgetConfig/util';
import { SortableContainer, SortableElement, SortableHandle } from 'react-sortable-hoc';
import PortalSettingDialog from 'src/pages/widgetConfig/widgetSetting/components/PortalSettingDialog';

const filterAlias = ['mobilephone', 'avatar', 'roleid', 'status', 'firstLoginTime', 'openid', 'portal_email'];
const Wrap = styled.div`
  position: relative;
  height: calc(100% - 100px);
  overflow: hidden;
  z-index: 1;
  .content {
    padding: 24px;
    height: calc(100% - 68px);
    overflow: auto;
  }
  .addControl {
    margin-left: 22px;
    width: 99px;
    height: 36px;
    background: #f8f8f8;
    border-radius: 3px;
    color: #2196f3;
    line-height: 34px;
    text-align: center;
    &:hover {
      background: #f5f5f5;
    }
  }
`;

const WrapSorh = styled.div`
  &.firstWrapSorh {
    margin-left: -11px;
  }
  &.title {
    margin-left: 0px;
    border-radius: 3px;
    overflow: hidden;
    background: #f8f8f8;
    padding-left: 16px;
  }
  label {
    width: 65px;
    &.required {
      margin-left: 10px;
    }
  }
  .controlName,
  .controlN {
    &.title {
      background: none;
      border: 0;
      margin-left: 5px;
    }
  }
`;
//支持的字段：文本、数值、电话、邮箱、日期、单选、多选、附件、地区、身份证、检查框；字段的属性是工作表字段的部分属性
const WIDGETS_TO_API_TYPE = [
  'TEXT',
  'MOBILE_PHONE',
  // 'TELEPHONE',
  'EMAIL',
  'NUMBER',
  'CRED',
  // 'FLAT_MENU',
  'MULTI_SELECT',
  'DROP_DOWN',
  // 'ATTACHMENT',
  'DATE',
  // 'DATE_TIME',
  // 'AREA_PROVINCE',
  'AREA_CITY',
  // 'AREA_COUNTY',
  'SWITCH',
];
export const WIDGETS_TO_API_TYPE_ENUM_N = {
  2: 'TEXT',
  3: 'MOBILE_PHONE',
  4: 'TELEPHONE',
  5: 'EMAIL',
  6: 'NUMBER',
  7: 'CRED',
  9: 'FLAT_MENU',
  10: 'MULTI_SELECT',
  11: 'DROP_DOWN',
  // 14: 'ATTACHMENT',
  15: 'DATE',
  16: 'DATE_TIME',
  19: 'AREA_PROVINCE',
  23: 'AREA_CITY',
  24: 'AREA_COUNTY',
  36: 'SWITCH',
};
const initData = (enumType, type, controlId) => {
  return {
    ...DEFAULT_DATA[enumType],
    size: 12,
    type: type || enumWidgetType[enumType],
    controlId: controlId ? controlId : uuidv4(),
    fieldPermission: '110', //默认收集
  };
};
const SortHandle = SortableHandle(() => <Icon className="mRight12 Font16 Hand Gray_9e" icon="drag" />);

const Item = SortableElement(props => {
  let {
    type,
    showEditDialog,
    deleteBtn,
    onChange,
    isRequired,
    fieldPermission = '111',
    controlName,
    controlId,
  } = props;
  return (
    <WrapSorh className="mBottom10 porTalSort flexRow">
      <SortHandle />
      {type ? (
        <span className="InlineBlock controlN">
          {DEFAULT_CONFIG[WIDGETS_TO_API_TYPE_ENUM_N[type] || 'TEXT'].widgetName}
        </span>
      ) : (
        <Dropdown
          data={[]}
          isAppendToBody
          data={WIDGETS_TO_API_TYPE.map(o => {
            return { text: DEFAULT_CONFIG[o].widgetName, value: o };
          })}
          className="InlineBlock controlN"
          onChange={newValue => {
            onChange(initData(newValue, null, controlId));
          }}
          placeholder={_l('类型')}
        />
      )}
      <input
        className={cx('controlName InlineBlock mLeft10 mRight25', { noName: !controlName })}
        value={controlName}
        placeholder={_l('字段标题')}
        onChange={e => {
          let value = e.target.value.trim();
          onChange({ controlName: value, controlId });
        }}
      />
      <Checkbox
        className="TxtLeft InlineBlock Hand cellect"
        text={''}
        checked={fieldPermission === '110'}
        onClick={checked => {
          onChange({
            fieldPermission: fieldPermission === '110' ? '111' : '110',
            controlId,
          });
        }}
      />
      <Checkbox
        className="TxtLeft InlineBlock Hand required"
        text={''}
        checked={isRequired}
        onClick={() => {
          onChange({ required: !isRequired, controlId });
        }}
      />
      <Icon
        className="Font18 Hand mRight10 set"
        icon="settings"
        onClick={() => {
          if (!type) {
            alert(_l('请选择字段类型'), 3);
            return;
          }
          showEditDialog(controlId, type);
        }}
      />
      <Icon
        className="Font18 Hand del"
        icon="trash"
        onClick={() => {
          deleteBtn(controlId);
        }}
      />
    </WrapSorh>
  );
});

const SortableList = SortableContainer(({ items, showEditDialog, deleteBtn, onChange }) => {
  return (
    <div className="">
      {_.map(items, (item, index) => {
        return (
          <Item
            {...item}
            controlName={item.controlName}
            type={item.type}
            index={index + 1} //很重要
            isRequired={item.required}
            fieldPermission={item.fieldPermission}
            key={'item_' + index}
            showEditDialog={showEditDialog.bind(item)}
            deleteBtn={deleteBtn.bind(item)}
            onChange={onChange.bind(item)}
          />
        );
      })}
    </div>
  );
});

export default function InfoSet(props) {
  const { portal = {}, appId } = props;
  let { portalSet = {}, onChangePortalSet } = props;
  let { controlTemplate = {} } = portalSet;
  const { groupId, name, projectId, worksheetId } = portal.baseInfo || {};
  const [show, setShow] = useState(false);
  const [controls, setControls] = useState([]);
  const [controlsFilter, setControlsFilter] = useState([]);
  const [currentControl, setCurrenControl] = useState({});
  const [allControl, setAllControl] = useState([]);
  const [hs, setHs] = useState(false);
  useEffect(() => {
    let { controlTemplate = {} } = portalSet;
    let { controls = [] } = controlTemplate;
    setHs(false);
    setControls(
      (controls.length > 0 ? controls.filter(o => !filterAlias.includes(o.alias)) : []).sort((a, b) => {
        return a.row - b.row;
      }),
    );
    setControlsFilter(controls.length > 0 ? controls.filter(o => filterAlias.includes(o.alias)) : []);
    setAllControl(controls || []);
  }, []);
  useEffect(() => {
    if (controls.length <= 0) {
      return;
    }
    let tmp = controls.slice();
    let val = tmp.shift();
    let data = [val].concat(...controlsFilter).concat(...tmp);
    setAllControl(data);
    onChangePortalSet(
      {
        controlTemplate: {
          ...controlTemplate,
          controls: data,
        },
      },
      hs,
    );
  }, [controls]);

  const handleMoveApp = list => {
    setHs(true);
    setControls(
      list.map((o, i) => {
        if (o.alias) {
          return { ...o, row: 0 };
        } else {
          return { ...o, row: controlsFilter.length + i + 1 };
        }
      }),
    );
  };
  const handleSortEnd = ({ oldIndex, newIndex }) => {
    if (oldIndex === newIndex) return;
    const list = controls.slice();
    const currentItem = list.splice(oldIndex, 1)[0];
    list.splice(newIndex, 0, currentItem);
    handleMoveApp(list);
  };
  const renderCon = () => {
    return (
      <React.Fragment>
        {/* 第一个是系统文本字段，名称是姓名，不支持修改也不支持删除，默认不收集，默认非必填 */}
        <WrapSorh className="mBottom10 porTalSort mTop10 title flexRow" style={{}}>
          {/* <span className="sortBox InlineBlock mRight12 mLeft7"></span> */}
          <span className={cx('InlineBlock controlN disable title')}>{_l('类型')}</span>
          <span className={cx('controlName InlineBlock mLeft10 disable title')}>{_l('名称')}</span>
          <Checkbox
            className="TxtLeft InlineBlock Hand"
            text={_l('收集')}
            checked={controls.filter(o => o.fieldPermission === '110').length >= controls.length}
            clearselected={
              !!(
                controls.length &&
                controls.filter(o => o.fieldPermission === '110').length &&
                controls.filter(o => o.fieldPermission === '110').length !== controls.length
              )
            }
            onClick={() => {
              setHs(true);
              setControls(
                controls.map((o, i) => {
                  return {
                    ...o,
                    fieldPermission:
                      controls.filter(o => o.fieldPermission === '110').length >= controls.length ? '111' : '110',
                  };
                }),
              );
            }}
          />
          <Checkbox
            className="TxtLeft InlineBlock Hand required"
            text={_l('必填')}
            checked={controls.filter(o => o.required).length >= controls.length}
            clearselected={
              !!(
                controls.length &&
                controls.filter(o => o.required).length &&
                controls.filter(o => o.required).length !== controls.length
              )
            }
            onClick={() => {
              setHs(true);
              setControls(
                controls.map((o, i) => {
                  if (i === 0) {
                    return o;
                  }
                  return { ...o, required: !(controls.filter(o => o.required).length >= controls.length) };
                }),
              );
            }}
          />
          <div style={{ width: 46 }} />
        </WrapSorh>
        {/* 系统字段 用户 */}
        <WrapSorh className="mBottom10 porTalSort firstWrapSorh flexRow" style={{}}>
          <span className="sortBox InlineBlock mRight18"></span>
          <span className={cx('InlineBlock controlN disable')}>
            {(DEFAULT_CONFIG[WIDGETS_TO_API_TYPE_ENUM_N[controls[0].type]] || {}).widgetName}
          </span>
          <span
            className={cx('controlName InlineBlock mLeft10 disable mRight25', { noName: !controls[0].controlName })}
          >
            {controls[0].controlName}
          </span>
          <Checkbox
            className="TxtLeft InlineBlock Hand cellect"
            text={''}
            checked={controls[0].fieldPermission === '110'}
            onClick={() => {
              setHs(true);
              setControls(
                controls.map((o, i) => {
                  if (i === 0) {
                    return {
                      ...o,
                      ...{
                        fieldPermission: controls[0].fieldPermission === '110' ? '111' : '110',
                        controlId: controls[0].controlId,
                      },
                    };
                  }
                  return o;
                }),
              );
            }}
          />
          <Checkbox className="TxtLeft InlineBlock Hand required" text={''} disabled checked={controls[0].required} />
          <div style={{ width: 46 }} />
        </WrapSorh>
        <SortableList
          items={controls.filter((o, i) => i !== 0)}
          useDragHandle
          onSortEnd={handleSortEnd}
          helperClass={'portalList'}
          onChange={control => {
            setHs(true);
            setControls(
              controls.map(o => {
                if (o.controlId === control.controlId) {
                  return { ...o, ...control };
                }
                return o;
              }),
            );
          }}
          showEditDialog={(controlId, type) => {
            setCurrenControl(controls.find(o => o.controlId === controlId));
            setShow(true);
          }}
          deleteBtn={controlId => {
            setHs(true);
            setControls(controls.filter(o => o.controlId !== controlId));
          }}
        />
      </React.Fragment>
    );
  };
  return (
    <Wrap>
      <div className="content">
        <h6 className="Font16 Gray Bold mBottom0">{_l('用户列表信息设置')}</h6>
        <div className="Font12 Gray_9e mTop8 mBottom8">
          {_l(
            '外部用户列表在系统字段的基础上，还可增加自定义字段的配置；如果自定义字段需要用户注册/登录时填写收集，点击左侧的收集勾选框，需要用户必填可点击右侧的必填勾选框',
          )}
        </div>
        {controls.length > 0 && renderCon()}
        <div
          className="addControl InlineBlock Hand"
          onClick={() => {
            setHs(true);
            setControls(
              controls.concat({
                controlId: uuidv4(),
                fieldPermission: '110', //新增默认就是收集
                required: false,
                row: allControl.length + 1,
              }),
            );
          }}
        >
          <i className="icon icon-add Font18 mRight5 TxtMiddle InlineBlock" />
          <span className="Bold TxtMiddle InlineBlock">{_l('添加字段')}</span>
        </div>
      </div>
      {show && (
        <PortalSettingDialog
          onClose={() => {
            setShow(false);
            setCurrenControl({});
          }}
          onOk={control => {
            setShow(false);
            setHs(true);
            setControls(
              controls.map(o => {
                if (o.controlId !== control.controlId) {
                  return o;
                } else {
                  return control;
                }
              }),
            );
          }}
          globalSheetInfo={{
            appId,
            groupId,
            name,
            projectId,
            worksheetId,
          }}
          data={currentControl}
        />
      )}
    </Wrap>
  );
}
