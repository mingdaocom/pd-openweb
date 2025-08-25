import React, { Component, Fragment } from 'react';
import { Divider, Select } from 'antd';
import cx from 'classnames';
import _ from 'lodash';
import Trigger from 'rc-trigger';
import styled from 'styled-components';
import { v4 as uuidv4 } from 'uuid';
import { Dialog, Icon, Tooltip } from 'ming-ui';
import { quickSelectDept, quickSelectRole } from 'ming-ui/functions';
import departmentController from 'src/api/department';
import jobAjax from 'src/api/job';
import workSiteController from 'src/api/workSite';
import { hasPermission } from 'src/components/checkPermission';
import { PERMISSION_ENUM } from 'src/pages/Admin/enum';
import { getEllipsisDep } from '../../constant';
import TextInput from '../TextInput';

const { Option } = Select;

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

const DelIconWrap = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
  border-radius: 3px;
  cursor: pointer;
  margin-left: 8px;
  &:hover {
    background: #f5f5f5;
    i {
      color: #f44336 !important;
    }
  }
`;

export default class BaseFormInfo extends Component {
  constructor(props) {
    super(props);
    this.state = { jobIds: [], worksiteList: [], orgRoles: [], useMultiJobs: false, departmentJobInfos: [] };
  }
  componentDidMount() {
    const { typeCursor, editCurrentUser = {}, actType } = this.props;
    if (typeCursor === 2 || actType === 'add') {
      this.getJobList();
      this.getWorksiteList(typeCursor === 2 ? editCurrentUser.workSite : undefined);
    }
    actType === 'edit' && this.updateBaseInfo(this.props);
  }

  componentWillReceiveProps(nextProps) {
    if (!_.isEqual(nextProps.baseInfo, this.props.baseInfo)) {
      this.setState({ jobList: nextProps.baseInfo.jobList, worksiteList: nextProps.baseInfo.worksiteList });
      this.updateBaseInfo(nextProps);
    }
  }

  updateBaseInfo = props => {
    const { typeCursor, editCurrentUser = {}, baseInfo = {} } = props;
    const { departmentInfos = [], jobInfos = [] } = editCurrentUser;
    const depIds = [2, 3].includes(typeCursor)
      ? departmentInfos.map(it => it.id || it.departmentId)
      : baseInfo.departmentIds;

    this.getDepartmentFullName(depIds, 'all');
    this.setState({
      ..._.pick(baseInfo, [
        'jobNumber',
        'contactPhone',
        'workSiteId',
        'jobList',
        'worksiteList',
        'orgRoles',
        'useMultiJobs',
      ]),
      departmentIds: depIds,
      jobIds: [2, 3].includes(typeCursor) ? jobInfos.map(it => it.id || it.jobId) : baseInfo.jobIds,
      departmentInfos,
      jobInfos,
      departmentJobInfos: (baseInfo.departmentJobInfos || []).map(item => ({
        key: item.department.id,
        departmentId: item.department.id,
        departmentName: item.department.name,
        jobIds: item.jobs.map(job => job.id),
      })),
    });
  };

  // 添加多任职
  handleAddMultipleJob = () => {
    const { useMultiJobs, departmentInfos = [], departmentJobInfos = [], jobIds = [] } = this.state;
    const convertData = departmentInfos.map(item => ({ ...item, jobIds: [], key: item.departmentId }));
    const emptyDepartJob = { key: `empty-${uuidv4()}`, jobIds: [] };

    const newData = useMultiJobs
      ? departmentJobInfos.concat(emptyDepartJob)
      : convertData.length > 1
        ? convertData
        : convertData.length === 1
          ? convertData.map(item => ({ ...item, jobIds })).concat(emptyDepartJob)
          : [
              { key: `empty-${uuidv4()}`, jobIds: [] },
              { key: `empty-${uuidv4()}`, jobIds: [] },
            ];

    if (!useMultiJobs) {
      Dialog.confirm({
        width: 520,
        title: _l('添加多任职'),
        description: (
          <div className="Gray">
            {_l(
              '添加后，支持设置部门对应的职位信息，设置后在成员的个人资料中展示。原本的“职位”将显示为“全部职位”汇总多任职信息中的职位信息，并在系统中使用。',
            )}
          </div>
        ),
        okText: _l('添加'),
        onOk: () => {
          this.setState({ useMultiJobs: true, departmentJobInfos: newData });
        },
      });
    } else {
      this.setState({ departmentJobInfos: newData });
    }
  };

  // 添加部门
  dialogSelectDeptFn = (e, selectedDepartment) => {
    const { useMultiJobs, departmentJobInfos } = this.state;

    quickSelectDept(e.target, {
      offset: { left: -167 },
      projectId: this.props.projectId,
      unique: useMultiJobs,
      fromAdmin: true,
      selectedDepartment: useMultiJobs
        ? selectedDepartment.departmentId
          ? [selectedDepartment]
          : []
        : this.state.departmentInfos,
      showCreateBtn: false,
      selectFn: (departments, isCancel = false) => {
        if (useMultiJobs) {
          if (isCancel || !departments.length) return;

          if (
            departmentJobInfos.filter(
              item =>
                item.departmentId === departments[0].departmentId &&
                departments[0].departmentId !== selectedDepartment.departmentId,
            ).length
          ) {
            alert(_l('已存在该部门，请勿重复选择'), 3);
            return;
          }

          const newData = departmentJobInfos.map(item => {
            return item.key === selectedDepartment.key
              ? { ...item, ...departments[0], key: departments[0].departmentId }
              : item;
          });
          this.setState({ departmentJobInfos: newData });
        } else {
          if (isCancel) {
            const newDepartmentInfos = this.state.departmentInfos.filter(
              l => l.departmentId !== departments[0].departmentId,
            );
            this.setState({ departmentInfos: newDepartmentInfos });
            return;
          }
          const data = _.uniqBy((this.state.departmentInfos || []).concat(departments), 'departmentId');
          const ids = data.map(it => it.departmentId);
          this.getDepartmentFullName(ids, 'all', data);
        }
      },
    });
  };

  //添加角色
  dialogSelectRoleFn = e => {
    const { projectId } = this.props;

    quickSelectRole(e.target, {
      projectId,
      unique: false,
      offset: { left: -167 },
      value: this.state.orgRoles.map(l => ({ organizeId: l.id, organizeName: l.name })),
      onSave: (data, isCancel = false) => {
        if (!data.length) return;

        let roles = data.map(l => ({ id: l.organizeId, name: l.organizeName }));
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
    const validIds = ids.filter(it => !!it);
    const departmentIds = validIds.filter(it => !fullDepartmentInfo[it]);

    if (_.isEmpty(departmentIds)) {
      if (!_.isEmpty(departments)) {
        const newDepartmentInfos = departments.map(it =>
          _.includes(validIds, it.departmentId)
            ? { ...it, departmentName: getEllipsisDep(fullDepartmentInfo[it.departmentId]) }
            : it,
        );
        this.setState({ departmentInfos: newDepartmentInfos });
      }
      return;
    }

    departmentController.getDepartmentFullNameByIds({ projectId, departmentIds: validIds }).then(res => {
      if (field === 'all') {
        const newDepartmentInfos = res.map(it => ({ departmentId: it.id, departmentName: getEllipsisDep(it.name) }));
        this.setState({ departmentInfos: newDepartmentInfos });
        return;
      }
      res.forEach(it => (fullDepartmentInfo[it.id] = it.name));
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
    this.ajaxRequest = jobAjax.getJobs({ projectId, keywords, pageIndex: 1, pageSize: 1000 });
    this.ajaxRequest.then(res => {
      let newJobInfo = (jobName && _.find(res.list, item => item.jobName === jobName)) || {};
      let jobIds = jobName && newJobInfo && _.get(newJobInfo, 'jobId') ? [newJobInfo.jobId] : [];
      this.setState({ jobList: res.list, jobIds: [...this.state.jobIds, ...jobIds], jobLoading: false });
    });
  };

  // 更新表单数据
  changeFormInfo = (e, field) => {
    const fieldValue = field === 'mobile' ? this.iti.getNumber() : field === 'email' ? e : e.target.value;
    this.setState({ [field]: fieldValue, isClickSubmit: false });
  };

  // 添加职位
  handleAddJob = jobName => {
    const { projectId } = this.props;
    jobAjax.addJob({ projectId, jobName }).then(res => {
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
    workSiteController.addWorkSite({ projectId, worksiteName }).then(res => {
      if (res) {
        alert(_l('创建成功'));
        this.getWorksiteList(worksiteName);
      } else {
        alert(_l('创建失败'), 2);
      }
    });
  };

  //删除多任职条目
  onDeleteMultiJobItem(item) {
    const { departmentInfos = [], departmentJobInfos = [], useMultiJobs } = this.state;
    const currentList = useMultiJobs ? departmentJobInfos : departmentInfos;
    const list = currentList.filter(it => (useMultiJobs ? it.key !== item.key : it.departmentId !== item.departmentId));
    this.setState(
      useMultiJobs
        ? {
            departmentJobInfos: list.length > 1 ? list : [],
            departmentInfos: list
              .filter(it => !!it.departmentId)
              .map(it => _.pick(it, ['departmentId', 'departmentName'])),
            visible: false,
            useMultiJobs: list.length > 1,
          }
        : { departmentInfos: list, visible: false },
    );
  }

  renderMoreOption = (item, i) => {
    const { visible, currentDepartmentId, departmentInfos = [], departmentJobInfos = [], useMultiJobs } = this.state;

    const onMoveDepart = action => {
      const currentItem = useMultiJobs ? departmentJobInfos.filter(it => it.key === item.key)[0] || {} : item;
      const list = useMultiJobs ? departmentJobInfos : departmentInfos;
      list.splice(i, 1);

      switch (action) {
        case 'forward':
          list.splice(i - 1, 0, currentItem);
          break;
        case 'backward':
          list.splice(i + 1, 0, currentItem);
          break;
        case 'toFirst':
          list.unshift(currentItem);
          break;
        default:
          break;
      }
      this.setState({ [useMultiJobs ? 'departmentJobInfos' : 'departmentInfos']: list, visible: false });
    };

    return (
      <Trigger
        popupClassName="moreActionTrigger"
        action={['click']}
        popupAlign={{ points: ['tl', 'bl'], offset: [10, 10] }}
        popupVisible={visible && currentDepartmentId === (item.departmentId || item.key)}
        onPopupVisibleChange={visible => this.setState({ visible })}
        popup={
          <ul>
            {useMultiJobs && i !== 0 && (
              <Fragment>
                {i > 1 && <li onClick={() => onMoveDepart('forward')}>{_l('上移')}</li>}
                {i !== departmentJobInfos.length - 1 && <li onClick={() => onMoveDepart('backward')}>{_l('下移')}</li>}
              </Fragment>
            )}
            {i !== 0 && <li onClick={() => onMoveDepart('toFirst')}>{_l('设为主任职部门')}</li>}
            <li onClick={() => this.onDeleteMultiJobItem(item)} className="Red">
              {_l('删除')}
            </li>
          </ul>
        }
      >
        <Icon
          className="Font16 Hand Gray_9e TxtMiddle ThemeHoverColor"
          icon="moreop"
          onClick={e => {
            e.stopPropagation();
            this.setState({ visible: true, currentDepartmentId: item.departmentId || item.key });
          }}
        />
      </Trigger>
    );
  };

  renderDepartItem = (item, i) => {
    const { typeCursor } = this.props;
    const { fullDepartmentInfo = {}, useMultiJobs } = this.state;
    const fullName = fullDepartmentInfo[item.departmentId] || '';

    if (!item.departmentId) {
      return null;
    }

    return (
      <span
        key={item.departmentId || item.key}
        className={cx('itemSpan mAll5', { disabledDepartment: typeCursor === 2 })}
        onMouseEnter={() => this.getDepartmentFullName([item.departmentId])}
      >
        <Icon className="departmentIcon Font14 TxtMiddle mRight6" icon="department" />
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
        {i === 0 && (
          <Tooltip popupPlacement="top" text={_l('主属部门')}>
            <Icon icon="main-department" className="Font22 ThemeColor mLeft8 mRight8" />
          </Tooltip>
        )}
        {typeCursor !== 2 && !useMultiJobs && this.renderMoreOption(item, i)}
      </span>
    );
  };

  renderDepartmentJob = (type = 'single', departmentItem = {}, index) => {
    const { typeCursor, projectId, authority = [] } = this.props;
    const {
      departmentInfos = [],
      jobList = [],
      jobIds = [],
      keywords = '',
      useMultiJobs,
      departmentJobInfos = [],
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

    const onJobsChange = idValues => {
      let newJob = idValues.find(item => item.indexOf('add_') > -1);
      if (newJob) {
        let jobName = newJob.split('add_')[1];
        this.setState({ keywords: '' }, () => this.handleAddJob(jobName));
        return;
      }

      if (type === 'multiple') {
        const newData = departmentJobInfos.map(item =>
          item.key === departmentItem.key ? { ...item, jobIds: idValues } : item,
        );

        const oldJobIds = departmentJobInfos.filter(item => item.key === departmentItem.key)[0]?.jobIds;
        const delJobIds = oldJobIds.filter(id => !idValues.includes(id));
        const allJobIds = _.uniq(_.flatten(newData.map(item => item.jobIds)));
        const newJobIds = _.uniq(jobIds.concat(idValues)).filter(
          id => !(delJobIds.includes(id) && !allJobIds.includes(id)), //只排除该部门删掉的，并且所有任职信息里面没有的职位
        );

        this.setState({ departmentJobInfos: newData, jobIds: newJobIds, keywords: '' });
      } else {
        const newData = useMultiJobs
          ? departmentJobInfos.map(item => ({
              ...item,
              jobIds: item.jobIds.filter(jobId => idValues.includes(jobId)),
            }))
          : [];
        this.setState({ jobIds: idValues, keywords: '', departmentJobInfos: newData });
      }
    };

    return (
      <div key={type === 'multiple' ? departmentItem.key : ''} data-id={type === 'multiple' ? departmentItem.key : ''}>
        {type === 'multiple' && (
          <div className="flexRow alignItemsCenter">
            {index === 0 && (
              <Tooltip popupPlacement="top" text={_l('主属部门')}>
                <Icon icon="main-department" className="Font22 ThemeColor mRight6" />
              </Tooltip>
            )}
            <span className="Gray_75">{_l('任职信息%0', index + 1)}</span>
            {typeCursor !== 2 && this.renderMoreOption(departmentItem, index)}
            <Divider className="mLeft8 minWidth0 flex" />
            <Tooltip popupPlacement="top" text={_l('删除')}>
              <DelIconWrap onClick={() => this.onDeleteMultiJobItem(departmentItem)}>
                <Icon icon="trash" className="Font14 Gray_bd" />
              </DelIconWrap>
            </Tooltip>
          </div>
        )}

        {type !== 'allJobs' && (
          <div className="formGroup">
            <div className="formLabel">{_l('部门')}</div>
            {(!useMultiJobs ? !_.isEmpty(departmentInfos) : !!departmentItem.departmentId) || typeCursor !== 2 ? (
              <Fragment>
                {!useMultiJobs
                  ? departmentInfos.map((item, i) => this.renderDepartItem(item, i))
                  : this.renderDepartItem(departmentItem)}

                {typeCursor !== 2 && (
                  <Icon
                    className="Font26 Hand Gray_9e mAll5 TxtMiddle ThemeHoverColor"
                    icon={useMultiJobs && departmentItem.departmentId ? 'Circle-replace' : 'task_add-02'}
                    onClick={e => this.dialogSelectDeptFn(e, departmentItem)}
                  />
                )}
              </Fragment>
            ) : (
              <div className="formControl disabled"></div>
            )}
          </div>
        )}

        <div className={cx('formGroup', { isAllJobs: type === 'allJobs' })}>
          <div className="formLabel">
            <span>{type === 'allJobs' ? _l('全部职位') : _l('职位')}</span>
            {['single', 'allJobs'].includes(type) && hasPermission(authority, PERMISSION_ENUM.BASIC_SETTING) && (
              <span
                className="Gray_9e Hover_21 Hand Right"
                onClick={() => location.assign(`/admin/sysinfo/${projectId}?level5`)}
              >
                {_l('管理')}
              </span>
            )}
          </div>
          <SelectWrap
            disabled={typeCursor === 2}
            ref={select => (this.select = select)}
            className={cx('w100 mdAntSelect', { noBorder: typeCursor === 2 })}
            showSearch
            allowClear={type === 'multiple' ? departmentItem.jobIds.length > 0 : jobIds.length > 0}
            listHeight={285}
            optionLabelProp="label"
            value={type === 'multiple' ? departmentItem.jobIds : jobIds}
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
            onChange={onJobsChange}
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
      </div>
    );
  };

  render() {
    const { typeCursor, projectId, authority = [] } = this.props;
    const {
      worksiteList = [],
      workSiteId,
      worksiteKeywords = '',
      jobNumber,
      contactPhone,
      orgRoles = [],
      useMultiJobs,
      departmentJobInfos = [],
    } = this.state;

    let worksiteResult = [...worksiteList];
    if (worksiteKeywords) {
      worksiteResult = worksiteResult.filter(item => item.workSiteName.indexOf(worksiteKeywords) > -1);
    }

    return (
      <Fragment>
        {useMultiJobs
          ? departmentJobInfos.map((item, index) => this.renderDepartmentJob('multiple', item, index))
          : this.renderDepartmentJob()}
        {typeCursor !== 2 && (
          <div
            className="ThemeColor ThemeHoverColor2 flexRow alignItemsCenter mTop20 Hand"
            style={{ width: 'fit-content' }}
            onClick={this.handleAddMultipleJob}
          >
            <Icon icon="add" />
            <span className="mLeft4">{_l('添加多任职')}</span>
          </div>
        )}

        {useMultiJobs && <div className="mTop20">{this.renderDepartmentJob('allJobs')}</div>}
        <Divider />

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
                      <Icon
                        icon="clear"
                        className="mLeft8 Hand"
                        onClick={() => this.setState({ orgRoles: orgRoles.filter(l => l.id !== item.id) })}
                      />
                    )}
                  </span>
                );
              })}
              {typeCursor !== 2 && (
                <Icon
                  className="Font26 Hand Gray_9e mAll5 TxtMiddle ThemeHoverColor"
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
            onSearch={worksiteKeywords => this.setState({ worksiteKeywords })}
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
