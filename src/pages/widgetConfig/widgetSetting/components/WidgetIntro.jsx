import React, { useEffect, useState } from 'react';
import cx from 'classnames';
import Trigger from 'rc-trigger';
import { Dialog, Support, Icon } from 'ming-ui';
import { DEFAULT_INTRO_LINK } from '../../config';
import { WidgetIntroWrap, IntroMenu } from '../../styled';
import { DEFAULT_CONFIG, DEFAULT_DATA, WIDGETS_TO_API_TYPE_ENUM } from '../../config/widget';
import { enumWidgetType, getWidgetInfo, canSetAsTitle, supportWidgetIntroOptions } from '../../util';
import { handleAdvancedSettingChange } from '../../util/setting';
import { WHOLE_SIZE } from '../../config/Drag';
import { Tooltip } from 'antd';
import NoTitleControlDialog from './NoTitleControlDialog';
import appManagementAjax from 'src/api/appManagement';
import _ from 'lodash';
import { v4 as uuidv4 } from 'uuid';

const DISPLAY_OPTIONS = [
  {
    text: _l('设置'),
    icon: 'settings',
    value: 1,
  },
  {
    text: _l('样式'),
    icon: 'color_lens',
    value: 2,
  },
  {
    text: _l('事件'),
    icon: 'score-flash',
    value: 4,
  },
  {
    text: _l('说明'),
    icon: 'sort',
    value: 3,
  },
];

const SWITCH_ENUM = {
  2: ['EMAIL', 'MOBILE_PHONE', 'AUTO_ID', 'CRED', 'SEARCH', 'RICH_TEXT'], // 文本
  3: ['TEXT'], // 电话
  4: ['TEXT'], // 电话
  5: ['TEXT'], // 邮箱
  6: ['MONEY', 'SCORE'], // 数值
  7: ['TEXT'], // 证件
  8: ['NUMBER'], // 金额
  9: ['MULTI_SELECT'], // 单选
  10: ['FLAT_MENU'], // 多选
  11: ['MULTI_SELECT'], // 单选
  28: ['NUMBER'], // 等级
  29: ['SUB_LIST'], // 关联记录
  30: item =>
    (item.strDefault || '10').split('')[0] !== '1' && item.sourceControlId
      ? [enumWidgetType[_.get(item, 'sourceControl.type')]]
      : [], // 他表字段
  31: ['NUMBER', 'MONEY', 'SCORE'], // 公式---数值计算
  32: ['TEXT'], // 文本组合
  37: item => [enumWidgetType[item.enumDefault2]], // 汇总
  38: item => (item.enumDefault === 2 ? ['DATE'] : ['NUMBER']), // 公式日期计算
  33: ['TEXT'], // 自动编号
  34: item => {
    const { mode } = window.subListSheetConfig[item.controlId] || {};
    if (item.dataSource && item.dataSource.includes('-')) return [];
    return mode === 'new' ? ['SHEET'] : ['RELATE_SHEET'];
  },
  41: ['TEXT'], // 富文本
  50: ['TEXT'], // api查询
};

