import React, { Component } from 'react';
import Checkbox from 'ming-ui/components/Checkbox';
import { LoadDiv } from 'ming-ui';
import { autobind } from 'core-decorators';

/**
 * 选择部门
 */
import PropTypes from 'prop-types';

import Radio from 'ming-ui/components/Radio';
import cx from 'classnames';
import NoData from './NoData';

import './css/department.less';
import styled from 'styled-components';
import _ from 'lodash';
const Wrap = styled.div`
  .onlySelf {
    display: none;
  }
  &:hover {
    .onlySelf {
      display: inline-block;
    }
  }
`;
export default class DepartmentList extends Component {
  static propTypes = {
    selectedDepartment: PropTypes.array,
    toogleDepargmentSelect: PropTypes.func,
    onChangeSelectedOnly: PropTypes.func,
    toggleDepartmentList: PropTypes.func,
    data: PropTypes.array,
    keywords: PropTypes.string,
    showUserCount: PropTypes.bool,
    checkIncludeChilren: PropTypes.bool,
    unique: PropTypes.bool,
  };
  getParentId = (list, id) => {
    for (let i in list) {
      if (list[i].departmentId == id) {
        return [list[i]];
      }
      if (list[i].subDepartments) {
        let node = this.getParentId(list[i].subDepartments, id);
        if (node !== undefined) {
          return node.concat(list[i]);
        }
      }
    }
  };
  getIsIncludesByParent = department => {
    let list = this.getParentId(this.props.treeData, department.departmentId).map(o => o.departmentId);
    let isIncludesByParent = this.props.selectedDepartment.filter(
      o =>
        (list.includes(o.departmentId) || o.departmentId.indexOf('orgs_') > -1) &&
        o.checkIncludeChilren &&
        o.departmentId !== department.departmentId,
    );
    return !!isIncludesByParent.length;
  };
  getChecked = department => {
    let selectedDepartmentData = this.props.selectedDepartment.filter(
      item => item.departmentId === department.departmentId,
    );
    return (
      !!selectedDepartmentData.length || (this.props.checkIncludeChilren && this.getIsIncludesByParent(department))
    );
  };
  getDisable = department => {
    return this.props.checkIncludeChilren && this.getIsIncludesByParent(department);
  };
  render() {
    let departments = this.props.data;
    if (departments && departments.length) {
      return (
        <div className="GSelect-departmentList">
          {departments.map((department, index) => {
            return (
              <Department
                key={department.departmentId + index}
                department={department}
                selectedDepartment={this.props.selectedDepartment}
                toogleDepargmentSelect={this.props.toogleDepargmentSelect}
                onChangeSelectedOnly={this.props.onChangeSelectedOnly}
                toggleDepartmentList={this.props.toggleDepartmentList}
                checked={this.getChecked(department)}
                isIncludesByParent={this.getIsIncludesByParent(department)}
                keywords={this.props.keywords}
                showUserCount={this.props.showUserCount}
                unique={this.props.unique}
                departmentMoreIds={this.props.departmentMoreIds}
                treeData={this.props.treeData}
                checkIncludeChilren={this.props.checkIncludeChilren}
              />
            );
          })}
        </div>
      );
    }
    return null;
  }
}

class Department extends Component {
  static defaultProps = {
    showUserCount: true,
  };
  static propTypes = {
    toogleDepargmentSelect: PropTypes.func,
    toggleDepartmentList: PropTypes.func,
    selectedDepartment: PropTypes.array,
    checked: PropTypes.bool,
    department: PropTypes.object,
    showUserCount: PropTypes.bool,
    unique: PropTypes.bool,
    checkIncludeChilren: PropTypes.bool,
    onChangeSelectedOnly: PropTypes.func,
  };
  constructor(props) {
    super(props);
    this.state = {
      moreIdLoading: '',
    };
  }
  componentWillReceiveProps(nextProps) {
    if (!_.isEqual(this.props.departmentMoreIds, nextProps.departmentMoreIds)) {
      this.setState({
        moreIdLoading: '',
      });
    }
  }
  @autobind
  toogleDepargmentSelect(event) {
    const {
      department: { open, disabled, departmentId },
    } = this.props;
    event.stopPropagation();
    if (!disabled) {
      this.props.toogleDepargmentSelect(this.props.department);
    }
    // if (!open) {
    //   this.props.toggleDepartmentList(departmentId);
    // }
  }

