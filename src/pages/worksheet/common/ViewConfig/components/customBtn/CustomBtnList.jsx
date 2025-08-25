import React from 'react';
import cx from 'classnames';
import _ from 'lodash';
import styled from 'styled-components';
import { Icon, SvgIcon } from 'ming-ui';
import withClickAway from 'ming-ui/decorators/withClickAway';

const Wrap = styled.li`
  .svgIconForBtn {
    display: inline-flex;
  }
`;
@withClickAway
class CustomBtnList extends React.Component {
  render() {
    let data = [];
    const { btnList, btnData } = this.props;
    if (btnList.length === btnData.length) {
      return '';
    }
    btnList.map(item => {
      const dataFind = _.find(btnData, it => it.btnId === item.btnId);
      if (!dataFind) {
        data.push(item);
      }
    });
    return (
      <div className="btnListBoxMain">
        <div className="btnListBox">
          {data.length > 0 ? (
            <React.Fragment>
              <ul className="btnListUl">
                <li className="Gray_9e">{_l('选择已有动作')}</li>
                {_.map(data, (item, i) => {
                  const { color, icon, name, iconUrl } = item;
                  return (
                    <Wrap
                      className="Gray overflow_ellipsis WordBreak btnList flexRow alignItemsCenter"
                      key={`${i}-btnList`}
                      onClick={() => {
                        this.props.setList(item);
                      }}
                    >
                      {!!iconUrl && !!icon && icon.endsWith('_svg') ? (
                        <SvgIcon
                          className="mRight12 svgIconForBtn"
                          addClassName="TxtMiddle"
                          url={iconUrl}
                          fill={!color ? '#1677ff' : color === 'transparent' ? '#151515' : color}
                          size={18}
                        />
                      ) : (
                        <Icon
                          icon={icon || 'custom_actions'}
                          style={{ color: color }}
                          className={cx(
                            'mRight12 Font18',
                            !icon ? 'Gray_bd' : !color ? 'ThemeColor3' : color === 'transparent' ? 'Gray' : '',
                          )}
                        />
                      )}
                      {name}
                    </Wrap>
                  );
                })}
              </ul>
              <div
                className="createBtn Hand"
                onClick={() => {
                  this.props.onShowCreateCustomBtn(true, false);
                }}
              >
                <i className="icon icon-add Font16 mRight5"></i>
                {_l('创建新动作')}
              </div>
            </React.Fragment>
          ) : (
            ''
          )}
        </div>
      </div>
    );
  }
}

export default CustomBtnList;
