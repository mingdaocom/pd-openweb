import React from 'react';
import PropTypes from 'prop-types';
import statisticController from 'src/api/statistic';
import PaginationWrap from '../../../../components/PaginationWrap';
import { LoadDiv, Icon, UserName } from 'ming-ui';
import _ from 'lodash';

const PAGE_SIZES = {
  NORMAL: 20,
  ALL: 100,
};

const REPOREPORT_TYPES = {
  POST: 1,
  DOC: 2,
  QA: 3,
  IMAGE: 4,
  USER: 5,
  GROUP: 6,
};

const SORT_FIELDS_TYPES = {
  CREATETIME: 0,
  POSTCOUNT: 1,
  COMMENTCOUNT: 2,
  DOCCOUNT: 3,
  QACOUNT: 4,
  VIEWCOUNT: 5,
  USERCOUNT: 6,
  PICCOUNT: 7,
  LINKCOUNT: 8,
  GROUPCOUNT: 9,
  LOGINTIME: 10,
  TASKSCOUNT: 11,
  ACTIVEINDEX: 12,
  SMSCOUNT: 13,
  TRIALCOUNT: 14,
  SCORECOUNT: 15,
  VOTECOUNT: 16,
  CREATETASKCOUNT: 17,
  COMPLETETASKCOUNT: 18,
};

const SORT_FILEDS = {
  [REPOREPORT_TYPES.USER]: [
    { text: _l('姓名') },
    { text: _l('部门'), width: '10%' },
    {
      sortField: SORT_FIELDS_TYPES.POSTCOUNT,
      title: _l('按发表动态数量降序排列'),
      text: _l('发布动态数'),
      width: '10%',
    },
    {
      sortField: SORT_FIELDS_TYPES.DOCCOUNT,
      title: _l('按发表文档数量降序排列'),
      text: _l('发布文档数'),
      width: '10%',
    },
    {
      sortField: SORT_FIELDS_TYPES.QACOUNT,
      title: _l('按发表问答数量降序排列'),
      text: _l('发表问答数'),
      width: '10%',
    },
    {
      sortField: SORT_FIELDS_TYPES.VOTECOUNT,
      title: _l('按发起投票数量降序排列'),
      text: _l('发起投票数'),
      width: '10%',
    },
    {
      sortField: SORT_FIELDS_TYPES.COMMENTCOUNT,
      title: _l('按评论回复次数降序排列'),
      text: _l('评论回复数'),
      width: '10%',
    },
    {
      sortField: SORT_FIELDS_TYPES.COMPLETETASKCOUNT,
      title: _l('按完成任务数降序排列'),
      text: _l('完成任务'),
      width: '10%',
    },
    {
      sortField: SORT_FIELDS_TYPES.CREATETASKCOUNT,
      title: _l('按创建任务数降序排列'),
      text: _l('创建任务'),
      width: '10%',
    },
  ],
  [REPOREPORT_TYPES.POST]: [
    { text: _l('发表人'), width: '15%' },
    { text: _l('部门'), width: '20%' },
    { text: _l('内容'), width: '20%' },
    {
      sortField: SORT_FIELDS_TYPES.COMMENTCOUNT,
      title: _l('按评论回复次数降序排列'),
      text: _l('评论回复次数'),
      width: '20%',
    },
  ],
  [REPOREPORT_TYPES.DOC]: [
    { text: _l('发表人'), width: '15%' },
    { text: _l('部门'), width: '20%' },
    { text: _l('文档标题') },
    {
      sortField: SORT_FIELDS_TYPES.VIEWCOUNT,
      title: _l('按查看次数降序排列'),
      text: _l('查看次数'),
      width: '10%',
    },
    {
      sortField: SORT_FIELDS_TYPES.COMMENTCOUNT,
      title: _l('按回复次数降序排列'),
      text: _l('回复次数'),
      width: '10%',
    },
  ],
  [REPOREPORT_TYPES.QA]: [
    { text: _l('发表人'), width: '15%' },
    { text: _l('部门'), width: '20%' },
    { text: _l('问答标题') },
    {
      sortField: SORT_FIELDS_TYPES.VIEWCOUNT,
      title: _l('按查看次数降序排列'),
      text: _l('查看次数'),
      width: '10%',
    },
    {
      sortField: SORT_FIELDS_TYPES.COMMENTCOUNT,
      title: _l('按回复次数降序排列'),
      text: _l('回复次数'),
      width: '10%',
    },
  ],
  [REPOREPORT_TYPES.IMAGE]: [
    { text: _l('发表人'), width: '15%' },
    { text: _l('部门'), width: '20%' },
    { text: _l('图片标题') },
    {
      sortField: SORT_FIELDS_TYPES.VIEWCOUNT,
      title: _l('按查看次数降序排列'),
      text: _l('查看次数'),
      width: '10%',
    },
    {
      sortField: SORT_FIELDS_TYPES.COMMENTCOUNT,
      title: _l('按回复次数降序排列'),
      text: _l('回复次数'),
      width: '10%',
    },
  ],
  [REPOREPORT_TYPES.GROUP]: [
    { text: _l('群组名称') },
    { text: _l('创建人'), width: '15%' },
    {
      sortField: SORT_FIELDS_TYPES.USERCOUNT,
      title: _l('按累计成员数降序排列'),
      text: _l('累计成员数'),
      width: '15%',
    },
    {
      sortField: SORT_FIELDS_TYPES.POSTCOUNT,
      title: _l('按发表动态更新数量降序排列'),
      text: _l('发布动态更新数量'),
      width: '15%',
    },
    {
      sortField: SORT_FIELDS_TYPES.DOCCOUNT,
      title: _l('按发表文档数量降序排列'),
      text: _l('发表文档数量'),
      width: '15%',
    },
    {
      sortField: SORT_FIELDS_TYPES.QACOUNT,
      title: _l('按发表问答数量降序排列'),
      text: _l('发表问答数量'),
      width: '15%',
    },
  ],
};

