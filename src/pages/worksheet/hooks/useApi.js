import { useEffect, useState } from 'react';

export default function useApi(fetchFn, args) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [data, setData] = useState(null);
  useEffect(() => {
    fetchFn(args)
      .then(resData => {
        setData(resData);
        setLoading(false);
      })
      .catch(setError);
  }, [JSON.stringify(args)]);
  return [loading, error, data];
}
