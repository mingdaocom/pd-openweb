import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { quickSelectRole } from 'ming-ui/functions';
import SelectOrgRole from 'mobile/components/SelectOrgRole';
import cx from 'classnames';
import { browserIsMobile } from 'src/util';
import { dealUserRange } from '../../tools/utils';
import _ from 'lodash';
import { SortableList } from 'ming-ui';

export default class Widgets extends Component {
  static propTypes = {
    disabled: PropTypes.bool,
    value: PropTypes.string,
    projectId: PropTypes.string,
    enumDefault: PropTypes.number,
    onChange: PropTypes.func,
  };

  state = {
    showMobileOrgRole: false,
  };

  shouldComponentUpdate(nextProps, nextState) {
    if (
      !_.isEqual(_.pick(nextProps, ['value', 'disabled']), _.pick(this.props, ['value', 'disabled'])) ||
      !_.isEqual(_.pick(nextState, ['showMobileOrgRole']), _.pick(this.state, ['showMobileOrgRole']))
    ) {
      return true;
    }
    return false;
  }

  /**
   * 选择组织角色
   */
  pickOrgRole = e => {
    const { projectId, formData, enumDefault, value } = this.props;

    if (!_.find(md.global.Account.projects, item => item.projectId === projectId)) {
      alert(_l('您不是该组织成员，无法获取其组织角色列表，请联系组织管理员'), 3);
      return;
    }

    if (browserIsMobile()) {
      this.setState({ showMobileOrgRole: true });
    } else {
      const orgRange = dealUserRange(this.props, formData);
      const roleValue = JSON.parse(value || '[]');
      quickSelectRole(e.target, {
        projectId,
        unique: enumDefault !== 1,
        offset: {
          top: 16,
          left: -16,
        },
        value: roleValue,
        onSave: this.onSave,
        appointedOrganizeIds: _.get(orgRange, 'appointedOrganizeIds'),
      });
    }
  };

  onSave = (data, isCancel = false) => {
    const { enumDefault, onChange, value } = this.props;
    const valueArr = JSON.parse(value || '[]');
    const lastIds = _.sortedUniq(valueArr.map(l => l.organizeId));
    const newIds = _.sortedUniq(data.map(l => l.organizeId));

    if ((_.isEmpty(data) || _.isEqual(lastIds, newIds)) && !isCancel) return;

    const filterData = data.map(i => ({ organizeId: i.organizeId, organizeName: i.organizeName }));
    let newData = enumDefault === 0 ? filterData : valueArr;

    if (enumDefault !== 0 || isCancel) {
      newData = isCancel
        ? newData.filter(l => l.organizeId !== filterData[0].organizeId)
        : _.uniqBy(newData.concat(filterData), 'organizeId');
    }

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

  renderItem({ item, items = [] }) {
    const { disabled, enumDefault } = this.props;

    return (
      <div
        className={cx('customFormControlTags pLeft10', { selected: browserIsMobile() && !disabled })}
        key={item.organizeId}
      >
        <span className="ellipsis" style={{ maxWidth: 200 }}>
          {item.organizeName}
        </span>

        {((enumDefault === 0 && items.length === 1) || enumDefault !== 0) && !disabled && (
          <i className="icon-minus-square Font16 tagDel" onClick={() => this.removeOrgRole(item.organizeId)} />
        )}
      </div>
    );
  }

  render() {
    const { projectId, disabled, enumDefault, formData, masterData = {}, onChange } = this.props;
    const value = JSON.parse(this.props.value || '[]');
    const { showMobileOrgRole } = this.state;
    const orgRange = dealUserRange(this.props, formData, masterData);

    return (
      <div className="customFormControlBox customFormControlUser">
        <SortableList
          items={value}
          canDrag={!disabled && enumDefault !== 0}
          itemKey="organizeId"
          itemClassName="inlineFlex grab"
          direction="vertical"
          renderBody
          renderItem={item => this.renderItem(item)}
          onSortEnd={items => onChange(JSON.stringify(items))}
        />

        {!disabled && (
          <div
            className="TxtCenter Gray_75 ThemeHoverBorderColor3 ThemeHoverColor3 pointer addBtn"
            onClick={this.pickOrgRole}
          >
            <i className={enumDefault === 0 && value.length ? 'icon-swap_horiz Font16' : 'icon-plus Font14'} />
          </div>
        )}

        {showMobileOrgRole && (
          <SelectOrgRole
            projectId={projectId}
            visible={true}
            unique={enumDefault === 0}
            onSave={this.onSave}
            appointedOrganizeIds={_.get(orgRange, 'appointedOrganizeIds')}
            onClose={() => this.setState({ showMobileOrgRole: false })}
          />
        )}
      </div>
    );
  }
}
