import React from 'react';
import uniqueId from 'lodash.uniqueid';
import isTouchDevice from './utils/isTouchDevice';
import PhotoContext, { PhotoContextType } from './photo-context';

export interface IPhotoConsumer {
  src: string;
  intro?: React.ReactNode;
  children?: React.ReactElement<any>;
}

const PhotoConsumer: React.FC<IPhotoConsumer> = ({ src, intro, children }) => {
  const photoContext = React.useContext<PhotoContextType>(PhotoContext);
  const key = React.useMemo<string>(() => uniqueId(), []);
  const [position, updatePosition] = React.useState<{
    clientX: number;
    clientY: number;
  }>({
    clientX: 0,
    clientY: 0,
  });
  const photoTriggerRef = React.useRef<HTMLElement | null>(null);

  React.useEffect(() => {
    photoContext.addItem({
      key,
      src,
      originRef: photoTriggerRef.current,
      intro,
    });
    return () => {
      photoContext.removeItem(key);
    };
  }, []);

  function handleTouchStart(e) {
    const { clientX, clientY } = e.touches[0];
    updatePosition({
      clientX,
      clientY,
    });
    if (children) {
      const { onTouchStart } = children.props;
      if (onTouchStart) {
        onTouchStart(e);
      }
    }
  }

  function handleTouchEnd(e) {
    const { clientX, clientY } = e.changedTouches[0];
    if (Math.abs(position.clientX - clientX) < 1 && Math.abs(position.clientY - clientY) < 1) {
      photoContext.onShow(key);
    }
    if (children) {
      const { onTouchEnd } = children.props;
      if (onTouchEnd) {
        onTouchEnd(e);
      }
    }
  }

  function handleClick(e) {
    photoContext.onShow(key);
    if (children) {
      const { onClick } = children.props;
      if (onClick) {
        onClick(e);
      }
    }
  }

  if (children) {
    return React.Children.only(
      React.cloneElement(
        children,
        isTouchDevice
          ? {
              onTouchStart: handleTouchStart,
              onTouchEnd: handleTouchEnd,
              ref: photoTriggerRef,
            }
          : { onClick: handleClick, ref: photoTriggerRef },
      ),
    );
  }
  return null;
};

export default PhotoConsumer;
