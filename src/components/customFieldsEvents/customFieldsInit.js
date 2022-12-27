
import config from './js/config';
import { cuntomFieldsEvents } from './js/customFieldsEvents';
import doT from '@mdfe/dot';
import tpl from './tpl/customFields.html';
import './css/customFieldsEvents.less';
import CustomScore from './js/customScore';
import nzh from 'nzh';
import { initControls } from './init';
import { getClassNameByExt } from 'src/util';
import _ from 'lodash';
import moment from 'moment';

const URL_REG = /((?:(https?(?::\/\/)(www\.)?)|(www\.))[a-z0-9-_.]+(?:\.[a-z0-9]{2,})(?:[-a-z0-9:%_+.~#?&//=@]*))/gi;
const linkify = text => {
  return text.replace(URL_REG, url => {
    return `<a href='${url.indexOf('//') >= 0 ? url : '//' + url}' target='_blank'>${url}</a>`;
  });
};

export default function customFieldsInit(options) {
  if (options.data && options.data.length) {
    options.data = _.groupBy(options.data, 'row');
    options.$el
      .html(
        doT.template(tpl)({
          data: options.data,
          formControls: options.formControls,
          sourceID: options.sourceID,
          attachmentType: options.attachmentType,
          hasAuth: options.hasAuth, // 全部控件是否有权限编辑
          controlType: config,
          type: options.type || 'oa', // oa || task
          isShowAttachmentBtn: options.isShowAttachmentBtn || false,
          linkify: linkify,
          getClassNameByExt: getClassNameByExt,
          nzhCn: nzh.cn,
          moment,
        }),
      )
      .addClass('Relative');

    var postUpdate = ($el, value, callback) => {
      if ($.isFunction(options.validationAfterPost)) {
        options.validationAfterPost($el, value, callback);
      }
    };

    initControls({
      data: options.data,
      $el: options.$el,
      postUpdate: postUpdate,
      inDetailed: false,
      type: options.type,
      index: 0,
      editMode: options.hasAuth,
    });
    for (let i in options.formControls) {
      let formControl = options.formControls[i];

      if (formControl && formControl.controls) {
        for (let j in formControl.controls) {
          if (typeof formControl.controls[j] === 'object') {
            let controls = {};
            controls[j] = formControl.controls[j];

            initControls({
              data: controls,
              $el: options.$el,
              postUpdate: postUpdate,
              inDetailed: true,
              type: options.type,
              index: parseInt(j, 10),
              editMode: options.hasAuth,
            });
          }
        }
      }
    }

    if (options.hasAuth !== false) {
      cuntomFieldsEvents(options);
    } else {
      options.$el.find('input, textarea').attr('disabled', 'disabled');
    }

    // 打开关联控件
    options.$el.on('click', '.customRelationBox .overflow_ellipsis:not(.customRelationDelete)', function (event) {
      window.open($(this).closest('li').data('link'));
    });

    new CustomScore(options.hasAuth, options.validationAfterPost);
  } else {
    options.$el.html('');
  }
}
