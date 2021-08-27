import React, { Fragment, Component } from 'react';
import { connect } from 'react-redux';
import { List, Flex, ListView, ActivityIndicator } from 'antd-mobile';
import * as actions from '../redux/actions';

const Item = List.Item;

class Logs extends Component {
  constructor(props) {
    super(props);
    const dataSource = new ListView.DataSource({
      rowHasChanged: (row1, row2) => row1 !== row2,
    });
    this.state = {
      dataSource,
      loading: true,
      isMore: true,
      pageIndex: 1,
    };
  }
  componentDidMount() {
    this.getSheetLogs(this.state.pageIndex);
  }
  getSheetLogs(index) {
    const { worksheetId, rowId } = this.props;
    this.setState({ loading: true });
    this.props.dispatch(actions.getSheetLogs({
      pageIndex: index,
      worksheetId,
      rowId,
    }, (isMore) => {
      this.setState({
        pageIndex: index,
        loading: false,
        isMore,
      });
    }));
  }
  componentWillReceiveProps(nextProps) {
    if (nextProps.sheetLogs.length !== this.props.sheetLogs.length) {
      this.setState({
        dataSource: this.state.dataSource.cloneWithRows({...nextProps.sheetLogs}),
      });
    }
  }
  onEndReached() {
    const { loading, isMore } = this.state;
    if (!loading && isMore) {
      this.getSheetLogs(this.state.pageIndex + 1);
    }
  }
  renderItem(item) {
    return (
      <Item key={item.id} extra={createTimeSpan(item.createTime)}>
        <span dangerouslySetInnerHTML={{ __html: item.message.replace('href', '_href') }} ></span>
      </Item>
    );
  }
  render() {
    const { dataSource, loading, isMore } = this.state;
    const { sheetLogs, height } = this.props;
    return (
      <Fragment>
        {
          _.isEmpty(sheetLogs) ? (
            <Flex justify="center" align="center" style={{height}}>
              {
                loading ? (
                  <ActivityIndicator size="large" />
                ) : (
                  <div>{_l('暂无日志')}</div>
                )
              }
            </Flex>
          ) : (
            <List className="sheetLogs">
              <ListView
                dataSource={dataSource}
                renderFooter={isMore ? () => (<Flex justify="center">{loading ? <ActivityIndicator animating /> : null}</Flex>) : false}
                pageSize={10}
                scrollRenderAheadDistance={500}
                onEndReached={this.onEndReached.bind(this)}
                onEndReachedThreshold={10}
                style={{
                  height,
                  overflow: 'auto',
                }}
                renderRow={this.renderItem.bind(this)}
              />
            </List>
          )
        }
      </Fragment>
    );
  }
}

export default connect((state) => {
  const { sheetLogs } = state.mobile;
  return {
    sheetLogs,
  };
})(Logs);
