import React from 'react';
import { Dialog } from 'ming-ui';
import './index.less';
import { checkSensitive } from 'src/api/fixedData.js';

class DialogCreatePosition extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      jobName: props.jobName || '',
      showPositionDialog: props.showPositionDialog || false,
      jobId: props.jobId || '',
      isNew: props.isNew || true,
    };
  }

  footer = () => {
    const { isNew = true, setValue, jobId, delFn, jobList } = this.props;
    const { jobName } = this.state;
    return (
      <div className="createPositionDialogFooter">
        {!isNew ? (
          <span
            className="LineHeight20 Left mTop5 Hand deleteBtn"
            onClick={() => {
              delFn(jobId);
            }}
          >
            <i class="icon-task-new-delete Font16 mRight10"></i>
            <span>{_l('删除')}</span>
          </span>
        ) : (
          ''
        )}
        <span
          class="noText ThemeHoverColor3 Hand"
          onClick={() => {
            setValue({
              isOk: false,
              showPositionDialog: false,
              jobName: '',
              jobId: '',
            });
          }}
        >
          {_l('取消')}
        </span>
        <span
          class="nyesText boderRadAll_3 ThemeBGColor3"
          onClick={() => {
            if (!jobName) {
              alert(_l('请输入职位名称'), 3);
              return;
            } else if (!!jobList.find(it => it.jobName === jobName)) {
              alert(_l('该职位名称已存在'), 3);
              return;
            }
            checkSensitive({ content: jobName }).then(res => {
              if (res) {
                return alert(_l('输入内容包含敏感词，请重新填写'), 3);
              }
              setValue({
                isOk: true,
                showPositionDialog: false,
                jobName: jobName.trim(),
                jobId: jobId,
              });
            });
          }}
        >
          {_l('保存')}
        </span>
      </div>
    );
  };

  render() {
    const { isNew = true, setValue } = this.props;
    const { jobName, jobId, showPositionDialog } = this.state;
    return (
      <Dialog
        title={isNew ? _l('新建职位') : _l('编辑职位')}
        footer={this.footer()}
        className="createPositionDialog"
        onCancel={() => {
          setValue({
            isOk: false,
            showPositionDialog: false,
            jobName: '',
            jobId: '',
          });
        }}
        visible={showPositionDialog}
      >
        <div>
          <div className="mTop5 mBottom5">{_l('职位名称')}</div>
          <input
            class="inputBox"
            maxLength={32}
            value={jobName}
            placeholder={_l('请填写职位名称')}
            onChange={e => {
              this.setState({
                jobName: e.target.value,
              });
            }}
          />
        </div>
      </Dialog>
    );
  }
}

export default DialogCreatePosition;
