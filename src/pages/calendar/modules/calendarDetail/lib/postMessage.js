import { formatShowTime } from '../common';
import ajaxRequest from 'src/api/message';
import './css/postMessage.less';
import tpl from './template/postMessage.html';
import doT from 'dot';
import _ from 'lodash';
import { Dialog, Button } from 'ming-ui';
import React from 'react';

export default function ({ createUser, members, address, description, allDay, start, end, title }) {
  var data = _.map(members, m => ({
    ...m,
    name: m.memberName,
    id: m.accountID || '',
  }));

  var defaultContent =
    _l('%0 邀请您参加日程：%1', md.global.Account.fullname, title.replace(/\n/g, '')) +
    '\n' +
    _l('时间：%0', formatShowTime({ allDay, start, end })) +
    '\n' +
    (address ? _l('地点：%0', address) : _l('地点：无')) +
    '\n' +
    (description ? _l('描述：%0', description) : _l('描述：无'));

  Dialog.confirm({
    dialogClasses: 'postMessageDialog',
    width: 570,
    children: (
      <div
        dangerouslySetInnerHTML={{
          __html: doT.template(tpl)({
            data: data,
            defaultContent,
          }),
        }}
      ></div>
    ),
    footer: (
      <div className="Dialog-footer-btns">
        <Button
          type="link"
          onClick={() => {
            $('.postMessageDialog').parent().remove();
          }}
        >
          {_l('取消')}
        </Button>
        <Button
          type="primary"
          onClick={() => {
            var ids = [];
            $('.postMessageList .markCompletedSmall').each(function () {
              var $this = $(this).parent();
              if ($this.attr('uid')) {
                ids.push($this.attr('uid'));
              }
            });

            if (ids.length < 1) {
              alert(_l('请选择发送人员'), 3);
              return false;
            }
            var value = $('#postContent').val();
            var type = $('#btnSendType').attr('type');
            var op = '';
            if (type === '1') {
              op = 'sendMessageToAccountIds';
            } else if (type === '2') {
              op = 'sendEmailMessageToAccountIds';
            }

            ajaxRequest[op]({
              accountIds: ids,
              content: value,
              attachments: '',
            })
              .then(() => {
                $('.postMessageDialog').parent().remove();
                alert(_l('发送成功'), 1);
              })
              .catch(() => {
                alert(_l('发送失败'), 3);
              });
          }}
        >
          {_l('发送')}
        </Button>
      </div>
    ),
  });

  setTimeout(() => {
    const $dialog = $('.postMessageDialog');
    $('#postContent', $dialog).autoTextarea({
      maxHeight: 250,
      minHeight: 100,
    });

    // 勾选
    $('.postMessageList', $dialog).on('click', 'li', function () {
      var $postCheck = $(this).find('.postCheck');
      if (!$postCheck.hasClass('markCompletedSmall')) {
        $postCheck.removeClass('markUnCompleteSmall').addClass('markCompletedSmall');
      } else {
        $postCheck.removeClass('markCompletedSmall ').addClass('markUnCompleteSmall');
      }
    });

    // 全选
    $('#postAllCheck', $dialog).on('click', function () {
      if (!$(this).hasClass('markCompletedSmall')) {
        $(this).removeClass('markUnCompleteSmall').addClass('markCompletedSmall');
        $('.postMessageList .postCheck').removeClass('markUnCompleteSmall').addClass('markCompletedSmall');
      } else {
        $(this).removeClass('markCompletedSmall ').addClass('markUnCompleteSmall');
        $('.postMessageList .postCheck').removeClass('markCompletedSmall ').addClass('markUnCompleteSmall');
      }
    });

    // 选择发送类型
    $('#btnprivate,#btnEmail').on('click', function () {
      var className = ['', 'postContentPrivate', 'postContentEmail'];
      var type = $(this).attr('type');
      $(this).addClass('ThemeColor3').siblings().removeClass('ThemeColor3');

      $('#btnSendType').attr('type', type).removeClass().addClass(className[type]);
    });
  }, 200);
}
