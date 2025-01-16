import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import _ from 'lodash';
import cx from 'classnames';
import Trigger from 'rc-trigger';
import { Icon, SvgIcon } from 'ming-ui';
import TextHeightLine from './TextHeightLine';
import { GLOBAL_SEARCH_LIST_SETTING, SEARCH_APP_ITEM_TYPE } from '../enum';
import renderText from 'src/pages/worksheet/components/CellControls/renderText.js';
import { getAppResultCodeText } from '../utils';
import { transferExternalLinkUrl } from 'src/pages/AppHomepage/AppCenter/utils';
import { addBehaviorLog, getFeatureStatus } from 'src/util';
import smartSearchAjax from 'src/api/smartSearch';
import { VersionProductType } from 'src/util/enum';

const Box = styled.div`
  padding-bottom: 12px;
  .title {
    margin-left: 14px;
    display: flex;
    align-items: center;
  }
  .noData {
    margin-left: 14px;
    font-size: 12px;
    color: #757575;
    display: flex;
    align-items: center;
  }
  .noData .icon {
    color: #2196f3 !important;
  }
  .list .listItem {
    width: 100%;
    border-radius: 4px;
    height: 56px;
    cursor: pointer;
    position: relative;
    .moreActionMask {
      position: absolute;
      top: 0;
      right: 0;
      width: 200px;
      height: 100%;
      background: linear-gradient(271deg, #ffffff 0%, rgba(255, 255, 255, 0) 100%);
      border-radius: 4px;
      align-items: center;
      justify-content: end;
      display: none;
      .moreAction {
        width: 28px;
        height: 28px;
        background: #ffffff;
        box-shadow: 0px 2px 4px 1px rgba(0, 0, 0, 0.06);
        border-radius: 5px 5px 5px 5px;
        border: 1px solid #eaeaea;
        display: flex;
        align-items: center;
        justify-content: center;
        &:hover {
          background: #f7f7f7;
        }
      }
    }
  }
  .list .listItem:hover,
  .list .listItem.highlight,
  .showMore.highlight {
    background: #f7f7f7;
    .moreActionMask {
      display: flex;
    }
  }
  .list .listItem .avatarCon {
    margin-right: 8px;
    margin-left: 14px;
    width: 32px;
    height: 32px;
    border-radius: 18px;
    background: #f7f7f7;
    text-align: center;
    line-height: 32px;
    min-width: 32px;
  }
  .list .listItem .avatarCon svg {
    vertical-align: middle !important;
  }
  .list .listItem .listItemInfo {
    flex: 1;
    height: 100%;
    padding: 8px 0;
    width: calc(100% - 54px);
  }
  .list .listItem .listItemInfoColumCenter {
    display: flex;
    flex-direction: column;
    justify-content: center;
  }
  .list .listItem .listItemInfoDes {
    position: relative;
  }
  .list .listItem .listItemInfoDes p {
    position: absolute;
    width: 100%;
    font-size: 13px;
    color: #757575;
  }
  .list .listItem .listItemInfo .listItemInfoTitle {
    height: 20px;
    line-height: 20px;
    display: flex;
  }
  .showMore {
    display: flex;
    align-items: center;
    padding: 10px 0;
  }
  .showMore:hover {
    background: #f7f7f7;
  }
  .splitDot {
    width: 4px;
    height: 4px;
    background: #c6c6c6;
    margin-left: 6px;
    margin-right: 6px;
    display: inline-block;
    vertical-align: middle;
    border-radius: 50%;
    margin-top: -2px;
  }
  .splitVertical {
    width: 1px;
    height: 12px;
    background: #c6c6c6;
    margin-left: 6px;
    margin-right: 6px;
    display: inline-block;
    vertical-align: middle;
  }
`;

