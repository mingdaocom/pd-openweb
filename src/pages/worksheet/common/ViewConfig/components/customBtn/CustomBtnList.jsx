import React from 'react';
import withClickAway from 'ming-ui/decorators/withClickAway';
import { Icon } from 'ming-ui';
import cx from 'classnames';
import _ from 'lodash';

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
                <li className="Gray_9e">{_l('选择已有按钮')}</li>
                {_.map(data, (item, i) => {
                  const { color, icon, name } = item;
                  return (
                    <li
                      className="Gray overflow_ellipsis WordBreak btnList"
                      key={`${i}-btnList`}
                      onClick={() => {
                        this.props.setList(item);
                      }}
                    >
                      <Icon
                        icon={icon || 'custom_actions'}
                        style={{ color: color }}
                        className={cx(
                          'mRight12 Font18',
                          !icon ? 'Gray_bd' : !color ? 'ThemeColor3' : color === 'transparent' ? 'Gray' : '',
                        )}
                      />
                      {name}
                    </li>
                  );
                })}
              </ul>
              <div
                className="creatBtn Hand"
                onClick={() => {
                  this.props.onShowCreateCustomBtn(true, false);
                }}
              >
                <i className="icon icon-add Font16 mRight5"></i>
                {_l('创建新按钮')}
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
