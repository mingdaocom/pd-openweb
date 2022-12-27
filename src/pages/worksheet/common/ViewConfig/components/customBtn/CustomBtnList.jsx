import React from 'react';
import withClickAway from 'ming-ui/decorators/withClickAway';
import { Icon } from 'ming-ui';
import { COLORS, ICONS } from 'src/pages/worksheet/common/CreateCustomBtn/config.js';
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
                  return (
                    <li
                      className="Gray overflow_ellipsis WordBreak btnList"
                      key={`${i}-btnList`}
                      onClick={() => {
                        this.props.setList(item);
                      }}
                    >
                      <Icon
                        icon={item.icon || 'custom_actions'}
                        style={{ color: item.color && item.icon ? item.color : '#e0e0e0' }}
                        className={cx('mRight12 Font18')}
                      />
                      {item.name}
                    </li>
                  );
                })}
              </ul>
              <div
                className="creatBtn Hand"
                onClick={() => {
                  this.props.showCreateCustomBtnFn(true, false);
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
