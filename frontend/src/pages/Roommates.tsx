import React from 'react';
import RoommatesList from '../components/roommates/RoommatesList';

const Roommates: React.FC = () => {
  React.useEffect(() => { document.title = "Find Roommates & Flatmates | Flatmates"; }, []);
  return (
    <>
      <RoommatesList />
    </>
  );
};

export default Roommates;
