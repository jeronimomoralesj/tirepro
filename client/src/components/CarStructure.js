import React from 'react';
import './CarStructure.css';

const VEHICLE_STRUCTURES = {
  CABEZOTE: {
    axes: 2,
    axleConfig: [
      { axle: 1, left: 1, right: 1 },
      { axle: 2, left: 2, right: 2 },
    ],
    startPosition: 1,
  },
  TRAILER: {
    axes: 3,
    axleConfig: [
      { axle: 1, left: 2, right: 2 },
      { axle: 2, left: 2, right: 2 },
      { axle: 3, left: 2, right: 2 },
    ],
    startPosition: 7,
  },
  DEFAULT: {
    axes: 2,
    axleConfig: [
      { axle: 1, left: 1, right: 1 },
      { axle: 2, left: 2, right: 2 },
    ],
    startPosition: 1,
  },
};

const CarStructure = ({ tires, onTireClick, vehicleType = 'DEFAULT' }) => {
  const structure = VEHICLE_STRUCTURES[vehicleType.toUpperCase()] || VEHICLE_STRUCTURES.DEFAULT;

  const getTireStatus = (tire) => {
    if (!tire) return 'tire-empty';
    const hasAllProfundidades =
      tire.profundidad_int &&
      tire.profundidad_cen &&
      tire.profundidad_ext;
    return hasAllProfundidades ? 'tire-complete' : 'tire-incomplete';
  };

  const calculateTirePosition = (startPosition, axleNumber, side, index) => {
    const basePosition = startPosition + (axleNumber - 1) * 4;
    return side === 'left' ? basePosition + index : basePosition + 2 + index;
  };

  const renderAxle = (axleConfig, axleNumber, startPosition) => (
    <div key={axleNumber} className="axle">
      <div className="tire-group">
        <div className="side left-side">
          {Array(axleConfig.left).fill(null).map((_, i) => {
            const position = calculateTirePosition(startPosition, axleNumber, 'left', i);
            const tire = tires.find((t) => t.pos?.at(-1)?.value === position);
            return (
              <div
                key={`left-${i}`}
                className={`tire-icon ${getTireStatus(tire)}`}
                onClick={() => tire && onTireClick(tire)}
              >
                {tire ? '🛞' : '◯'}
              </div>
            );
          })}
        </div>
        <div className="middle-frame">
          <div className="axle-line" />
        </div>
        <div className="side right-side">
          {Array(axleConfig.right).fill(null).map((_, i) => {
            const position = calculateTirePosition(startPosition, axleNumber, 'right', i);
            const tire = tires.find((t) => t.pos?.at(-1)?.value === position);
            return (
              <div
                key={`right-${i}`}
                className={`tire-icon ${getTireStatus(tire)}`}
                onClick={() => tire && onTireClick(tire)}
              >
                {tire ? '🛞' : '◯'}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );

  return (
    <div className="car-structure">
      {structure.axleConfig.map((axleConfig, index) =>
        renderAxle(axleConfig, index + 1, structure.startPosition)
      )}
    </div>
  );
};

export default CarStructure;
