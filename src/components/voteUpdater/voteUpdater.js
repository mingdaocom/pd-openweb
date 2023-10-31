import './voteUpdater.css';
import doT from 'dot';
import 'src/components/uploadAttachment/uploadAttachment';
import 'src/components/mdDatePicker/mdDatePicker';
import _ from 'lodash';
import moment from 'moment';

const VoteUpdater = {
  init: function ($el) {
    const _this = this;

    return $el.each(function (i, el) {
      var idPrefix = Math.random().toString(36).substring(7);
      var $el = $(el);
      if (!$el.attr('id')) {
        $el.attr('id', idPrefix + 'Vote_updater');
      }

      var addItem = function (canClose) {
        var $options = $el.find('.voteOptions');
        var $items = $options.find('li');
        var voteCount = $items.length;
        if (voteCount >= 99) return;
        var it = {};
        it.canClose = canClose;
        it.idPrefix = idPrefix;

        var $lastItem;
        if ($items.length) {
          $lastItem = $items.last();
          it.curindex = parseInt($lastItem.attr('index') || '0') + 1;
        } else {
          it.curindex = 1;
        }
        if (it.curindex >= 10) {
          it.width = 69;
          it.txtWidth = 84;
        } else {
          it.width = 70;
          it.txtWidth = 85;
        }
        var itemTpl =
          '<li class="pAll5" index="{{=it.curindex}}">\
          <div class="Left mRight5">\
            {{= _l("选项") }}\
            <span class="voteIndex"></span>\
            &nbsp;\
          </div>\
          <div class="Left mRight5 inputTxt" style="width: {{= it.width}}%">\
            <input type="text" class="TextBox"\
              placeholder="{{= _l("请输入投票项") }}"\
              style="width:{{= it.txtWidth }}%"\
              value=""  />\
            <div id="{{= it.idPrefix + "divVoteUpload" + it.curindex }}"></div>\
            <div class="Clear"></div>\
          </div>\
          <div class="Left ThemeColor3 Hand" id="{{= it.idPrefix + "VotePicUpload" + it.curindex }}">{{= _l("上传图片") }}...</div>\
          {{? it.canClose}}\
          <div class="Left mLeft10">\
            <span class="Hand Bold Gray_a removeVoteItem" title="{{= _l("关闭") }}">×</span>\
          </div>\
          {{?}}\
          <div class="Clear"></div>\
        </li>';
        var $newItem = $(doT.template(itemTpl)(it));
        if ($lastItem) {
          $lastItem.after($newItem);
        } else {
          $options.find('ul').append($newItem);
        }
        $options.scrollTop($options.scrollTop() + $options.height());

        _this.initUploadify(it.curindex, idPrefix);

        $options
          .find('li')
          .find('.voteIndex')
          .each(function (i) {
            $(this).text(i + 1);
          });

        var oldVoteAvailableNumber = $el.find('.voteAvailableNumber').val();
        var optionTpl =
          '{{ for(var i = 1; i <= it.voteCount + 1; i++) { }}\
          <option {{? it.oldVoteAvailableNumber == i }}selected="selected"{{?}}>{{= i}}</option>\
        {{ } }}';
        $el.find('.voteAvailableNumber').html(
          doT.template(optionTpl)({
            oldVoteAvailableNumber: oldVoteAvailableNumber,
            voteCount: voteCount,
          }),
        );
      };

      $el.html(_this.getDefaultContent(idPrefix, $el.attr('left')));

      addItem();
      addItem();

      $el
        .off()
        .on('click', '.addItem', function () {
          addItem(true);
        })
        .on('click', '.voteOptions li .removeVoteItem', function () {
          var voteCount = $el.find('.voteOptions li').length;
          $(this).parent().parent().remove();
          $el.find('.voteOptions li .voteIndex').each(function (i) {
            $(this).text(i + 1);
          });
          var oldVoteAvailableNumber = $el.find('.voteAvailableNumber').val();
          var optionTpl =
            '{{ for(var i = 1; i <= it.voteCount - 1; i++) { }}\
          <option {{? it.oldVoteAvailableNumber == i }}selected="selected"{{?}}>{{= i}}</option>\
        {{ } }}';
          $el.find('.voteAvailableNumber').html(
            doT.template(optionTpl)({
              oldVoteAvailableNumber: oldVoteAvailableNumber,
              voteCount: voteCount,
            }),
          );
        });
      $el.find('.voteLastTime').val(_this.getTomorrowEnd());
      $el.find('.voteLastTime').mdDatePicker({
        selectDate: moment(_this.getTomorrowEnd()),
        dialogStyle: {
          offsetLeft: 0,
          offsetTop: 24,
        },
        isShowClear: false,
        zIndex: 1002,
        onChange: function (dateText) {
          var voteLastTime = dateText;
          voteLastTime = new Date(voteLastTime);
          var today = new Date(new Date().getTime() - (new Date().getTime() % 86400000));
          if (today - voteLastTime === 0) {
            var hour = new Date().getHours();
            $el
              .find('.voteLastHour')
              .find('option')
              .each(function (hourOptionIndex, option) {
                var disabled = parseInt($(option).val(), 10) <= hour;
                if (disabled) $(option).hide();
                $(option).prop('disabled', disabled);
              })
              .end()
              .val(hour + 1 >= 24 ? 0 : hour + 1);
          } else {
            $el.find('.voteLastHour option').prop('disabled', false).show();
          }
        },
      });
    });
  },
  getDefaultContent: function (idPrefix, left) {
    left = left || 73;
    return (
      '<div class="arrowUpOuter" style="left:' +
      left +
      'px;"><div class="arrowUpInner"></div></div>\
    <div class="updaterDialog_Main" style="min-height: 35px;">\
      <div class="Left voteOptions">\
        <ul>\
        </ul>\
        <div class="pLeft5 mTop5">\
          <a href="javascript:void(0)" class="addItem">\
            ' +
      _l('+增加选项') +
      '</a>\
        </div>\
      </div>\
      <div class="Clear"></div>\
      <div class="voteUpdaterOperate">\
        <table border="0" cellpadding="2" cellspacing="1">\
          <tr>\
            <td width="130" style="vertical-align: middle; height: 30px;">\
              ' +
      _l('允许选择') +
      '\
              <select class="voteAvailableNumber">\
                <option>1</option>\
                <option>2</option>\
              </select>\
              ' +
      _l('项') +
      '\
            </td>\
            <td style="vertical-align: middle;">\
              ' +
      _l('截止日期') +
      '\
              <input class="TextBox voteLastTime" style="width: 70px" />\
              <select class="voteLastHour">\
                <option value="0">0</option>\
                <option value="1">1</option>\
                <option value="2">2</option>\
                <option value="3">3</option>\
                <option value="4">4</option>\
                <option value="5">5</option>\
                <option value="6">6</option>\
                <option value="7">7</option>\
                <option value="8">8</option>\
                <option value="9">9</option>\
                <option value="10">10</option>\
                <option value="11">11</option>\
                <option value="12">12</option>\
                <option value="13">13</option>\
                <option value="14">14</option>\
                <option value="15">15</option>\
                <option value="16">16</option>\
                <option value="17">17</option>\
                <option value="18">18</option>\
                <option value="19">19</option>\
                <option value="20">20</option>\
                <option value="21">21</option>\
                <option value="22">22</option>\
                <option value="23">23</option>\
              </select>&nbsp;' +
      _l('时') +
      '\
            </td>\
          </tr>\
          <tr>\
            <td>\
              <input id="' +
      idPrefix +
      'voteAnonymous" type="checkbox" class="mRight5 Left voteAnonymous" />\
              <label for="' +
      idPrefix +
      'voteAnonymous">' +
      _l('匿名投票') +
      '</label>\
            </td>\
          </tr>\
        </table>\
      </div>\
    </div>\
    <div class="Clear"></div>\
  '
    );
  },
  initUploadify: function (index, idPrefix) {
    var picContainerHtml = doT.template(
      '<div class="votePicContainer Hidden votePicContainer{{=it.index}}">\
        <div class="votePicUploaded">\
          <input type="hidden" id="{{=it.idPrefix}}hidVotePicUpload{{=it.index}}" />\
        </div>\
        <div class="votePicDesc Hidden">\
          <div class="overflow_ellipsis votePicName Bold"></div>\
          <br />\
          <a href="javascript:;" id="re_{{=it.idPrefix}}VotePicUpload{{=it.index}}">换一张</a>\
        </div>\
        <div class="Clear"></div>\
      </div>',
    )({ index: index, idPrefix: idPrefix });
    var $divVoteUpload = $('#' + idPrefix + 'divVoteUpload' + index).html(picContainerHtml);
    $('#' + idPrefix + 'hidVotePicUpload' + index).uploadAttachment({
      filterTitle: '图片',
      filterExtensions: 'gif,png,jpg,jpeg,bmp',
      pluploadID: '#' + idPrefix + 'VotePicUpload' + index,
      newPluploadID: '#re_' + idPrefix + 'VotePicUpload' + index,
      folder: 'VoteDoc',
      multiSelection: false,
      onlyOne: true,
      filesAdded: function () {
        $divVoteUpload.find('.votePicContainer' + index).show();
      },
      callback: function (attachments, totalSize) {
        var $votePicContainer = $divVoteUpload.find('.votePicContainer' + index);
        if (attachments.length > 0) {
          var attachment = attachments[0];
          $votePicContainer.find('.votePicDesc').show();
          $votePicContainer
            .find('.votePicName')
            .text(attachment.originalFileName + attachment.fileExt)
            .attr('title', attachment.originalFileName + attachment.fileExt)
            .show();
          var fullFilePath = attachment.serverName + attachment.filePath + attachment.fileName + attachment.fileExt;
          $votePicContainer.find('img:first').attr('file', fullFilePath).attr('thumbnail', fullFilePath);
          $votePicContainer.find('img:first').attr('src', `${attachment.url}&imageView2/1/w/219/h/153`);
          $('#' + idPrefix + 'VotePicUpload' + index).hide();
        } else {
          $('#' + idPrefix + 'VotePicUpload' + index).show();
          $votePicContainer.hide();
        }
      },
    });
  },
  getTomorrowEnd: function () {
    var now = new Date();
    now.setDate(now.getDate() + 1);
    return now.getFullYear() + '-' + (now.getMonth() + 1) + '-' + now.getDate();
  },
  reset: function ($el) {
    var _this = this;

    return $el.each(function (i, el) {
      var $el = $(el);
      if ($el.find('.voteOptions input').length > 0) {
        $el.find('.voteOptions input[type = "text"]').addClass('Gray_c').val(_l('请输入投票项'));
        $el.find('.UploadSuccess').html('');
        $el.find('div[pluploadid]').show();
        $el.find('.voteOptions li:gt(1)').remove();
      }
      if ($el.find('.voteAvailableNumber').length > 0) {
        $el.find('.voteAvailableNumber').get(0).selectedIndex = 0;
      }
      if ($el.find('.voteAnonymous').length > 0) {
        $el.find('.voteAnonymous').removeAttr('checked');
      }
      if ($el.find('.voteVisble').length > 0) {
        $el.find('.voteVisble').attr('checked', 'checked');
      }
      if ($(el).find('.voteOptions li').length > 0) {
        var oplength = $(el).find('.voteOptions li').length;
        if (oplength > 0) {
          for (var i = 0; i < oplength; i++) {
            if (i > 1) {
              $(el).find('.voteOptions li').eq(i).remove();
            }
          }
        }
      }
      $el.find('.voteLastHour').val(new Date().getHours());
      $el.find('.voteLastTime').val(_this.getTomorrowEnd());
      $el.find('.voteUpdaterOperate').show();
    });
  },
  getData: function ($el) {
    var $voteItems = $el.find('.voteOptions li');
    var voteOptions = '';
    var voteOptionFiles = '';
    var voteLastTime = '';
    var voteLastHour = '';
    var voteAvailableNumber = '';
    var voteAnonymous = false;
    var voteVisble = false;

    $voteItems.each(function (i) {
      if ($voteItems.eq(i).find('input').val() != '' && $voteItems.eq(i).find('input').val() != _l('请输入投票项')) {
        voteOptions += $voteItems.eq(i).find('input').val() + '[Option]';
        if ($voteItems.eq(i).find('img:first').attr('file') != '') {
          voteOptionFiles += $voteItems.eq(i).find('img:first').attr('file') + '[Option]';
        } else {
          voteOptionFiles += '[Option]';
        }
      }
    });

    voteLastTime = $el.find('.voteLastTime').val();
    voteLastHour = $el.find('.voteLastHour').val();
    voteAvailableNumber = parseInt($el.find('.voteAvailableNumber').val() || '0', 10);
    voteAnonymous = $el.find('.voteAnonymous').prop('checked');
    voteVisble = voteAnonymous.length > 0;

    var rData = '';
    if (voteOptions.length > 0) {
      rData += 'voteOptions=' + encodeURIComponent(voteOptions || '');
      rData += '&voteOptionFiles=' + encodeURIComponent(voteOptionFiles || '');
    }
    if (voteLastTime.length > 0) {
      rData += '&voteLastTime=' + encodeURIComponent(voteLastTime || '');
    }
    if (voteLastHour.length > 0) {
      rData += '&voteLastHour=' + encodeURIComponent(voteLastHour || '');
    }
    rData += '&voteAvailableNumber=' + encodeURIComponent(voteAvailableNumber || '');
    rData += '&voteAnonymous=' + encodeURIComponent(voteAnonymous || '');
    rData += '&voteVisble=' + encodeURIComponent(voteVisble || '');

    return {
      invalid: $.grep($voteItems, function (voteItem) {
        var $voteItemInput = $(voteItem).find('input[type = "text"]');
        $voteItemInput.val(_.trim($voteItemInput.val()));
        return $voteItemInput.val() === '' || $voteItemInput.val() === _l('请输入投票项');
      }).length,
      voteOptions: voteOptions,
      voteOptionFiles: voteOptionFiles,
      voteLastTime: voteLastTime,
      voteLastHour: voteLastHour,
      voteAvailableNumber: voteAvailableNumber,
      voteAnonymous: voteAnonymous,
      voteVisble: voteVisble,
    };
  },
  alertInvalidData: function ($el) {
    var $emptyInput = $.grep($el.find('.voteOptions li input[type = "text"]'), function (voteItemInput) {
      var $voteItemInput = $(voteItemInput);
      $voteItemInput.val(_.trim($voteItemInput.val()));
      return $voteItemInput.val() === '' || $voteItemInput.val() === _l('请输入投票项');
    });
    if ($emptyInput.length) {
      alert('投票项内容不能为空', 3);
    }
  },
};

export default VoteUpdater;