const MoreOperateMenu = styled.ul`
  background: #fff;
  box-shadow: 0px 4px 16px 1px rgba(0, 0, 0, 0.24);
  border-radius: 3px 3px 3px 3px;
  width: 160px;
  font-size: 13px;
  color: #151515;
  padding: 4px 0;
  li {
    line-height: 36px;
    padding: 0 24px;
    cursor: pointer;
    &:hover {
      background-color: #2196f3;
      color: #fff;
    }
  }
`;

export default function AppList(props) {
  const {
    data = {},
    needShowMore = false,
    dataKey = '',
    viewAll = false,
    searchKeyword = '',
    closeDialog = undefined,
    needTime = false,
    needTitle = false,
    currentProjectName = '',
    className = '',
    extendButtons = null,
    explore = false,
    title = undefined,
    resultCode = null,
    start = false,
    onStartBetween = null,
    isApp = false,
    sortTime = 'updateTime',
    appId,
    viewName = true,
    loadMore = false,
    getNextPage = () => {},
    currentProjectId,
    update = () => {},
  } = props;

  const settingInfo = GLOBAL_SEARCH_LIST_SETTING[dataKey];

  const [list, setList] = useState(data.list || []);
  const [expand, setExpand] = useState(false);
  const [keyCodeStart, setKeyCodeStart] = useState(start);
  const [current, setCurrent] = useState(-1);
  const [countFlag, setCountFlag] = useState(0);
  const [keyCode, setKeyCode] = useState(null);
  const [buttons, setButtons] = useState(undefined);
  const [timeKey, setTimeKey] = useState(sortTime);
  const [id, setId] = useState();
  const [nextPage, setNextPage] = useState(false);
  const [optionVisibleId, setOptionVisibleId] = useState(-1);
  let count = 0;

  useEffect(() => {
    document.addEventListener('keydown', switchHandle);
    return () => document.removeEventListener('keydown', switchHandle);
  }, []);

  useEffect(() => {
    if (sortTime === timeKey) return;
    setTimeKey(sortTime);
  }, [sortTime]);

  useEffect(() => {
    setId(appId);
  }, [appId]);

  useEffect(() => {
    if (!data.list) return;
    data.list = data.list.map(l => {
      return {
        ...l,
        value: l.value
          ? l.value
              .split('|')
              .filter(text => text.includes(searchKeyword))
              .join(' ')
          : '',
      };
    });
    if (viewAll || needShowMore) {
      setList(_.slice(data.list, 0, 5));
    } else {
      setList(data.list);
    }

    if (dataKey === 'record') {
      setNextPage(data.nextPage);
    }
  }, [data]);

  useEffect(() => {
    setButtons(extendButtons);
  }, [extendButtons]);

  useEffect(() => {
    setKeyCodeStart(start);
  }, [start]);

  useEffect(() => {
    if (!keyCode) return;
    switchFun();
  }, [countFlag]);

  const switchFun = () => {
    if (!keyCodeStart) return;

    if (keyCode === 13 && current > -1) {
      skipHandle(list[current]);
    }

    if (keyCode === 13 && current === -2) {
      needShowMore ? expandHandle() : clickShowHandle();
    }

    if ([38, 40].indexOf(keyCode) < 0) return;

    let _index = -1;

    if (current === -2) {
      keyCode === 40 && (_index = -1);
      keyCode === 38 && (_index = list.length - 1);
      if (keyCode === 40 && onStartBetween) {
        onStartBetween();
        count = 0;
        setCountFlag(0);
      }
    } else if (keyCode === 40 && current + 1 < list.length) {
      _index = current + 1;
    } else if (keyCode === 38 && current - 1 > -1) {
      _index = current - 1;
    } else if ((viewAll && data.total > 5) || needShowMore) {
      _index = -2;
    } else {
      _index = -1;
      if (onStartBetween) {
        onStartBetween();
        count = 0;
        setCountFlag(0);
      }
    }

    setCurrent(_index);
  };

  const switchHandle = e => {
    e.stopPropagation();
    if ([38, 40, 13].indexOf(e.keyCode) > -1) {
      setKeyCode(e.keyCode);
      count = count + 1;
      setCountFlag(count);
    }
  };

  const clickShowHandle = () => {
    const { viewAll } = props;
    if (viewAll) {
      closeDialog && closeDialog();
      return;
    }
  };

  const expandHandle = () => {
    let sign = expand;
    setList(sign ? _.slice(data.list, 0, 5) : data.list);
    setExpand(!sign);
  };

  const getTitle = item => {
    if (dataKey === 'record') {
      const { titleControls = [] } = data;
      const control = titleControls.find(l => l.controlId === item.titleControlId);
      return control ? renderText({ ...control, value: item.title || '' }) || item.title : item.title || '';
    }
    return item.itemType === 3 ? item.appName || '' : item.name || '';
  };

  const skipHandle = item => {
    let url = '';
    if (dataKey === 'app') {
      //埋点
      const typeObj = { 0: 'worksheet', 1: 'customPage', 2: 'app', 3: 'app' };
      addBehaviorLog(typeObj[item.itemType], item.itemType === 3 || item.itemType === 2 ? item.appId : item.itemId);

      const parameter = [
        item.appId,
        item.sectionId,
        !_.includes([item.appId, item.sectionId], item.itemId) && item.itemType !== 2 ? item.itemId : '',
      ];
      url =
        item.createType === 1
          ? transferExternalLinkUrl(item.urlTemplate, currentProjectId, item.appId)
          : encodeURI(`/app/${parameter.filter(o => o).join('/')}`);
    } else {
      url = encodeURI(`/app/${item.appId}/${item.itemId}/row/${item.rowId}`);
    }
    window.open(url);
  };

  const setFilter = (item, isApp) => {
    const { itemType, itemId, appId } = item;

    smartSearchAjax
      .setFilter({
        projectId: currentProjectId,
        itemType: isApp ? 3 : itemType,
        appId,
        itemId: isApp ? appId : itemId,
      })
      .then(res => {
        if (!!res) {
          alert(_l('成功'));
          update();
        } else alert(_l('失败'), 2);
      });
    setOptionVisibleId(-1);
  };

  const renderEmpty = () => {
    if (list && list.length > 0) return null;

    const needUpdate =
      dataKey === 'record' && getFeatureStatus(currentProjectId, VersionProductType.globalSearch) !== '1';

    if ((resultCode && [3, 2].indexOf(resultCode) > -1) || needUpdate) {
      return <div className="noData">{getAppResultCodeText(needUpdate ? 3 : resultCode, currentProjectName)}</div>;
    }

    return (
      <div className="noData">{`${
        dataKey === 'app' ? _l('没有搜索到相关应用和应用项') : _l('没有搜索到相关记录')
      }，${_l('可尝试更换关键字搜索')}`}</div>
    );
  };

  return (
    <Box className={`globalSearchAllList ${className}`}>
      {needTitle && (
        <div className="title Font14 Bold mBottom12 mTop20">
          {title || settingInfo.label}
          {buttons && buttons.map(item => item)}
        </div>
      )}
      {renderEmpty()}
      <ul className="list">
        {list &&
          list.map((item, index) => {
            return (
              <li
                className={cx('listItem valignWrapper', {
                  highlight: (start && current === index) || optionVisibleId === item.rowId,
                })}
                key={`globalSearchAllList-${item.rowId || item.appId}-${dataKey}${index}`}
                onClick={() => skipHandle(item)}
              >
                <div
                  className="avatarCon"
                  style={{
                    background:
                      dataKey === 'record'
                        ? `rgba(${parseInt(item.color.slice(1, 3), 16)}, ${parseInt(
                            item.color.slice(3, 5),
                            16,
                          )}, ${parseInt(item.color.slice(5), 16)}, 0.06)`
                        : item.itemType === 3
                        ? item.color
                        : 'rgba(178, 178, 178, 0.14)',
                  }}
                >
                  <SvgIcon
                    url={item.iconUrl}
                    fill={dataKey === 'record' ? item.color : item.itemType === 3 ? '#fff' : '#757575'}
                    size={18}
                  />
                </div>
                <div className={cx('listItemInfo', { listItemInfoColumCenter: item.itemType === 3 })}>
                  <p className="listItemInfoTitle Font14 Bold mBottom0">
                    <TextHeightLine
                      className="Font14 mLeft8 ellipsis flex"
                      heightLineText={searchKeyword}
                      text={getTitle(item)}
                    />
                    {dataKey === 'record' && needTime && (
                      <span className="mRight20 Gray_75 Font12 Normal">
                        {timeKey === 'updateTime' ? _l('更新时间：') : _l('创建时间')} {createTimeSpan(item[timeKey])}
                      </span>
                    )}
                  </p>
                  {item.itemType !== 3 && (
                    <div className="listItemInfoDes mLeft8 mTop4">
                      <p className="ellipsis">
                        {dataKey === 'record' ? item.name : SEARCH_APP_ITEM_TYPE[item.itemType]}
                        {!isApp && viewName && (
                          <React.Fragment>
                            <span className="splitDot" />
                            {item.appName}
                          </React.Fragment>
                        )}

                        {dataKey === 'record' ? (
                          item.value ? (
                            <React.Fragment>
                              <span className="splitVertical" />
                              <TextHeightLine className="" heightLineText={searchKeyword} text={item.value || ''} />
                            </React.Fragment>
                          ) : null
                        ) : null}
                      </p>
                    </div>
                  )}
                </div>
                {dataKey === 'record' && (
                  <div class="moreActionMask" onClick={e => e.stopPropagation()}>
                    <Trigger
                      popupVisible={optionVisibleId === item.rowId}
                      action={['click']}
                      popupAlign={{ points: ['tr', 'br'] }}
                      onPopupVisibleChange={visible => setOptionVisibleId(visible ? item.rowId : -1)}
                      mask={true}
                      popup={
                        <MoreOperateMenu>
                          {viewName && (
                            <li key="MoreOperateMenu-list-0" onClick={() => setFilter(item, true)}>
                              {_l('不再搜索此应用')}
                            </li>
                          )}
                          <li key="MoreOperateMenu-list-1" onClick={() => setFilter(item)}>
                            {_l('不再搜索此表')}
                          </li>
                        </MoreOperateMenu>
                      }
                    >
                      <div className="moreAction">
                        <Icon icon="moreop" className="Font18 Gray_9e" />
                      </div>
                    </Trigger>
                  </div>
                )}
              </li>
            );
          })}
      </ul>
      {needShowMore && data.total > 5 && (
        <div className={cx('pLeft20 showMore', { highlight: start && current === -2 })}>
          <Icon icon={expand ? 'expand_less' : 'task-point-more'} className="Gray_9e Font18" />
          <a className="text mLeft24 Gray_9e" onClick={expandHandle}>
            {expand ? _l('收起') : _l('显示更多')}
          </a>
        </div>
      )}
      {viewAll && data.total > 5 && (
        <div className={cx('pLeft20 showMore', { highlight: start && current === -2 })}>
          <Icon icon="task-point-more" className="Gray_9e Font18" />
          <a
            href={`/search?search_key=${searchKeyword}&search_type=${settingInfo.key}&appId=${id}`}
            className="text mLeft24 Gray_9e"
            onClick={clickShowHandle}
          >
            {_l('查看全部')}
          </a>
        </div>
      )}
      {loadMore && nextPage && list.length < 10 && (
        <div className={cx('pLeft20 showMore', { highlight: start && current === -2 })}>
          <Icon icon="task-point-more" className="Gray_9e Font18" />
          <a className="text mLeft24 Gray_9e" onClick={getNextPage}>
            {_l('加载更多')}
          </a>
        </div>
      )}
    </Box>
  );
}
