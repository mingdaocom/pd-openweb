import React from 'react';
import './index.less';
import { Dialog, LoadDiv, Icon } from 'ming-ui';
import userController from 'src/api/user';
import Act from '../dialogInviteUser/act';
import DialogSelectDept from 'src/components/dialogSelectDept';
import DialogSelectJob from 'src/components/DialogSelectJob';
import 'src/components/select/select';

class Approval extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      companyName: '',
      jobNumber: '',
      contactPhone: '',
      fullname: '',
      departmentInfos: [], // 部门信息
      isShowAct: false,
      idAct: '',
      jobInfos: [], // 职位信息
      isShowJobList: false,
      jobs: [],
      isLoading: true,
      mobilePhone: '',
      isLoading: false,
      workSiteId: '',
      workSites: [],
    };
    this.workSiteInput = null;
  }

  componentDidMount() {
    this.getUserData();
  }

  getUserData = () => {
    if (!this.state.isLoading) {
      this.setState({
        isLoading: true,
      });
    }
    userController
      .getUserCard({
        projectId: this.props.projectId,
        accountId: this.props.accountId,
        setAcountPravite: false,
      })
      .then(
        data => {
          if (data) {
            let { user = [], workSites = [], jobs } = data;
            this.setState(
              {
                isLoading: false,
                mobilePhone: user.mobilePhone,
                fullname: user.fullname,
                jobInfos: user.jobInfos,
                departmentInfos: user.departmentInfos,
                workSiteId: user.workSiteId,
                jobNumber: user.jobNumber,
                contactPhone: user.contactPhone,
              },
              () => {
                let list = [];
                if (workSites.length > 0) {
                  list = JSON.parse(
                    JSON.stringify(workSites)
                      .replace(/workSiteId/g, 'id')
                      .replace(/workSiteName/g, 'name'),
                  );
                }
                $(this.workSiteInput).MDSelect({
                  defualtSelectedValue: this.state.workSiteId,
                  dataArr: list,
                  showType: 4,
                  defaultOptionText: _l('请选择工作地点'),
                  onChange: value => {
                    this.setState({
                      workSiteId: value,
                    });
                  },
                });
              },
            );
          }
        },
        () => {},
      );
  };

  saveFn = fn => {
    userController
      .agreeUserJoin({
        projectId: this.props.projectId,
        accountId: this.props.accountId,
        jobIds: this.state.jobInfos.map(it => it.jobId),
        departmentIds: this.state.departmentInfos.map(it => it.departmentId),
        workSiteId: this.state.workSiteId,
        jobNumber: this.state.jobNumber,
        contactPhone: this.state.contactPhone,
      })
      .then(
        result => {
          if (result === 1) {
            fn({
              isOk: true,
            });
            alert(_l('批准成功'));
          } else if (result === 4) {
            alert(_l('当前用户数已超出人数限制'), 3);
          } else {
            alert(_l('操作失败'), 2);
          }
        },
        () => {
          alert(_l('操作失败'), 2);
        },
      );
    return false;
  };

  // 添加部门
  dialogSelectDeptFn = e => {
    const { projectId, departmentId } = this.props;
    const { departmentInfos } = this.state;
    const _this = this;
    new DialogSelectDept({
      projectId,
      unique: false,
      fromAdmin: true,
      selectedDepartment: departmentInfos,
      showCreateBtn: false,
      selectFn(departments) {
        _this.setState({
          departmentInfos: departments,
        });
      },
    });
  };
  // 添加职位
  dialogSelectJobFn = e => {
    const { projectId } = this.props;
    const { jobInfos } = this.state;
    new DialogSelectJob({
      projectId,
      onSave: data => {
        const jobIds = jobInfos.map(job => job.jobId);

        this.setState({
          jobInfos: jobInfos.concat(data.filter(o => jobIds.indexOf(o.jobId) === -1)),
        });
      },
    });
  };

  render() {
    const { departmentInfos, jobInfos, jobNumber, contactPhone, isLoading, fullname, mobilePhone } = this.state;

    return (
      <Dialog
        title={_l('审批信息')}
        okText={_l('批准加入')}
        cancelText={_l('取消')}
        className="dialogApproval"
        onCancel={() => {
          this.props.setValue({
            showDialog: false,
          });
        }}
        onOk={() => {
          this.saveFn(this.props.setValue);
        }}
        visible={this.props.showDialog}>
        {isLoading ? (
          <LoadDiv />
        ) : (
          <div className="formTable">
            <div className="formGroup">
              <span className="formLabel mTop5">{_l('姓名')}</span>
              <div className="formControl Gray_75">{fullname}</div>
            </div>
            <div className="formGroup">
              <span className="formLabel mTop5">{_l('手机')}</span>
              <div className="formControl Gray_75">{mobilePhone}</div>
            </div>
            <div className="formGroup mBottom24">
              <span className="formLabel">{_l('部门')}</span>
              {departmentInfos.map((item, i) => {
                return (
                  <span className="itemSpan mAll5">
                    {item.departmentName}
                    {i === 0 && <span className="isTopIcon">主</span>}
                    <div className="moreOption">
                      <Icon
                        className="Font14 Hand Gray_bd"
                        icon="moreop"
                        onClick={e => {
                          this.setState(
                            {
                              isShowAct: !this.state.isShowAct,
                            },
                            () => {
                              if (this.state.isShowAct) {
                                this.setState({
                                  idAct: item.departmentId,
                                });
                              }
                            },
                          );
                        }}
                      />
                      {this.state.isShowAct && this.state.idAct === item.departmentId && (
                        <Act
                          onClickAwayExceptions={[]}
                          onClickAway={() =>
                            this.setState({
                              isShowAct: false,
                              idAct: '',
                            })
                          }
                          isPosition={false}
                          isTop={i === 0}
                          deleteFn={() => {
                            let list = departmentInfos.filter(it => it.departmentId !== item.departmentId) || [];
                            this.setState({
                              isShowAct: false,
                              idAct: '',
                              departmentInfos: list,
                            });
                          }}
                          setToTop={() => {
                            let list = departmentInfos.filter(it => it.departmentId !== item.departmentId);
                            let data = departmentInfos.find(it => it.departmentId === item.departmentId);
                            list.unshift(data);
                            this.setState({
                              isShowAct: false,
                              idAct: '',
                              departmentInfos: list,
                            });
                          }}
                          isShowAct={this.state.isShowAct}
                        />
                      )}
                    </div>
                  </span>
                );
              })}
              <Icon
                className="Font26 Hand Gray_9e mAll5 TxtMiddle"
                icon="task_add-02"
                onClick={e => this.dialogSelectDeptFn(e)}
              />
            </div>
            <div className="formGroup">
              <span className="formLabel mTop5">{_l('职位')}</span>
              <div className="jobBox">
                {_.map(jobInfos, item => {
                  return (
                    <span className="itemSpan mAll5">
                      {item.jobName}
                      <div className="moreOption">
                        <Icon
                          className="Font14 Hand Gray_bd"
                          icon="moreop"
                          onClick={e => {
                            this.setState(
                              {
                                isShowAct: !this.state.isShowAct,
                              },
                              () => {
                                if (this.state.isShowAct) {
                                  this.setState({
                                    idAct: item.jobId,
                                  });
                                }
                              },
                            );
                          }}
                        />
                        {this.state.isShowAct && this.state.idAct === item.jobId && (
                          <Act
                            onClickAwayExceptions={[]}
                            onClickAway={() =>
                              this.setState({
                                isShowAct: false,
                                idAct: '',
                              })
                            }
                            isPosition={true}
                            isTop={false}
                            deleteFn={() => {
                              this.setState({
                                isShowAct: false,
                                idAct: '',
                                jobInfos: this.state.jobInfos.filter(it => it.jobId !== item.jobId),
                              });
                            }}
                            isShowAct={this.state.isShowAct}
                          />
                        )}
                      </div>
                    </span>
                  );
                })}
                <span className="jobChooseIcon Relative">
                  <Icon
                    className="Font26 Hand Gray_9e mAll5 TxtMiddle"
                    icon="task_add-02"
                    onClick={e => this.dialogSelectJobFn(e)}
                  />
                </span>
              </div>
            </div>
            <div className="formGroup mBottom25">
              <span className="formLabel">{_l('工作地点')}</span>
              <div className="formControl Gray_75">
                <div className="workSiteBox">
                  <input type="hidden" ref={input => (this.workSiteInput = input)} />
                </div>
              </div>
            </div>
            <div className="formGroup">
              <span className="formLabel mTop5">{_l('工号')}</span>
              <div className="formControl">
                <input
                  value={jobNumber}
                  placeholder={_l('请输入工号')}
                  onChange={e => {
                    this.setState({
                      jobNumber: e.target.value,
                    });
                  }}
                />
              </div>
            </div>
            <div className="formGroup">
              <span className="formLabel">{_l('工作电话')}</span>
              <div className="formControl">
                <input
                  value={contactPhone}
                  placeholder={_l('请输入工作电话')}
                  onChange={e => {
                    this.setState({
                      contactPhone: e.target.value,
                    });
                  }}
                />
              </div>
            </div>
          </div>
        )}
      </Dialog>
    );
  }
}

export default Approval;
