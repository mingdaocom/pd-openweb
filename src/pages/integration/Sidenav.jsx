import React from 'react';
import cx from 'classnames';
import _ from 'lodash';
import styled from 'styled-components';
import { MdLink } from 'ming-ui';
import { PERMISSION_ENUM } from 'src/utils/domain/security/permission';
import { VersionProductType } from 'src/utils/domain/shared/productFeatures';
import { getFeatureStatus } from 'src/utils/services/project';
import { hasPermission } from 'src/utils/services/security/permission';
import { dataIntegrationList, list } from './config';

const Wrap = styled.div`
  width: 241px;
  height: 100%;
  background: var(--color-background-primary);
  border-radius: 0px 0px 0px 0px;
  border-right: 1px solid var(--color-border-secondary);
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
      color: var(--color-text-primary);
      i {
        color: var(--color-text-secondary);
      }
    }
    &.cur {
      background: var(--color-primary-transparent);
      a {
        color: var(--color-primary);
        i {
          color: var(--color-primary);
        }
      }
      &:hover {
        background: var(--color-primary-transparent);
      }
    }
    &:hover {
      background: var(--color-background-hover);
    }
  }
`;

class Sidenav extends React.Component {
  componentDidUpdate(prevProps) {
    if (prevProps !== this.props) {
      const { params = {} } = this.props.match;
      !params.type ? localStorage.removeItem('integrationUrl') : safeLocalStorageSetItem(`integrationUrl`, params.type);
    }
  }
  render() {
    const { match = { params: {} }, myPermissions = [], menuAuth = {}, currentProjectId } = this.props;
    const { type = '' } = match.params;
    const hasDataIntegrationAuth =
      !_.get(window, 'md.global.SysSettings.hideDataPipeline') &&
      hasPermission(myPermissions, [
        PERMISSION_ENUM.CREATE_SYNC_TASK_FEATURE,
        PERMISSION_ENUM.CREATE_SYNC_TASK,
        PERMISSION_ENUM.MANAGE_SYNC_TASKS,
        PERMISSION_ENUM.MANAGE_DATA_SOURCES,
        PERMISSION_ENUM.MANAGE_DATA_MIRROR,
      ]);

    return (
      <Wrap>
        <div className="textSecondary pTop28 pLeft18">{_l('API 集成')}</div>
        <ul className="mTop12">
          {list.map((o, index) => {
            return (
              <li
                key={index}
                className={cx('Bold Font14', { cur: o.type === type || (!type && o.type === 'connect') })}
              >
                <MdLink className="pLeft18 overflow_ellipsis pRight10" to={`/integration/${o.type}`}>
                  <i className={`icon-${o.icon} mRight8 Font20 TxtMiddle`} /> {o.txt}
                </MdLink>
              </li>
            );
          })}
        </ul>
        {hasDataIntegrationAuth && (
          <React.Fragment>
            <div className="textSecondary pTop28 pLeft18">
              <span>{_l('数据集成')}</span>
            </div>
            <ul className="mTop12">
              {dataIntegrationList.map((o, index) => {
                if (
                  (o.type === 'dataConnect' && menuAuth.noCreateTaskMenu) ||
                  (o.type === 'task' && menuAuth.noSyncTaskMenu) ||
                  (o.type === 'source' && menuAuth.noSourceMenu) ||
                  (o.type === 'dataMirror' &&
                    (menuAuth.noMirrorMenu || !getFeatureStatus(currentProjectId, VersionProductType.dataMirror))) ||
                  (o.type === 'stats' && menuAuth.noStatsMenu)
                ) {
                  return null;
                }

                return (
                  <li key={index} className={cx('Bold', { cur: o.type === type || (!type && o.type === 'connect') })}>
                    <MdLink className="pLeft18 overflow_ellipsis pRight10" to={`/integration/${o.type}`}>
                      <i className={`icon-${o.icon} mRight8 Font20 TxtMiddle`} /> {o.txt}
                    </MdLink>
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
