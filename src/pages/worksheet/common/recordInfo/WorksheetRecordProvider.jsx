import React from 'react';
import _ from 'lodash';
import PropTypes from 'prop-types';
import sheetAjax from 'src/api/worksheet';
import { getRowDetail } from 'worksheet/api';

export default Component =>
  class WorksheetRecordProvider extends React.Component {
    static propTypes = {
      loadWorksheetInfo: PropTypes.bool,
      loadWorksheetRecord: PropTypes.bool,
      worksheetId: PropTypes.string,
      appId: PropTypes.string,
      rowId: PropTypes.string,
      viewId: PropTypes.string,
    };
    constructor(props) {
      super(props);
      this.state = {
        loading: true,
        worksheetinfo: {},
      };
    }

    componentDidMount() {
      const { loadWorksheetInfo, loadWorksheetRecord, worksheetId, appId, rowId, viewId } = this.props;
      if (loadWorksheetInfo) {
        sheetAjax.getWorksheetInfo({ worksheetId: worksheetId, getTemplate: true }).then(data => {
          this.setState({
            loading: false,
            worksheetinfo: _.pick(data, ['appId', 'projectId', 'entityName', 'allowAdd', 'template']),
          });
        });
      } else if (loadWorksheetRecord) {
        getRowDetail({
          getType: 1,
          appId,
          rowId,
          viewId,
          worksheetId,
        }).then(data => {
          this.setState({
            loading: false,
            worksheetinfo: {
              formData: data.formData,
              ..._.pick(data, ['appId', 'projectId', 'entityName', 'allowAdd', 'template']),
            },
          });
        });
      }
    }

    render() {
      const { loadWorksheetInfo, loadWorksheetRecord, ...rest } = this.props;
      const { loading, worksheetinfo } = this.state;
      return (!(loadWorksheetInfo || loadWorksheetRecord) || !loading) && <Component {...rest} {...worksheetinfo} />;
    }
  };
