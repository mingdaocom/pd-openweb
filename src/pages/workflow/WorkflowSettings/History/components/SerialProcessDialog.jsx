import React, { useEffect, useState } from 'react';
import _ from 'lodash';
import moment from 'moment';
import styled from 'styled-components';
import { Dialog, LoadDiv, Support } from 'ming-ui';
import activityAJAX from '../../../api/activity';
import emptyListPng from '../images/emptyList.png';

const DialogWarp = styled(Dialog)`
  .header {
    padding: 24px 0;
  }
  li {
    &.list {
      height: 68px;
    }
  }
  .list {
    display: flex;
    align-items: center;
    border-bottom: 1px solid #ddd;
    .icon-delete {
      display: none;
    }
    &:hover {
      .icon-delete {
        display: block;
      }
    }
    .w40 {
      width: 40px;
    }
    .w150 {
      width: 150px;
    }
    .w190 {
      width: 190px;
    }
  }
  .emptyListWrap {
    padding: 100px 0;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    img {
      width: 130px;
      height: 130px;
      border-radius: 50%;
    }
    .text {
      margin-top: 24px;
    }
  }
`;
export default ({ processId, onClose = () => {} }) => {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pageIndex, setPageIndex] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const getSerialList = (pageIndex = 1) => {
    setLoading(true);

    activityAJAX.getList({ processId, pageIndex, pageSize: 30 }).then(res => {
      setLoading(false);
      setList(pageIndex === 1 ? res : list.concat(res));
      setPageIndex(pageIndex);
      setHasMore(res.length > 0);
    });
  };
  const handleScroll = _.throttle(e => {
    if (e.target.scrollTop + e.target.clientHeight >= e.target.scrollHeight - 30 && !loading && hasMore) {
      getSerialList(pageIndex + 1);
    }
  });
  const removePendingProcess = (id = '') => {
    activityAJAX.remove({ processId, id }).then(() => {
      getSerialList();
    });
  };

  useEffect(() => {
    getSerialList();
  }, []);

  return (
    <DialogWarp
      visible
      width={960}
      overlayClosable={false}
      type="fixed"
      title={_l('串行等待中的流程')}
      onScroll={handleScroll}
      onCancel={onClose}
      footer={null}
    >
      <div className="Gray_75 flexRow alignItemsCenter">
        {_l('工作流配置为“严格串行”时，运行中的工作流需要等待前序的流程执行完毕')}
        <Support
          type={3}
          text={_l('了解更多')}
          className="ThemeColor3 ThemeHoverColor2 mLeft5"
          href="https://help.mingdao.com/workflow/configuration#operation-mode"
        />
        <div className="flex" />
        <div className="ThemeHoverColor3 pointer" onClick={() => removePendingProcess()}>
          {_l('取消等待中的流程')}
        </div>
        <div className="icon-refresh1 Font16 ThemeHoverColor3 pointer mLeft15" onClick={() => getSerialList()}></div>
      </div>

      <div className="list bold Gray_75 Font14 mTop30 pBottom5">
        <div className="w150 mLeft16">{_l('状态')}</div>
        <div className="flex">{_l('流程触发数据')}</div>
        <div className="w190">{_l('加入排队时间')}</div>
        <div className="w150">{_l('触发时间')}</div>
        <div className="w40" />
      </div>

      {loading && pageIndex === 1 && <LoadDiv className="mTop15" />}

      {!loading && !list.length && (
        <div className="emptyListWrap">
          <img src={emptyListPng} />
          <div className="text Gray_75 Font16">{_l('没有串行等待中的流程')}</div>
        </div>
      )}

      <ul>
        {list.map((item, index) => {
          return (
            <li className="list" key={index}>
              <div className="w150 mLeft16 bold flexRow alignItemsCenter">
                <i
                  className="icon-play-circle Font24 mRight6"
                  style={{ color: item.createDate ? '#1677ff' : '#00BCD7' }}
                />
                {item.createDate ? _l('运行中') : _l('等待中')}
              </div>
              <div className="flex ellipsis mRight15">
                {_l('数据：')}
                {item.title}
              </div>
              <div className="w190">{moment(item.date).format('YYYY-MM-DD HH:mm:ss')}</div>
              <div className="w150">{item.createDate ? moment(item.createDate).format('YYYY-MM-DD HH:mm:ss') : ''}</div>
              <div className="w40">
                {index === 0 && (
                  <span data-tip={_l('中止')} onClick={() => removePendingProcess(item.id)}>
                    <i className="icon-delete Font16 pointer ThemeHoverColor3 Gray_75" />
                  </span>
                )}
              </div>
            </li>
          );
        })}

        {loading && pageIndex > 1 && <LoadDiv className="mTop10" />}
      </ul>
    </DialogWarp>
  );
};
