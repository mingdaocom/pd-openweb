import doT from 'dot';
import _ from 'lodash';
import categoryAjax from 'src/api/category';
import userAjax from 'src/api/user';
import { AT_ALL_TEXT, SOURCE_TYPE } from 'src/components/comment/config';
import { getCaretPosition, setCaretPosition } from 'src/utils/common';
import { htmlEncodeReg } from 'src/utils/common';
import './css/mentionsInput.css';

/*
jQuery `input` special event v1.0

http://whattheheadsaid.com/projects/input-special-event

(c) 2010-2011 Andy Earnshaw
MIT license
www.opensource.org/licenses/mit-license.php

Modified by Kenneth Auchenberg
* Disabled usage of onPropertyChange event in IE, since its a bit delayed, if you type really fast.
*/

(function ($) {
  // Handler for propertychange events only
  function propHandler() {
    var $this = $(this);
    if (window.event.propertyName == 'value' && !$this.data('triggering.inputEvent')) {
      $this.data('triggering.inputEvent', true).trigger('input');
      window.setTimeout(function () {
        $this.data('triggering.inputEvent', false);
      }, 0);
    }
  }

  $.event.special.input = {
    setup: function (data, namespaces) {
      var timer; // Get a reference to the element
      var elem = this; // Store the current state of the element
      var state = elem.value; // Create a dummy element that we can use for testing event support
      var tester = document.createElement(this.tagName); // Check for native oninput
      var oninput = 'oninput' in tester || checkEvent(tester); // Check for onpropertychange
      var onprop = 'onpropertychange' in tester; // Generate a random namespace for event bindings
      var ns = 'inputEventNS' + ~~(Math.random() * 10000000); // Last resort event names
      var evts = ['focus', 'blur', 'paste', 'cut', 'keydown', 'drop', ''].join('.' + ns + ' ');

      function checkState() {
        var $this = $(elem);
        if (elem.value != state && !$this.data('triggering.inputEvent')) {
          state = elem.value;

          $this.data('triggering.inputEvent', true).trigger('input');
          window.setTimeout(function () {
            $this.data('triggering.inputEvent', false);
          }, 0);
        }
      }

      // Set up a function to handle the different events that may fire
      function handler(e) {
        // When focusing, set a timer that polls for changes to the value
        if (e.type === 'focus') {
          checkState();
          clearInterval(timer);
          timer = window.setInterval(checkState, 250);
        } else if (e.type === 'blur') {
          // When blurring, cancel the aforeset timer
          window.clearInterval(timer);
        } else {
          // For all other events, queue a timer to check state ASAP
          window.setTimeout(checkState, 0);
        }
      }

      // Bind to native event if available
      if (oninput) {
        return false;
        //      } else if (onprop) {
        //        // Else fall back to propertychange if available
        //        $(this).find("input, textarea").andSelf().filter("input, textarea").bind("propertychange." + ns, propHandler);
      }
      $(this).find('input, textarea').andSelf().filter('input, textarea').bind(evts, handler);
      $(this).data('inputEventHandlerNS', ns);
    },
    teardown: function () {
      var elem = $(this);
      elem.find('input, textarea').unbind(elem.data('inputEventHandlerNS'));
      elem.data('inputEventHandlerNS', '');
    },
  };

  // Setup our jQuery shorthand method
  $.fn.input = function (handler) {
    return handler ? this.bind('input', handler) : this.trigger('input');
  };

  /*
  The following function tests the element for oninput support in Firefox.  Many thanks to
  http://blog.danielfriesen.name/2010/02/16/html5-browser-maze-oninput-support/
  */
  function checkEvent(el) {
    // First check, for if Firefox fixes its issue with el.oninput = function
    el.setAttribute('oninput', 'return');
    if (typeof el.oninput === 'function') {
      return true;
    }
    // Second check, because Firefox doesn't map oninput attribute to oninput property
    try {
      // "* Note * : Disabled focus and dispatch of keypress event due to conflict with DOMready, which resulted in scrolling down to the bottom of the page, possibly because layout wasn't finished rendering.
      var e = document.createEvent('KeyboardEvent');
      var ok = false;
      var tester = function (evt) {
        ok = true;
        evt.preventDefault();
        evt.stopPropagation();
      };

      // e.initKeyEvent("keypress", true, true, window, false, false, false, false, 0, "e".charCodeAt(0));

      document.body.appendChild(el);
      el.addEventListener('input', tester, false);
      // el.focus();
      // el.dispatchEvent(e);
      el.removeEventListener('input', tester, false);
      document.body.removeChild(el);
      return ok;
    } catch (error) {
      //
    }
  }
})(jQuery);

