import PropTypes from 'prop-types';
import React, { Component } from 'react';
import DialogSelectGroups from 'src/components/dialogSelectDept';
import cx from 'classnames';
import { Tooltip } from 'ming-ui';
import SelectUser from 'mobile/components/SelectUser';
import departmentAjax from 'src/api/department';
import { getTabTypeBySelectUser } from 'src/pages/worksheet/common/WorkSheetFilter/util';
import { browserIsMobile } from 'src/util';
import { dealRenderValue } from '../../tools/utils';
import _ from 'lodash';

export default class Widgets extends Component {
  static propTypes = {
    disabled: PropTypes.bool,
    value: PropTypes.string,
    projectId: PropTypes.string,
    enumDefault: PropTypes.number,
    onChange: PropTypes.func,
  };

  state = {
    showSelectDepartment: false,
  };

  /**
   * 选择部门
   */
  pickDepartment = () => {
    const { projectId, enumDefault, advancedSetting = {} } = this.props;
    const that = this;

    if (!_.find(md.global.Account.projects, item => item.projectId === projectId)) {
      alert(_l('您不是该组织成员，无法获取其部门列表，请联系组织管理员'), 3);
      return;
    }
    if (browserIsMobile()) {
      this.setState({ showSelectDepartment: true });
    } else {
      new DialogSelectGroups({
        projectId,
        isIncludeRoot: false,
        unique: enumDefault === 0,
        showCreateBtn: false,
        allPath: advancedSetting.allpath === '1',
        selectFn: that.onSave,
      });
    }
  };

  onSave = data => {
    const { enumDefault, onChange, value } = this.props;
    const newData = enumDefault === 0 ? data : _.uniqBy(JSON.parse(value || '[]').concat(data), 'departmentId');

    onChange(JSON.stringify(newData));
  };

  /**
   * 删除部门
   */
  removeDepartment(departmentId) {
    const { onChange, value } = this.props;
    const newValue = departmentId
      ? JSON.parse(value || '[]').filter(item => item.departmentId !== departmentId)
      : JSON.parse(value || '[]').filter(i => !i.isDelete);

    onChange(JSON.stringify(newValue));
  }

  render() {
    const { projectId, disabled, enumDefault, appId, advancedSetting = {} } = this.props;
    const { allpath } = advancedSetting;
    const value = dealRenderValue(this.props.value, advancedSetting);
    const { showSelectDepartment } = this.state;

    return (
      <div className="customFormControlBox customFormControlUser">
        {value.map((item, index) => {
          return (
            <Tooltip
              mouseEnterDelay={0.6}
              disable={!projectId}
              text={
                !_.get(window, 'shareState.shareId')
                  ? () =>
                      new Promise((resolve, reject) => {
                        if (!projectId) {
                          return reject();
                        }

                        if (item.isDelete) {
                          resolve(_l('%0部门已被删除', item.deleteCount > 1 ? `${item.deleteCount}个` : ''));
                          return;
                        }

                        if (allpath === '1') {
                          return resolve(item.departmentName);
                        }

                        departmentAjax
                          .getDepartmentFullNameByIds({
                            projectId,
                            departmentIds: [item.departmentId],
                          })
                          .then(res => {
                            resolve(_.get(res, '0.name'));
                          });
                      })
                  : null
              }
            >
              <div
                className={cx('customFormControlTags', {
                  selected: browserIsMobile() && !disabled,
                  isDelete: item.isDelete,
                })}
                key={index}
              >
                <div className="departWrap" style={{ backgroundColor: '#2196f3' }}>
                  <i className="Font16 icon-department" />
                </div>

                <span
                  className="ellipsis mLeft5"
                  style={{
                    maxWidth: 200,
                    ...(allpath === '1' && !item.isDelete ? { direction: 'rtl', unicodeBidi: 'normal' } : {}),
                  }}
                >
                  {item.departmentName}
                  {item.deleteCount > 1 && <span className="Gray mLeft5">{item.deleteCount}</span>}
                </span>

                {((enumDefault === 0 && value.length === 1) || enumDefault !== 0) && !disabled && (
                  <i
                    className="icon-minus-square Font16 tagDel"
                    onClick={() => this.removeDepartment(item.departmentId)}
                  />
                )}
              </div>
            </Tooltip>
          );
        })}

        {!disabled && (
          <div
            className="TxtCenter Gray_75 ThemeHoverBorderColor3 ThemeHoverColor3 pointer addBtn"
            onClick={this.pickDepartment}
          >
            <i className={enumDefault === 0 && value.length ? 'icon-swap_horiz Font16' : 'icon-plus Font14'} />
          </div>
        )}

        {showSelectDepartment && (
          <SelectUser
            projectId={projectId}
            visible={true}
            type="department"
            onlyOne={enumDefault === 0}
            onClose={() => this.setState({ showSelectDepartment: false })}
            onSave={this.onSave}
            appId={appId}
            userType={getTabTypeBySelectUser(this.props)}
            selectRangeOptions={!!advancedSetting.userrange}
            allPath={advancedSetting.allpath === '1'}
          />
        )}
      </div>
    );
  }
}
