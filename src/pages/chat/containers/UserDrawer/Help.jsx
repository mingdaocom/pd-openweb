import React from 'react';
import cx from 'classnames';
import _ from 'lodash';
import { Icon } from 'ming-ui';
import { PopoverWrap } from '../ChatList/Avatar/styled';

const collections = () => {
  const lang = window.getCurrentLang();
  return [
    {
      type: 'support',
      text: _l('支持'),
      items: [
        { id: 'helpDoc', text: _l('帮助文档'), icon: 'class', href: 'https://help.mingdao.com/' },
        { id: 'video', text: _l('学习视频'), icon: 'play_circle_outline', href: 'https://learn.mingdao.com/' },
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
          href: `https://apidoc.mingdao.com/${lang === 'zh-Hans' ? 'zh-Hans' : 'en'}`,
        },
      ],
    },
    {
      type: 'buy',
      text: _l('购买'),
      items: [{ id: 'versionAndPrice', text: _l('版本和价格'), icon: 'score', href: 'https://www.mingdao.com/price' }],
    },
  ];
};

const renderProjectsPopover = () => {
  return (
    <PopoverWrap>
      {collections().map(item => {
        const { type, text, items = [] } = item;
        return (
          <div key={type}>
            <div className="horizontalPadding Gray_9e bold">{text}</div>
            {items.map(v => {
              if (md.global.Config.IsLocal && _.includes(['video', 'communityQuestions', 'helpDoc', ''], v.id)) {
                return null;
              }
              if (_.includes(['partnerSupport'], v.id)) {
                return (
                  <div
                    className="itemWrap flexRow alignItemsCenter pointer"
                    key={v.id}
                    onClick={() => {
                      if (v.id === 'partnerSupport') {
                        window.KF5SupportBoxAPI && window.KF5SupportBoxAPI.open();
                      }
                    }}
                  >
                    <Icon
                      icon={v.icon}
                      className={cx('Gray_9e TxtMiddle', {
                        Font16: v.id === 'lastUpdated',
                        Font20: v.id !== 'lastUpdated',
                      })}
                    />
                    <div className="mLeft10 flex ellipsis Gray">{v.text}</div>
                  </div>
                );
              }

              return (
                <a className="itemWrap flexRow alignItemsCenter pointer" key={v.id} href={v.href || ''} target="_blank">
                  <Icon
                    icon={v.icon}
                    className={cx('Gray_9e TxtMiddle', {
                      Font16: v.id === 'lastUpdated',
                      Font20: v.id !== 'lastUpdated',
                    })}
                  />
                  <div className="mLeft10 flex ellipsis Gray">{v.text}</div>
                </a>
              );
            })}
          </div>
        );
      })}
    </PopoverWrap>
  );
};

export default renderProjectsPopover;
