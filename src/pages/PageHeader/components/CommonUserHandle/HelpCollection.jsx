import React, { useState } from 'react';
import styled from 'styled-components';
import { Icon } from 'ming-ui';
import cx from 'classnames';
import _ from 'lodash';
import hapAI from './images/hapAI.png';
import HapAiDialog from './HapAiDialog';

const collections = () => {
  const lang = window.getCurrentLang();

  return [
    {
      type: 'support',
      text: _l('支持'),
      items: [
        { id: 'helpDoc', text: _l('帮助文档'), icon: 'class', href: 'https://help.mingdao.com/' },
        { id: 'video', text: _l('学习视频'), icon: 'play_circle_outline', href: 'https://learn.mingdao.net/' },
        { id: 'communityQuestions', text: _l('社区提问'), icon: 'forum', href: 'https://bbs.mingdao.net/' },
        { id: 'helpDoc', text: _l('寻找伙伴支持'), icon: 'partner', href: 'https://www.mingdao.com/partnerlist' },
        { id: 'partnerSupport', text: _l('人工客服'), icon: 'support_agent' },
      ],
    },
    {
      type: 'resource',
      text: _l('资源'),
      items: [
        { id: 'blog', text: _l('博客'), icon: 'rss_feed', href: 'https://blog.mingdao.com' },
        { id: 'activity', text: _l('活动'), icon: 'school', href: 'https://www.mingdao.com/activitycenter' },
        {
          id: 'lastUpdated',
          text: _l('最近更新'),
          icon: 'gift',
          href: 'https://blog.mingdao.com/category/product/product-update	',
        },
        {
          id: 'api',
          text: _l('API文档'),
          icon: 'worksheet_API',
          href: `${md.global.Config.WebUrl}apidoc/${
            lang === 'zh-Hans' ? 'zh-Hans/' : 'en/'
          }`,
        },
      ],
    },
    {
      type: 'buy',
      text: _l('购买'),
      items: [{ id: 'versionAndPrice', text: _l('版本和价格'), icon: 'stars', href: 'https://www.mingdao.com/price' }],
    },
  ];
};

const CollectionWrap = styled.div`
  width: 340px;
  padding: 12px;
  box-sizing: border-box;
  background: #ffffff;
  box-shadow: 0px 4px 16px 0px rgba(0, 0, 0, 0.25);
  border-radius: 3px;
  .hapHelper {
    width: 316px;
    background: #ffffff;
    border-radius: 8px;
    border: 1px solid #2196f3;
    padding: 10px 15px;
    box-sizing: border-box;
    &:hover {
      background: rgba(33, 150, 243, 0.05);
    }
    .hapAI {
      height: 32px;
      margin: auto 0;
    }
  }
  .item {
    height: 36px;
    display: flex;
    align-items: center;
    color: #151515;
    font-size: 14px;
    border-radius: 3px 3px 3px 3px;
    &:hover {
      background: #f5f5f9;
    }
  }
`;

export default function HelpCollection(props) {
  const { hapAIPosition, updatePopupVisible = () => {} } = props;
  const isTop = hapAIPosition === 'top';
  const [showHapAi, setShowHapAi] = useState(false);

  const renderHap = () => {
    return (
      <div
        className={cx('hapHelper flexRow Hand', { mTop12: !isTop })}
        onClick={() => {
          updatePopupVisible(false);
          setShowHapAi(true);
        }}
      >
        <img className="hapAI" src={hapAI} />
        <div className="mLeft15">
          <div className="bold Font14">{_l('HAP助手')}</div>
          <div className="Gray_75">{_l('您好，请问需要什么帮助？')}</div>
        </div>
      </div>
    );
  };

  return (
    <CollectionWrap>
      {isTop && renderHap()}
      {collections().map((item, index) => {
        const { type, text, items = [] } = item;

        return (
          <div className={cx('itemWrap')} key={type}>
            <div
              className={cx('title Gray_9e bold mBottom8  mLeft10', {
                mTop0: !isTop && index === 0,
                mTop12: !(!isTop && index === 0),
              })}
            >
              {text}
            </div>
            {items.map(v => {
              if (md.global.Config.IsLocal && _.includes(['video', 'communityQuestions', 'helpDoc', ''], v.id)) {
                return null;
              }

              if (_.includes(['partnerSupport'], v.id)) {
                return (
                  <div
                    className="item Hand"
                    key={v.id}
                    onClick={() => {
                      updatePopupVisible(false);
                      if (v.id === 'partnerSupport') {
                        window.KF5SupportBoxAPI && window.KF5SupportBoxAPI.open();
                      }
                    }}
                  >
                    <Icon
                      icon={v.icon}
                      className={cx('Gray_9e TxtMiddle mLeft10', {
                        Font16: v.id === 'lastUpdated',
                        Font20: v.id !== 'lastUpdated',
                      })}
                    />
                    <span className="mLeft10 TxtMiddle"> {v.text}</span>
                  </div>
                );
              }

              return (
                <a
                  className="item Hand"
                  key={v.id}
                  href={v.href || ''}
                  target="_blank"
                  onClick={() => {
                    updatePopupVisible(false);
                  }}
                >
                  <Icon
                    icon={v.icon}
                    className={cx('Gray_9e TxtMiddle mLeft10', {
                      Font16: v.id === 'lastUpdated',
                      Font20: v.id !== 'lastUpdated',
                    })}
                  />
                  <span className="mLeft10 TxtMiddle"> {v.text}</span>
                </a>
              );
            })}
          </div>
        );
      })}
      {!isTop && renderHap()}

      {showHapAi && <HapAiDialog visible={showHapAi} onCancel={() => setShowHapAi(false)} />}
    </CollectionWrap>
  );
}
