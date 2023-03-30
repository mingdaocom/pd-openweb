import PropTypes from 'prop-types';
import React, { Component } from 'react';
import DialogSelectGroups from 'src/components/dialogSelectDept';
import cx from 'classnames';
import { Tooltip } from 'ming-ui';
import SelectUser from 'mobile/components/SelectUser';
import departmentAjax from 'src/api/department';
import { getTabTypeBySelectUser } from 'src/pages/worksheet/common/WorkSheetFilter/util';
import { browserIsMobile } from 'src/util';
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
    const { projectId, enumDefault } = this.props;
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
    const newValue = JSON.parse(value).filter(item => item.departmentId !== departmentId);

    onChange(JSON.stringify(newValue));
  }

  render() {
    const { projectId, disabled, enumDefault, appId, advancedSetting = {}, worksheetId, controlId } = this.props;
    const value = JSON.parse(this.props.value || '[]');
    const { showSelectDepartment } = this.state;

    return (
      <div
        className="customFormControlBox"
        style={{
          flexWrap: 'wrap',
          minWidth: 0,
          alignItems: 'center',
          height: 'auto',
          background: '#fff',
          borderColor: '#fff',
          padding: 0,
        }}
      >
        {value.map((item, index) => {
          return (
            <Tooltip
              mouseEnterDelay={0.6}
              disable={!projectId}
              text={() =>
                new Promise((resolve, reject) => {
                  if (!projectId) {
                    return reject();
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
              }
            >
              <div className={cx('customFormControlTags', { selected: browserIsMobile() && !disabled })} key={index}>
                <div className="departWrap" style={{ backgroundColor: '#2196f3' }}>
                  <i className="Font16 icon-department" />
                </div>

                <span className="ellipsis mLeft5" style={{ maxWidth: 200 }}>
                  {item.departmentName}
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
          />
        )}
      </div>
    );
  }
}
