import React, { Component, Fragment } from 'react';
import { Icon, Tooltip } from 'ming-ui';
import { Select } from 'antd';
import Trigger from 'rc-trigger';
import departmentController from 'src/api/department';
import jobAjax from 'src/api/job';
import workSiteController from 'src/api/workSite';
import { getEllipsisDep } from '../../constant';
import TextInput from '../TextInput';
import cx from 'classnames';
import styled from 'styled-components';
import _ from 'lodash';
import { quickSelectRole, quickSelectDept } from 'ming-ui/functions';
import { hasPermission } from 'src/components/checkPermission';
import { PERMISSION_ENUM } from 'src/pages/Admin/enum';

const SelectWrap = styled(Select)`
  &:not(.ant-select-customize-input) .ant-select-selector {
    height: unset !important;
  }
`;

const RoleTagsWrap = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
  .roleTag {
    background: #eaeaea;
    border-radius: 12px 12px 12px 12px;
    padding: 0 8px;
    height: 24px;
    line-height: 24px;
    display: inline-block;
  }
`;

const { Option } = Select;
export default class BaseFormInfo extends Component {
  constructor(props) {
    super(props);
    this.state = {
      jobIds: [],
      worksiteList: [],
      orgRoles: [],
    };
  }
  componentDidMount() {
    const { typeCursor, editCurrentUser = {}, actType } = this.props;
    if (typeCursor === 2 || actType === 'add') {
      this.getJobList();
      this.getWorksiteList(typeCursor === 2 ? editCurrentUser.workSite : undefined);
    }
    this.updateBaseInfo(this.props);
  }

  componentWillReceiveProps(nextProps) {
    if (!_.isEqual(nextProps.baseInfo, this.props.baseInfo)) {
      this.setState({
        jobList: nextProps.baseInfo.jobList,
        worksiteList: nextProps.baseInfo.worksiteList,
      });
      this.updateBaseInfo(nextProps);
    }
  }

  updateBaseInfo = props => {
    const { typeCursor, editCurrentUser = {}, actType } = props;
    const { departmentInfos = [], jobInfos = [] } = editCurrentUser;
    const {
      jobNumber,
      contactPhone,
      workSiteId,
      departmentIds,
      jobIds = [],
      jobList,
      worksiteList,
      orgRoles = [],
    } = props.baseInfo;
    const depIds =
      typeCursor === 2 || typeCursor === 3 ? departmentInfos.map(it => it.id || it.departmentId) : departmentIds;
    this.getDepartmentFullName(depIds, 'all');
    this.setState({
      jobNumber,
      contactPhone,
      workSiteId,
      jobList,
      worksiteList,
      departmentIds: depIds,
      jobIds: typeCursor === 2 || typeCursor === 3 ? jobInfos.map(it => it.id || it.jobId) : jobIds,
      departmentInfos,
      jobInfos,
      orgRoles,
    });
  };

  // 添加部门
  dialogSelectDeptFn = e => {
    const { projectId } = this.props;
    const { departmentInfos } = this.state;

    quickSelectDept(e.target, {
      offset: {
        left: -167,
      },
      projectId,
      unique: false,
      fromAdmin: true,
      selectedDepartment: departmentInfos,
      showCreateBtn: false,
      selectFn: (departments, isCancel = false) => {
        if (isCancel) {
          this.setState({
            departmentInfos: this.state.departmentInfos.filter(l => l.departmentId !== departments[0].departmentId),
          });
          return;
        }
        const data = _.uniqBy(this.state.departmentInfos.concat(departments), 'departmentId');
        this.getDepartmentFullName(
          data.map(it => it.departmentId),
          'all',
          data,
        );
      },
    });
  };

  //添加角色
  dialogSelectRoleFn = e => {
    const { projectId } = this.props;

    quickSelectRole(e.target, {
      projectId,
      unique: false,
      offset: {
        left: -167,
      },
      value: this.state.orgRoles.map(l => ({ organizeId: l.id, organizeName: l.name })),
      onSave: (data, isCancel = false) => {
        if (!data.length) return;

        let roles = data.map(l => {
          return {
            id: l.organizeId,
            name: l.organizeName,
          };
        });
        this.setState({
          orgRoles: isCancel
            ? this.state.orgRoles.filter(l => l.id !== data[0].organizeId)
            : _.uniqBy(this.state.orgRoles.concat(roles), 'id'),
        });
      },
    });
  };

  getDepartmentFullName = (ids = [], field, departments = []) => {
    let { projectId } = this.props;
    let { fullDepartmentInfo = {} } = this.state;
    const departmentIds = ids.filter(it => !fullDepartmentInfo[it]);
    if (_.isEmpty(departmentIds)) {
      if (!_.isEmpty(departments)) {
        this.setState({
          departmentInfos: departments.map(it => {
            if (_.includes(ids, it.departmentId)) {
              return { ...it, departmentName: getEllipsisDep(fullDepartmentInfo[it.departmentId]) };
            }
            return it;
          }),
        });
      }
      return;
    }
    departmentController
      .getDepartmentFullNameByIds({
        projectId,
        departmentIds: ids,
      })
      .then(res => {
        if (field === 'all') {
          this.setState({
            departmentInfos: res.map(it => ({ departmentId: it.id, departmentName: getEllipsisDep(it.name) })),
          });
          return;
        }
        res.forEach(it => {
          fullDepartmentInfo[it.id] = it.name;
        });
        this.setState({ fullDepartmentInfo });
      });
  };

  // 获取职位列表
  getJobList = jobName => {
    const { projectId } = this.props;
    const { keywords } = this.state;
    if (!jobName && this.props.actType !== 'add') {
      this.setState({ jobLoading: true });
    }
    if (this.ajaxRequest) {
      this.ajaxRequest.abort();
    }
    this.ajaxRequest = jobAjax.getJobs({
      projectId,
      keywords,
      pageIndex: 1,
      pageSize: 1000,
    });
    this.ajaxRequest.then(res => {
      let newJobInfo = (jobName && _.find(res.list, item => item.jobName === jobName)) || {};
      let jobIds = jobName && newJobInfo && _.get(newJobInfo, 'jobId') ? [newJobInfo.jobId] : [];
      this.setState({
        jobList: res.list,
        jobIds: [...this.state.jobIds, ...jobIds],
        jobLoading: false,
      });
    });
  };
  // 更新表单数据
  changeFormInfo = (e, field) => {
    this.setState({
      [field]: field === 'mobile' ? this.iti.getNumber() : field === 'email' ? e : e.target.value,
      isClickSubmit: false,
    });
  };

  // 添加职位
  handleAddJob = jobName => {
    const { projectId } = this.props;
    jobAjax
      .addJob({
        projectId,
        jobName,
      })
      .then(res => {
        if (res) {
          alert(_l('创建成功'));
          this.getJobList(jobName);
        } else {
          alert(_l('创建失败'), 2);
        }
      });
  };

  // 获取工作地点列表
  getWorksiteList = workSiteName => {
    const { projectId } = this.props;
    const { worksiteKeywords } = this.state;
    if (!workSiteName && this.props.actType !== 'add') {
      this.setState({ worksiteLoading: true });
    }
    if (this.worksiteRequest) {
      this.worksiteRequest.abort();
    }
    this.worksiteRequest = workSiteController.getWorkSites({
      projectId,
      sortField: 1,
      sortType: 1,
      pageSize: 1000,
      keywords: worksiteKeywords,
    });
    this.worksiteRequest.then(res => {
      let newWorksiteInfo = (workSiteName && _.find(res.list, item => item.workSiteName === workSiteName)) || {};
      let workSiteId = newWorksiteInfo.workSiteId;

      this.setState({
        worksiteList: res.list,
        workSiteId: workSiteId ? workSiteId : this.state.workSiteId,
        worksiteLoading: false,
      });
    });
  };

  // 添加工作地点
  handleAddWorksite = worksiteName => {
    const { projectId } = this.props;
    workSiteController
      .addWorkSite({
        projectId,
        worksiteName,
      })
      .then(res => {
        if (res) {
          alert(_l('创建成功'));
          this.getWorksiteList(worksiteName);
        } else {
          alert(_l('创建失败'), 2);
        }
      });
  };

  deleteOrgRoles = item => {
    const { orgRoles } = this.state;

    this.setState({ orgRoles: orgRoles.filter(l => l.id !== item.id) });
  };

  render() {
    const { typeCursor, projectId, hideRole, authority = [] } = this.props;
    const {
      departmentInfos = [],
      fullDepartmentInfo = {},
      visible,
      jobList = [],
      jobIds = [],
      keywords = '',
      workSite = '',
      worksiteList = [],
      workSiteId,
      worksiteKeywords = '',
      jobNumber,
      contactPhone,
      currentDepartmentId,
      orgRoles = [],
    } = this.state;
    let jobResult = [...jobList];
    if (keywords) {
      jobResult = jobResult.filter(item => item.jobName.indexOf(keywords) > -1);
    }
    jobIds.forEach(item => {
      if ((item || '').toString().indexOf('add_') > -1) {
        jobResult.push({ jobId: '', jobName: item.split('add_')[1] });
      }
    });
    let worksiteResult = [...worksiteList];
    if (worksiteKeywords) {
      worksiteResult = worksiteResult.filter(item => item.workSiteName.indexOf(worksiteKeywords) > -1);
    }

    return (
      <Fragment>
        <div className="formGroup">
          <div className="formLabel">{_l('部门')}</div>
          {!_.isEmpty(departmentInfos) || typeCursor !== 2 ? (
            <Fragment>
              {departmentInfos.map((item, i) => {
                const fullName = fullDepartmentInfo[item.departmentId] || '';
                return (
                  <span
                    className={cx('itemSpan mAll5', { disabledDepartment: typeCursor === 2 })}
                    onMouseEnter={() => this.getDepartmentFullName([item.departmentId])}
                  >
                    <Icon className="departmentIcon Font14 TxtMiddle mRight6" icon="department1" />
                    {
                      <Tooltip
                        tooltipClass="departmentFullNametip"
                        popupPlacement="bottom"
                        text={<div>{fullName}</div>}
                        mouseEnterDelay={0.5}
                      >
                        <span>{item.departmentName}</span>
                      </Tooltip>
                    }
                    {i === 0 && <span className="isTopIcon">{_l('主')}</span>}
                    {typeCursor !== 2 && (
                      <div className="moreOption mLeft8">
                        <Trigger
                          popupClassName="moreActionTrigger"
                          action={['click']}
                          popupAlign={{ points: ['tl', 'bl'], offset: [10, 10] }}
                          popupVisible={visible && currentDepartmentId === item.departmentId}
                          onPopupVisibleChange={visible => {
                            this.setState({ visible });
                          }}
                          popup={
                            <ul>
                              {i !== 0 && (
                                <li
                                  onClick={() => {
                                    let list = departmentInfos.filter(it => it.departmentId !== item.departmentId);
                                    let data = departmentInfos.find(it => it.departmentId === item.departmentId);
                                    list.unshift(data);
                                    this.setState({
                                      departmentInfos: list,
                                      visible: false,
                                    });
                                  }}
                                >
                                  {_l('设为主属部门')}
                                </li>
                              )}
                              <li
                                onClick={() => {
                                  let list = departmentInfos.filter(it => it.departmentId !== item.departmentId);
                                  this.setState({
                                    departmentInfos: list,
                                    visible: false,
                                  });
                                }}
                              >
                                {_l('删除')}
                              </li>
                            </ul>
                          }
                        >
                          <Icon
                            className="Font14 Hand Gray_bd TxtMiddle"
                            icon="moreop"
                            onClick={e => {
                              e.stopPropagation();
                              this.setState({ visible: true, currentDepartmentId: item.departmentId });
                            }}
                          />
                        </Trigger>
                      </div>
                    )}
                  </span>
                );
              })}
              {typeCursor !== 2 && (
                <Icon
                  className="Font26 Hand Gray_9e mAll5 TxtMiddle"
                  icon="task_add-02"
                  onClick={e => this.dialogSelectDeptFn(e)}
                />
              )}
            </Fragment>
          ) : (
            <div className="formControl disabled"></div>
          )}
        </div>
        <div className="formGroup">
          <div className="formLabel">{_l('角色')}</div>
          {!_.isEmpty(orgRoles) || typeCursor !== 2 ? (
            <RoleTagsWrap className="formRolesValue">
              {orgRoles.map(item => {
                return (
                  <span className="roleTag" key={item.id}>
                    <Icon icon="person_new" className="Gray_9e Font18 mRight8 TxtMiddle" />
                    <span>{item.name}</span>
                    {typeCursor !== 2 && (
                      <Icon icon="clear" className="mLeft8 Hand" onClick={() => this.deleteOrgRoles(item)} />
                    )}
                  </span>
                );
              })}
              {typeCursor !== 2 && (
                <Icon
                  className="Font26 Hand Gray_9e mAll5 TxtMiddle"
                  icon="task_add-02"
                  onClick={e => this.dialogSelectRoleFn(e)}
                />
              )}
            </RoleTagsWrap>
          ) : (
            <div className="formControl disabled"></div>
          )}
        </div>

        <div className="formGroup">
          <div className="formLabel">
            <span>{_l('职位')}</span>
            {hasPermission(authority, PERMISSION_ENUM.BASIC_SETTING) && (
              <span
                className="Gray_9e Hover_21 Hand Right"
                onClick={() => {
                  location.assign(`/admin/sysinfo/${projectId}?level5`);
                }}
              >
                {_l('管理')}
              </span>
            )}
          </div>
          <SelectWrap
            disabled={typeCursor === 2}
            ref={select => {
              this.select = select;
            }}
            className={cx('w100 mdAntSelect', { noBorder: typeCursor === 2 })}
            showSearch
            allowClear={jobIds.length > 0}
            listHeight={285}
            optionLabelProp="label"
            value={jobIds}
            placeholder={_l('请选择')}
            suffixIcon={<Icon icon="arrow-down-border Font14" />}
            filterOption={() => true}
            notFoundContent={<span className="Gray_99">{_l('可直接输入创建新的职位')}</span>}
            onSearch={keywords =>
              this.setState({ keywords, jobIds: jobIds.filter(item => item.indexOf('add_') === -1) })
            }
            onDropdownVisibleChange={open => {
              this.setState({ keywords: '' });
              !open && this.select.blur();
            }}
            mode="multiple"
            onChange={jobIds => {
              let newJob = jobIds.find(item => item.indexOf('add_') > -1);
              if (newJob) {
                let jobName = newJob.split('add_')[1];
                this.setState({ keywords: '' }, () => {
                  this.handleAddJob(jobName);
                });
              } else {
                this.setState({ jobIds, keywords: '' });
              }
            }}
          >
            {!!keywords && _.isEmpty(jobList) && (
              <Option disabled>
                <span className="ellipsis customRadioItem Gray_9e">{_l('可直接输入创建新的职位')}</span>
              </Option>
            )}
            {jobResult.map(item => (
              <Option key={item.jobId} value={item.jobId} label={item.jobName}>
                {item.jobName}
              </Option>
            ))}

            {keywords && !jobResult.find(item => item.jobName === keywords) && (
              <Option value={`add_${keywords}`} label={keywords}>
                <span>{_l('创建新职位：%0', keywords)}</span>
              </Option>
            )}
          </SelectWrap>
        </div>
        <div className="formGroup">
          <div className="formLabel">
            <span>{_l('工作地点')}</span>
            {hasPermission(authority, PERMISSION_ENUM.BASIC_SETTING) && (
              <span
                className="Gray_9e Hover_21 Hand Right"
                onClick={() => {
                  location.assign(`/admin/sysinfo/${projectId}?level3`);
                }}
              >
                {_l('管理')}
              </span>
            )}
          </div>
          <Select
            ref={select => {
              this.worksiteSelect = select;
            }}
            disabled={typeCursor === 2}
            className={cx('w100 mdAntSelect', { noBorder: typeCursor === 2 })}
            showSearch
            allowClear
            listHeight={285}
            optionLabelProp="label"
            value={workSiteId || undefined}
            placeholder={_l('请选择')}
            suffixIcon={<Icon icon="arrow-down-border Font14" />}
            filterOption={() => true}
            notFoundContent={<span className="Gray_99">{_l('可直接输入创建新的工作地点')}</span>}
            onSearch={worksiteKeywords =>
              this.setState({
                worksiteKeywords,
              })
            }
            onDropdownVisibleChange={open => {
              this.setState({ worksiteKeywords: '' });
              !open && this.worksiteSelect.blur();
            }}
            onChange={workSiteId => {
              if (workSiteId && workSiteId.indexOf('add_') > -1) {
                const worksiteName = workSiteId.split('add_')[1];
                this.setState({ worksiteKeywords: '' }, () => this.handleAddWorksite(worksiteName));
              } else {
                this.setState({ workSiteId });
              }

              let val = !!workSiteId && workSiteId.indexOf('add_') > -1 ? workSiteId.split('add_')[1] : workSiteId;
              this.setState({ workSiteId: val });
            }}
          >
            {!!worksiteKeywords && _.isEmpty(worksiteList) && (
              <Option disabled>
                <span className="ellipsis customRadioItem Gray_9e">{_l('可直接输入创建新的工作地点')}</span>
              </Option>
            )}
            {worksiteResult.map(item => (
              <Option key={item.workSiteId} value={item.workSiteId} label={item.workSiteName}>
                {item.workSiteName}
              </Option>
            ))}

            {worksiteKeywords && !worksiteResult.find(item => item.workSiteName === worksiteKeywords) && (
              <Option value={`add_${worksiteKeywords}`} label={worksiteKeywords}>
                <span>{_l('创建新工作地点：%0', worksiteKeywords)}</span>
              </Option>
            )}
          </Select>
        </div>
        <TextInput
          label={_l('工号')}
          value={jobNumber}
          disabled={typeCursor === 2}
          placeholder={_l('')}
          onChange={e => this.changeFormInfo(e, 'jobNumber')}
        />
        <TextInput
          label={_l('工作电话')}
          value={contactPhone}
          disabled={typeCursor === 2}
          onChange={e => this.changeFormInfo(e, 'contactPhone')}
          maxLength="32"
        />
      </Fragment>
    );
  }
}
