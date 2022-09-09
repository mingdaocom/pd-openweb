import PropTypes from 'prop-types';
import React, { Component } from 'react';
import DialogSelectOrgRole from 'src/components/DialogSelectOrgRole';
import SelectOrgRole from 'mobile/components/SelectOrgRole';
import cx from 'classnames';
import { browserIsMobile } from 'src/util';

export default class Widgets extends Component {
  static propTypes = {
    disabled: PropTypes.bool,
    value: PropTypes.string,
    projectId: PropTypes.string,
    enumDefault: PropTypes.number,
    onChange: PropTypes.func,
  };

  state = {
    orgRoleDialogVisible: false,
    showMobileOrgRole: false,
  };

  /**
   * 选择组织角色
   */
  pickOrgRole = () => {
    const { projectId } = this.props;

    if (!_.find(md.global.Account.projects, item => item.projectId === projectId)) {
      alert(_l('您不是该组织成员，无法获取其组织角色列表，请联系组织管理员'), 3);
      return;
    }

    if (browserIsMobile()) {
      this.setState({ showMobileOrgRole: true });
    } else {
      this.setState({ orgRoleDialogVisible: true });
    }
  };

  onSave = data => {
    const filterData = data.map(i => ({ organizeId: i.organizeId, organizeName: i.organizeName }));
    const { enumDefault, onChange, value } = this.props;
    const newData =
      enumDefault === 0 ? filterData : _.uniqBy(JSON.parse(value || '[]').concat(filterData), 'organizeId');

    onChange(JSON.stringify(newData));
  };

  /**
   * 删除组织角色
   */
  removeOrgRole(organizeId) {
    const { onChange, value } = this.props;
    const newValue = JSON.parse(value).filter(item => item.organizeId !== organizeId);

    onChange(JSON.stringify(newValue));
  }

  render() {
    const { projectId, disabled, enumDefault } = this.props;
    const value = JSON.parse(this.props.value || '[]');
    const { orgRoleDialogVisible, showMobileOrgRole } = this.state;

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
            <div className={cx('customFormControlTags', { selected: browserIsMobile() && !disabled })} key={index}>
              <div className="departWrap" style={{ backgroundColor: '#FFAD00' }}>
                <i className="Font16 icon-user" />
              </div>

              <span className="ellipsis mLeft5" style={{ maxWidth: 200 }}>
                {item.organizeName}
              </span>

              {((enumDefault === 0 && value.length === 1) || enumDefault !== 0) && !disabled && (
                <i className="icon-minus-square Font16 tagDel" onClick={() => this.removeOrgRole(item.organizeId)} />
              )}
            </div>
          );
        })}

        {!disabled && (
          <div
            className="TxtCenter Gray_75 ThemeHoverBorderColor3 ThemeHoverColor3 pointer addBtn"
            onClick={this.pickOrgRole}
          >
            <i className={enumDefault === 0 && value.length ? 'icon-swap_horiz Font16' : 'icon-plus Font14'} />
          </div>
        )}

        {orgRoleDialogVisible && (
          <DialogSelectOrgRole
            projectId={projectId}
            orgRoleDialogVisible={orgRoleDialogVisible}
            unique={enumDefault === 0}
            onSave={this.onSave}
            onClose={() => this.setState({ orgRoleDialogVisible: false })}
          />
        )}

        {showMobileOrgRole && (
          <SelectOrgRole
            projectId={projectId}
            visible={true}
            unique={enumDefault === 0}
            onSave={this.onSave}
            onClose={() => this.setState({ showMobileOrgRole: false })}
          />
        )}
      </div>
    );
  }
}
