import React, { useState } from 'react';

const ExpandableText = ({ text = '', maxLength = 80 }) => {
  const [expanded, setExpanded] = useState(false);

  if (!text || text.length <= maxLength) {
    return <span>{text}</span>;
  }

  return (
    <span>
      {expanded ? text : text.slice(0, maxLength) + '...'}
      <button
        onClick={() => setExpanded(prev => !prev)}
        style={{
          background: 'none',
          border: 'none',
          color: '#0d6efd',
          cursor: 'pointer',
          padding: '0 0 0 4px',
          fontSize: 'inherit',
          textDecoration: 'underline',
        }}
      >
        {expanded ? 'Leia Menos' : 'Leia Mais'}
      </button>
    </span>
  );
};

export default ExpandableText;