const SORT_TYPES = {
  ASC: 1,
  DESC: 0,
};

export default class StatTable extends React.Component {
  static REPOREPORT_TYPES = REPOREPORT_TYPES;

  static propTypes = {
    reportType: PropTypes.oneOf(_.values(REPOREPORT_TYPES)),
    startDate: PropTypes.string,
    endDate: PropTypes.string,
    projectId: PropTypes.string.isRequired,
  };

  constructor() {
    super();
    this.state = {
      sortField: SORT_FIELDS_TYPES.CREATETIME,
      sortType: SORT_TYPES.DESC,
      pageIndex: 1,
      pageSize: PAGE_SIZES.NORMAL,
      isLoading: false,

      allCount: null,
      list: null,
    };
  }

  componentWillMount() {
    this.fetchData();
  }

  componentWillReceiveProps(nextProps) {
    if (
      this.props.reportType !== nextProps.reportType ||
      this.props.startDate !== nextProps.startDate ||
      this.props.endDate !== nextProps.endDate
    ) {
      this.abortRequest();
      this.setState(
        {
          isLoading: true,
          pageIndex: 1,
          pageSize: PAGE_SIZES.NORMAL,
          sortField: SORT_FIELDS_TYPES.CREATETIME,
          sortType: SORT_TYPES.DESC,
        },
        this.fetchData.bind(this),
      );
    }
  }

  componentWillUpdate(nextProps, nextState) {
    const { sortField, sortType, pageIndex, pageSize } = this.state;
    if (
      sortField !== nextState.sortField ||
      sortType !== nextState.sortType ||
      pageIndex !== nextState.pageIndex ||
      pageSize !== nextState.pageSize
    ) {
      this.abortRequest();
      this.fetchData(nextState);
    }
  }

  abortRequest() {
    if (this.promise && this.promise.abort) {
      this.promise.abort();
    }
  }

  fetchData(nextState) {
    const { startDate, endDate, projectId, reportType } = this.props;
    const { pageIndex, pageSize, sortField, sortType } = nextState || this.state;
    const params = {
      startDate,
      endDate,
      pageIndex,
      pageSize,
      sortField,
      sortType,
      projectId,
    };
    this.setState({
      isLoading: true,
    });
    let requestFunc;
    switch (reportType) {
      case REPOREPORT_TYPES.USER:
        requestFunc = statisticController.getUserReport;
        break;
      case REPOREPORT_TYPES.GROUP:
        requestFunc = statisticController.getGroupReport;
        break;
      case REPOREPORT_TYPES.QA:
      case REPOREPORT_TYPES.POST:
      case REPOREPORT_TYPES.DOC:
      case REPOREPORT_TYPES.IMAGE:
        requestFunc = statisticController.getPostReportByType;
        params.postReportType = reportType;
        break;
    }

    this.promise = requestFunc(params);

    this.promise
      .then(data => {
        if (data) {
          this.setState({
            list: data.list,
            allCount: data.allCount,
            isLoading: false,
          });
        } else {
          return Promise.reject();
        }
      })
      .catch(({ errorCode } = {}) => {
        if (errorCode !== 1) {
          alert(_l('获取列表失败'), 2);
          this.setState({
            isLoading: false,
          });
        }
      });
  }

  renderCol() {
    const { reportType } = this.props;
    const fields = SORT_FILEDS[reportType];
    return (
      <colgroup>
        <col width="5%" />
        {_.map(fields, (field, index) => {
          return <col width={field.width} key={index} />;
        })}
      </colgroup>
    );
  }

