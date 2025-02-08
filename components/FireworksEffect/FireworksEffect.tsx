import React from 'react';
import Fireworks from 'react-canvas-confetti/dist/presets/fireworks';

const FireworksEffect = ({ isVisible }: { isVisible: boolean }) => {
  if (!isVisible) return null;

  return (
    <Fireworks
      autorun={{ speed: 2, duration: 1000, delay: 300 }}
      globalOptions={{ useWorker: true, resize: true }}
    />
  );
};

export default FireworksEffect;
