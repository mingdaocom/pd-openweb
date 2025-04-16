import React, { Component } from 'react';
import { BrowserRouter } from 'react-router-dom';
import { Icon, LoadDiv, ScrollView } from 'ming-ui';
import worksheetAjax from 'src/api/worksheet';
import DraftList from './DraftList';

export default class MobileDraftList extends Component {
  constructor(props) {
    super(props);
    this.state = {
      draftData: [],
      loading: true,
      worksheetInfo: { template: {}, switches: [] },
    };
  }

  componentDidMount() {
    this.getWorksheetInfo();
    this.getDraftData();
  }

  getWorksheetInfo = () => {
    const { worksheetId } = _.get(this.props, 'match.params');
    worksheetAjax
      .getWorksheetInfo({
        worksheetId: worksheetId,
        getRules: true,
        getSwitchPermit: true,
        getTemplate: true,
      })
      .then(data => {
        this.setState({ worksheetInfo: data });
      });
  };

  getDraftData = () => {
    const { appId, worksheetId } = _.get(this.props, 'match.params');
    worksheetAjax
      .getFilterRows({ appId, worksheetId: worksheetId, getType: 21 })
      .then(res => {
        this.setState({ draftData: res.data, loading: false });
      })
      .catch(res => {
        this.setState({ draftData: [], loading: false });
      });
  };

  render() {
    const { appId, worksheetId } = _.get(this.props, 'match.params');
    const { loading, draftData, worksheetInfo = {} } = this.state;

    if (loading) {
      return (
        <div className="w100 h100 valignWrapper justifyContentCenter">
          <LoadDiv />
        </div>
      );
    }

    return (
      <BrowserRouter>
        <DraftList
          draftData={draftData}
          appId={appId}
          worksheetId={worksheetId}
          worksheetInfo={worksheetInfo}
          getDraftData={this.getDraftData}
          updateDraftList={(rowId, rowData) => {
            let data = _.clone(draftData);
            if (!rowData) {
              data = data.filter(it => it.rowid !== rowId);
            } else {
              const index = _.findIndex(data, it => it.rowid === rowId);
              data[index] = rowData;
            }
            this.setState({ draftData: data });
          }}
        />
      </BrowserRouter>
    );
  }
}
