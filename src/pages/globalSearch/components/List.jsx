import React, { useEffect, useState } from 'react';
import cx from 'classnames';
import _ from 'lodash';
import styled from 'styled-components';
import { Avatar, Icon } from 'ming-ui';
import { getClassNameByExt } from 'src/utils/common';
import RegExpValidator from 'src/utils/expression';
import { GLOBAL_SEARCH_LIST_SETTING } from '../enum';
import { getImgUrl } from '../utils';
import TextHeightLine from './TextHeightLine';

const Box = styled.div`
  padding-bottom: 12px;
  .title {
    margin-left: 14px;
  }
  .list .listItem {
    width: 100%;
    border-radius: 4px;
    height: 56px;
    cursor: pointer;
  }
  .list .listItem:hover,
  .list .listItem.highlight,
  .showMore.highlight {
    background: #f7f7f7;
  }
  .list .listItem .avatarCon {
    margin-right: 8px;
    margin-left: 14px;
    width: 32px;
    text-align: center;
  }
  .list .listItem .listItemInfo {
    flex: 1;
    height: 100%;
    padding: 8px 0;
  }
  .list .listItem .listItemInfoDes {
    position: relative;
  }
  .list .listItem .listItemInfoDes p {
    position: absolute;
    width: 100%;
    font-size: 12px;
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
  .list .listItem .avatarCon .fileIcon {
    width: 26px;
    height: 30px;
    margin-top: 6px;
  }
`;

const LIST_URL_PRE = {
  post: {
    pre: '/feeddetail?itemID=',
    idKey: 'postID',
  },
  task: {
    pre: '/apps/task/task_',
    idKey: 'taskID',
  },
  kcnode: {
    pre: '',
    idKey: 'link',
  },
};

export default function List(props) {
  const {
    data = { count: 0 },
    needTitle = false,
    dataKey = '',
    viewAll = false,
    searchKeyword = '',
    closeDialog = undefined,
    needTime = false,
    className = '',
    start = false,
    onStartBetween = null,
  } = props;

  const settingInfo = GLOBAL_SEARCH_LIST_SETTING[dataKey];

  const [list, setList] = useState(data[settingInfo.prefix + 'List']);
  const [keyCodeStart, setKeyCodeStart] = useState(start);
  const [current, setCurrent] = useState(-1);
  const [countFlag, setCountFlag] = useState(0);
  const [keyCode, setKeyCode] = useState(null);
  let count = 0;

  useEffect(() => {
    document.addEventListener('keydown', switchHandle);
    return () => document.removeEventListener('keydown', switchHandle);
  }, []);

  useEffect(() => {
    setList(data[settingInfo.prefix + 'List']);
  }, [data]);

  useEffect(() => {
    setKeyCodeStart(start);
  }, [start]);

  useEffect(() => {
    if (!keyCode) return;
    switchFun();
  }, [countFlag]);

  const clickShowHandle = () => {
    const { viewAll } = props;
    if (viewAll) {
      closeDialog && closeDialog();
      return;
    }
  };

  const switchFun = () => {
    if (!keyCodeStart) return;

    if (keyCode === 13 && current > -1) {
      skipHandle(list[current]);
    }

    if (keyCode === 13 && current === -2) {
      clickShowHandle();
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
    } else if (viewAll && data.count > 5) {
      _index = -2;
      if (onStartBetween) {
        onStartBetween();
        count = 0;
        setCountFlag(0);
      }
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

  const skipHandle = item => {
    let url = encodeURI(`${LIST_URL_PRE[dataKey].pre}${item[LIST_URL_PRE[dataKey].idKey]}`);
    window.open(url);
  };

  return (
    <Box className={`globalSearchAllList ${className}`}>
      {needTitle && (
        <div className="title Font14 Bold mBottom12 mTop20">
          {settingInfo.label} <span className="Gray_75 Normal mLeft8">{data.count}</span>
        </div>
      )}
      <ul className="list">
        {list &&
          list.map((item, index) => {
            let prefix = settingInfo.prefix;

            return (
              <li
                className={cx('listItem valignWrapper', { highlight: start && current === index })}
                key={`globalSearchAllList-${item[settingInfo.listKey]}`}
                onClick={() => skipHandle(item)}
              >
                <div className="avatarCon">
                  {dataKey === 'kcnode' ? (
                    <i
                      className={cx(
                        getClassNameByExt(`.${RegExpValidator.getExtOfFileName(item.fileName)}`),
                        'fileIcon',
                      )}
                    />
                  ) : (
                    <Avatar size={32} src={getImgUrl(item.avatar)} />
                  )}
                </div>
                <div className="listItemInfo">
                  <p className="listItemInfoTitle mBottom4 Font14 Bold">
                    {(settingInfo.titleKey ? item[settingInfo.titleKey] || '' : item[prefix + 'UserName'] || '') ===
                      searchKeyword}
                    <TextHeightLine
                      className="Font14 mLeft8 ellipsis flex"
                      heightLineText={searchKeyword}
                      text={settingInfo.titleKey ? item[settingInfo.titleKey] || '' : item[prefix + 'UserName'] || ''}
                    />
                    {needTime && (
                      <span className="mRight13 Gray_75 Font12 Normal">
                        {_l('更新时间：')}{' '}
                        {_.split(
                          item.nodeCreateTime || item.taskCreateTime || item.postCreateTime,
                          /[\u4e00-\u9fa5]/g,
                          3,
                        ).join('-')}
                      </span>
                    )}
                  </p>
                  <div className="listItemInfoDes">
                    <p className=" ellipsis">
                      <TextHeightLine
                        className="Font13 mLeft8 ellipsis flex"
                        heightLineText={searchKeyword}
                        text={
                          settingInfo.descKeys
                            ? settingInfo.descKeys
                                .map(l => (l === 'position' ? (item[l] ? item[l].slice(1) : '') : item[l]))
                                .join(' | ') || ''
                            : item[prefix + 'Content'] || ''
                        }
                      />
                    </p>
                  </div>
                </div>
              </li>
            );
          })}
      </ul>
      {viewAll && data.count > 5 && (
        <div className={cx('pLeft20 showMore', { highlight: start && current === -2 })}>
          <Icon icon="more_horiz" className="Gray_9e Font18" />
          <a
            href={`/search?search_key=${searchKeyword}&search_type=${settingInfo.key}`}
            className="text mLeft24 Gray_9e"
            onClick={clickShowHandle}
          >
            {_l('查看全部')}
          </a>
        </div>
      )}
    </Box>
  );
}