  renderThead() {
    const { reportType } = this.props;
    const { sortType, sortField } = this.state;
    const fields = SORT_FILEDS[reportType];
    return (
      <tr>
        <th width={'5%'} />
        {_.map(fields, (field, index) => {
          const widthProps = field.width ? { width: field.width } : {};
          const icon = field.sortField === sortField && sortType === SORT_TYPES.DESC ? 'arrow-up' : 'arrow-down';
          if (field.sortField) {
            const clickHander = e => {
              if (field.sortField === sortField) {
                this.setState({
                  sortType: sortType === SORT_TYPES.DESC ? SORT_TYPES.ASC : SORT_TYPES.DESC,
                });
              } else {
                this.setState({
                  sortType: SORT_TYPES.DESC,
                });
              }
              this.setState({
                sortField: field.sortField,
              });
            };
            return (
              <th className="TxtCenter" key={index}>
                <span title={field.title} className="Hand" onClick={clickHander}>
                  {field.text}
                  <Icon icon={icon} className="mLeft5 sortIcon" />
                </span>
              </th>
            );
          } else {
            return (
              <th {...widthProps} key={index}>
                {field.text}
              </th>
            );
          }
        })}
      </tr>
    );
  }

  renderTds(item, index) {
    const { reportType } = this.props;
    const { user: { accountId, fullname, department, userId } = {} } = item;
    if (reportType === REPOREPORT_TYPES.USER) {
      return (
        <React.Fragment>
          <td className="pLeft10">{index + 1}</td>
          <td className="overflow_ellipsis wMax100">
            <UserName user={{ accountId, userName: fullname }} />
          </td>
          <td>
            <div>{department}</div>
          </td>
          <td className="TxtCenter">{item.postCount}</td>
          <td className="TxtCenter">{item.docCount}</td>
          <td className="TxtCenter">{item.qaCount}</td>
          <td className="TxtCenter">{item.voteCount}</td>
          <td className="TxtCenter">{item.commentCount}</td>
          <td className="TxtCenter">{item.completeTaskCount}</td>
          <td className="TxtCenter">{item.createTaskCount}</td>
        </React.Fragment>
      );
    } else if (reportType === REPOREPORT_TYPES.POST) {
      return (
        <React.Fragment>
          <td className="pLeft10">{index + 1}</td>
          <td className="overflow_ellipsis wMax100">
            <UserName user={{ accountId, userName: fullname }} />
          </td>
          <td>{department}</td>
          <td className="overflow_ellipsis wMax100">
            <a href={'/feeddetail?itemID=' + item.postId} target="_blank" className="TxtMiddle">
              {item.message}
            </a>
          </td>
          <td className="TxtCenter">{item.numComment}</td>
        </React.Fragment>
      );
    } else if (reportType === REPOREPORT_TYPES.GROUP) {
      const createUser = item.createUser || {};
      return (
        <React.Fragment>
          <td className="pLeft10">{index + 1}</td>
          <td className="overflow_ellipsis wMax100">
            <a href={'/group/groupValidate?gID=' + item.groupId} target="_blank">
              {item.groupName}
            </a>
          </td>
          <td className="overflow_ellipsis wMax100">
            <UserName user={{ accountId: createUser.accountId, userName: createUser.fullname }} />
          </td>
          <td className="TxtCenter">{item.numFollower}</td>
          <td className="TxtCenter">{item.postCount}</td>
          <td className="TxtCenter">{item.docCount}</td>
          <td className="TxtCenter">{item.qaCount}</td>
        </React.Fragment>
      );
    } else {
      return (
        <React.Fragment>
          <td className="pLeft10">{index + 1}</td>
          <td>{!userId ? fullname : <UserName user={{ accountId, userName: fullname }} />}</td>
          <td>{department}</td>
          <td>
            <a
              href={'/feeddetail?itemID=' + item.postId}
              target="_blank"
              className="overflow_ellipsis TxtMiddle wMax100"
            >
              {item.message}
            </a>
          </td>
          <td className="TxtCenter">{item.numView}</td>
          <td className="TxtCenter">{item.numComment}</td>
        </React.Fragment>
      );
    }
  }

  render() {
    const { isLoading, list, allCount, pageSize, pageIndex } = this.state;
    const { reportType } = this.props;
    const fields = SORT_FILEDS[reportType];
    return (
      <div className="statTable">
        <table className="ThemeBorderColor4 w100" cellSpacing="0">
          {this.renderCol()}
          <thead>{this.renderThead()}</thead>
        </table>
        <div className="statTableBody">
          {isLoading ? (
            <LoadDiv className="mTop10 mBottom10" />
          ) : (
            <table>
              {this.renderCol()}
              <tbody>
                {allCount > 0 ? (
                  _.map(list, (reportItem, index) => {
                    return (
                      <tr className="LineHeight25" key={index}>
                        {this.renderTds(reportItem, index)}
                      </tr>
                    );
                  })
                ) : (
                  <tr className="TxtCenter">
                    <td colSpan={fields.length + 1} className="pTop30">
                      <span>{_l('暂无数据')}</span>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>
        {!isLoading && allCount > PAGE_SIZES.NORMAL ? (
          <PaginationWrap
            total={allCount}
            pageSize={pageSize}
            pageIndex={pageIndex}
            onChange={pageIndex => this.setState({ pageIndex }, this.fetchData)}
          />
        ) : null}
      </div>
    );
  }
}
