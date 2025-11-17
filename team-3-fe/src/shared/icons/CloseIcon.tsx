import type { SVGProps } from 'react';

const CloseIcon = (props: SVGProps<SVGSVGElement>) => {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path
        d="M18.3 7.1C18.6866 6.7134 18.6866 6.0866 18.3 5.7C17.9134 5.3134 17.2866 5.3134 16.9 5.7L12 10.6L7.1 5.7C6.7134 5.3134 6.0866 5.3134 5.7 5.7C5.3134 6.0866 5.3134 6.7134 5.7 7.1L10.6 12L5.7 16.9C5.3134 17.2866 5.3134 17.9134 5.7 18.3C6.0866 18.6866 6.7134 18.6866 7.1 18.3L12 13.4L16.9 18.3C17.2866 18.6866 17.9134 18.6866 18.3 18.3C18.6866 17.9134 18.6866 17.2866 18.3 16.9L13.4 12L18.3 7.1Z"
        fill="currentColor"
      />
    </svg>
  );
};

export default CloseIcon;
