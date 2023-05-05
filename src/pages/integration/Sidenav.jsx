import React from 'react';
import { Icon, ScrollView } from 'ming-ui';
import cx from 'classnames';
import styled from 'styled-components';
import { Link } from 'react-router-dom';
import { list, dataIntegrationList } from './config';
const Wrap = styled.div`
  width: 241px;
  height: 100%;
  background: #ffffff;
  border-radius: 0px 0px 0px 0px;
  border-right: 1px solid #ededed;
  .pLeft18 {
    padding-left: 18px;
  }
  .pTop28 {
    padding-top: 28px;
  }
  .betaIcon {
    color: #4caf50;
    font-size: 15px;
    margin-left: 4px;
  }
  li {
    width: 230px;
    height: 44px;
    border-radius: 0px 22px 22px 0px;
    a {
      display: inline-flex;
      align-items: center;
      width: 100%;
      line-height: 44px;
      color: #333;
      i {
        color: #757575;
      }
    }
    &.cur {
      background: #e3f2fe;
      a {
        color: #2196f3;
        i {
          color: #2196f3;
        }
      }
      &:hover {
        background: #e3f2fe;
      }
    }
    &:hover {
      background: #f5f5f5;
    }
  }
`;

class Sidenav extends React.Component {
  componentWillReceiveProps(nextProps) {
    const { params = {} } = nextProps.match;
    !params.type ? localStorage.removeItem('integrationUrl') : safeLocalStorageSetItem(`integrationUrl`, params.type);
  }
  render() {
    const { match = { params: {} }, isSuperAdmin } = this.props;
    const { type = '' } = match.params;
    return (
      <Wrap>
        <div className="Gray_75 pTop28 pLeft18">{_l('API 集成')}</div>
        <ul className="mTop12">
          {list.map((o, index) => {
            return (
              <li
                key={index}
                className={cx('Bold Font14', { cur: o.type === type || (!type && o.type === 'connect') })}
              >
                <Link className="pLeft18 overflow_ellipsis pRight10" to={`/integration/${o.type}`}>
                  <i className={`icon-${o.icon} mRight8 Font24 TxtMiddle`} /> {o.txt}
                </Link>
              </li>
            );
          })}
        </ul>
        {isSuperAdmin && (
          <React.Fragment>
            <div className="Gray_75 pTop28 pLeft18 flexRow alignItemsCenter">
              <span>{_l('数据集成')}</span>
              <Icon icon="beta1" className="betaIcon" />
            </div>
            <ul className="mTop12">
              {dataIntegrationList.map((o, index) => {
                return (
                  <li key={index} className={cx('Bold', { cur: o.type === type || (!type && o.type === 'connect') })}>
                    <Link className="pLeft18 overflow_ellipsis pRight10" to={`/integration/${o.type}`}>
                      <i className={`icon-${o.icon} mRight8 Font24 TxtMiddle`} /> {o.txt}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </React.Fragment>
        )}
      </Wrap>
    );
  }
}

export default Sidenav;
