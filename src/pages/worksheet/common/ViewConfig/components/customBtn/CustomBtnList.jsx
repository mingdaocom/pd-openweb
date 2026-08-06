import React from 'react';
import cx from 'classnames';
import _ from 'lodash';
import styled from 'styled-components';
import { Icon, SvgIcon } from 'ming-ui';
import ClickAway from 'ming-ui/components/ClickAway';

const Wrap = styled.li`
  .svgIconForBtn {
    display: inline-flex;
  }
`;

function CustomBtnList({ btnList, btnData, setList, onShowCreateCustomBtn }) {
  const data = btnList.filter(item => !_.find(btnData, it => it.btnId === item.btnId));

  if (btnList.length === btnData.length) {
    return '';
  }

  return (
    <div className="btnListBoxMain">
      <div className="btnListBox">
        {data.length > 0 && (
          <React.Fragment>
            <ul className="btnListUl">
              <li className="textTertiary">{_l('选择已有动作')}</li>
              {_.map(data, (item, i) => {
                const { color, icon, name, iconUrl, status } = item;
                const isDisabled = status === 0;
                return (
                  <Wrap
                    className="textPrimary overflow_ellipsis WordBreak btnList flexRow alignItemsCenter"
                    key={`${i}-btnList`}
                    onClick={() => {
                      setList(item);
                    }}
                  >
                    {!!iconUrl && !!icon && icon.endsWith('_svg') ? (
                      <SvgIcon
                        className="mRight12 svgIconForBtn"
                        addClassName="TxtMiddle"
                        url={iconUrl}
                        fill={
                          !color
                            ? 'var(--color-primary)'
                            : color === 'transparent'
                              ? 'var(--color-text-primary)'
                              : color
                        }
                        size={18}
                      />
                    ) : (
                      <Icon
                        icon={icon || 'custom_actions'}
                        style={{ color: color }}
                        className={cx(
                          'mRight12 Font18',
                          !icon
                            ? 'textDisabled'
                            : !color
                              ? 'colorPrimary'
                              : color === 'transparent'
                                ? 'textPrimary'
                                : '',
                        )}
                      />
                    )}
                    <span className={cx('overflow_ellipsis', { textTertiary: isDisabled })}>
                      {name}
                      {isDisabled && <span className="mLeft5">{`[${_l('停用')}]`}</span>}
                    </span>
                  </Wrap>
                );
              })}
            </ul>
            <div
              className="createBtn Hand"
              onClick={() => {
                onShowCreateCustomBtn(true, false);
              }}
            >
              <i className="icon icon-add Font16 mRight5"></i>
              {_l('创建新动作')}
            </div>
          </React.Fragment>
        )}
      </div>
    </div>
  );
}

export default ClickAway.wrap(CustomBtnList);
