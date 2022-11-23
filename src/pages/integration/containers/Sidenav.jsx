import React from 'react';
import { Icon, ScrollView } from 'ming-ui';
import cx from 'classnames';
import styled from 'styled-components';
import { Link } from 'react-router-dom';
import { list } from '../config';
const Wrap = styled.div`
  width: 241px;
  height: 100%;
  background: #ffffff;
  border-radius: 0px 0px 0px 0px;
  border-right: 1px solid #ededed;
  .pLeft18 {
    padding-left: 18px;
  }
  li {
    width: 230px;
    height: 40px;
    border-radius: 0px 20px 20px 0px;
    a {
      display: block;
      width: 100%;
      line-height: 40px;
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
  render() {
    const { match = { params: {} } } = this.props;
    const { type = '' } = match.params;
    return (
      <Wrap>
        <div className="Gray_75 pTop20 pLeft18">{_l('API 集成')}</div>
        <ul className="mTop12">
          {list.map(o => {
            return (
              <li className={cx('Bold', { cur: o.type === type || (!type && o.type === 'connect') })}>
                <Link className="pLeft18 overflow_ellipsis pRight10" to={`/integration/${o.type}`}>
                  <i className={`icon-${o.icon} mRight8 Font24 TxtMiddle`} /> {o.txt}
                </Link>
              </li>
            );
          })}
        </ul>
      </Wrap>
    );
  }
}

export default Sidenav;
