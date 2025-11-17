import React from 'react';

export const FilledLikeIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg
    width="20" // единый размер
    height="20"
    viewBox="0 0 22 20" // совпадает с LikeIcon
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    style={{
      marginTop: '2px',
      marginLeft: '1px',
      transform: 'scale(1.1)',
      transformOrigin: 'center',
    }}
    {...props}
  >
    <path
      d="M0 5.85219C0 10.7151 4.01943 13.3065 6.96173 15.626C8 16.4445 9 17.2151 10 17.2151C11 17.2151 12 16.4445 13.0383 15.626C15.9806 13.3065 20 10.7151 20 5.85219C20 0.989251 14.4998 -2.45945 10 2.21572C5.50016 -2.45945 0 0.989251 0 5.85219Z"
      fill="#3F41D6"
    />
  </svg>
);
