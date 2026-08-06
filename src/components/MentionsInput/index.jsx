import React, { Fragment, useEffect, useRef, useState } from 'react';
import cx from 'classnames';
import _ from 'lodash';
import Trigger from 'rc-trigger';
import { Icon } from 'ming-ui';
import functionWrap from 'ming-ui/components/FunctionWrap';
import { dialogSelectUser } from 'ming-ui/functions';
import categoryApi from 'src/api/category';
import groupApi from 'src/api/group';
import personalStyleAjax from 'src/api/personalStyle';
import userApi from 'src/api/user';
import { AT_ALL_TEXT, SOURCE_TYPE } from 'src/components/comment/config';
import PersonalStatus from 'src/pages/chat/components/MyStatus/PersonalStatus';
import { getCaretPosition, setCaretPosition } from 'src/utils/common';
import { htmlEncodeReg } from 'src/utils/common';
import './index.less';

// 全角和半角
const categoryLetterArr = ['#', '＃'];
const atLetterArr = ['@', '＠'];

const escapeRegExp = value => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const highlightTerm = (value, term) => {
  if (!term && !term?.length) {
    return value;
  }

  return value.replace(
    new RegExp('(?![^&;]+;)(?!<[^<>]*)(' + escapeRegExp(term) + ')(?![^<>]*>)(?![^&;]+;)', 'gi'),
    '<b>$1</b>',
  );
};

const addressBookSelectConfig = {
  isAddressBookSelect: true,
  id: 'addressBookSelect',
  fullname: _l('通讯录'),
  type: 'user',
};

