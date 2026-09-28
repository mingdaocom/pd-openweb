import _, { find, get, includes, isArray } from 'lodash';
import { v4 as uuidv4 } from 'uuid';
import { RELATE_RECORD_SHOW_TYPE } from 'src/utils/domain/worksheet/constants';
import { getTemporaryAttachmentFromUrl } from 'src/utils/platform/file/attachment';
import { OPTION_COLORS_LIST } from './config';
import { REQUIRED_SUPPORTED_WIDGET_TYPES } from './type';
import { DEFAULT_DATA } from './widget';
import { enumWidgetType, WIDGETS_TO_API_TYPE_ENUM } from './widgetTypes';

/**
 * 将 AI 推荐字段定义转换为工作表控件配置。
 */
export function convertAiRecommendControlToControlData(recommendControl, { worksheetId, allWidgets = [] } = {}) {
  const {
    id,
    type,
    name,
    isRequired,
    isHeading,
    col,
    row,
    size,
    description,
    code,
    formulaExpression,
    optionColor,
    options = [],
    isMultiple,
    displayField = [],
    relatedWorksheet = {},
  } = recommendControl;
  let control = {
    controlName: name,
    controlId: id || uuidv4(),
    col,
    row,
    size,
    hint: description,
    alias: code,
    attribute: isHeading ? 1 : 0,
    source: recommendControl,
  };

  if (['text', 'longText'].includes(recommendControl.type)) {
    control.type = WIDGETS_TO_API_TYPE_ENUM.TEXT;
  } else if (recommendControl.type === 'longText') {
    control.type = WIDGETS_TO_API_TYPE_ENUM.TEXT;
    control.enumDefault = 2;
  } else if (type === 'number') {
    control.type = WIDGETS_TO_API_TYPE_ENUM.NUMBER;
  } else if (recommendControl.type === 'amount') {
    control.type = WIDGETS_TO_API_TYPE_ENUM.MONEY;
  } else if (type === 'region') {
    control.type = WIDGETS_TO_API_TYPE_ENUM.AREA_PROVINCE;
  } else if (type === 'location') {
    control.type = WIDGETS_TO_API_TYPE_ENUM.LOCATION;
  } else if (type === 'date') {
    control.type = WIDGETS_TO_API_TYPE_ENUM.DATE;
  } else if (type === 'dateTime') {
    control.type = WIDGETS_TO_API_TYPE_ENUM.DATE_TIME;
  } else if (type === 'boolean') {
    control.type = WIDGETS_TO_API_TYPE_ENUM.SWITCH;
  } else if (type === 'dropdown') {
    control.type = WIDGETS_TO_API_TYPE_ENUM.DROP_DOWN;
  } else if (type === 'radio') {
    control.type = WIDGETS_TO_API_TYPE_ENUM.FLAT_MENU;
  } else if (type === 'checkbox') {
    control.type = WIDGETS_TO_API_TYPE_ENUM.MULTI_SELECT;
  } else if (type === 'autoid') {
    control.type = WIDGETS_TO_API_TYPE_ENUM.AUTO_ID;
  } else if (type === 'member') {
    control.type = WIDGETS_TO_API_TYPE_ENUM.USER_PICKER;
  } else if (type === 'department') {
    control.type = WIDGETS_TO_API_TYPE_ENUM.DEPARTMENT;
  } else if (type === 'phone') {
    control.type = WIDGETS_TO_API_TYPE_ENUM.MOBILE_PHONE;
  } else if (type === 'email') {
    control.type = WIDGETS_TO_API_TYPE_ENUM.EMAIL;
  } else if (type === 'attachment') {
    control.type = WIDGETS_TO_API_TYPE_ENUM.ATTACHMENT;
  } else if (type === 'formula') {
    control.type = WIDGETS_TO_API_TYPE_ENUM.FORMULA_NUMBER;
  } else if (type === 'subform') {
    control.type = WIDGETS_TO_API_TYPE_ENUM.SUB_LIST;
  } else if (type === 'section') {
    control.type = WIDGETS_TO_API_TYPE_ENUM.SPLIT_LINE;
  } else if (type === 'tab') {
    control.type = WIDGETS_TO_API_TYPE_ENUM.SECTION;
  } else if (includes(['related', 'multiRelated', 'relatedTable'], type)) {
    control.type = WIDGETS_TO_API_TYPE_ENUM.RELATE_SHEET;
  }

  if (REQUIRED_SUPPORTED_WIDGET_TYPES.includes(control.type)) {
    control.required = isRequired;
  }

  const defaultData = DEFAULT_DATA[enumWidgetType[control.type]] || {};
  control = {
    ...defaultData,
    ...{
      ...control,
      advancedSetting: {
        ...(control.advancedSetting || defaultData.advancedSetting || {}),
      },
    },
  };
  if (!control.advancedSetting) {
    control.advancedSetting = {};
  }

  if (includes(['related', 'multiRelated', 'relatedTable'], type)) {
    control.dataSource = relatedWorksheet === 'self' ? worksheetId : relatedWorksheet?.id;
    control.showControls = (displayField || []).map(item => item.fieldID);
    if (type === 'related') {
      control.advancedSetting.showtype = String(RELATE_RECORD_SHOW_TYPE.DROPDOWN);
    } else if (type === 'multiRelated') {
      control.enumDefault = 2;
      control.advancedSetting.showtype = String(RELATE_RECORD_SHOW_TYPE.CARD);
    } else if (type === 'relatedTable') {
      control.enumDefault = 2;
      control.advancedSetting.showtype = String(RELATE_RECORD_SHOW_TYPE.TAB_TABLE);
    }
  }

  if (control.type === WIDGETS_TO_API_TYPE_ENUM.FORMULA_NUMBER && formulaExpression) {
    let expression = formulaExpression;
    allWidgets.forEach(widget => {
      if (widget.code) {
        expression = expression.replace(new RegExp(widget.code, 'g'), `\$${widget.id}\$`);
      }
    });
    control.dataSource = expression;
  }

  if (control.type === WIDGETS_TO_API_TYPE_ENUM.SUB_LIST) {
    const relationControls = (recommendControl.subFields || []).map(convertAiRecommendControlToControlData);
    control.dataSource = uuidv4();
    control.relationControls = relationControls;
    control.showControls = relationControls.map(item => item.controlId);
  }

  // 处理人员、部门字段多选属性
  if (control.type === WIDGETS_TO_API_TYPE_ENUM.USER_PICKER || control.type === WIDGETS_TO_API_TYPE_ENUM.DEPARTMENT) {
    control.enumDefault = isMultiple ? 1 : 0;
  }

  // 选项
  if (
    _.includes(
      [WIDGETS_TO_API_TYPE_ENUM.FLAT_MENU, WIDGETS_TO_API_TYPE_ENUM.MULTI_SELECT, WIDGETS_TO_API_TYPE_ENUM.DROP_DOWN],
      control.type,
    )
  ) {
    if (options.length) {
      control.options = (options || []).map((item, index) => ({
        key: uuidv4(),
        value: item.label,
        isDeleted: false,
        index,
        checked: item.isDefault,
        color: item.color || OPTION_COLORS_LIST[(index + 1) % OPTION_COLORS_LIST.length],
      }));
    }

    const defaultOption = find(control.options, { checked: true });

    if (defaultOption) {
      control.advancedSetting.defsource = JSON.stringify([
        {
          rcid: '',
          cid: '',
          staticValue: defaultOption.key,
        },
      ]);
    }

    if (optionColor) {
      control.enumDefault2 = 1;
    }
  }

  return control;
}