/*
 * Mentions Input
 * Version 1.0.2
 * Written by: Kenneth Auchenberg (Podio)
 *
 * Using underscore.js
 *
 * License: MIT License - http://www.opensource.org/licenses/mit-license.php
 */

(function ($, _, undefined) {
  // eslint-disable-line no-shadow, no-shadow-restricted-names
  // Settings
  var KEY = {
    BACKSPACE: 8,
    TAB: 9,
    RETURN: 13,
    ESC: 27,
    LEFT: 37,
    UP: 38,
    RIGHT: 39,
    DOWN: 40,
    COMMA: 188,
    SPACE: 32,
    HOME: 36,
    END: 35,
  }; // Keys "enum"
  var defaultSettings = {
    triggerChar: '@',
    onDataRequest: $.noop,
    minChars: 0,
    showAvatars: true,
    showCategory: false,
    submitBtn: '',
    zIndex: 5,
    position: 'bottom', // 'top' 'bottom'
    reset: true,
    isAtAll: false, // @ 全体成员
    sourceType: SOURCE_TYPE.POST, // atAll类型
    searchType: 0, // 用户搜索使用 1 用户和群组 0
    classes: {
      autoCompleteItemActive: 'active',
    },
    templates: {
      wrapper: _.template('<div class="mentions-input-box"></div>'),
      autocompleteList: _.template('<div class="mentions-autocomplete-list"></div>'),
      autocompleteListItem: _.template(
        '<li data-ref-id="<%= id %>" data-ref-type="<%= type %>" data-display="<%= display %>"><%= content %></li>',
      ),
      autocompleteListItemAvatar: _.template('<img src="<%= avatar %>" />'),
      mentionsOverlay: _.template('<div class="mentions"><div></div></div>'),
      mentionItemSyntax: _.template('<%= type %>:<%= id %>'),
      mentionItemHighlight: _.template('<strong><span>@<%= value %></span></strong>'),
      categoryListItem: _.template('<li class="mentions-autocomplete-list-category ellipsis"><%= content %></li>'),
    },
  };

  var utils = {
    highlightTerm: function (value, term) {
      if (!term && !term.length) {
        return value;
      }
      return value.replace(new RegExp('(?![^&;]+;)(?!<[^<>]*)(' + term + ')(?![^<>]*>)(?![^&;]+;)', 'gi'), '<b>$1</b>');
    },
    rtrim: function (string) {
      return string.replace(/\s+$/, '');
    },
  };

  var MentionsInput = function (settings) {
    var domInput, elmInputBox, elmAutocompleteList, elmWrapperBox, elmMentionsOverlay, elmActiveAutoCompleteItem;
    var mentionsCollection = [];
    var autocompleteItemCollection = {};
    var inputBuffer = [];
    var isAt = false;
    var atPos = 0;
    var currentType;
    var currentDataQuery;
    var localStorage = window.store || window.localStorage;
    var promiseObj = null;

    // 全角和半角
    var categoryLetterArr = ['#', '＃'];
    var atLetterArr = ['@', '＠'];

    settings = $.extend(
      true,
      {},
      defaultSettings,
      {
        templates: {
          mentionItemSyntax:
            settings.sourceType === SOURCE_TYPE.POST
              ? _.template('<%= type %>:<%= id %>')
              : _.template('[aid]<%= id %>[/aid]'),
          mentionAllSyntax:
            settings.sourceType === SOURCE_TYPE.POST
              ? _.template('<%= type %>:<%= id %>')
              : _.template('[all]<%= id %>[/all]'),
        },
      },
      settings,
    );

    function initTextarea() {
      $(domInput).addClass('emojiFontFace');
      elmInputBox = $(domInput);

      if (elmInputBox.attr('data-mentions-input') == 'true') {
        return;
      }

      var identityClassName = 'mentions-input-box';
      var $tpl = $(settings.templates.wrapper()).addClass(identityClassName);
      elmInputBox.wrapAll($tpl);
      elmWrapperBox = elmInputBox.closest(`.${identityClassName}`);

      elmInputBox.attr('data-mentions-input', 'true');
      elmInputBox.bind('keydown', onInputBoxKeyDown);
      elmInputBox.bind('keyup', onInputBoxInput);
      elmInputBox.bind('focus', onInputBoxInput);
      elmInputBox.bind('blur', onInputBoxBlur);
    }

    function initAutocomplete() {
      elmAutocompleteList = $(settings.templates.autocompleteList()).css('zIndex', settings.zIndex);
      elmAutocompleteList.appendTo(elmWrapperBox);
      elmAutocompleteList.delegate('li', 'mousedown', onAutoCompleteItemClick);
    }

    function initMentionsOverlay() {
      elmMentionsOverlay = $(settings.templates.mentionsOverlay());
      elmMentionsOverlay.prependTo(elmWrapperBox);
    }

    function updateValues() {
      var syntaxMessage = getInputBoxValue();
      var mentionText = htmlEncodeReg(syntaxMessage);

      _.each(mentionsCollection, function (mention) {
        var textSyntax = settings.templates.mentionItemSyntax(mention);
        var encodedMention = _.extend({}, mention, { value: htmlEncodeReg(mention.value) });
        var textHighlight = settings.templates.mentionItemHighlight(encodedMention);
        if (mention.id === 'atAll' || mention.id === 'isCommentAtAll') {
          // atAll 特殊处理 转化为 [all]atAll[all] 或者 user:isCommentAtAll
          textSyntax = settings.templates.mentionAllSyntax(mention);
        }
        syntaxMessage = syntaxMessage.replace('@' + mention.value, textSyntax);
        mentionText = mentionText.replace(textSyntax, textHighlight);
      });

      mentionText = mentionText.replace(/\n/g, '<br />');
      mentionText = mentionText.replace(/ {2}/g, '&nbsp; ');

      elmMentionsOverlay.find('div').html(mentionText);
      elmInputBox.data('messageText', syntaxMessage);
    }

    function resetBuffer() {
      inputBuffer = [];
    }

    function updateMentionsCollection() {
      var inputText = getInputBoxValue();

      mentionsCollection = _.reject(mentionsCollection, function (mention, index) {
        return !mention.value || inputText.indexOf(mention.value) == -1;
      });
      mentionsCollection = _.compact(mentionsCollection);
    }

    function addMention(mention) {
      var currentMessage = getInputBoxValue();
      var position = getCaretPosition(elmInputBox[0]);

      var startCaretPosition = 0;
      if (isAt && atPos < position) {
        // 中文问题
        startCaretPosition = position - currentDataQuery.length - 1;
      } else {
        startCaretPosition = position - 1;
      }

      var currentCaretPosition = position;

      var start = currentMessage.substr(0, startCaretPosition);
      var end = currentMessage.substr(currentCaretPosition, currentMessage.length);
      var startEndIndex;
      if (atLetterArr.indexOf(currentType) > -1) {
        startEndIndex = (start + '@' + mention.value).length + 1;
        mentionsCollection.push(mention);
      } else if (settings.showCategory && categoryLetterArr.indexOf(currentType) > -1) {
        startEndIndex = (start + '#' + mention.value + '#').length + 1;
      }

      isAt = false;
      atPos = 0;
      currentDataQuery = '';
      hideAutoComplete();
      var updatedMessageText;
      if (atLetterArr.indexOf(currentType) > -1) {
        updatedMessageText = start + '@' + mention.value + ' ' + end;
      } else if (settings.showCategory && categoryLetterArr.indexOf(currentType) > -1) {
        updatedMessageText = start + '#' + mention.value + '# ' + end;
      }

      if (updatedMessageText) {
        currentType = '';
        elmInputBox.val(updatedMessageText);
        updateValues();
        elmInputBox.focus();
        setCaretPosition(elmInputBox[0], startEndIndex);
      }
    }

    function getInputBoxValue() {
      // return $.trim(elmInputBox.val());
      return elmInputBox.val();
    }

    function onAutoCompleteItemClick(e) {
      var elmTarget = $(this);
      var mention = autocompleteItemCollection[elmTarget.attr('data-uid')];

      addMention(mention);

      return false;
    }

    function onInputBoxBlur(e) {
      hideAutoComplete();
    }

    function onInputBoxInput(e) {
      updateValues();
      updateMentionsCollection();
      if ([38, 40, 16].indexOf(e.keyCode) > -1) {
        return;
      }

      var startPos = getCaretPosition(elmInputBox[0]);
      var currentMessage = getInputBoxValue();
      var startChar = currentMessage.substring(startPos - 1, startPos);
      if (atLetterArr.indexOf(startChar) > -1 || (settings.showCategory && categoryLetterArr.indexOf(startChar) > -1)) {
        atPos = startPos;
        isAt = true;
        currentType = startChar;
      } else if (startChar == ' ' || startChar == '') {
        isAt = false;
        currentType = '';
      }

      if (!isAt) {
        // 解决部分数据法恶心的问题
        var message = currentMessage.substring(atPos, startPos);
        if (message.indexOf(' ') == -1 && message.indexOf('\n') == -1) {
          // 没有空格 没有换行，重新激活搜索
          isAt = true;
          currentType = currentMessage.substring(atPos - 1, atPos);
        }
      }

      if (isAt && atPos <= getCaretPosition(elmInputBox[0])) {
        currentDataQuery = currentMessage.substring(atPos, getCaretPosition(elmInputBox[0]));
        _.defer(_.bind(doSearch, this, currentDataQuery));
      } else {
        hideAutoComplete();
        currentType = '';
      }
    }

    function onInputBoxKeyPress(e) {
      if (e.keyCode !== KEY.BACKSPACE) {
        var typedValue = String.fromCharCode(e.which || e.keyCode);
        inputBuffer.push(typedValue);
      }
    }

    function onInputBoxKeyDown(e) {
      if (e.ctrlKey && (e.keyCode === 13 || e.keyCode === 108)) {
        if (settings.submitBtn) {
          onInputBoxBlur(e);
          document.getElementById(settings.submitBtn).click();
        }
        return;
      }

      if (e.keyCode === KEY.LEFT || e.keyCode === KEY.RIGHT || e.keyCode === KEY.HOME || e.keyCode === KEY.END) {
        _.defer(resetBuffer);

        return;
      }

      if (e.keyCode === KEY.BACKSPACE) {
        inputBuffer = inputBuffer.slice(0, -1 + inputBuffer.length); // Can't use splice, not available in IE
        return;
      }

      if (!elmAutocompleteList.is(':visible')) {
        return true;
      }

      switch (e.keyCode) {
        case KEY.UP:
        case KEY.DOWN:
          var elmCurrentAutoCompleteItem = null;
          if (e.keyCode === KEY.DOWN) {
            if (elmActiveAutoCompleteItem && elmActiveAutoCompleteItem.length) {
              elmCurrentAutoCompleteItem = elmActiveAutoCompleteItem.next();
            } else {
              elmCurrentAutoCompleteItem = elmAutocompleteList.find('li').first();
            }
          } else {
            elmCurrentAutoCompleteItem = $(elmActiveAutoCompleteItem).prev();
          }

          if (elmCurrentAutoCompleteItem.length) {
            selectAutoCompleteItem(elmCurrentAutoCompleteItem);
            triggerScroll();
          }
          return false;

        case KEY.RETURN:
        case KEY.TAB:
          if (elmActiveAutoCompleteItem && elmActiveAutoCompleteItem.length) {
            elmActiveAutoCompleteItem.trigger('mousedown');
            return false;
          }
          break;
        default:
          break;
      }

      return true;
    }

    function hideAutoComplete() {
      elmActiveAutoCompleteItem = null;
      elmAutocompleteList.empty().hide();
    }

    function triggerScroll() {
      var itemHeight = elmActiveAutoCompleteItem.height();
      var containerHeight = elmAutocompleteList.height();
      var containerScorllTop = elmAutocompleteList.scrollTop();
      if ((elmActiveAutoCompleteItem.index() + 1) * itemHeight - containerScorllTop > containerHeight) {
        elmAutocompleteList.scrollTop((elmActiveAutoCompleteItem.index() + 1) * itemHeight - containerHeight + 6);
      }

      if (elmActiveAutoCompleteItem.index() * itemHeight < containerScorllTop) {
        elmAutocompleteList.scrollTop(elmActiveAutoCompleteItem.index() * itemHeight);
      }
    }

    function selectAutoCompleteItem(elmItem) {
      elmItem.addClass(settings.classes.autoCompleteItemActive);
      elmItem.siblings().removeClass(settings.classes.autoCompleteItemActive);

      elmActiveAutoCompleteItem = elmItem;
    }

    function populateDropdown(query, results) {
      const WINDOW_HEIGHT = $(window).height();

      var height = elmMentionsOverlay.outerHeight();
      var topGap = elmMentionsOverlay.offset().top;
      var bottomGap = WINDOW_HEIGHT - topGap - height;
      if (settings.position === 'top') {
        elmAutocompleteList.css({
          bottom: height + 5,
          maxHeight: topGap - 130,
          minHeight: settings.minHeight,
        });
      } else {
        elmAutocompleteList.css({
          maxHeight: bottomGap - 15,
          minHeight: settings.minHeight,
        });
      }
      elmAutocompleteList.show();
      elmAutocompleteList.empty();
      if (!results.accounts.length && !results.groups.length) {
        var $noData = $('<div class="mentionNoData">');
        if (results.isNewAccount) {
          $noData.append(
            '<div class="invite"><i class="icon-invite"></i><p>' +
              _l('您还没有一起协作的小伙伴，') +
              '<br/><span class="ThemeColor3 Hand">' +
              _l('邀请更多的同事') +
              ' </span>' +
              _l('加入吧！') +
              ' </p></div>',
          );
        } else if (currentDataQuery === '') {
          var strNoOne = _l('输入姓名或群组名，提醒TA查看');
          $noData.append('<div class="noOne">' + strNoOne + '</div>');
        } else {
          if (md.global.Account.isPortal) {
            $noData.append('<div class="invite"><p>' + _l('没有找到') + ' </p></div>');
          } else {
            $noData.append(
              '<div class="invite"><i class="icon-invite"></i><p>' +
                _l('没有找到，') +
                '<span class="ThemeColor3 Hand">' +
                _l('邀请更多的同事') +
                ' </span>' +
                _l('加入吧！') +
                ' </p></div>',
            );
          }
        }
        $noData.find('.invite').on('mousedown', function (evt) {
          import('src/components/addFriends').then(func => {
            func.default({ fromType: 0 });
          });
          evt.stopPropagation();
        });
        elmAutocompleteList.append($noData);
        return;
      }

      var elmDropDownList = $('<ul>').appendTo(elmAutocompleteList).hide();

      if (results.accounts && results.accounts.length > 0) {
        let atDataIndex = null;
        let userIndex = null;

        results.accounts.map((item, i) => {
          if (item.isAtData && !atDataIndex) {
            atDataIndex = i;
          }
          if (!item.isAtData && !item.isAll && !userIndex) {
            userIndex = i;
          }
        });
        _.each(results.accounts, function (item, index) {
          var itemUid = _.uniqueId('mention_');
          let template = '';
          if (item.isAll) {
            template = `<div class="itemContent"><span class="wMax100 InlineBlock pTop5 ThemeColor3" title={{! it.fullname }}>{{! it.fullname}}</span><br/><span class="Gray_9e pBottom5 InlineBlock">${_l(
              '所有记录成员与参与讨论的人',
            )}</span></div>`;
          } else {
            if (settings.forReacordDiscussion) {
              if (item.isAtData) {
                template = `<div class="itemContent">
                {{? !it.job && !it.companyName}}
                <div style="line-height:38px" >
                {{??}}
                <div>
                {{?}}
                <span class="fullname Gray" title={{! it.fullname }}>{{! it.fullname}}</span>
                </div>
                {{? it.job || it.companyName}}
                <div>
                <span class="Gray_a"  title={{! it.job}}>{{! it.job || ""}}</span>
                {{? it.job && it.companyName}}
                  <span class="Gray_a">/</span>
                {{?}}
                {{? !it.isAll}}
                  <span class="Gray_a">{{! it.companyName}}</span>
                {{?}}
                </div>
                {{?}}
              </div>`;
              } else {
                template = `<div class="itemContent">{{? !it.profession && !it.companyName}}<div style="line-height:38px">{{??}}<div>{{?}}<span class="fullname Gray" title={{! it.fullname }}>{{! it.fullname}}</span></div>{{? it.profession || it.companyName}} <div>{{? it.profession}}<span class="Gray_a" title={{! it.profession}}>{{! it.profession}}</span>{{?}}{{? it.profession && it.companyName}}<span class="Gray_a">/</span>{{?}}{{? !it.isAll}}<span class="Gray_a">{{! it.companyName}}</span>{{?}}</div>{{?}}</div>`;
              }
            } else {
              template =
                '<div class="itemContent"><div><span class="fullname ThemeColor3" title={{! it.fullname }}>{{! it.fullname}}</span>{{? it.profession}}<span class="Gray_a" title={{! it.profession}}>{{! it.profession}}</span>{{?}}</div><div>{{? !it.isAll}}<span class="Gray_a">{{! it.companyName}}</span>{{?}}</div></div>';
            }
          }
          autocompleteItemCollection[itemUid] = {
            id: htmlEncodeReg(item.accountId || item.id),
            value: item.fullname,
            avatar: item.isAtData ? item.avatar : item.avatarMiddle,
            display: htmlEncodeReg(item.fullname),
            type: 'user',
            content: utils.highlightTerm(doT.template(template)(item), query),
          };

          var elmListItem = $(settings.templates.autocompleteListItem(autocompleteItemCollection[itemUid])).attr(
            'data-uid',
            itemUid,
          );

          if (index === 0) {
            selectAutoCompleteItem(elmListItem);
          }
          if (settings.forReacordDiscussion && atDataIndex === index && !query) {
            let elmListItem = $(`<div class='title mTop6 Bold Gray_9e'>${_l('参与者')}</div>`);
            elmListItem.appendTo(elmDropDownList);
          }

          if (settings.forReacordDiscussion && userIndex === index && !query) {
            let elmListItem = $(`<div class='title mTop6 Bold Gray_9e'>${_l('最常协作')}</div>`);
            elmListItem.appendTo(elmDropDownList);
          }

          if (settings.showAvatars) {
            var elmIcon = $(settings.templates.autocompleteListItemAvatar(autocompleteItemCollection[itemUid]));
            elmIcon.prependTo(elmListItem);
          }

          elmListItem = elmListItem.appendTo(elmDropDownList);
        });
      }

      if (results.groups && results.groups.length > 0) {
        _.each(results.groups, function (item, index) {
          var itemUid = _.uniqueId('mention_');

          autocompleteItemCollection[itemUid] = {
            id: htmlEncodeReg(item.groupId),
            value: item.name,
            avatar: item.avatar,
            display: htmlEncodeReg(item.name),
            type: 'group',
            content: utils.highlightTerm(
              doT.template(
                '<div class="itemContent"><div><span class="Gray_a">[群]</span><span class="ThemeColor3">{{! it.name}}</span><span class="Gray_a"></span></div><div><span class="Gray_a">{{! it.isAll ? "" : (it.project ? it.project.companyDisplayName : "好友")}}</span></div></div>'
              )(item),
              query,
            ),
          };

          var groupTag = '';
          if (item.isVerified == '1') {
            groupTag = "<span class='groupTag Font16 icon-official-group' title='官方群组'></span>";
          }

          var elmListItem = $(settings.templates.autocompleteListItem(autocompleteItemCollection[itemUid])).attr(
            'data-uid',
            itemUid,
          );

          if (!results.accounts.length && index === 0) {
            selectAutoCompleteItem(elmListItem);
          }

          if (settings.showAvatars) {
            var elmIcon = $(settings.templates.autocompleteListItemAvatar(autocompleteItemCollection[itemUid]));
            elmIcon.prependTo(elmListItem);
          }
          elmListItem = elmListItem.appendTo(elmDropDownList);
        });
      }

      elmAutocompleteList.show();
      elmDropDownList.show();

      if (results.accounts && results.accounts.length > 0 && results.groups && results.groups.length > 0) {
        elmAutocompleteList
          .find('li:eq(' + (results.accounts.length - 1) + ')')
          .css('borderBottom', '1px dashed #e3e3e3');
      }
    }

    function categoryPopulateDropdown(query, results) {
      elmAutocompleteList.show();

      if (!results || !results.length) {
        hideAutoComplete();
        return;
      }

      elmAutocompleteList.empty();
      var elmDropDownList = $('<ul>').appendTo(elmAutocompleteList).hide();

      if (results && results.length > 0) {
        _.each(results, function (item, index) {
          var itemUid = _.uniqueId('mention_');

          autocompleteItemCollection[itemUid] = _.extend({}, item);

          var elmListItem = $(
            settings.templates.categoryListItem({
              content: utils.highlightTerm(item.value, query),
            }),
          ).attr('data-uid', itemUid);

          if (index === 0) {
            selectAutoCompleteItem(elmListItem);
          }

          elmListItem = elmListItem.appendTo(elmDropDownList);
        });
      }

      elmAutocompleteList.show();
      elmDropDownList.show();
    }

    function getUsers(query, recordAtdatas = []) {
      if (promiseObj && promiseObj.abort) {
        promiseObj.abort();
      }
      if (recordAtdatas.length > 15 && settings.forReacordDiscussion) {
        let responseData = {};
        responseData.accounts = [
          {
            isAll: true,
            avatarMiddle: '/staticfiles/images/atAllUser.png',
            id: 'atAll',
            fullname: AT_ALL_TEXT[settings.sourceType],
            type: 'user',
          },
        ].concat(recordAtdatas);
        return populateDropdown(query, responseData);
      }

      let data = [];
      if (!query) {
        var additionalTerm = null;
        if (settings.isAtAll) {
          // @全体任务成员
          additionalTerm = {
            id: 'atAll',
            fullname: AT_ALL_TEXT[settings.sourceType],
          };
        }
        if (settings.isAtAll && settings.sourceType === SOURCE_TYPE.POST) {
          additionalTerm = {
            id: 'isCommentAtAll',
            fullname: AT_ALL_TEXT[settings.sourceType],
          };
        }

        if (additionalTerm) {
          data = [
            {
              isAll: true,
              avatarMiddle: '/staticfiles/images/atAllUser.png',
              id: additionalTerm.id,
              fullname: additionalTerm.fullname,
              type: 'user',
            },
          ];
        }
        let responseInitData = { accounts: data };
        if (recordAtdatas.length > 0 && settings.forReacordDiscussion) {
          responseInitData.accounts = data.concat(recordAtdatas);
        }
        settings.forReacordDiscussion && populateDropdown(query, responseInitData);
      }

      promiseObj = userAjax.getUsersByKeywords({
        search: settings.searchType,
        keywords: query,
        currentProjectId: settings.projectId,
      });

      promiseObj.then(function getUsersByKeywordsCb(responseData) {
        if (!query) {
          if (recordAtdatas.length > 0 && settings.forReacordDiscussion) {
            let ids = recordAtdatas.map(o => o.accountId);
            responseData.accounts = data.concat(recordAtdatas).concat(
              // _.take(
              //   responseData.accounts.filter(o => !ids.includes(o.accountId)),
              //   20 - recordAtdatas.length,
              // )
              responseData.accounts
                .filter(o => !ids.includes(o.accountId))
                .map(o => {
                  return {
                    ...o,
                    isAtData: false,
                  };
                }),
            );
          } else {
            responseData.accounts = data.concat(responseData.accounts);
          }
          if (
            settings.forReacordDiscussion &&
            !$('.workSheetCommentBox .commentBox .mentions-autocomplete-list').html()
          )
            return;
        }
        populateDropdown(query, responseData);
      });
    }

    function doSearch(query) {
      if (atLetterArr.indexOf(currentType) > -1) {
        //!query 使用sessionStorage  atData
        if (settings.forReacordDiscussion && !query) {
          let atData = sessionStorage.getItem('atData') || '[]';
          let recordAtdatas = JSON.parse(atData) || [];
          recordAtdatas = recordAtdatas.map(o => {
            return {
              ...o,
              isAtData: true,
            };
          });
          getUsers(query, recordAtdatas);
        } else {
          getUsers(query);
        }
      } else if (settings.showCategory && categoryLetterArr.indexOf(currentType) > -1) {
        promiseObj = categoryAjax.autoCompleteCategory({ keywords: query });

        promiseObj.then(function (result) {
          categoryPopulateDropdown(query, result);
        });
      }
    }

    function resetInput() {
      if (settings.reset) {
        elmInputBox.val('');
      }
      mentionsCollection = [];
      updateValues();
    }

    function storeData() {
      if (!elmInputBox.val()) return clearStoreData();
      var key = 'mentionsInputCache_' + md.global.Account.accountId + '_' + (settings.cacheKey || '');
      var data = {
        text: elmInputBox.val(),
        messageText: elmInputBox.data('messageText'),
        mentionsCollection: mentionsCollection,
      };
      safeLocalStorageSetItem(key, JSON.stringify(data));
    }

    function restoreData(callback) {
      var key = 'mentionsInputCache_' + md.global.Account.accountId + '_' + (settings.cacheKey || '');
      var json = localStorage.getItem(key);
      var data;
      try {
        data = json && JSON.parse(json);
      } catch (err) {
        data = null;
      }
      if (!data || !data.text) {
        resetInput();
        return callback(false);
      }
      mentionsCollection = data.mentionsCollection;
      elmInputBox.val(data.text);
      elmInputBox.data('messageText', data.messageText);

      updateValues();
      return callback(true, data);
    }

    function clearStoreData() {
      var key = 'mentionsInputCache_' + md.global.Account.accountId + '_' + (settings.cacheKey || '');
      localStorage.removeItem(key);
    }

    // Public methods
    return {
      init: function (domTarget) {
        domInput = domTarget;

        initTextarea();
        initAutocomplete();
        initMentionsOverlay();
        resetInput();

        if (settings.prefillMention) {
          addMention(settings.prefillMention);
        }
      },

      val: function (callback) {
        if (!_.isFunction(callback)) {
          return;
        }

        var value = mentionsCollection.length ? elmInputBox.data('messageText') : getInputBoxValue();
        callback.call(this, value);
      },

      setValue: function (text, messageText, mentionsCollectionArg) {
        mentionsCollection = mentionsCollectionArg;
        elmInputBox.val(text);
        elmInputBox.data('messageText', messageText);

        updateValues();
      },

      reset: function () {
        resetInput();
      },

      store: function () {
        storeData();
      },

      restore: function (callback) {
        restoreData(callback);
      },

      clearStore: function () {
        clearStoreData();
      },

      getMentions: function (callback) {
        if (!_.isFunction(callback)) {
          return;
        }

        callback.call(this, mentionsCollection);
      },
    };
  };

  $.fn.mentionsInput = function (method, settings) {
    var outerArguments = arguments;

    if (typeof method === 'object' || !method) {
      settings = method;
    }

    return this.each(function () {
      var instance = $.data(this, 'mentionsInput') || $.data(this, 'mentionsInput', new MentionsInput(settings));

      if (_.isFunction(instance[method])) {
        return instance[method].apply(this, Array.prototype.slice.call(outerArguments, 1));
      } else if (typeof method === 'object' || !method) {
        return instance.init.call(this, this);
      }
      $.error('Method ' + method + ' does not exist');
    });
  };
})(jQuery, _);
