import PropTypes from 'prop-types';
import React from 'react';
import ScrollView from 'ming-ui/components/ScrollView';
import homeAppAjax from 'src/api/homeApp';
import WorkSheetCommenter from './WorkSheetCommenter';
import WorkSheetCommentList from './WorkSheetCommentList';
import _ from 'lodash';
import '@mdfe/nanoscroller';
import cx from 'classnames';

const discussTypes = [
  { id: 1, name: 'discuss', text: _l('内部') },
  { id: 2, name: 'discussPortal', text: _l('外部门户') },
];
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
      disType: md.global.Account.isPortal && props.exAccountDiscussEnum === 1 ? 2 : 1, //外部门户且不可见内部讨论 则直接显示外部讨论
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
    if (nextProps.formFlag !== this.props.formFlag || !_.isEqual(this.props.formdata, nextProps.formdata)) {
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
    } = nextProps || this.props;
    const { discussions = [], disType } = this.state;
    let data = [];
    formdata = formdata.filter(
      o =>
        [o.sourceControlType, o.type].includes(26) && //成员字段
        (o.userPermission !== 0 || o.controlId === 'ownerid' || (o.type === 30 && _.get(o, 'strDefault.0') !== '1')), //排除仅用于记录人员数据(除了拥有者字段外)
    );
    if (disType === 1) {
      //内部讨论
      if (!allowExAccountDiscuss || (allowExAccountDiscuss && exAccountDiscussEnum !== 0)) {
        //未配置外部人员可参与讨论 或配置了外部成员不可见内部讨论 不能@外部用户
        formdata = formdata.filter(o => (o.advancedSetting || {}).usertype !== '2');
      }
    }
    formdata.map(o => {
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
          disType === 1 &&
          (!allowExAccountDiscuss || (allowExAccountDiscuss && exAccountDiscussEnum !== 0)) &&
          d.accountId.indexOf('a#') >= 0
        ),
      //内部讨论 未配置外部人员可参与讨论 或配置了外部成员不可见内部讨论 不能@外部用户
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

  handleRecordRightContentScroll = e => {
    if (
      this.$scrollCon &&
      this.$scrollCon.scrollHeight - this.$scrollCon.clientHeight - this.$scrollCon.scrollTop < 20
    ) {
      const { updatePageIndex } = this.commentList;
      updatePageIndex();
    }
  };

  scrollToListTop() {
    if (this.scrollView && this.scrollView.nanoScroller && this.commentList) {
      $(this.scrollView.nanoScroller).nanoScroller({ scrollTop: 0 });
    }
  }

  handleScroll = (event, values) => {
    const { direction, maximum, position } = values;
    // filelist ignore event
    if (direction === 'down' && maximum - position < 20 && this.commentList) {
      // method of child component
      const { updatePageIndex } = this.commentList;
      updatePageIndex();
    }
  };
  render() {
    const {
      disableScroll,
      addCallback,
      projectId,
      forReacordDiscussion,
      status,
      exAccountDiscussEnum,
      allowExAccountDiscuss,
    } = this.props;
    const { worksheetInfo, disType } = this.state;
    let entityType = //0 = 全部，1 = 不包含外部讨论，2=外部讨论
      disType === 2
        ? 2
        : disType === 1 && !md.global.Account.isPortal && exAccountDiscussEnum === 1 //当前内部成员，外部门户开放讨论且外部门户设置为不可见内部
          ? 1
          : 0;
    const commenterProps = {
      worksheet: Object.assign({}, this.props, worksheetInfo),
      scrollToListTop: this.scrollToListTop.bind(this),
      change: (payload, discussion) => {
        this.setState(payload, () => this.getAtData());
      },
      addCallback,
      projectId,
      forReacordDiscussion,
      entityType,
    };
    const commentListProps = {
      worksheet: Object.assign({}, this.props, worksheetInfo),
      listRef: el => {
        this.commentList = el;
      },
      change: (payload, discussion) => {
        this.setState(payload, () => this.getAtData());
      },
      addCallback,
      forReacordDiscussion,
      status,
      entityType,
    };

    const renderWorkSheetCommentList = () => {
      return (
        <React.Fragment>
          {/* 内部成员，且外部门户支持参与讨论，但不可见内部讨论 */}
          {!md.global.Account.isPortal && allowExAccountDiscuss && exAccountDiscussEnum === 1 && (
            <div className="discussType flexRow alignItemsCenter">
              {discussTypes.map(o => {
                return (
                  <div
                    className={cx('discuss TxtCenter flex Bold Hand', { isCur: disType === o.id })}
                    onClick={() => {
                      this.setState({ disType: o.id }, () => {
                        this.getAtData();
                      });
                    }}
                  >
                    {o.text}
                  </div>
                );
              })}
            </div>
          )}
          <WorkSheetCommentList {...commentListProps} discussions={this.state.discussions} atData={this.state.atData} />
        </React.Fragment>
      );
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
            {renderWorkSheetCommentList()}
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
            {renderWorkSheetCommentList()}
          </ScrollView>
        )}
        <WorkSheetCommenter {...commenterProps} discussions={this.state.discussions} atData={this.state.atData} />
      </div>
    );
  }
}
