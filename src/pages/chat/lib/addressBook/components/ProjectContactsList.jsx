import React, { Fragment } from 'react';
import { ScrollView, LoadDiv, Icon } from 'ming-ui';
import departmentController from 'src/api/department';
import ContactItem from './ContactItem';
import cx from 'classnames';
import styled from 'styled-components';

const DepartmentTreeWrapper = styled.div`
  border-right: 1px solid #f3f3f3;
  overflow: auto;
  .subs {
    margin-left: 10px;
  }
`;

const Department = styled.div`
  width: 100%;
  padding: 4px;
  &:hover {
    background-color: #f5f5f5;
  }
  &.active {
    background-color: #d6ecfe;
    .icon,
    div {
      color: #2196f3 !important;
    }
  }
  .iconArrow {
    display: flex;
    padding: 7px 0px 5px 2px;
    border-radius: 4px;
    &:hover {
      background-color: #f5f5f5;
    }
  }
`;

export default class ProjectContactList extends React.Component {
  constructor(props) {
    super(props);
    const project = _.find(md.global.Account.projects, { projectId: props.projectId });
    this.state = {
      selects: [project.projectId],
      department: props.departmentsList,
      departmentLoading: false,
    };
  }

  componentWillReceiveProps(nextProps) {
    if (!_.isEqual(this.props.departmentsList, nextProps.departmentsList)) {
      this.setState({ department: nextProps.departmentsList, selects: [nextProps.projectId] });
    }
    if (!_.isEqual(this.props.departmentLoading, nextProps.departmentLoading)) {
      this.setState({ departmentLoading: nextProps.departmentLoading });
    }
  }

  renderListContent() {
    const { department = [], isLoading } = this.props;
    if (!department.length && isLoading) return <LoadDiv className="mTop10" />;
    return <React.Fragment>{this.renderDepartmentTree()}</React.Fragment>;
  }

  updateTreeData = (list, key, subs) => {
    return list.map(node => {
      if (node.departmentId === key) {
        return { ...node, subs };
      }
      if (node.subs) {
        return { ...node, subs: this.updateTreeData(node.subs, key, subs) };
      }
      return node;
    });
  };

  expandNext = id => {
    const { projectId } = this.props;
    let { department } = this.state;
    this.setState({ departmentLoading: true });
    departmentController
      .pagedDepartmentTrees({
        projectId,
        pageIndex: 1,
        pageSize: 100,
        parentId: id,
      })
      .then(res => {
        let data = res.map(item => ({ ...item, subs: [] }));
        this.setState({ department: this.updateTreeData(department, id, data), departmentLoading: false });
      });
  };

  renderDepartment(item) {
    const { groupId = '' } = this.props;
    const { selects } = this.state;
    const subVisible = selects.includes(item.departmentId);
    return (
      <Fragment key={item.departmentId}>
        <Department
          className={cx('flexRow valignWrapper pointer', { active: groupId === item.departmentId })}
          onClick={() => {
            this.props.selectCurrentDepartment(item.departmentId, item.departmentName);
          }}
        >
          <Icon
            icon={subVisible ? 'arrow-down' : 'arrow-right-tip'}
            className={cx('Gray_75 iconArrow', { Visibility: !item.haveSubDepartment })}
            onClick={event => {
              event.stopPropagation();
              this.expandNext(item.departmentId);
              const { selects } = this.state;
              if (selects.includes(item.departmentId)) {
                this.setState({
                  selects: selects.filter(id => id !== item.departmentId),
                });
              } else {
                this.setState({
                  selects: selects.concat(item.departmentId),
                });
              }
            }}
          />
          <Icon className="Gray_9e Font16 mLeft2 mRight5" icon="folder" />
          <div className="ellipsis Font13">{item.departmentName}</div>
        </Department>
        {subVisible && <div className="subs">{item.subs.map(item => this.renderDepartment(item))}</div>}
      </Fragment>
    );
  }

  renderDepartmentTree() {
    const { projectId } = this.props;
    const { department = [], departmentLoading } = this.state;
    const project = _.find(md.global.Account.projects, { projectId });
    return (
      <DepartmentTreeWrapper className="flex">
        <ScrollView
          className="flex asdsad"
          onScrollEnd={() => {
            if (!departmentLoading && this.props.isMore) {
              this.props.loadNextPage();
            }
          }}
        >
          {this.renderDepartment({
            departmentId: project.projectId,
            departmentName: project.companyName,
            subs: department.length ? department : [],
            haveSubDepartment: department.length ? true : false,
          })}
          {departmentLoading && <LoadDiv />}
        </ScrollView>
      </DepartmentTreeWrapper>
    );
  }
  onScrollEnd = () => {};

  render() {
    return <ScrollView onScrollEnd={this.onScrollEnd}>{this.renderListContent()}</ScrollView>;
  }
}