  @autobind
  toggleDepartmentList(event) {
    event.stopPropagation();
    this.props.toggleDepartmentList(this.props.department.departmentId);
  }
  render() {
    const { moreIdLoading } = this.state;
    let { department, checked, keywords, isIncludesByParent, checkIncludeChilren } = this.props;
    let { haveSubDepartment, subDepartments, disabled, open, departmentName } = department;
    disabled = disabled || isIncludesByParent;
    let name = departmentName;
    let nameArr = [name];
    if (this.props.keywords) {
      let mt = name.match(keywords);
      let len = keywords.length;
      if (mt) {
        nameArr = [];
        while (mt) {
          nameArr.push(name.slice(0, mt.index));
          nameArr.push(name.slice(mt.index, mt.index + len));
          name = name.slice(mt.index + len);
          mt = name.match(keywords);
        }
        if (name) {
          nameArr.push(name);
        }
      }
    }
    return (
      <div className="GSelect-department">
        <div className={cx('GSelect-department-row flexRow')} onClick={this.toggleDepartmentList}>
          <div
            className={cx('GSelect-arrow', {
              'GSelect-arrow--transparent': !haveSubDepartment,
              pointer: haveSubDepartment,
            })}
          >
            <i
              className={cx(
                'GSelect-arrow__arrowIcon',
                department.open ? 'GSelect-arrow__arrowIcon--open' : 'GSelect-arrow__arrowIcon--close',
              )}
            />
          </div>
          <Wrap
            className="flex flexRow GSelect-department-box pointer"
            onClick={department => {
              if (disabled) {
                return;
              }
              this.toogleDepargmentSelect(department);
            }}
          >
            {this.props.unique ? (
              <Radio disabled={disabled} className="GSelect-department--checkbox" checked={checked} />
            ) : (
              <Checkbox
                disabled={disabled}
                className="GSelect-department--checkbox"
                styleType={
                  checked &&
                  checkIncludeChilren &&
                  !(this.props.selectedDepartment.find(o => o.departmentId === department.departmentId) || {})
                    .checkIncludeChilren
                    ? 'light'
                    : ''
                }
                checked={checked}
              />
            )}
            <div className={cx('GSelect-department__name overflow_ellipsis')}>
              {nameArr.map((item, index) => {
                if (item === keywords) {
                  return (
                    <span key={item + index} className="GSelect-department__name--hightlight">
                      {item}
                    </span>
                  );
                }
                return <span key={item + index}>{item}</span>;
              })}
            </div>
            {this.props.showUserCount ? (
              <div className={cx('GSelect-department__count')}>{`（${department.userCount}人）`}</div>
            ) : null}
            {checkIncludeChilren && !disabled && (
              <span
                className="Hand onlySelf ThemeColor3 pRight5"
                onClick={e => {
                  e.stopPropagation();
                  this.props.onChangeSelectedOnly(department);
                }}
              >
                {_l('仅当前部门')}
              </span>
            )}
          </Wrap>
        </div>
        {!haveSubDepartment || !open ? null : (
          <DepartmentList
            selectedDepartment={this.props.selectedDepartment}
            onChangeSelectedOnly={this.props.onChangeSelectedOnly}
            toogleDepargmentSelect={this.props.toogleDepargmentSelect}
            toggleDepartmentList={this.props.toggleDepartmentList}
            data={subDepartments}
            checkIncludeChilren={this.props.checkIncludeChilren}
            keywords={this.props.keywords}
            showUserCount={this.props.showUserCount}
            unique={this.props.unique}
            departmentMoreIds={this.props.departmentMoreIds}
            treeData={this.props.treeData}
          />
        )}
        {open &&
        (subDepartments[0] || {}).parentId &&
        (this.props.departmentMoreIds || []).find(o => o.departmentId === subDepartments[0].parentId) ? (
          <span
            className="mLeft60 Hand moreBtn"
            onClick={() => {
              safeLocalStorageSetItem('parentId', subDepartments[0].parentId);
              this.props.toggleDepartmentList(subDepartments[0].parentId);
              this.setState({
                moreIdLoading: subDepartments[0].parentId,
              });
            }}
          >
            {moreIdLoading === subDepartments[0].parentId && <LoadDiv size="small" />}
            {moreIdLoading === subDepartments[0].parentId ? _l('加载中') : _l('更多')}
          </span>
        ) : (
          ''
        )}
      </div>
    );
  }
}
