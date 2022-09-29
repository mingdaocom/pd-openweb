import React, { forwardRef } from 'react';
import './edit.less';
import { Dialog, LoadDiv, Icon, Tooltip } from 'ming-ui';
import { Select } from 'antd';
import userController from 'src/api/user';
import departmentController from 'src/api/department';
import Act from '../dialogInviteUser/act';
import DialogSelectDept from 'dialogSelectDept';
import DialogSelectJob from 'src/components/DialogSelectJob';
import intlTelInput from '@mdfe/intl-tel-input';
import utils from '@mdfe/intl-tel-input/build/js/utils';
import '@mdfe/intl-tel-input/build/css/intlTelInput.min.css';
import RegExp from 'src/util/expression';
import { getJobs, addJob } from 'src/api/job';
import cx from 'classnames';
import { checkSensitive } from 'src/api/fixedData.js';

const { Option } = Select;
const configs = [
  { key: 'fullname', label: _l('姓名'), isRequired: true },
  { key: 'mobilePhone', label: _l('手机号') },
  { key: 'email', label: _l('邮箱') },
];

const TextInput = forwardRef((props, $ref) => {
  const { label, editable = true, isRequired = false, value, placeholder, onChange, onBlur, onFocus, error } = props;
  let inputProps = {
    value,
    placeholder,
    onChange,
    onBlur,
    onFocus,
  };
  return (
    <div className="formGroup editFormGroup">
      <span className="formLabel">
        {label}
        {isRequired ? <span className="TxtMiddle Red">*</span> : null}
      </span>
      {editable ? (
        <div className="formControl">
          <input type="text" className={cx({ error })} {...inputProps} ref={$ref} />
        </div>
      ) : null}
      {props.children}
      <span
        className={cx('Block Red LineHeight25', {
          Hidden: error && error.msg,
          pTop25: !error,
        })}
      >
        {error && error.msg}
      </span>
    </div>
  );
});

const checkFuncs = {
  fullname: fullname => {
    if ($.trim(fullname) === '') {
      return {
        msg: _l('姓名不能为空'),
      };
    }
  },
  email: email => {
    if (!email) return;
    if (!RegExp.isEmail(email)) {
      return {
        msg: _l('邮箱格式错误'),
      };
    }
  },
  mobilePhone: ([value, input, iti]) => {
    if (value && iti) {
      if (!(input && iti.isValidNumber())) {
        return {
          msg: _l('手机号格式错误'),
        };
      }
    }
  },
};

