import React from 'react';

const ChevronDown: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg
    width="21"
    height="20"
    viewBox="0 0 21 20"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M3.89218 7.34424C4.11681 7.08216 4.51138 7.05181 4.77346 7.27645L10.2 11.9278L15.6266 7.27645C15.8887 7.05181 16.2833 7.08217 16.5079 7.34424C16.7326 7.60632 16.7022 8.00089 16.4401 8.22552L10.6068 13.2255C10.3727 13.4261 10.0274 13.4261 9.7933 13.2255L3.95997 8.22552C3.69789 8.00088 3.66754 7.60632 3.89218 7.34424Z"
      fill="#221E1C"
    />
  </svg>
);

export default ChevronDown;
