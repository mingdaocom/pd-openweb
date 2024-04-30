import { getRequest } from 'src/util';
import { InviteFromType } from '../config';

export const getTitle = () => {
  const { type } = getRequest();
  let str = _l('注册');
  switch (type) {
    case 'create':
      str = _l('创建组织');
      break;
    case 'add':
    case 'editInfo':
      str = _l('加入组织');
      break;
    default:
      break;
  }

  return str;
};

export const getDes = authInfo => {
  let titleDesc = '';
  switch (authInfo.fromType) {
    case InviteFromType.friend:
      titleDesc = _l('成为协作好友');
      break;
    case InviteFromType.group:
      let groupDesc = authInfo.isPost ? _l('群组') : _l('聊天');
      titleDesc = groupDesc;
      break;
    case InviteFromType.task:
      titleDesc = _l('任务');
      break;
    case InviteFromType.kc:
      titleDesc = _l('共享文件夹');
      break;
    case InviteFromType.calendar:
      titleDesc = _l('日程');
      break;
    case InviteFromType.tFolder:
      titleDesc = _l('项目');
      break;
  }
  return titleDesc;
};

export const getDepartmentInfo = props => {
  const { userCard = [] } = props;
  const { departments = [], workSites = [], jobs = [] } = userCard;
  let departmentsN =
    departments.length <= 0
      ? [
          {
            value: 'null',
            text: _l('暂无部门'),
          },
        ]
      : _.map(departments, item => {
          return {
            value: item.departmentId,
            text: item.departmentName,
          };
        });
  let workSitesN =
    workSites.length <= 0
      ? [
          {
            value: 'null',
            text: _l('暂无工作地点'),
          },
        ]
      : _.map(workSites, item => {
          return {
            value: item.workSiteId,
            text: item.workSiteName,
          };
        });
  let jobsN =
    jobs.length <= 0
      ? [
          {
            value: 'null',
            text: _l('暂无职位'),
          },
        ]
      : _.map(jobs, item => {
          return {
            value: item.jobId,
            text: item.jobName,
          };
        });
  return {
    departmentsArr: departmentsN,
    workSitesArr: workSitesN,
    jobsArr: jobsN,
  };
};

// 名片字段验证
export const validateUserCardRequiredField = props => {
  const { company = {}, updateWarn, userCard = [] } = props;
  const {
    departmentId = '',
    jobId = '', // 加入网络使用
    workSiteId = '',
    jobNumber = '',
  } = company;
  const { isMustWorkSite = true, isMustDepartment = true, isMustJobNumber = true, isMustJob = true } = userCard;
  let isRight = true;
  let warnningData = [];
  if (isMustDepartment && !departmentId) {
    warnningData.push({ tipDom: this.departmentId, warnningText: _l('请填写部门') });
    isRight = false;
  }
  if (isMustJob && !jobId) {
    warnningData.push({ tipDom: this.jobId, warnningText: _l('请填写职位') });
    isRight = false;
  }
  if (isMustWorkSite && !workSiteId) {
    warnningData.push({ tipDom: this.workSiteId, warnningText: _l('请填写工作地点') });
    isRight = false;
  }
  if (isMustJobNumber && !jobNumber) {
    warnningData.push({ tipDom: this.jobNumber, warnningText: _l('请填写工号') });
    isRight = false;
  }
  updateWarn(warnningData);
  return isRight;
};