const MentionsInput = props => {
  const {
    input,
    projectId,
    isAddressBookSelect = !md.global.Account.isPortal,
    showCategory = false,
    isAtAll = false,
    searchType = 0,
    sourceType = SOURCE_TYPE.POST,
    popupAlignOffset,
    popupAlignPoints,
    getPopupContainer,
    getPopupMaxHeight,
    defaultMaxHeight,
    getAtData,
    initCallback,
  } = props;
  const [triggerPopupVisible, setTriggerPopupVisible] = useState(false);
  const [results, setResults] = useState({});
  const [loading, setLoading] = useState(false);
  const [activeId, setActiveId] = useState('');
  const popupVisible = useRef(false);
  const popupRef = useRef(null);
  const chatPage = useRef({
    query: '',
    pageIndex: 1,
    isMore: true,
    accounts: [],
  });
  const mentionItemSyntax =
    sourceType === SOURCE_TYPE.POST ? _.template('<%= type %>:<%= id %>') : _.template('[aid]<%= id %>[/aid]');
  const mentionAllSyntax =
    sourceType === SOURCE_TYPE.POST ? _.template('<%= type %>:<%= id %>') : _.template('[all]<%= id %>[/all]');
  const rect = input.getBoundingClientRect();
  const timerId = useRef(null);
  const debouncedSearch = useRef(null);
  const mentionState = useRef({
    isAt: false,
    atPos: 0,
    currentType: null,
    currentDataQuery: null,
    promiseObj: null,
    requestId: 0,
    externalResults: {},
    externalActiveId: '',
    mentionsCollection: [],
  });
  const getMentionsCollection = () => mentionState.current.mentionsCollection || [];

  const createRequestId = () => {
    mentionState.current.requestId += 1;
    return mentionState.current.requestId;
  };

  const isLatestRequest = requestId => mentionState.current.requestId === requestId;

  const syncMentionsCollection = message => {
    const mentionTextCounts = {};
    const mentionsCollection = getMentionsCollection().filter(mention => {
      const mentionText = '@' + mention.fullname;
      const count = message.split(mentionText).length - 1;
      const usedCount = mentionTextCounts[mentionText] || 0;

      if (usedCount < count) {
        mentionTextCounts[mentionText] = usedCount + 1;
        return true;
      }

      return false;
    });

    mentionState.current.mentionsCollection = mentionsCollection;
    return mentionsCollection;
  };

  const updateTriggerPopupVisible = visible => {
    if (!visible) {
      createRequestId();
    }

    popupVisible.current = visible;
    setTriggerPopupVisible(visible);
  };

  useEffect(() => {
    debouncedSearch.current = _.debounce(query => doSearch(query), 200);
    input.addEventListener('focus', handleValueChange);
    input.addEventListener('keyup', handleValueChange);
    input.addEventListener('keydown', handleKeydown);
    input.addEventListener('blur', handleBlur);
    input.val = callback => {
      if (!_.isFunction(callback)) {
        return;
      }

      var value = getMentionsCollection().length ? input.messageText : input.value;
      callback(value);
    };

    input.setValue = (text, messageText, mentionsCollectionArg) => {
      mentionState.current.mentionsCollection = mentionsCollectionArg || [];
      input.value = text;
      input.messageText = messageText;
      updateValues();
    };

    input.reset = () => {
      input.value = '';
      mentionState.current.mentionsCollection = [];
      updateValues();
    };

    input.clearStore = () => {
      var key = 'mentionsInputCache_' + md.global.Account.accountId + '_' + (props.cacheKey || '');
      localStorage.removeItem(key);
    };

    input.store = () => {
      if (!input.value) {
        input.clearStore();
        return;
      }

      var key = 'mentionsInputCache_' + md.global.Account.accountId + '_' + (props.cacheKey || '');
      var data = {
        text: input.value,
        messageText: input.messageText,
        mentionsCollection: getMentionsCollection(),
      };
      safeLocalStorageSetItem(key, JSON.stringify(data));
    };

    input.restore = callback => {
      var key = 'mentionsInputCache_' + md.global.Account.accountId + '_' + (props.cacheKey || '');
      var json = localStorage.getItem(key);
      var data;
      try {
        data = json && safeParse(json);
      } catch (err) {
        console.log(err);
        data = null;
      }

      if (!data || !data.text) {
        mentionState.current.mentionsCollection = [];
        return callback(false);
      }

      mentionState.current.mentionsCollection = data.mentionsCollection || [];
      input.value = data.text;
      input.messageText = data.messageText;

      updateValues();
      return callback(true, data);
    };

    input.getMentions = callback => {
      callback && callback(getMentionsCollection());
    };

    input.addMention = user => {
      mentionState.current.currentType = '@';
      handleAddMention(user);
    };

    input.destroy = () => {
      props.onClose();
    };

    input.updateValue = handleValueChange;
    initCallback && initCallback();
    return () => {
      input.removeEventListener('focus', handleValueChange);
      input.removeEventListener('keyup', handleValueChange);
      input.removeEventListener('keydown', handleKeydown);
      input.removeEventListener('blur', handleBlur);
      clearTimeout(timerId.current);
      debouncedSearch.current && debouncedSearch.current.cancel();
      const { promiseObj } = mentionState.current;

      if (promiseObj && promiseObj.abort) {
        promiseObj.abort();
      }
    };
  }, []);

  const handleBlur = () => {
    timerId.current = setTimeout(() => {
      updateTriggerPopupVisible(false);
    }, 500);
  };

  const handleSelectUser = () => {
    updateTriggerPopupVisible(false);
    dialogSelectUser({
      showMoreInvite: false,
      overlayClosable: false,
      SelectUserSettings: {
        projectId: _.find(md.global.Account.projects, { projectId }) ? projectId : undefined,
        selectedAccountIds: [],
        filterAccountIds: [md.global.Account.accountId],
        includeMySelf: false,
        callback: users => {
          handleAddMention(
            users.map(user => {
              return {
                type: 'user',
                fullname: user.fullname,
                id: user.accountId,
              };
            }),
          );
        },
      },
    });
  };

  const handleAddMention = mention => {
    const state = mentionState.current;
    const currentType = state.currentType;
    var currentMessage = input.value;
    var position = getCaretPosition(input);

    var startCaretPosition = 0;
    if (state.isAt && state.atPos < position) {
      // 中文问题
      startCaretPosition = position - (state.currentDataQuery || '').length - 1;
    } else {
      startCaretPosition = position - 1;
    }

    var currentCaretPosition = position;
    var start = currentMessage.substr(0, startCaretPosition);
    var end = currentMessage.substr(currentCaretPosition, currentMessage.length);
    var startEndIndex;
    if (atLetterArr.indexOf(currentType) > -1) {
      if (_.isArray(mention)) {
        const value = mention.map(item => '@' + item.fullname).join(' ');
        startEndIndex = (start + value).length + 1;
        state.mentionsCollection = getMentionsCollection().concat(mention);
      } else {
        startEndIndex = (start + '@' + mention.fullname).length + 1;
        state.mentionsCollection = getMentionsCollection().concat(mention);
      }
    } else if (showCategory && categoryLetterArr.indexOf(currentType) > -1) {
      startEndIndex = (start + '#' + mention.value + '#').length + 1;
    }

    state.isAt = false;
    state.atPos = 0;
    state.currentDataQuery = '';

    var updatedMessageText;
    if (atLetterArr.indexOf(currentType) > -1) {
      if (_.isArray(mention)) {
        const value = mention.map(item => `@` + item.fullname + ' ').join('');
        updatedMessageText = start + value + end;
      } else {
        updatedMessageText = start + '@' + mention.fullname + ' ' + end;
      }
    } else if (showCategory && categoryLetterArr.indexOf(currentType) > -1) {
      updatedMessageText = start + '#' + mention.value + '# ' + end;
    }

    if (updatedMessageText) {
      state.currentType = '';
      input.value = updatedMessageText;
      updateValues();
      input.focus();
      setCaretPosition(input, startEndIndex);
      props.onSelected && props.onSelected(mention.fullname);
    }

    updateTriggerPopupVisible(false);
  };

  const handleScroll = event => {
    const { scrollTop, scrollHeight, clientHeight } = event.target;

    if (
      sourceType === SOURCE_TYPE.CHAT &&
      scrollTop + clientHeight >= scrollHeight &&
      !loading &&
      chatPage.current.isMore
    ) {
      getUsers(mentionState.current.currentDataQuery, [], createRequestId(), true);
    }
  };

  const updateValues = () => {
    var syntaxMessage = input.value;
    const mentionsCollection = syncMentionsCollection(syntaxMessage);

    _.each(mentionsCollection, function (mention) {
      var textSyntax = mentionItemSyntax(mention);
      if (mention.id === 'atAll' || mention.id === 'isCommentAtAll') {
        // atAll 特殊处理 转化为 [all]atAll[all] 或者 user:isCommentAtAll
        textSyntax = mentionAllSyntax(mention);
      }

      syntaxMessage = syntaxMessage.replace('@' + mention.fullname, textSyntax);
    });

    input.messageText = syntaxMessage;
  };

  const handleValueChange = e => {
    updateValues();

    const state = mentionState.current;

    if (timerId.current) {
      clearTimeout(timerId.current);
    }

    const target = e?.target || input;
    const keyCode = e?.keyCode;

    if (!target) {
      return;
    }

    if ([38, 40, 16].indexOf(keyCode) > -1) {
      return;
    }

    let startPos = getCaretPosition(target);
    let currentMessage = target.value;
    let startChar = currentMessage.substring(startPos - 1, startPos);

    if (atLetterArr.indexOf(startChar) > -1 || (showCategory && categoryLetterArr.indexOf(startChar) > -1)) {
      state.atPos = startPos;
      state.isAt = true;
      state.currentType = startChar;
    } else if (startChar == ' ' || startChar == '') {
      state.isAt = false;
      state.currentType = '';
    }

    if (!state.isAt) {
      // 解决部分数据法恶心的问题
      var message = currentMessage.substring(state.atPos, startPos);
      if (
        (message.indexOf(' ') == -1 && message.indexOf('\n') == -1) ||
        (window.isSafari && atLetterArr.includes(message.charAt(message.length - 1)))
      ) {
        // 没有空格 没有换行，重新激活搜索
        state.isAt = true;
        state.currentType = currentMessage.substring(state.atPos - 1, state.atPos);
      }
    }

    if (
      currentMessage &&
      atLetterArr.includes(currentMessage.substring(currentMessage.length, currentMessage.length - 1))
    ) {
      state.currentType = '@';
      state.currentDataQuery = '';
      debouncedSearch.current && debouncedSearch.current.cancel();
      _.defer(() => doSearch(''));
      return;
    }

    if (state.isAt && state.atPos <= getCaretPosition(target)) {
      state.currentDataQuery = currentMessage.substring(state.atPos, getCaretPosition(target));
      debouncedSearch.current(state.currentDataQuery);
    } else {
      debouncedSearch.current && debouncedSearch.current.cancel();
      updateTriggerPopupVisible(false);
    }
  };

  const handleKeydown = e => {
    const state = mentionState.current;
    const { which } = e;
    const { accounts = [], groups = [], categorys = [] } = state.externalResults;
    const visible = popupVisible.current;

    if (e.ctrlKey && (e.keyCode === 13 || e.keyCode === 108)) {
      if (props.submitBtn) {
        handleBlur();
        document.getElementById(props.submitBtn).click();
      }

      return;
    }

    if (!visible) return;

    const res = accounts.concat(groups, categorys);
    let index = _.findIndex(res, { id: state.externalActiveId });

    if (which === 38) {
      e.stopPropagation();
      e.preventDefault();
      if (index === 0) return;
      const newIndex = index ? index - 1 : res.length - 1;
      const id = _.get(res[newIndex], 'id') || 0;
      state.externalActiveId = id;
      setActiveId(id);
      setTimeout(() => adjustViewport('up'), 0);
    }

    if (which === 40) {
      e.stopPropagation();
      e.preventDefault();
      if (index === res.length - 1) return;
      const newIndex = index + 1;
      const id = _.get(res[newIndex], 'id') || 0;
      state.externalActiveId = id;
      setActiveId(id);
      setTimeout(() => adjustViewport('down'), 0);
    }

    if (which === 13) {
      e.stopPropagation();
      e.preventDefault();
      if (state.externalActiveId === 'addressBookSelect' && sourceType !== SOURCE_TYPE.CHAT) {
        handleSelectUser();
        return;
      }

      res[index] && handleAddMention(res[index]);
    }
  };

  const adjustViewport = direction => {
    const wrapEl = popupRef.current;
    const activeEl = wrapEl ? wrapEl.querySelector('.mentionItem.active') : null;

    if (activeEl) {
      if (
        direction === 'up' &&
        (activeEl.offsetTop < 0 || activeEl.offsetTop + activeEl.clientHeight >= wrapEl.clientHeight)
      ) {
        wrapEl.scrollTop = wrapEl.scrollTop - activeEl.clientHeight;
      }

      if (direction === 'down' && activeEl.offsetTop + activeEl.clientHeight >= wrapEl.clientHeight) {
        wrapEl.scrollTop = wrapEl.scrollTop + activeEl.clientHeight;
      }
    }
  };

  const doSearch = query => {
    const state = mentionState.current;
    const requestId = createRequestId();

    if (atLetterArr.indexOf(state.currentType) > -1) {
      if (props.forReacordDiscussion) {
        let recordAtdatas = (_.isFunction(getAtData) ? getAtData() : props.atData) || [];
        recordAtdatas = recordAtdatas.map(o => {
          return {
            ...o,
            id: o.accountId,
            isAtData: true,
          };
        });
        getUsers(query, recordAtdatas, requestId);
      } else {
        getUsers(query, [], requestId);
      }
    } else if (showCategory && categoryLetterArr.indexOf(state.currentType) > -1) {
      if (state.promiseObj && state.promiseObj.abort) {
        state.promiseObj.abort();
      }

      state.promiseObj = categoryApi.autoCompleteCategory({ keywords: query });
      state.promiseObj.then(function (result) {
        if (!isLatestRequest(requestId)) return;

        populateDropdown(query, {
          categorys: result.map(item => {
            return {
              ...item,
              fullname: item.value,
              showFullname: highlightTerm(htmlEncodeReg(item.value), query),
            };
          }),
        });
        updateTriggerPopupVisible(true);
      });
    }
  };

  const getUsers = async (query, recordAtdatas = [], requestId = createRequestId(), isLoadMore = false) => {
    const state = mentionState.current;

    if (state.promiseObj && state.promiseObj.abort) {
      state.promiseObj.abort();
    }

    // chat 群组成员
    if (sourceType === SOURCE_TYPE.CHAT) {
      const { chatParas } = props;
      const pageSize = 15;
      const pageQuery = query || '';
      const pageIndex = isLoadMore && chatPage.current.query === pageQuery ? chatPage.current.pageIndex : 1;
      setLoading(true);
      state.promiseObj = groupApi
        .getGroupUsers({
          pageSize,
          pageIndex,
          groupId: chatParas.groupId,
          keywords: query,
        })
        .then(data => {
          if (!isLatestRequest(requestId)) return;

          const { groupUsers } = data;
          const responseData = { accounts: pageIndex === 1 ? [] : chatPage.current.accounts };
          const atAll = [
            {
              type: 'user',
              id: 'all',
              fullname: _l('全体成员'),
              avatar: chatParas.avatar,
            },
          ];
          const accounts = groupUsers
            .filter(item => item.accountId !== md.global.Account.accountId)
            .map(item => {
              return {
                ...item,
                type: 'user',
                id: item.accountId,
                showFullname: highlightTerm(htmlEncodeReg(item.fullname), query),
              };
            });

          if (pageIndex === 1) {
            responseData.accounts = query ? accounts : atAll.concat(accounts);
          } else {
            responseData.accounts = responseData.accounts.concat(accounts);
          }

          chatPage.current = {
            query: pageQuery,
            pageIndex: pageIndex + 1,
            isMore: groupUsers.length === pageSize,
            accounts: responseData.accounts,
          };
          updateTriggerPopupVisible(responseData.accounts.length ? true : false);
          populateDropdown(query, responseData);

          setLoading(false);
        });
      return;
    }

    let data = [];

    if (!query) {
      var additionalTerm = null;
      if (isAtAll) {
        // @全体任务成员
        additionalTerm = {
          id: 'atAll',
          fullname: AT_ALL_TEXT[sourceType],
        };
      }

      if (isAtAll && sourceType === SOURCE_TYPE.POST) {
        additionalTerm = {
          id: 'isCommentAtAll',
          fullname: AT_ALL_TEXT[sourceType],
        };
      }

      if (!isAtAll && !categorys.length && isAddressBookSelect) {
        data = [addressBookSelectConfig];
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
        if (isAddressBookSelect) {
          data = data.concat(addressBookSelectConfig);
        }
      }

      let responseInitData = { accounts: data };
      props.forReacordDiscussion && isLatestRequest(requestId) && populateDropdown(query, responseInitData);
    }

    // 获取参与者的个人状态
    const statusOptionsData = recordAtdatas.length
      ? await personalStyleAjax.getAccountsPersonalStatus({
          accountIds: recordAtdatas.map(o => o.accountId),
        })
      : null;

    if (!isLatestRequest(requestId)) return;

    recordAtdatas =
      statusOptionsData && statusOptionsData.onStatusOptions && statusOptionsData.onStatusOptions.length
        ? recordAtdatas.map(account => ({
            ...account,
            onStatusOption: statusOptionsData.onStatusOptions.find(o => o.accountId === account.accountId),
          }))
        : recordAtdatas;

    state.promiseObj = userApi.getUsersByKeywords({
      search: searchType,
      keywords: query,
      currentProjectId: projectId,
    });

    state.promiseObj.then(function getUsersByKeywordsCb(responseData) {
      if (!isLatestRequest(requestId)) return;

      const originAccounts = _.cloneDeep(responseData.accounts);

      if (!query) {
        if (recordAtdatas.length > 0 && props.forReacordDiscussion) {
          let ids = recordAtdatas.map(o => o.accountId);
          responseData.accounts = data.concat(recordAtdatas).concat(
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
      } else if (recordAtdatas.length > 0 && props.forReacordDiscussion) {
        responseData.accounts = _.uniqBy(
          data.concat(recordAtdatas.filter(o => o.fullname.includes(query))).concat(
            responseData.accounts.map(o => {
              return {
                ...o,
                isAtData: false,
              };
            }),
          ),
          'accountId',
        );
      }

      let atDataIndex = null;
      let userIndex = null;

      responseData.accounts = responseData.accounts.map((item, index) => {
        if (item.isAtData && atDataIndex == null && props.forReacordDiscussion && !query) {
          atDataIndex = index;
          item.atDataIndex = index;
        }

        if (!item.isAtData && !item.isAll && !item.isAddressBookSelect && userIndex == null && !query) {
          userIndex = index;
          item.userIndex = index;
        }

        return {
          ...item,
          type: 'user',
          id: item.id || item.accountId,
          showFullname: highlightTerm(htmlEncodeReg(item.fullname), query),
          onStatusOption:
            item?.onStatusOption || originAccounts.find(v => v.accountId === item.accountId)?.onStatusOption,
        };
      });
      responseData.groups = responseData.groups.map(item => {
        return {
          ...item,
          id: item.groupId,
          type: 'group',
          fullname: item.name,
          showFullname: highlightTerm(htmlEncodeReg(item.name), query),
        };
      });
      updateTriggerPopupVisible(true);
      populateDropdown(query, responseData);
    });
  };

  const populateDropdown = (query, results) => {
    const { accounts = [], categorys = [] } = results;
    const id = _.get(accounts[0] || categorys[0], 'id');
    setActiveId(id);
    setResults(results);
    mentionState.current.externalResults = results;
    mentionState.current.externalActiveId = id;
  };

  const { accounts = [], groups = [], categorys = [] } = results;
  const isCategory = showCategory && categoryLetterArr.indexOf(mentionState.current.currentType) > -1;

  const getMaxHeight = () => {
    const max = defaultMaxHeight || document.body.clientHeight / 2;
    const isBody = getPopupContainer ? getPopupContainer().tagName === 'BODY' : true;

    if (isBody) {
      const top = rect.top;
      const bottom = document.body.clientHeight - (rect.top + rect.height);

      if (top < max && bottom > max) {
        return max;
      }

      return top > max ? max : top - 10;
    } else {
      const value = getPopupMaxHeight ? getPopupMaxHeight() : max;
      return value > max ? max : value;
    }
  };

  const getWidth = () => {
    const inputWidht = input.clientWidth;
    const maxWidth = 380;
    return inputWidht > maxWidth ? maxWidth : inputWidht;
  };

  return (
    <Trigger
      popupVisible={triggerPopupVisible}
      getPopupContainer={getPopupContainer}
      // onPopupVisibleChange={value => setTriggerPopupVisible(value)}
      popupAlign={{
        offset: popupAlignOffset || [0, 0],
        points: popupAlignPoints || ['bl', 'tl'],
        overflow: {
          adjustX: true,
          adjustY: true,
        },
      }}
      destroyPopupOnHide
      action={['hover']}
      popupClassName="mentionsTriggerWrap"
      popup={
        <div
          ref={popupRef}
          className="mentionsAutocompleteList"
          onScroll={handleScroll}
          style={{ maxHeight: getMaxHeight(), width: getWidth() }}
        >
          {accounts.map((item, index) => (
            <Fragment key={item.id}>
              {item.atDataIndex === index && (
                <Fragment>
                  <div className="divider mTop4 mBottom4" />
                  <div className="pLeft10 mTop6 Bold textTertiary Font12">{_l('参与者')}</div>
                </Fragment>
              )}
              {item.userIndex === index && (
                <Fragment>
                  <div className="divider mTop4 mBottom4" />
                  <div className="pLeft10 mTop6 Bold textTertiary Font12">{_l('最常协作')}</div>
                </Fragment>
              )}
              <div
                className={cx('mentionItem', {
                  active: item.id === activeId,
                  chatItem: sourceType === SOURCE_TYPE.CHAT,
                })}
                onClick={() => (item.isAddressBookSelect ? handleSelectUser() : handleAddMention(item))}
              >
                {item.isAddressBookSelect ? (
                  <div className="avatar addressBookSelect flexColumn alignItemsCenter justifyContentCenter">
                    <Icon icon="topbar-addressList" className="Font15" />
                  </div>
                ) : (
                  <img className="avatar" src={item.avatarMiddle || item.avatar} />
                )}
                <div className="flex mLeft10 overflowHidden">
                  <div className="flexRow">
                    <div
                      className="fullname textPrimary ellipsis"
                      dangerouslySetInnerHTML={{
                        __html: item.showFullname || item.fullname,
                      }}
                    ></div>
                    {item.onStatusOption ? (
                      <PersonalStatus onlyEmoji accountId={item.accountId} onStatusOption={item.onStatusOption} />
                    ) : null}
                  </div>
                  {sourceType !== SOURCE_TYPE.CHAT && (
                    <div className="textTertiary ellipsis">
                      {!item.department && !item.job ? (
                        <Fragment>
                          {item.profession}
                          {item.profession && item.companyName && ` | `}
                          {item.companyName}
                        </Fragment>
                      ) : (
                        <Fragment>
                          {item.department}
                          {item.department && item.job && ` | `}
                          {item.job}
                        </Fragment>
                      )}
                    </div>
                  )}
                  {item.isAll && (
                    <div className="textTertiary ellipsis">
                      {sourceType === SOURCE_TYPE.WORKSHEETROW
                        ? _l('所有记录成员与参与讨论的人')
                        : _l('所有成员与参与讨论的人')}
                    </div>
                  )}
                  {item.id === 'addressBookSelect' && (
                    <div className="textTertiary ellipsis">{_l('从联系人中选择')}</div>
                  )}
                </div>
              </div>
            </Fragment>
          ))}
          {!!groups.length && (
            <Fragment>
              {!!accounts.length && <div className="divider mTop4 mBottom4" />}
              <div className="pLeft10 mTop6 Bold textTertiary">{_l('群组')}</div>
            </Fragment>
          )}
          {groups.map(item => (
            <div
              className={cx('mentionItem', {
                active: item.groupId === activeId,
              })}
              onClick={() => handleAddMention(item)}
              key={item.groupId}
            >
              <img className="avatar" src={item.avatar} />
              <div className="flex mLeft10 overflowHidden">
                <div
                  className="fullname textPrimary ellipsis"
                  dangerouslySetInnerHTML={{ __html: item.showFullname || item.fullname }}
                ></div>
                <div className="textTertiary ellipsis">{_.get(item, 'project.companyName')}</div>
              </div>
            </div>
          ))}
          {!(accounts.length + groups.length + categorys.length) && (
            <div className="mentionNoData flexColumn alignItemsCenter">
              {!isCategory && <Icon icon="invite" className="textTertiary" />}
              <p
                className="mTop20 textTertiary"
                dangerouslySetInnerHTML={{
                  __html:
                    md.global.Account.isPortal || isCategory
                      ? _l('没有找到')
                      : _l(
                          '没有找到，%0 加入吧!',
                          `<span class="colorPrimary Hand mLeft3">${_l('邀请更多的同事')}</span>`,
                        ),
                }}
                onClick={() => {
                  if (isCategory) return;
                  import('src/components/addFriends').then(func => {
                    func.default({ fromType: 0 });
                    updateTriggerPopupVisible(false);
                  });
                }}
              ></p>
            </div>
          )}
          {categorys.map(item => (
            <div
              className={cx('mentionItem categoryItem', { active: item.id === activeId })}
              onClick={() => handleAddMention(item)}
              key={item.id}
            >
              <div className="flex overflowHidden">
                <div
                  className="fullname textPrimary ellipsis"
                  dangerouslySetInnerHTML={{ __html: item.showFullname || item.value }}
                ></div>
              </div>
            </div>
          ))}
        </div>
      }
    >
      <div
        className="Absolute"
        style={{ left: rect.left, top: rect.top, height: rect.height, pointerEvents: 'none' }}
      />
    </Trigger>
  );
};

export default function initMentionsInput(props) {
  functionWrap(MentionsInput, props);
}