class EditInfo extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      companyName: '',
      jobNumber: '',
      contactPhone: '',
      fullname: '',
      email: '',
      mobilePhone: '',
      departmentInfos: [], //部门信息
      isShowAct: false,
      idAct: '',
      jobInfos: [], //职位信息
      isShowJobList: false,
      jobs: [],
      isLoading: true,
      workSiteId: '',
      jobIds: [],
      jobList: [],
      keywords: '',
      errors: {},
      fullDepartmentInfo: {}
    };
    this.handleFieldBlur = this.handleFieldBlur.bind(this);
    this.handleFieldInput = this.handleFieldInput.bind(this);
    this.clearError = this.clearError.bind(this);
  }

  componentDidMount() {
    this.getJobList();
    this.getUserData();
    this.itiFn();
  }

  componentDidUpdate() {
    !this.iti && this.itiFn();
  }

  componentWillUnmount() {
    this.iti && this.iti.destroy();
  }

  itiFn = () => {
    if (this.$refs.mobilePhone) {
      this.iti = intlTelInput(this.$refs.mobilePhone, {
        customPlaceholder: '',
        autoPlaceholder: 'off',
        initialCountry: 'cn',
        loadUtils: '',
        preferredCountries: ['cn'],
        utilsScript: utils,
        separateDialCode: true,
      });
    }
  };

  getUserData = () => {
    if (!this.state.isLoading) {
      this.state({
        isLoading: true,
      });
    }
    userController
      .getUserCard({
        accountId: this.props.accountId,
        projectId: this.props.projectId,
        setAcountPravite: false,
      })
      .then(data => {
        let { user = {}, workSites = [], jobs = [] } = data;
        this.setState(
          {
            isLoading: false,
            fullname: user.fullname || '',
            mobilePhone: user.mobilePhone || '',
            email: user.email || '',
            companyName: user.companyName || '',
            departmentInfos: user.departmentInfos || [], //部门信息
            jobInfos: user.jobInfos || [], //职位信息
            jobNumber: user.jobNumber || '',
            contactPhone: user.contactPhone || '',
            workSiteId: user.workSiteId,
            jobs: jobs || [],
            jobIds: (user.jobInfos || []).map(item => item.jobId),
            // idAct: user.departmentInfos && user.departmentInfos.length > 0 ? user.departmentInfos[0].departmentId : ''
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
              defaultOptionText: _l('请选择'),
              onChange: value => {
                this.setState({
                  workSiteId: value,
                });
              },
            });
          },
        );
      });
  };

  clearError(field) {
    return () => {
      const { errors } = this.state;
      delete errors[field];
      this.setState({ errors });
    };
  }

  handleFieldInput(field) {
    return e => {
      this.setState({
        [field]: field === 'mobilePhone' ? this.iti.getNumber() : e.target.value,
      });
    };
  }

  handleFieldBlur(field) {
    return e => {
      let value;
      if (typeof e !== 'undefined') {
        value = field === 'mobilePhone' ? [this.iti.getNumber(), this.$refs.mobilePhone, this.iti] : e.target.value;
      } else {
        value = field === 'mobilePhone' ? [this.iti.getNumber(), this.$refs.mobilePhone, this.iti] : this.state[field];
      }
      const errors = this.state.errors || {};
      const checkResult = checkFuncs[field](value);
      if (checkResult) {
        errors[field] = checkResult;
      }
      this.setState({
        errors: errors,
      });
    };
  }

  getJobList = jobName => {
    const { projectId } = this.props;
    const { keywords } = this.state;
    if (this.ajaxRequest) {
      this.ajaxRequest.abort();
    }
    this.ajaxRequest = getJobs({
      projectId,
      keywords,
      pageIndex: 1,
      pageSize: 1000,
    });
    this.ajaxRequest.then(res => {
      console.log(res, 'res');
      let newJobInfo = jobName && _.find(res.list, item => item.jobName === jobName);
      let jobIds = jobName && newJobInfo ? [newJobInfo.jobId] : [];
      this.setState(
        {
          jobList: res.list,
          jobIds: [...this.state.jobIds, ...jobIds],
        },
        () => {
          console.log(this.state.jobList, 'jobListjobListjobListjobList');
        },
      );
    });
  };
  handleAddJob = jobName => {
    const { projectId } = this.props;
    addJob({
      projectId,
      jobName,
    }).then(res => {
      if (res) {
        alert(_l('创建成功'));
        this.getJobList(jobName);
      } else {
        alert(_l('创建失败'), 2);
      }
    });
  };
  onBlur = e => {
    let { contactPhone } = this.state;
    let tel = e && e.target && e.target.value;
    if (!tel) return;
    if (!RegExp.isTel(tel) && !RegExp.isMobile(tel)) {
      this.setState({ contactPhoneError: true });
    } else {
      this.setState({ contactPhoneError: false });
    }
  };

  saveFn = fn => {
    if (md.global.Config.IsPlatformLocal) {
      Promise.all([
        checkSensitive({ content: this.state.companyName }),
        checkSensitive({ content: this.state.jobNumber }),
      ]).then(results => {
        if (!results.find(result => result)) {
          userController
            .updateUserCard({
              projectId: this.props.projectId,
              accountId: this.props.accountId,
              companyName: this.state.companyName,
              jobIds: this.state.jobIds,
              departmentIds: this.state.departmentInfos.map(it => it.departmentId),
              jobNumber: this.state.jobNumber,
              contactPhone: this.state.contactPhone,
              workSiteId: this.state.workSiteId,
            })
            .then(
              function (result) {
                if (result === 1) {
                  fn({
                    showDialog: false,
                    isOk: true,
                  });
                  alert(_l('修改成功'), 1);
                } else {
                  alert(_l('保存失败'), 2);
                }
              },
              function () {
                alert(_l('保存失败'), 2);
              },
            )
            .always(function () {
              // _this.dialog.enable();
            });
        } else {
          alert(_l('输入内容包含敏感词，请重新填写'), 3);
        }
      });
      return;
    }
    if (!(this.state.email || this.state.mobilePhone)) {
      alert(_l('请输入手机号或邮箱'), 3);
      return false;
    }
    if (this.state.errors && _.keys(this.state.errors).length) {
      return false;
    }
    userController
      .updateUser({
        projectId: this.props.projectId,
        accountId: this.props.accountId,
        companyName: this.state.companyName,
        jobIds: this.state.jobInfos.map(it => it.jobId),
        departmentIds: this.state.departmentInfos.map(it => it.departmentId),
        jobNumber: this.state.jobNumber,
        contactPhone: this.state.contactPhone,
        workSiteId: this.state.workSiteId,
        fullname: this.state.fullname,
        mobilePhone: this.state.mobilePhone,
        email: this.state.email,
      })
      .then(
        function (result) {
          if (result === 1) {
            fn({
              showDialog: false,
              isOk: true,
            });
            alert(_l('修改成功'), 1);
          } else {
            alert(_l('保存失败'), 2);
          }
        },
        function () {
          alert(_l('保存失败'), 2);
        },
      );
  };

  // 添加部门
  dialogSelectDeptFn = e => {
    const { projectId, departmentId } = this.props;
    const { departmentInfos } = this.state;
    const _this = this;
    new DialogSelectDept({
      projectId,
      unique: false,
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
          // idAct: data[0].departmentId
        });
      },
    });
  };
  $refs = {};
  onBlur = e => {
    let { contactPhone } = this.state;
    let tel = e && e.target && e.target.value;
    console.log(tel, contactPhone, !RegExp.isTel(tel));
    if (!tel) return;
    if (!RegExp.isTel(tel) && !RegExp.isMobile(tel)) {
      this.setState({ contactPhoneError: true });
    } else {
      this.setState({ contactPhoneError: false });
    }
  };

  getJobList = jobName => {
    const { projectId } = this.props;
    const { keywords } = this.state;
    if (this.ajaxRequest) {
      this.ajaxRequest.abort();
    }
    this.ajaxRequest = getJobs({
      projectId,
      keywords,
      pageIndex: 1,
      pageSize: 1000,
    });
    this.ajaxRequest.then(res => {
      let newJobInfo = jobName && _.find(res.list, item => item.jobName === jobName);
      let jobIds = jobName && newJobInfo ? [newJobInfo.jobId] : [];
      this.setState({
        jobList: res.list,
        jobIds: [...this.state.jobIds, ...jobIds],
      });
    });
  };

  handleAddJob = jobName => {
    const { projectId } = this.props;
    addJob({
      projectId,
      jobName,
    }).then(res => {
      if (res) {
        alert(_l('创建成功'));
        this.getJobList(jobName);
      } else {
        alert(_l('创建失败'), 2);
      }
    });
  };

  render() {
    const {
      departmentInfos,
      jobInfos,
      jobs,
      jobNumber,
      contactPhone,
      isLoading,
      contactPhoneError,
      errors,
      jobList = [],
      jobIds = [],
      keywords = '',
      fullDepartmentInfo = {},
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
    return (
      <Dialog
        title={_l('编辑员工名片')}
        okText={_l('保存')}
        cancelText={_l('取消')}
        className="dialogSetEdit"
        onCancel={() => {
          this.props.setValue({
            showDialog: false,
          });
        }}
        onOk={() => {
          if (this.state.contactPhoneError) return;
          this.saveFn(this.props.setValue);
        }}
        visible={this.props.showDialog}
      >
        {isLoading ? (
          <LoadDiv />
        ) : md.global.Config.IsPlatformLocal ? (
          <div className="formTable">
            <div className="formGroup">
              <span className="formLabel mTop5">{_l('姓名')}</span>
              <div className="formControl">{this.state.fullname}</div>
            </div>
            <div className="formGroup">
              <span className="formLabel">{_l('部门')}</span>
              {departmentInfos.map((item, i) => {
                const fullName = (fullDepartmentInfo[item.departmentId] || '').split('/')
                return (
                  <Tooltip
                    tooltipClass="departmentFullNametip"
                    popupPlacement="bottom"
                    text={
                      <div>
                        {fullName.map((n, i) => (
                          <span>
                            {n}
                            {fullName.length - 1 > i && <span className="mLeft8 mRight8">/</span>}
                          </span>
                        ))}
                      </div>
                    }
                    mouseEnterDelay={0.5}
                  >
                    <span
                      className="itemSpan mAll5"
                      onMouseEnter={() => this.getDepartmentFullName(item.departmentId)}
                    >
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
                  </Tooltip>
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
              <Select
                ref={select => {
                  this.select = select;
                }}
                className="w100 jobSelect"
                dropdownClassName="dropJobList"
                showSearch
                allowClear={jobIds.length > 0}
                listHeight={285}
                optionLabelProp="label"
                value={!_.isEmpty(jobResult) ? jobIds : []}
                placeholder="请选择"
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
              </Select>
            </div>
            <div className="formGroup">
              <span className="formLabel mTop5">{_l('工作地点')}</span>
              <div className="formControl">
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
                  placeholder={_l('')}
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
                  maxLength="32"
                  placeholder={_l('')}
                  onBlur={this.onBlur}
                  className={cx({ error: contactPhoneError })}
                  onChange={e => {
                    this.setState({
                      contactPhone: e.target.value,
                    });
                  }}
                />
              </div>
              {contactPhoneError && <span className="Block Red LineHeight25">{_l('工作电话格式不正确')}</span>}
            </div>
          </div>
        ) : (
          <div className="formTable">
            {configs.map(con => {
              let value = this.state[con.key];
              if (con.key === 'mobilePhone' && this.iti) {
                const countryData = this.iti.getSelectedCountryData();
                const dialCode = `+${countryData.dialCode}`;
                value = (value || '').replace(dialCode, '');
              }
              return (
                <TextInput
                  ref={input => {
                    this.$refs[con.key] = input;
                  }}
                  value={value}
                  label={con.label}
                  isRequired={con.isRequired}
                  placeholder={_l('请输入%0', con.label)}
                  onFocus={this.clearError(con.key)}
                  onChange={this.handleFieldInput(con.key)}
                  onBlur={this.handleFieldBlur(con.key)}
                  error={errors[con.key]}
                  key={con.key}
                />
              );
            })}
            <div className="formGroup editFormGroup">
              <span className="formLabel mTop5">{_l('组织')}</span>
              <div className="formControl">
                <input
                  type="text"
                  className="inputBox txtCompanyName"
                  value={this.state.companyName}
                  placeholder={_l('组织名称')}
                  onChange={e => {
                    this.setState({
                      companyName: e.target.value,
                    });
                  }}
                />
              </div>
            </div>
            <div className="formGroup">
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
            <div className="formGroup">
              <span className="formLabel mTop5">{_l('工作地点')}</span>
              <div className="formControl">
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
                  placeholder={_l('')}
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
                  maxLength="32"
                  placeholder={_l('')}
                  onBlur={this.onBlur}
                  className={cx({ error: contactPhoneError })}
                  onChange={e => {
                    this.setState({
                      contactPhone: e.target.value,
                    });
                  }}
                />
              </div>
              {contactPhoneError && <span className="Block Red LineHeight25">{_l('工作电话格式不正确')}</span>}
            </div>
          </div>
        )}
      </Dialog>
    );
  }
}

export default EditInfo;