export default function WidgetIntro(props) {
  const { data = {}, from, onChange, mode, setMode, globalSheetInfo = {}, isRecycle } = props;
  const {
    type,
    controlId,
    controlName,
    dataSource = '',
    sourceControl = {},
    relationControls = [],
    advancedSetting,
  } = data;
  const { icon, widgetName, intro, moreIntroLink } = getWidgetInfo(type);
  const [visible, setVisible] = useState(false);
  const [switchList, setSwitchList] = useState([]);
  const [titleVisible, setTitleVisible] = useState(false);

  useEffect(() => {
    let newList = ((_.includes([30, 34, 37, 38], type) ? SWITCH_ENUM[type](data) : SWITCH_ENUM[type]) || []).filter(
      i => i,
    );
    newList = newList.map(i => {
      if (i === 'SHEET') {
      }
      return i === 'SHEET' ? { type: 'SHEET', widgetName: _l('转为工作表') } : { ...DEFAULT_CONFIG[i], type: i };
    });
    setSwitchList(newList);
  }, [controlId, data]);

  const switchType = info => {
    setVisible(false);

    //子表转工作表
    if (info.type === 'SHEET') {
      const isHaveCanSetAsTitle = _.some(relationControls, canSetAsTitle);
      if (isHaveCanSetAsTitle) {
        Dialog.confirm({
          title: _l('将子表转为工作表'),
          description: _l(
            '将从空白创建的子表转为一个实体工作表。此工作表将成为当前表单的一个关联子表，并可以在应用配置、流程、权限中被使用',
          ),
          okText: _l('确定'),
          onOk: () => {
            window.clearLocalDataTime({
              requestData: { worksheetId: dataSource },
              clearSpecificKey: 'Worksheet_GetWorksheetInfo',
            });
            appManagementAjax
              .changeSheet({
                sourceWorksheetId: globalSheetInfo.worksheetId,
                worksheetId: dataSource,
                name: controlName,
              })
              .then(res => {
                if (res) {
                  if (window.subListSheetConfig[controlId]) {
                    window.subListSheetConfig[controlId].mode = 'relate';
                  }
                  onChange({ data, needUpdate: true });
                  alert(_l('转换成功'));
                } else {
                  alert(_l('转换失败'), 2);
                }
              });
          },
        });
      } else {
        setTitleVisible(true);
      }
      return;
    }

    let newData = DEFAULT_DATA[info.type] || {};

    if (_.isEmpty(newData)) return;

    if (_.get(advancedSetting, 'required') === '1' && data.required) {
      newData = handleAdvancedSettingChange(newData, { required: '1' });
    }

    // 保存自定义事件
    if (_.get(advancedSetting, 'custom_event')) {
      const newCustomEvent = safeParse(_.get(advancedSetting, 'custom_event') || '[]').map(i => {
        return {
          ...i,
          eventId: uuidv4(),
        };
      });
      newData = handleAdvancedSettingChange(newData, { custom_event: JSON.stringify(newCustomEvent) });
    }

    // 清空默认值
    newData = handleAdvancedSettingChange(newData, { dynamicsrc: '', defsource: '', defaultfunc: '', defaulttype: '' });

    newData = _.omit(newData, ['controlName']);
    newData.type = WIDGETS_TO_API_TYPE_ENUM[info.type];

    if (info.type === 'DATE' || info.type === 'DATE_TIME') {
      newData = { ...newData, enumDefault: 0, unit: '' };
    }

    if (type === 6 || type === 8) {
      // 转金额或数值保留前后缀
      if (_.includes(['MONEY', 'NUMBER'], info.type)) {
        newData = handleAdvancedSettingChange(newData, _.pick(advancedSetting, ['prefix', 'suffix', 'dot']));
      }
      onChange(newData);
      return;
    }

    if (type === 9) {
      onChange({ type: newData.type });
      return;
    }
    // 多选转单选 需要将默认选中设为一个
    if (type === 10) {
      onChange({
        ...handleAdvancedSettingChange(data, { showtype: '1' }),
        type: 9,
      });
      return;
    }
    // 下拉转多选需要设置排列方式
    if (type === 11) {
      onChange({ type: 10, advancedSetting: { direction: '0' } });
      return;
    }

    // 关联记录
    if (type === 29) {
      Dialog.confirm({
        title: _l('将关联记录字段转为子表字段'),
        description: _l(
          '转为子表字段后，原关联记录字段中配置的筛选条件，以及与关联视图相关的权限、排序方式、自定义动作将被清除。',
        ),
        okText: _l('确定'),
        onOk: () => {
          onChange({
            type: 34,
            size: WHOLE_SIZE,
            unique: false,
            enumDefault: 2,
            advancedSetting: {
              allowadd: '1',
              allowcancel: '1',
              allowedit: '1',
              allowsingle: '1',
              allowexport: '1',
            },
          });
          if (mode === 4) {
            setMode(1);
          }
        },
      });
      return;
    }

    // 他表字段
    if (type === 30) {
      onChange({
        ..._.omit(sourceControl, ['controlId']),
        attribute: 0,
      });
      return;
    }

    // 汇总
    if (type === 37) {
      onChange({
        ...newData,
        dataSource: '',
        sourceControlId: '',
      });
      return;
    }

    // 公式
    if (type === 31 || type === 38) {
      Dialog.confirm({
        title: _l('变更字段类型'),
        description: _l(
          '此为不可逆操作，将公式变更为%0后，公式计算方式将丢失，保存后无法再转换为公式类型。你确定要进行变更吗？',
          info.widgetName,
        ),
        okText: _l('确定'),
        onOk: () => {
          onChange({
            ...newData,
            unit: type === 38 ? '' : newData.unit,
            dataSource: '',
            sourceControlId: '',
          });
        },
      });
      return;
    }

    // 子表
    if (type === 34) {
      Dialog.confirm({
        title: _l('将子表转为关联记录'),
        description: _l('将子表字段转为关联记录字段'),
        okText: _l('确定'),
        onOk: () => {
          const sheetInfo = _.get(window, `subListSheetConfig.${data.controlId}.sheetInfo`);
          window.subListSheetConfig[data.controlId] = {
            loading: false,
            sheetInfo: sheetInfo,
            views: _.get(sheetInfo, 'views'),
            controls: _.get(sheetInfo, 'template.controls'),
          };
          onChange({
            ...handleAdvancedSettingChange(newData, { searchrange: '1', dynamicsrc: '', defaulttype: '' }),
            ..._.pick(data, ['showControls']),
            type: 29,
            enumDefault: 2,
          });
        },
      });
      return;
    }

    // 富文本
    if (type === 41 && controlId) {
      Dialog.confirm({
        title: _l('变更字段类型'),
        description: _l('将富文本变更为普通文本后，文本样式、图片等信息将丢失。你确定要进行变更吗？'),
        okText: _l('确定'),
        onOk: () => {
          onChange(newData);
        },
      });
      return;
    }

    onChange(newData);
  };

  const isAllowSwitch = () => {
    if (type === 29 && from === 'subList') return false;
    return switchList.length > 0;
  };

  return (
    <WidgetIntroWrap>
      <div className="title">
        <Trigger
          popup={() => {
            return (
              <IntroMenu>
                {switchList.map(i => {
                  return (
                    <div className="menuItem" onClick={() => switchType(i)}>
                      <Icon icon={i.icon} />
                      {i.widgetName}
                    </div>
                  );
                })}
              </IntroMenu>
            );
          }}
          popupVisible={visible}
          onPopupVisibleChange={visible => {
            if (!isAllowSwitch()) return;
            setVisible(visible);
          }}
          action={['click']}
          popupAlign={{
            points: ['tl', 'bl'],
            offset: [0, 4],
            overflow: { adjustX: true, adjustY: true },
          }}
          getPopupContainer={() => document.body}
        >
          <div className={cx('switchType', { disabled: !isAllowSwitch })}>
            <Icon icon={icon} className="Gray_75 Font18" />
            <span>{widgetName}</span>
            {isAllowSwitch() && <Icon icon="task_custom_btn_unfold" className="mLeft6 Gray_75" />}
          </div>
        </Trigger>

        <Tooltip placement={'bottom'} title={intro}>
          <span style={{ marginLeft: '3px' }}>
            <Support
              type={3}
              href={moreIntroLink || DEFAULT_INTRO_LINK}
              text={<i className="icon-help Font16 Gray_9e"></i>}
            />
          </span>
        </Tooltip>
      </div>

      <div className="introOptions">
        {DISPLAY_OPTIONS.map(item => {
          if (!supportWidgetIntroOptions(data, item.value, from, isRecycle)) return null;

          return (
            <Tooltip title={item.text} placement="bottom">
              <div className={cx('optionIcon', { active: mode === item.value })} onClick={() => setMode(item.value)}>
                <Icon icon={item.icon} className="Font18" />
              </div>
            </Tooltip>
          );
        })}
      </div>

      {titleVisible && <NoTitleControlDialog onClose={() => setTitleVisible(false)} />}
    </WidgetIntroWrap>
  );
}