/**
 * 将工作表控件类型映射为 AI 推荐字段类型。
 */
export function convertControlTypeToAiRecommendControlType(type) {
  if (type === WIDGETS_TO_API_TYPE_ENUM.TEXT) {
    return 'text';
  } else if (type === WIDGETS_TO_API_TYPE_ENUM.LONG_TEXT) {
    return 'longText';
  } else if (type === WIDGETS_TO_API_TYPE_ENUM.NUMBER) {
    return 'number';
  } else if (type === WIDGETS_TO_API_TYPE_ENUM.MONEY) {
    return 'amount';
  } else if (type === WIDGETS_TO_API_TYPE_ENUM.AREA_PROVINCE) {
    return 'region';
  } else if (type === WIDGETS_TO_API_TYPE_ENUM.LOCATION) {
    return 'location';
  } else if (type === WIDGETS_TO_API_TYPE_ENUM.DATE) {
    return 'date';
  } else if (type === WIDGETS_TO_API_TYPE_ENUM.DATE_TIME) {
    return 'dateTime';
  } else if (type === WIDGETS_TO_API_TYPE_ENUM.SWITCH) {
    return 'boolean';
  } else if (type === WIDGETS_TO_API_TYPE_ENUM.DROP_DOWN) {
    return 'dropdown';
  } else if (type === WIDGETS_TO_API_TYPE_ENUM.FLAT_MENU) {
    return 'radio';
  } else if (type === WIDGETS_TO_API_TYPE_ENUM.MULTI_SELECT) {
    return 'checkbox';
  } else if (type === WIDGETS_TO_API_TYPE_ENUM.AUTOID) {
    return 'autoid';
  } else if (type === WIDGETS_TO_API_TYPE_ENUM.USER_PICKER) {
    return 'member';
  } else if (type === WIDGETS_TO_API_TYPE_ENUM.DEPARTMENT) {
    return 'department';
  } else if (type === WIDGETS_TO_API_TYPE_ENUM.MOBILE_PHONE) {
    return 'phone';
  } else if (type === WIDGETS_TO_API_TYPE_ENUM.EMAIL) {
    return 'email';
  } else if (type === WIDGETS_TO_API_TYPE_ENUM.ATTACHMENT) {
    return 'attachment';
  } else if (type === WIDGETS_TO_API_TYPE_ENUM.FORMULA) {
    return 'formula';
  } else if (type === WIDGETS_TO_API_TYPE_ENUM.SUB_LIST) {
    return 'subform';
  } else if (type === WIDGETS_TO_API_TYPE_ENUM.RELATE) {
    return 'related';
  } else if (type === WIDGETS_TO_API_TYPE_ENUM.MULTI_RELATED) {
    return 'multiRelated';
  } else if (type === WIDGETS_TO_API_TYPE_ENUM.RELATED_TABLE) {
    return 'relatedTable';
  } else if (type === WIDGETS_TO_API_TYPE_ENUM.SPLIT_LINE) {
    return 'section';
  } else if (type === WIDGETS_TO_API_TYPE_ENUM.TAB) {
    return 'tab';
  }

  return null;
}

