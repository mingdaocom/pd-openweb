import '../css/mentionsInput.css';
import { getRequest, htmlEncodeReg, setCaretPosition, getCaretPosition } from 'src/util';
import _ from 'lodash';
const Request = getRequest();

(function ($) {
  // Handler for propertychange events only
  function propHandler() {
    const $this = $(this);
    if (window.event.propertyName == 'value' && !$this.data('triggering.inputEvent')) {
      $this.data('triggering.inputEvent', true).trigger('input');
      window.setTimeout(() => {
        $this.data('triggering.inputEvent', false);
      }, 0);
    }
  }

  $.event.special.input = {
    setup(data, namespaces) {
      let timer,
        // Get a reference to the element
        elem = this,
        // Store the current state of the element
        state = elem.value,
        // Create a dummy element that we can use for testing event support
        tester = document.createElement(this.tagName),
        // Check for native oninput
        oninput = 'oninput' in tester || checkEvent(tester),
        // Check for onpropertychange
        onprop = 'onpropertychange' in tester,
        // Generate a random namespace for event bindings
        ns = 'inputEventNS' + ~~(Math.random() * 10000000),
        // Last resort event names
        evts = ['focus', 'blur', 'paste', 'cut', 'keydown', 'drop', ''].join('.' + ns + ' ');

      function checkState() {
        const $this = $(elem);
        if (elem.value != state && !$this.data('triggering.inputEvent')) {
          state = elem.value;

          $this.data('triggering.inputEvent', true).trigger('input');
          window.setTimeout(() => {
            $this.data('triggering.inputEvent', false);
          }, 0);
        }
      }

      // Set up a function to handle the different events that may fire
      function handler(e) {
        // When focusing, set a timer that polls for changes to the value
        if (e.type == 'focus') {
          checkState();
          clearInterval(timer);
          timer = window.setInterval(checkState, 250);
        } else if (e.type == 'blur') {
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
      } else {
        // Else clutch at straws!
        $(this)
          .find('input, textarea')
          .andSelf()
          .filter('input, textarea')
          .bind(evts, handler);
      }
      $(this).data('inputEventHandlerNS', ns);
    },
    teardown() {
      const elem = $(this);
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
      let e = document.createEvent('KeyboardEvent'),
        ok = false,
        tester = function (e) {
          ok = true;
          e.preventDefault();
          e.stopPropagation();
        };

      // e.initKeyEvent("keypress", true, true, window, false, false, false, false, 0, "e".charCodeAt(0));

      document.body.appendChild(el);
      el.addEventListener('input', tester, false);
      // el.focus();
      // el.dispatchEvent(e);
      el.removeEventListener('input', tester, false);
      document.body.removeChild(el);
      return ok;
    } catch (error) {}
  }
})(jQuery);

/**
 *  @name                            Elastic
 *    @descripton                        Elastic is jQuery plugin that grow and shrink your textareas automatically
 *    @version                        1.6.11
 *    @requires                        jQuery 1.2.6+
 *
 *    @author                            Jan Jarfalk
 *    @author-email                    jan.jarfalk@unwrongest.com
 *    @author-website                    http://www.unwrongest.com
 *
 *    @licence                        MIT License - http://www.opensource.org/licenses/mit-license.php
 */

(function ($) {
  jQuery.fn.extend({
    elastic() {
      //	We will create a div clone of the textarea
      //	by copying these attributes from the textarea to the div.
      const mimics = [
        'paddingTop',
        'paddingRight',
        'paddingBottom',
        'paddingLeft',
        'fontSize',
        'lineHeight',
        'fontFamily',
        'width',
        'fontWeight',
        'border-top-width',
        'border-right-width',
        'border-bottom-width',
        'border-left-width',
        'borderTopStyle',
        'borderTopColor',
        'borderRightStyle',
        'borderRightColor',
        'borderBottomStyle',
        'borderBottomColor',
        'borderLeftStyle',
        'borderLeftColor',
      ];

      return this.each(function () {
        // Elastic only works on textareas
        if (this.type !== 'textarea') {
          return false;
        }

        let $textarea = jQuery(this),
          $twin = jQuery('<div />').css({
            position: 'absolute',
            display: 'none',
            'word-wrap': 'break-word',
            'white-space': 'pre-wrap',
          }),
          lineHeight = parseInt($textarea.css('line-height'), 10) || parseInt($textarea.css('font-size'), '10'),
          minheight = parseInt($textarea.css('height'), 10) || lineHeight * 3,
          maxheight = parseInt($textarea.css('max-height'), 10) || Number.MAX_VALUE,
          goalheight = 0;

        // Opera returns max-height of -1 if not set
        if (maxheight < 0) {
          maxheight = Number.MAX_VALUE;
        }

        // Append the twin to the DOM
        // We are going to meassure the height of this, not the textarea.
        $twin.appendTo($textarea.parent());

        // Copy the essential styles (mimics) from the textarea to the twin
        let i = mimics.length;
        while (i--) {
          $twin.css(mimics[i].toString(), $textarea.css(mimics[i].toString()));
        }

        // Updates the width of the twin. (solution for textareas with widths in percent)
        function setTwinWidth() {
          const curatedWidth = Math.floor(parseInt($textarea.width(), 10));
          if ($twin.width() !== curatedWidth) {
            $twin.css({ width: curatedWidth + 'px' });

            // Update height of textarea
            update(true);
          }
        }

        // Sets a given height and overflow state on the textarea
        function setHeightAndOverflow(height, overflow) {
          const curratedHeight = Math.floor(parseInt(height, 10));
          if ($textarea.height() !== curratedHeight) {
            $textarea.css({ height: curratedHeight + 'px', overflow });
          }
        }

        // This function will update the height of the textarea if necessary
        function update(forced) {
          // Get curated content from the textarea.
          const textareaContent = $textarea
            .val()
            .replace(/&/g, '&amp;')
            .replace(/ {2}/g, '&nbsp;')
            .replace(/<|>/g, '&gt;')
            .replace(/\n/g, '<br />');

          // Compare curated content with curated twin.
          const twinContent = $twin.html().replace(/<br>/gi, '<br />');

          if (forced || textareaContent + '&nbsp;' !== twinContent) {
            // Add an extra white space so new rows are added when you are at the end of a row.
            $twin.html(textareaContent + '&nbsp;');

            // Change textarea height if twin plus the height of one line differs more than 3 pixel from textarea height
            if (Math.abs($twin.height() + lineHeight - $textarea.height()) > 3) {
              const goalheight = $twin.height() + lineHeight;
              if (goalheight >= maxheight) {
                setHeightAndOverflow(maxheight, 'auto');
              } else if (goalheight <= minheight) {
                setHeightAndOverflow(minheight, 'hidden');
              } else {
                setHeightAndOverflow(goalheight, 'hidden');
              }
            }
          }
        }

        // Hide scrollbars
        $textarea.css({ overflow: 'hidden' });

        // Update textarea size on keyup, change, cut and paste
        $textarea.bind('keyup change cut paste', () => {
          update();
        });

        // Update width of twin if browser or textarea is resized (solution for textareas with widths in percent)
        $(window).bind('resize', setTwinWidth);
        $textarea.bind('resize', setTwinWidth);
        $textarea.bind('update', update);

        // Compact textarea on blur
        $textarea.bind('blur', () => {
          if ($twin.height() < maxheight) {
            if ($twin.height() > minheight) {
              $textarea.height($twin.height());
            } else {
              $textarea.height(minheight);
            }
          }
        });

        // And this line is to catch the browser paste event
        $textarea.bind('input paste', (e) => {
          setTimeout(update, 250);
        });

        // Run update once when elastic is initialized
        update();
      });
    },
  });
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
  // Settings
  const KEY = {
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
  const defaultSettings = {
    triggerChar: '@',
    onDataRequest: $.noop,
    minChars: 0,
    showAvatars: true,
    showCategory: false,
    elastic: false,
    submitBtn: '',
    reset: true,
    isTaskAtAll: false, // 任务中心讨论 @ 全体成员
    searchType: '0', // 用户搜索使用,
    $deferred: null,
    onSearch() {},
    filter() {},
    format(users) {
      const result = [];
      for (let i = 0; i < users.length; i++) {
        const user = users[i];
        if (user.accountId === md.global.Account.accountId || !user.accountId) {
          continue;
        }
        const _obj = {};
        _obj.id = user.accountId;
        _obj.name = htmlEncodeReg(user.fullname);
        _obj.logo = user.avatar;
        result.push(_obj);
      }
      return result;
    },
    onShow() {},
    allMemberData: {
      avatar: '/UIControl/mentioninput/images/taskAtUserAll.png',
      department: '',
      job: '',
      id: 'taskAtUserAll',
      name: '任务全体成员',
      type: 'user',
    },
    remoteURL: '/ajaxpage/GetUsersByKeywords.aspx',
    remoteURLParas: {},
    localResource: false,
    classes: {
      autoCompleteItemActive: 'active',
    },
    templates: {
      wrapper: _.template('<div class="mentions-input-box"></div>'),
      autocompleteList: _.template('<div class="mentions-autocomplete-list nano"><ul class="nano-content"></ul></div>'),
      autocompleteListItem: _.template('<li data-ref-id="<%= id %>" data-ref-type="<%= type %>" data-display="<%= display %>"><%= content %></li>'),
      autocompleteListItemAvatar: _.template('<img src="<%= avatar %>" />'),
      autocompleteListItemIcon: _.template('<div class="icon <%= icon %>"></div>'),
      mentionsOverlay: _.template('<div class="mentions"><div></div></div>'),
      mentionItemSyntax: _.template('<%= type %>:<%= id %>'),
      mentionItemHighlight: _.template('<strong><span>@<%= value %></span></strong>'),
      categoryListItem: _.template('<li><%= content %></li>'),
      groupUsers: _.template('<li class="userItem"><%= content %></li>'),
    },
    onSelected: null,
  };

  const utils = {
    highlightTerm(value, term) {
      if (!term && !term.length) {
        return value;
      }
      return value.replace(new RegExp('(?![^&;]+;)(?!<[^<>]*)(' + term + ')(?![^<>]*>)(?![^&;]+;)', 'gi'), '<b>$1</b>');
    },
    rtrim(string) {
      return string.replace(/\s+$/, '');
    },
  };

  const MentionsInput = function (settings) {
    let domInput, elmInputBox, elmInputWrapper, elmAutocompleteList, elmWrapperBox, elmMentionsOverlay, elmActiveAutoCompleteItem;
    let mentionsCollection = [];
    const autocompleteItemCollection = {};
    let inputBuffer = [];
    let isAt = false;
    let atPos = 0;
    let currentType;
    let currentDataQuery;

    let hasMore = true;

    settings = $.extend(true, {}, defaultSettings, settings);

    function initTextarea() {
      $(domInput).addClass('emojiFontFace');
      elmInputBox = $(domInput);

      if (elmInputBox.attr('data-mentions-input') == 'true') {
        return;
      }

      elmInputWrapper = elmInputBox.parent();
      elmWrapperBox = $(settings.templates.wrapper());
      elmWrapperBox.empty();
      elmInputBox.wrapAll(elmWrapperBox);
      elmWrapperBox = elmInputWrapper.find('> div');
      elmInputBox.attr('data-mentions-input', 'true');
      elmInputBox.bind('keydown', onInputBoxKeyDown);
      elmInputBox.bind('keyup', onInputBoxInput);
      elmInputBox.bind('focus', onInputBoxInput);
      elmInputBox.bind('blur', onInputBoxBlur);

      // Elastic textareas, internal setting for the Dispora guys
      if (settings.elastic) {
        elmInputBox.elastic();
      }
    }

    function initAutocomplete() {
      elmAutocompleteList = $(settings.templates.autocompleteList());
      elmAutocompleteList.appendTo(elmWrapperBox);
      elmAutocompleteList.delegate('li', 'mousedown', onAutoCompleteItemClick);
      let timer = null;
      elmAutocompleteList.nanoScroller({ scroll: 'top' }).bind('scrollend', () => {
        if (settings.pageIndex == 1) {
          settings.pageIndex = 2;
        }
        if (timer) {
          clearTimeout(timer);
        }
        timer = setTimeout(() => {
          console.log('load more @mentions');
          fetchMoreUserOnScrollEnd('');
          clearTimeout(timer);
        }, 300);
      });
    }

    function initMentionsOverlay() {
      elmMentionsOverlay = $(settings.templates.mentionsOverlay());
      elmMentionsOverlay.prependTo(elmWrapperBox);
    }

    function updateValues() {
      let syntaxMessage = getInputBoxValue();

      _.each(mentionsCollection, (mention) => {
        const textSyntax = settings.templates.mentionItemSyntax(mention);
        syntaxMessage = syntaxMessage.replace('@' + mention.value, textSyntax);
      });

      let mentionText = htmlEncodeReg(syntaxMessage);

      _.each(mentionsCollection, (mention) => {
        const formattedMention = _.extend({}, mention, { value: htmlEncodeReg(mention.value) });
        const textSyntax = settings.templates.mentionItemSyntax(formattedMention);
        const textHighlight = settings.templates.mentionItemHighlight(formattedMention);

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
      const inputText = getInputBoxValue();

      mentionsCollection = _.reject(mentionsCollection, (mention, index) => {
        return !mention.value || inputText.indexOf(mention.value) == -1;
      });
      mentionsCollection = _.compact(mentionsCollection);
    }

    function addMention(mention) {
      const currentMessage = `${getInputBoxValue().trim()} `;

      const position = getCaretPosition(elmInputBox[0]) + (mention.addAt ? 2 : 0);

      let startCaretPosition = 0;
      if ((mention.addAt ? false : isAt) && atPos < position) {
        // 中文问题
        startCaretPosition = position - currentDataQuery.length - 1;
      } else startCaretPosition = position - 1;

      const currentCaretPosition = position;

      const start = currentMessage.substr(0, startCaretPosition);
      const end = currentMessage.substr(currentCaretPosition, currentMessage.length);
      let startEndIndex;
      if (currentType == '@') {
        startEndIndex = (start + '@' + mention.value).length + 1;
        mention.type = mention.type || '';
        mentionsCollection.push(mention);
      } else if (settings.showCategory && currentType == '#') {
        startEndIndex = (start + '#' + mention.value + '#').length + 1;
      }

      isAt = false;
      atPos = 0;
      currentDataQuery = '';
      hideAutoComplete();
      let updatedMessageText;
      if (currentType == '@') {
        updatedMessageText = start.replace(/(@$)/g, '') + '@' + mention.value + ' ' + end;
      } else if (settings.showCategory && currentType == '#') {
        updatedMessageText = start + '#' + mention.value + '# ' + end;
      }

      if (updatedMessageText) {
        currentType = '';
        elmInputBox.val(updatedMessageText);
        updateValues();

        elmInputBox.focus();
        setCaretPosition(elmInputBox[0], startEndIndex);
        settings.onSelected && settings.onSelected(mention.value);
      }
    }

    function getInputBoxValue() {
      // return $.trim(elmInputBox.val());
      return elmInputBox.val();
    }

    function onAutoCompleteItemClick(e) {
      const elmTarget = $(this);
      const mention = autocompleteItemCollection[elmTarget.attr('data-uid')];
      addMention(mention);

      return false;
    }

    function onInputBoxBlur(e) {
      hideAutoComplete();
    }

    function onInputBoxInput(e) {
      updateValues();
      updateMentionsCollection();

      if (e.keyCode == 38 || e.keyCode == 40) return;
      const startPos = getCaretPosition(elmInputBox[0]);
      const currentMessage = getInputBoxValue();
      const startChar = currentMessage.substring(startPos - 1, startPos);
      if (startChar == '@' || (settings.showCategory && startChar == '#')) {
        atPos = startPos;
        isAt = true;
        currentType = startChar;
        settings.pageIndex = 1;
      } else if (startChar == ' ' || startChar == '') {
        isAt = false;
        currentType = '';
      }
      if (!isAt) {
        // 解决部分数据法恶心的问题
        const message = currentMessage.substring(atPos, startPos);
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
        const typedValue = String.fromCharCode(e.which || e.keyCode);
        inputBuffer.push(typedValue);
      }
    }

    function onInputBoxKeyDown(e) {
      if (e.ctrlKey && (e.keyCode == 13 || e.keyCode == 108)) {
        if (settings.submitBtn) {
          onInputBoxBlur(e);
          document.getElementById(settings.submitBtn).click();
        }
        return;
      }

      if (e.keyCode == KEY.LEFT || e.keyCode == KEY.RIGHT || e.keyCode == KEY.HOME || e.keyCode == KEY.END) {
        _.defer(resetBuffer);

        if (navigator.userAgent.indexOf('MSIE 9') > -1) {
          _.defer(updateValues);
        }

        return;
      }

      if (e.keyCode == KEY.BACKSPACE) {
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
          if (e.keyCode == KEY.DOWN) {
            if (elmActiveAutoCompleteItem && elmActiveAutoCompleteItem.length) {
              if (!elmActiveAutoCompleteItem.is(':last-child')) {
                elmCurrentAutoCompleteItem = elmActiveAutoCompleteItem.next();
                if (elmCurrentAutoCompleteItem.position().top >= elmAutocompleteList.height() - 80) {
                  elmAutocompleteList.nanoScroller().nanoScroller({ scrollTo: elmCurrentAutoCompleteItem });
                }
              }
            } else {
              elmCurrentAutoCompleteItem = elmAutocompleteList.find('li').first();
            }
          } else {
            elmCurrentAutoCompleteItem = $(elmActiveAutoCompleteItem).prev();
            if (!elmActiveAutoCompleteItem.is(':first-child') && elmCurrentAutoCompleteItem.position().top <= 20) {
              elmAutocompleteList.nanoScroller().nanoScroller({ scrollTo: elmCurrentAutoCompleteItem });
            }
          }

          if (elmCurrentAutoCompleteItem && elmCurrentAutoCompleteItem.length) {
            selectAutoCompleteItem(elmCurrentAutoCompleteItem);
          }

          return false;

        case KEY.RETURN:
        case KEY.TAB:
          if (elmActiveAutoCompleteItem && elmActiveAutoCompleteItem.length) {
            elmActiveAutoCompleteItem.trigger('mousedown');
            return false;
          }

          break;
      }

      return true;
    }

    /**
     * 获取更多用户
     * @param query
     */
    function fetchMoreUserOnScrollEnd(query) {
      if (!hasMore) {
        return false;
      }
      const paras = settings.remoteURLParas;
      paras.pageIndex = settings.pageIndex;
      settings.ajaxController.getGroupUsers(paras).done((data) => {
        let result = null;
        const users = settings.format(data.groupUsers);
        settings.pageIndex += 1;
        if (users.length <= 0) {
          hasMore = false;
          return false;
        }
        result = { UserItems: users, GroupItems: [] };
        renderMoreUserList(query, result);
      });
    }

    /**
     * 记载数据之后，添加dom
     * @param query
     * @param results
     */
    function renderMoreUserList(query, results) {
      let $scrollTo;
      const elmDropDownList = elmAutocompleteList.find('ul');

      if (results.UserItems && results.UserItems.length > 0) {
        results.UserItems = results.UserItems.filter((user) => {
          if (elmDropDownList.find('[data-accountid="' + user.id + '"]').length) {
            console.log(user.id);
            return false;
          } else {
            return true;
          }
        });
        _.each(results.UserItems, (item, index) => {
          const itemUid = _.uniqueId('mention_');

          autocompleteItemCollection[itemUid] = _.extend({}, item, { value: item.name });

          let elmListItem = $(
            settings.templates.groupUsers({
              id: htmlEncodeReg(item.id),
              display: htmlEncodeReg(item.name),
              type: htmlEncodeReg(item.type),
              // 'content': utils.highlightTerm("<span class='ThemeColor3 limitWidth'>" + item.name + "</span><span class='limitWidth Gray_9'>" + item.department + "</span><span class='limitWidth Gray_9'>" + item.job + "</span><div class='Clear'></div>", query)
              content: utils.highlightTerm(
                "<div class='memberInfo data-accountid='" +
                  item.id +
                  "'><span class='userAvatar " +
                  item.status +
                  "'><img src=" +
                  item.logo +
                  '></span>' +
                  item.name +
                  "</div> <span class='status'><i class=" +
                  item.statusClass +
                  '></i></span>',
                query
              ),
            })
          ).attr('data-uid', itemUid);

          if (settings.showAvatars) {
            const elmIcon = $(settings.templates.autocompleteListItemAvatar({ avatar: item.avatar }));
            elmIcon.prependTo(elmListItem);
          }
          elmListItem = elmListItem.appendTo(elmDropDownList);

          if (index === 0) {
            $scrollTo = elmListItem;
          }
        });
      }
      // elmAutocompleteList
      //    .nanoScroller()
      //    .nanoScroller({scrollTo: $scrollTo.prevAll()});
      // .nanoScroller({scrollTop: 300 });
      if (results.UserItems && results.UserItems.length > 0 && (results.GroupItems && results.GroupItems.length > 0)) {
        elmAutocompleteList.find('li:eq(' + (results.UserItems.length - 1) + ')').css('borderBottom', '1px dashed #e3e3e3');
      }
    }

    function hideAutoComplete() {
      elmActiveAutoCompleteItem = null;
      elmAutocompleteList.find('ul').empty();
      elmAutocompleteList.hide();
      settings.pageIndex = 1;
    }

    function selectAutoCompleteItem(elmItem) {
      elmItem.addClass(settings.classes.autoCompleteItemActive);
      elmItem.siblings().removeClass(settings.classes.autoCompleteItemActive);

      elmActiveAutoCompleteItem = elmItem;
    }

    function populateDropdown(query, results) {
      settings.onShow.call(this, elmAutocompleteList);
      elmAutocompleteList.show();
      elmAutocompleteList.nanoScroller({ scroll: 'top' });

      if (!results.UserItems.length && !results.GroupItems.length) {
        hideAutoComplete();
        return;
      }

      elmAutocompleteList.find('ul').empty();
      const elmDropDownList = elmAutocompleteList.find('ul');

      if (results.UserItems && results.UserItems.length > 0) {
        results.UserItems = results.UserItems.filter((user) => {
          if (elmDropDownList.find('[data-accountid="' + user.id + '"]').length) {
            console.log(user.id);
            return false;
          } else {
            return true;
          }
        });
        _.each(results.UserItems, (item, index) => {
          const itemUid = _.uniqueId('mention_');

          autocompleteItemCollection[itemUid] = _.extend({}, item, { value: item.name });

          let elmListItem = $(
            settings.templates.groupUsers({
              id: htmlEncodeReg(item.id),
              display: htmlEncodeReg(item.name),
              type: htmlEncodeReg(item.type),
              // 'content': utils.highlightTerm("<span class='ThemeColor3 limitWidth'>" + item.name + "</span><span class='limitWidth Gray_9'>" + item.department + "</span><span class='limitWidth Gray_9'>" + item.job + "</span><div class='Clear'></div>", query)
              content: utils.highlightTerm(
                "<div class='memberInfo' data-accountid='" +
                  item.id +
                  "'><span class='userAvatar " +
                  item.status +
                  "'><img src=" +
                  item.logo +
                  '></span>' +
                  item.name +
                  "</div> <span class='status'><i class=" +
                  item.statusClass +
                  '></i></span>',
                query
              ),
            })
          ).attr('data-uid', itemUid);

          if (index === 0) {
            selectAutoCompleteItem(elmListItem);
          }

          if (settings.showAvatars) {
            const elmIcon = $(settings.templates.autocompleteListItemAvatar({ avatar: item.avatar }));
            elmIcon.prependTo(elmListItem);
          }
          elmListItem = elmListItem.appendTo(elmDropDownList);
        });
      }

      if (results.GroupItems && results.GroupItems.length > 0) {
        _.each(results.GroupItems, (item, index) => {
          const itemUid = _.uniqueId('mention_');

          autocompleteItemCollection[itemUid] = _.extend({}, item, { value: item.name });

          let groupTag = '';
          if (item.is_public == '0' && item.isVerified == '1') {
            groupTag =
              "<span class='groupTag icon-private-group Gray_c6 Font16' title='私有群组'></span><span class='groupTag mRight5 Font16 icon-official-group ShaYellowNew' title='官方群组'></span>";
          } else if (item.is_public == '0') groupTag = "<span class='groupTag Font16 icon-private-group Gray_c6' title='私有群组'></span>";
          else if (item.isVerified == '1') groupTag = "<span class='groupTag Font16 icon-official-group ShaYellowNew' title='官方群组'></span>";

          let elmListItem = $(
            settings.templates.autocompleteListItem({
              id: htmlEncodeReg(item.id),
              display: htmlEncodeReg(item.name),
              type: htmlEncodeReg(item.type),
              content: utils.highlightTerm(
                "<span class='ThemeColor3 groupLimitWidth'>[群]" +
                  item.name +
                  "</span><span class='Gray_9 Left'>(" +
                  item.user_count +
                  ')</span>' +
                  groupTag +
                  "<div class='Clear'></div>",
                query
              ),
            })
          ).attr('data-uid', itemUid);

          if (!results.UserItems.length && index === 0) {
            selectAutoCompleteItem(elmListItem);
          }

          if (settings.showAvatars) {
            const elmIcon = $(settings.templates.autocompleteListItemAvatar({ avatar: item.avatar }));
            elmIcon.prependTo(elmListItem);
          }
          elmListItem = elmListItem.appendTo(elmDropDownList);
        });
      }

      elmAutocompleteList.show();
      elmDropDownList.show();

      if (results.UserItems && results.UserItems.length > 0 && (results.GroupItems && results.GroupItems.length > 0)) {
        elmAutocompleteList.find('li:eq(' + (results.UserItems.length - 1) + ')').css('borderBottom', '1px dashed #e3e3e3');
      }
    }

    function categoryPopulateDropdown(query, results) {
      elmAutocompleteList.show();

      if (!results.Categorys || !results.Categorys.length) {
        hideAutoComplete();
        return;
      }

      elmAutocompleteList.empty();
      const elmDropDownList = $('<ul>')
        .appendTo(elmAutocompleteList)
        .hide();

      if (results.Categorys && results.Categorys.length > 0) {
        _.each(results.Categorys, (item, index) => {
          const itemUid = _.uniqueId('mention_');

          autocompleteItemCollection[itemUid] = _.extend({}, item, { value: item.name });

          let elmListItem = $(
            settings.templates.categoryListItem({
              content: utils.highlightTerm(item.name, query),
            })
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

    function doSearch(query) {
      if (currentType == '@') {
        let gID = '';
        if (Request.gID) gID = Request.gID;

        if (settings.localResource) {
          const searchData = {
            UserItems: settings.onSearch(query),
            GroupItems: [],
          };

          populateDropdown(query, searchData);
        }
        const paras = settings.remoteURLParas;
        paras.type = 1;
        hasMore = true;
        if (!query) {
          paras.pageIndex = settings.pageIndex;
          delete paras.keywords;
          settings.ajaxController.getGroupUsers(paras).done((data) => {
            let users = settings.format(data.groupUsers);
            users = settings.addAtAll(query).concat(users);
            settings.pageIndex = 2;
            const result = { UserItems: users, GroupItems: [] };
            populateDropdown(query, result);
          });
        } else {
          paras.keywords = query;
          paras.pageIndex = 1;
          if (settings.$deferred) {
            settings.$deferred.abort();
          }
          settings.$deferred = settings.ajaxController.getGroupUsers(paras);
          settings.$deferred.done((data) => {
            // 个人化
            let users = settings.format(data.groupUsers);
            users = settings.addAtAll(query).concat(users);
            settings.pageIndex = 1;
            const result = { UserItems: users, GroupItems: [] };
            populateDropdown(query, result);
          });
          elmAutocompleteList.nanoScroller({ scroll: 'top' });
        }
      }
    }

    function resetInput() {
      if (settings.reset) elmInputBox.val('');
      mentionsCollection = [];
      updateValues();
    }

    // Public methods
    return {
      init(domTarget) {
        domInput = domTarget;

        initTextarea();
        initAutocomplete();
        initMentionsOverlay();
        resetInput();

        if (settings.prefillMention) {
          addMention(settings.prefillMention);
        }
      },

      val(callback) {
        if (!_.isFunction(callback)) {
          return;
        }

        const value = mentionsCollection.length ? elmInputBox.data('messageText') : getInputBoxValue();
        callback.call(this, value);
      },

      reset() {
        resetInput();
      },

      getMentions(callback) {
        if (!_.isFunction(callback)) {
          return;
        }

        callback.call(this, mentionsCollection);
      },

      addMention(user) {
        currentType = '@';
        addMention(user);
      },
    };
  };

  $.fn.wcMentionsInput = function (method, settings) {
    const outerArguments = arguments;

    if (typeof method === 'object' || !method) {
      settings = method;
    }

    return this.each(function () {
      const instance = $.data(this, 'mentionsInput') || $.data(this, 'mentionsInput', new MentionsInput(settings));

      if (_.isFunction(instance[method])) {
        return instance[method].apply(this, Array.prototype.slice.call(outerArguments, 1));
      } else if (typeof method === 'object' || !method) {
        return instance.init.call(this, this);
      } else {
        $.error('Method ' + method + ' does not exist');
      }
    });
  };
})(jQuery, _);
