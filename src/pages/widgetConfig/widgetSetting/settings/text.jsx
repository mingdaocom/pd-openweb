import React, { Fragment } from 'react';
import { Tooltip } from 'antd';
import cx from 'classnames';
import img from 'staticfiles/images/markdown.png';
import styled from 'styled-components';
import { Icon } from 'ming-ui';
import { getAdvanceSetting, handleAdvancedSettingChange } from 'src/pages/widgetConfig/util/setting';
import { DisplayMode, SettingItem } from '../../styled';
import '../../styled/style.less';

const DISPLAY_OPTIONS = [
  {
    text: _l('单行'),
    value: 2,
    img: 'Single_Line',
  },
  {
    text: _l('多行'),
    value: 1,
    img: 'Multiple_Lines',
  },
  {
    text: _l('Markdown'),
    value: 3,
    img: 'Markdown',
  },
];

const MarkdownTipsWrap = styled.div`
  width: 350px;
  .text {
    color: #fff;
    font-weight: bold;
  }
  .imgContainer {
    margin: 10px 0;
    height: 164px;
    padding: 14px;
    background: #ffffff;
    border-radius: 3px;
  }
`;

function MarkdownTips() {
  return (
    <MarkdownTipsWrap>
      <div className="text">
        {_l(
          'Markdown 是一种轻量级的标记语言输入方式。除了进行常规文本输入外，还可以添加简单的文本标识来实现对内容的格式化',
        )}
      </div>
      <div className="imgContainer">
        <img src={img} width={272} height={137} />
      </div>
    </MarkdownTipsWrap>
  );
}

export default function Text(props) {
  const { data, onChange } = props;
  const { datamask } = getAdvanceSetting(data);
  const currentEnumDefault = data.enumDefault === 0 ? 2 : data.enumDefault;

  return (
    <Fragment>
      <SettingItem>
        <div className="settingItemTitle">{_l('类型')}</div>
        <DisplayMode>
          {DISPLAY_OPTIONS.map(item => {
            return (
              <Tooltip
                autoCloseDelay={0}
                title={item.value === 3 ? <MarkdownTips /> : ''}
                placement="bottomRight"
                overlayClassName="textMarkdownTipsContainer"
              >
                <div
                  className={cx('displayItem', { active: currentEnumDefault === item.value })}
                  onClick={() => {
                    if (item.value !== 2 && datamask === '1') {
                      onChange({ ...handleAdvancedSettingChange(data, { datamask: '0' }), enumDefault: item.value });
                      return;
                    }
                    // markdown
                    if (item.value === 3) {
                      onChange({
                        ...handleAdvancedSettingChange(data, {
                          filterregex: '',
                          sorttype: 'en',
                          datamask: '0',
                          encryId: '',
                        }),
                        unique: false,
                        enumDefault: item.value,
                      });
                      return;
                    }
                    onChange({ enumDefault: item.value });
                  }}
                >
                  <div className="mBottom4">
                    <Icon icon={item.img} className="Font36" />
                  </div>
                  <span className="text">{item.text}</span>
                </div>
              </Tooltip>
            );
          })}
        </DisplayMode>
      </SettingItem>
    </Fragment>
  );
}
