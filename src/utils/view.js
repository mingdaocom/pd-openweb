import _ from 'lodash';
import RegExpValidator from 'src/utils/expression';

// 获取封面url
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
