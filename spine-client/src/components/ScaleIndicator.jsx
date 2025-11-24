import React from 'react';
import './ScaleIndicator.css';

const SEGMENT_COUNT = 5;
const SEGMENT_CM = 10;
const PIXELS_PER_SEGMENT = 40;

function ScaleIndicator({ className = '' }) {
    const segments = Array.from({ length: SEGMENT_COUNT });
    const labels = Array.from({ length: SEGMENT_COUNT + 1 }, (_, index) => `${index * SEGMENT_CM}cm`);

    return (
        <div
            className={`scale-indicator ${className}`.trim()}
            role="presentation"
            aria-label={`比例尺顯示，每 ${PIXELS_PER_SEGMENT} 像素等於 ${SEGMENT_CM} 公分`}
        >
            <div className="scale-indicator__title">比例尺</div>
            <div className="scale-indicator__content" aria-hidden="true">
                <div className="scale-indicator__bar">
                    {segments.map((_, index) => (
                        <span
                            key={`scale-segment-${index}`}
                            className={`scale-indicator__segment ${
                                index % 2 === 0
                                    ? 'scale-indicator__segment--light'
                                    : 'scale-indicator__segment--dark'
                            }`}
                        />
                    ))}
                </div>
                <div className="scale-indicator__labels">
                    {labels.map((label, index) => (
                        <span key={`scale-label-${label}-${index}`}>{label}</span>
                    ))}
                </div>
            </div>
            <div className="scale-indicator__note">{`${PIXELS_PER_SEGMENT}px = ${SEGMENT_CM}cm`}</div>
        </div>
    );
}

export default ScaleIndicator;
