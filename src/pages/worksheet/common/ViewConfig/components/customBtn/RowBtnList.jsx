import React from 'react';
import cx from 'classnames';
import _ from 'lodash';
import styled from 'styled-components';
import { Icon, SvgIcon } from 'ming-ui';
import withClickAway from 'ming-ui/decorators/withClickAway';
import { BTN_LIST, SYS_BTN_LIST } from './config';

const Wrap = styled.li`
  .svgIconForBtn {
    display: inline-flex;
  }
`;
@withClickAway
class RowBtnList extends React.Component {
  render() {
    const { btnList, onAdd = () => {}, view, tempList = [] } = this.props;
    const actioncolumn = !_.get(view, 'advancedSetting.actioncolumn')
      ? []
      : safeParse(_.get(view, 'advancedSetting.actioncolumn'));

    const renderIcon = (data, key) => {
      if (key === 'sys') {
        return <Icon icon={data.icon} style={{ color: data.color }} className={cx('mRight12 Font18 InlineFlex')} />;
      }
      if (key === 'btn') {
        const { color, icon, iconUrl } = data;
        return (
          <React.Fragment>
            {!!iconUrl && !!icon && icon.endsWith('_svg') ? (
              <SvgIcon
                className="mRight12 svgIconForBtn InlineFlex"
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
                  'mRight12 Font18 InlineFlex',
                  !icon ? 'Gray_bd' : !color ? 'ThemeColor3' : color === 'transparent' ? 'Gray' : '',
                )}
              />
            )}
          </React.Fragment>
        );
      }
      return <Icon icon="print" className={cx('mRight12 Font18 Gray_75 InlineFlex')} />;
    };

    const getBtns = () => {
      const ids = actioncolumn.filter(o => o.type === 'btn').map(o => o.id);
      return btnList.filter(o => !(ids || []).includes(o.btnId));
    };

    const getPrints = () => {
      const ids = actioncolumn.filter(o => o.type === 'print').map(o => o.id);
      return tempList.filter(o => !(ids || []).includes(o.id));
    };
    const getSys = () => {
      return SYS_BTN_LIST.filter(a => !(actioncolumn || []).find(o => o.type === a.key));
    };

    const renderLiCon = () => {
      let l = 0;
      return (
        <React.Fragment>
          <ul className="btnListUl">
            {BTN_LIST.map((o, n) => {
              const data = o.key === 'print' ? getPrints() : o.key === 'sys' ? getSys() : getBtns();
              if (data.length <= 0) return null;
              l = l + 1;
              return (
                <React.Fragment>
                  {n !== 0 && l > 1 && (
                    <div className="w100 mTop5 mBottom5" style={{ borderTop: '1px solid #EAEAEA' }} />
                  )}
                  <li className="Gray_9e">{o.txt}</li>
                  {_.map(data, (item, i) => {
                    const { name } = item;
                    return (
                      <Wrap
                        className="Gray overflow_ellipsis WordBreak btnList flexRow alignItemsCenter"
                        key={`${i}-btnList`}
                        onClick={() => {
                          onAdd({
                            id: o.key === 'btn' ? item.btnId : o.key === 'sys' ? item.key : item.id,
                            type: o.key === 'sys' ? item.key : o.key,
                          });
                        }}
                      >
                        {renderIcon(item, o.key)}
                        {o.key === 'sys' ? item.txt : name}
                      </Wrap>
                    );
                  })}
                </React.Fragment>
              );
            })}
            {l <= 0 && <span className="Gray_75 pAll10 LineHeight40">{_l('无可添加按钮')}</span>}
          </ul>
        </React.Fragment>
      );
    };

    return (
      <div className="btnListBoxMain">
        <div className="btnListBox">{renderLiCon()}</div>
      </div>
    );
  }
}

export default RowBtnList;
