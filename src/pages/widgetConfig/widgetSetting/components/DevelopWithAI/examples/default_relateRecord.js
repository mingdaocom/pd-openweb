// <free_field_name>关联记录</free_field_name>
// <file_name>RelateRecordList_v1.jsx</file_name>
function RelateRecordList({ value, onChange }) {
  const selectedRecords = JSON.parse(value || '[]');
  const selectedRecordIds = selectedRecords.map(r => r.sid);
  const [records, setRecords] = useState([]);
  useEffect(() => {
    getRowsForRelation({ pageSize: 10 }).then(res => setRecords(res.data));
  }, []);
  return (
    <div class="grid grid-cols-[repeat(auto-fill,minmax(100px,200px))] gap-3">
      {records.map(r => (
        <div
          className={
            'p-4 mb-2 border border-gary-400 rounded' +
            (selectedRecordIds.indexOf(r.rowid) > -1 ? ' border-blue-500' : '')
          }
          onClick={() => {
            onChange(JSON.stringify([{ sid: r.rowid }]));
          }}
        >
          {r['rowid']}
        </div>
      ))}
    </div>
  );
}
