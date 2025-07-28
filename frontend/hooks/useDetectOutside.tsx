import { RefObject, useEffect } from 'react';

interface Props {
  ref: RefObject<HTMLDivElement | null>;
  callback: () => void;
};

const useDetectOutside = ({ ref, callback }: Props) => {
  useEffect(() => {
    const handleClick = (event: any) => {
      if (ref.current && !ref.current?.contains(event?.target)) {
        callback();
      }
    };

    document.addEventListener('mousedown', handleClick);

    return () => {
      document.removeEventListener('mousedown', handleClick);
    };
  }, [ref, callback]);
};

export default useDetectOutside;