/**
 * 将 AI 生成的字段值转换为对应控件可保存的数据格式。
 */
export function formatAiGenControlValue(control, value = '') {
  try {
    const { type } = control;
    let result = value;

    if (type === WIDGETS_TO_API_TYPE_ENUM.ATTACHMENT) {
      result = isArray(value)
        ? {
            attachments: value.map(({ ext, name, url }) =>
              getTemporaryAttachmentFromUrl({
                fileUrl: url,
                fileName: name,
                fileSize: 40,
                fileExt: ext ? '.' + ext : '',
              }),
            ),
            attachmentData: [],
            knowledgeAtts: [],
          }
        : [];
    } else if (
      type === WIDGETS_TO_API_TYPE_ENUM.DROP_DOWN ||
      type === WIDGETS_TO_API_TYPE_ENUM.MULTI_SELECT ||
      type === WIDGETS_TO_API_TYPE_ENUM.FLAT_MENU
    ) {
      const matchedValues = typeof value === 'string' ? value.split(',') : value;
      const matchedOptions = get(control, 'options', []).filter(option =>
        find(matchedValues, value => option.value === value),
      );
      result = matchedOptions.map(item => item.key);
    } else if (type === WIDGETS_TO_API_TYPE_ENUM.USER_PICKER) {
      result = isArray(value)
        ? value.slice(0, control.enumDefault === 0 ? 1 : undefined).map(item => {
            return {
              fullname: item.name,
              accountId: item.id,
              avatar: item.avatar,
            };
          })
        : [];
    } else if (type === WIDGETS_TO_API_TYPE_ENUM.ORG_ROLE) {
      result = isArray(value)
        ? value.slice(0, control.enumDefault === 0 ? 1 : undefined).map(item => {
            return {
              organizeName: item.name,
              organizeId: item.id,
            };
          })
        : [];
    } else if (type === WIDGETS_TO_API_TYPE_ENUM.DEPARTMENT) {
      result = isArray(value)
        ? value.slice(0, control.enumDefault === 0 ? 1 : undefined).map(item => {
            return {
              departmentName: item.name,
              departmentId: item.id,
            };
          })
        : [];
    } else if (type === WIDGETS_TO_API_TYPE_ENUM.RELATE_SHEET || type === WIDGETS_TO_API_TYPE_ENUM.CASCADER) {
      result = isArray(value)
        ? value.map(item => {
            return {
              name: item.name,
              sid: item.id || item.sid,
            };
          })
        : [];
    } else if (type === WIDGETS_TO_API_TYPE_ENUM.SUB_LIST) {
      result = (value || []).map(row => {
        const newRow = {};
        Object.keys(row).forEach(controlId => {
          const matchedControl = get(control, 'relationControls', []).find(c => c.controlId === controlId);

          if (matchedControl) {
            newRow[controlId] = formatAiGenControlValue(matchedControl, row[controlId]);
          }
        });
        return newRow;
      });
    }

    if (type === WIDGETS_TO_API_TYPE_ENUM.SWITCH) {
      return result ? '1' : '0';
    }

    return typeof result === 'string' ? result : JSON.stringify(result);
  } catch (err) {
    console.error(err);
    return;
  }
}
