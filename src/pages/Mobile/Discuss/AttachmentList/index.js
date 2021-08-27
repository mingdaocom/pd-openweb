import React, { Fragment, Component } from 'react';
import { connect } from 'react-redux';
import { List, Flex, ActivityIndicator, WhiteSpace } from 'antd-mobile';
import AttachmentFiles from '../AttachmentFiles';
import * as actions from '../redux/actions';
import withoutFile from './assets/withoutFile.png'

const Item = List.Item;

class AttachmentWrapper extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: true,
    };
  }
  componentDidMount() {
    this.getSheetAttachments();
  }
  getSheetAttachments() {
    const { worksheetId, rowId } = this.props;
    this.setState({ loading: true });
    this.props.dispatch(actions.getSheetAttachments({
      worksheetId,
      rowId,
    }, () => {
      this.setState({
        loading: false,
      });
    }));
  }
  renderItem(item) {
    return (
      <Item key={item.id} extra={createTimeSpan(item.createTime)}>
        <span dangerouslySetInnerHTML={{ __html: item.message }} ></span>
      </Item>
    );
  }
  render() {
    const { loading } = this.state;
    const { sheetAttachments, height } = this.props;
    const padding = 30;
    return (
      <Fragment>
        {
          _.isEmpty(sheetAttachments) ? (
            <Flex justify="center" align="center" style={{height}}>
              {
                loading ? (
                  <ActivityIndicator size="large" />
                ) : (
                  <Flex direction="column" className="withoutData">
                    <img src={withoutFile}/>
                    <WhiteSpace size="lg"/>
                    <span className="text">{_l('暂无文件')}</span>
                  </Flex>
                )
              }
            </Flex>
          ) : (
            <List className="sheetAttachments">
              <AttachmentFiles attachments={sheetAttachments} width="32%"/>
            </List>
          )
        }
      </Fragment>
    );
  }
}

export default connect((state) => {
  const { sheetAttachments } = state.mobile;
  return {
    sheetAttachments,
  };
})(AttachmentWrapper);
