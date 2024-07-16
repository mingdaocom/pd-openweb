import React, { Component } from 'react';
import { LoadDiv } from 'ming-ui';
import ApplicationItem from 'mobile/AppHome/components/ApplicationItem';
import homeAppAjax from 'src/api/homeApp';
import Back from '../components/Back';
import styled from 'styled-components';

const Wrap = styled.div`
  display: flex;
  flex-wrap: wrap;
  padding: 16px 10px;
  .loadingWrap {
    width: 100%;
    height: 100vh;
  }
`;

//  应用收藏
export default class RecordCollect extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: false,
      markedAppItems: [],
      langItems: []
    };
  }

  componentDidMount() {
    this.getData();
  }

  getData = () => {
    const { projectId } = _.get(this.props, 'match.params') || {};
    if (!projectId) return;

    this.setState({ loading: true });

    Promise.all([
      homeAppAjax.myPlatform({ projectId, containsLinks: true }),
      projectId ? homeAppAjax.myPlatformLang({ projectId, noCache: false }) : undefined,
    ]).then(result => {
      const [platformRes, langRes = []] = result;
      const { markedAppItems = [] } = platformRes;
      this.setState({
        markedAppItems: markedAppItems.filter(o => o && !o.webMobileDisplay),
        langItems: langRes,
        loading: false,
      });
    }).catch(err => {
      this.setState({ markedAppItems: [], loading: false });
    });
  };

  render() {
    const { markedAppItems, langItems, loading } = this.state;

    return (
      <Wrap>
        {loading ? (
          <div className="loadingWrap flexRow alignItemsCenter justifyContentCenter">
            <LoadDiv />
          </div>
        ) : (
          markedAppItems.map((item, index) => {
            return <ApplicationItem direction="horizontal" index={index} radius={40} iconSize={30} data={item} myPlatformLang={langItems} />;
          })
        )}

        <Back
          icon="home"
          onClick={() => {
            window.mobileNavigateTo('/mobile/dashboard');
          }}
        />
      </Wrap>
    );
  }
}
