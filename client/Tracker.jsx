// import React, { memo, useState, useEffect, useCallback } from 'react';
// import { Tracker } from 'meteor/tracker';

// export function useTracker(reactiveFn, dependencies) {
//   const [trackerData, setTrackerData] = useState(null);
//   const callback = useCallback(reactiveFn, dependencies);

//   useEffect(() => {
//     let computation;
//     Tracker.nonreactive(() => {
//       computation = Tracker.autorun(() => setTrackerData(callback()));
//     });
//     return () => computation.stop();
//   }, [callback]);

//   return trackerData;
// }
