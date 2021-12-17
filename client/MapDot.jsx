import React from 'react';

export function MapDot(props){
  const { active, ...otherProps } = props;
  return (
      <div {...otherProps} style={{backgroundColor: 'darkgray', opacity: '.8', height: '10px', width: '10px', borderRadius: '80%'}}></div>
  );
}

export default MapDot;