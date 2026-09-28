import _ from 'lodash';
import RegExpValidator from 'src/utils/domain/validation/expression';

/** 不能作为视图排序字段的控件类型。 */
export const CAN_NOT_AS_VIEW_SORT = [14, 19, 21, 22, 23, 24, 25, 34, 35, 40, 41, 43, 45, 52, 10010];

/** 普通工作表系统字段的稳定排序。 */
export const NORMAL_SYSTEM_FIELDS_SORT = ['rowid', 'caid', 'ownerid', 'uaid', 'ctime', 'utime'];

/** 工作流系统字段的稳定排序。 */
export const WORKFLOW_SYSTEM_FIELDS_SORT = [
  'wfname',
  'wfstatus',
  'wfcuaids',
  'wfrtime',
  'wfftime',
  'wfdtime',
  'wfcaid',
  'wfctime',
  'wfcotime',
];

/**
 * 从记录附件字段中选取首个图片预览地址并转换为封面尺寸。
 */
export const getCoverUrl = (coverId, record, controls) => {
  const coverControl = _.find(controls, c => c.controlId && c.controlId === coverId);

  if (!coverControl) {
    return;
  }

  try {
    const files = safeParse(record[coverId]) || [];
    const coverFile = _.find(files, file => file && RegExpValidator.fileIsPicture(file.ext));
    const { previewUrl = '' } = coverFile || {};

    if (!previewUrl) {
      return;
    }

    return previewUrl.indexOf('imageView2') > -1
      ? previewUrl.replace(/imageView2\/\d\/w\/\d+\/h\/\d+(\/q\/\d+)?/, 'imageView2/1/w/200/h/140')
      : `${previewUrl}&imageView2/1/w/200/h/140`;
  } catch (err) {
    console.log(err);
  }

  return;
};
