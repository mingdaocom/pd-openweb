import React from 'react';
import cx from 'classnames';
import styled from 'styled-components';
import { Link } from 'react-router-dom';
import { list, dataIntegrationList } from './config';
import { hasPermission } from 'src/components/checkPermission';
import { PERMISSION_ENUM } from 'src/pages/Admin/enum';

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
    const { match = { params: {} }, myPermissions = [], menuAuth = {} } = this.props;
    const { type = '' } = match.params;
    const hasDataIntegrationAuth = hasPermission(myPermissions, [
      PERMISSION_ENUM.CREATE_SYNC_TASK,
      PERMISSION_ENUM.MANAGE_SYNC_TASKS,
      PERMISSION_ENUM.MANAGE_DATA_SOURCES,
    ]);

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
        {hasDataIntegrationAuth && (
          <React.Fragment>
            <div className="Gray_75 pTop28 pLeft18">
              <span>{_l('数据集成')}</span>
            </div>
            <ul className="mTop12">
              {dataIntegrationList.map((o, index) => {
                if (
                  (o.type === 'dataConnect' && menuAuth.noCreateTaskMenu) ||
                  (o.type === 'task' && menuAuth.noSyncTaskMenu) ||
                  (o.type === 'source' && menuAuth.noSourceMenu)
                ) {
                  return null;
                }

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
