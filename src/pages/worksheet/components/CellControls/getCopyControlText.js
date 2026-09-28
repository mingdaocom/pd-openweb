import _ from 'lodash';
import { renderText } from 'src/utils/domain/control/display';
import { WIDGETS_TO_API_TYPE_ENUM } from 'src/utils/domain/control/widgetTypes';

/**
 * 将工作表单元格的控件值转换为适合复制到剪贴板的文本。
 */
export default function getCopyControlText(control) {
  let content;

  try {
    if (_.includes([WIDGETS_TO_API_TYPE_ENUM.SIGNATURE, WIDGETS_TO_API_TYPE_ENUM.SUB_LIST], control.type)) {
      content = control.value;
    } else if (control.type === WIDGETS_TO_API_TYPE_ENUM.ATTACHMENT) {
      content = safeParse(control.value)
        .map(c => `${c.originalFilename}${c.ext}(${c.previewUrl})`)
        .join(',');
    } else if (control.type === WIDGETS_TO_API_TYPE_ENUM.RELATION) {
      content = safeParse(control.value)
        .map(
          c =>
            `[${
              {
                1: _l('任务'),
                2: _l('项目'),
                3: _l('日程'),
                4: _l('文件'),
                5: _l('申请单'),
                6: '',
                7: _l('日程'),
              }[c.type]
            }]${c.name}(${c.link})`,
        )
        .join(',');
    } else if (_.includes([WIDGETS_TO_API_TYPE_ENUM.SCORE], control.type)) {
      content = control.value;
    } else {
      content = renderText(control);
    }
  } catch (err) {
    console.error(err);
  }

  return content;
}
