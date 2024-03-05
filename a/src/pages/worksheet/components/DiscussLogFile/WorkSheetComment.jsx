import PropTypes from 'prop-types';
import React from 'react';
import { autobind } from 'core-decorators';
import ScrollView from 'ming-ui/components/ScrollView';
import homeAppAjax from 'src/api/homeApp';
import WorkSheetCommenter from './WorkSheetCommenter';
import WorkSheetCommentList from './WorkSheetCommentList';
import _ from 'lodash';
import '@mdfe/nanoscroller';

export default class WorkSheetComment extends React.Component {
  static propTypes = {
    appId: PropTypes.string,
    worksheetId: PropTypes.string,
    appSectionId: PropTypes.string,
    disableScroll: PropTypes.bool,
    addCallback: PropTypes.func,
  };
  constructor(props) {
    super(props);
    this.state = {
      discussions: [],
      worksheetInfo: {},
      atData: [],
    };
  }
  componentDidMount() {
    const { appId, worksheetId, appSectionId, disableScroll } = this.props;
    if (this.scrollView && disableScroll) {
      this.$scrollCon = $(this.scrollView).closest('.rightContentScroll')[0];
      if (this.$scrollCon) {
        this.$scrollCon.addEventListener('scroll', this.handleRecordRightContentScroll);
      }
    }
    if (worksheetId && (!appId || !appSectionId)) {
      homeAppAjax.getAppSimpleInfo({ worksheetId }).then(data => {
        this.setState({ worksheetInfo: data });
      });
    }
    this.getAtData();
  }
  componentWillReceiveProps(nextProps) {
    if (
      nextProps.formFlag !== this.props.formFlag ||
      nextProps.status !== this.props.status || //内部和外部讨论
      !_.isEqual(this.props.formdata, nextProps.formdata)
    ) {
      this.getAtData(nextProps);
    }
  }
  componentWillUnmount() {
    if (this.$scrollCon) {
      this.$scrollCon.removeEventListener('scroll', this.handleRecordRightContentScroll);
    }
  }
  getAtData = nextProps => {
    let {
      formdata = [],
      allowExAccountDiscuss = false, //是否配置外部门户可参与讨论
      exAccountDiscussEnum = 0, //外部门户可见讨论区域为全部
      status, //1:线上|内部 4:外部讨论
    } = nextProps || this.props;
    const { discussions = [] } = this.state;
    let data = [];
    if (status === 1) {
      //内部讨论
      if (!allowExAccountDiscuss || (allowExAccountDiscuss && exAccountDiscussEnum !== 0)) {
        //未配置外部人员可参与讨论 或配置了外部成员不可见内部讨论 不能@外部用户
        formdata = formdata.filter(
          o =>
            o.type === 26 && //成员字段
            (o.userPermission !== 0 || o.controlId === 'ownerid') && //排除仅用于记录人员数据(除了拥有者字段外)
            (o.advancedSetting || {}).usertype !== '2',
        );
      }
    }
    formdata
      .filter(
        o =>
          o.type === 26 && //成员字段
          (o.userPermission !== 0 || o.controlId === 'ownerid'), //排除仅用于记录人员数据(除了拥有者字段外)
      )
      .map(o => {
        let d;
        try {
          d = JSON.parse(o.value).map(item => {
            return Object.assign({}, item, { job: o.controlName });
          });
        } catch (err) {
          d = [];
        }
        data = data.concat(d);
      });
    let accountsInMessage = [];
    let dis = discussions.map(o => {
      accountsInMessage = accountsInMessage.concat(o.accountsInMessage);
      return o.createAccount;
    });
    data = data
      //参与讨论的
      .concat(dis.map(item => Object.assign({}, item, { job: _l('讨论用户') })))
      //@到的
      .concat(accountsInMessage.map(item => Object.assign({}, item, { job: _l('讨论用户') })))
      //排除自己以及未指定等
      .filter(
        d =>
          !(
            ['user-undefined', 'user-publicform', md.global.Account.accountId].includes(d.accountId) ||
            d.accountId.indexOf('user-') >= 0
          ),
      );
    data = data.filter(
      d =>
        !(
          status === 1 &&
          (!allowExAccountDiscuss || (allowExAccountDiscuss && exAccountDiscussEnum !== 0)) &&
          d.accountId.indexOf('a#') >= 0
        ) && //内部讨论 未配置外部人员可参与讨论 或配置了外部成员不可见内部讨论 不能@外部用户
        d.status === 1, //状态为正常的用户
    );
    let hash = {};
    const data2 = data.reduce((preVal, curVal) => {
      hash[curVal.accountId] ? '' : (hash[curVal.accountId] = true && preVal.push(curVal));
      return preVal;
    }, []);
    this.setState({
      atData: data2,
    });
  };
  @autobind
  handleRecordRightContentScroll(e) {
    if (
      this.$scrollCon &&
      this.$scrollCon.scrollHeight - this.$scrollCon.clientHeight - this.$scrollCon.scrollTop < 20
    ) {
      const { updatePageIndex } = this.commentList;
      updatePageIndex();
    }
  }
  scrollToListTop() {
    if (this.scrollView && this.scrollView.nanoScroller && this.commentList) {
      const $nano = $(this.scrollView.nanoScroller);
      $(this.scrollView.nanoScroller).nanoScroller({ scrollTop: 0 });
    }
  }
  @autobind
  handleScroll(event, values) {
    const { direction, maximum, position } = values;
    // filelist ignore event
    if (direction === 'down' && maximum - position < 20 && this.commentList) {
      // method of child component
      const { updatePageIndex } = this.commentList;
      updatePageIndex();
    }
  }
  render() {
    const { disableScroll, addCallback, projectId, forReacordDiscussion, status, exAccountDiscussEnum } = this.props;
    const { worksheetInfo } = this.state;
    let entityType = //0 = 全部，1 = 不包含外部讨论，2=外部讨论
      status === 4
        ? 2
        : status === 1 && !md.global.Account.isPortal && exAccountDiscussEnum === 1 //当前内部成员，外部门户开放讨论且外部门户设置为不可见内部
        ? 1
        : 0;
    const commenterProps = {
      worksheet: Object.assign({}, this.props, worksheetInfo),
      scrollToListTop: this.scrollToListTop.bind(this),
      change: (payload, discussion) => {
        this.setState(payload);
        this.getAtData();
      },
      addCallback,
      projectId,
      forReacordDiscussion,
      entityType,
    };
    const commentListProps = {
      worksheet: this.props,
      listRef: el => {
        this.commentList = el;
      },
      change: (payload, discussion) => {
        this.setState(payload);
        this.getAtData();
      },
      addCallback,
      forReacordDiscussion,
      status,
      entityType,
    };

    return (
      <div className="workSheetCommentBox flex flexRow">
        {disableScroll ? (
          <div
            className="commentListBox flex"
            ref={scrollView => {
              this.scrollView = scrollView;
            }}
          >
            <WorkSheetCommentList
              {...commentListProps}
              discussions={this.state.discussions}
              atData={this.state.atData}
            />
          </div>
        ) : (
          <ScrollView
            className="commentListBox flex"
            ref={scrollView => {
              this.scrollView = scrollView;
            }}
            updateEvent={this.handleScroll}
            preserveScrollTop
          >
            <WorkSheetCommentList
              {...commentListProps}
              discussions={this.state.discussions}
              atData={this.state.atData}
            />
          </ScrollView>
        )}
        <WorkSheetCommenter {...commenterProps} discussions={this.state.discussions} atData={this.state.atData} />
      </div>
    );
  }
}
