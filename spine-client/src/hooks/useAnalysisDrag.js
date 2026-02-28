import { useState, useEffect } from 'react';

/**
 * 點位拖曳 Hook
 * 封裝頸椎 / 尾椎分析共用的拖曳狀態與事件處理
 *
 * @param {Object}   options
 * @param {React.RefObject} options.containerRef  - 容器 DOM ref
 * @param {Function} options.constraintFn         - 點位約束函數 (points, idx, x, y, prev) => newPoints
 */
export function useAnalysisDrag({ containerRef, constraintFn }) {
    const [points, setPoints] = useState([]);
    const [currentPointIndex, setCurrentPointIndex] = useState(0);
    const [isDragging, setIsDragging] = useState(false);
    const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

    const [lines, setLines] = useState([]);
    const [intersectionPoints, setIntersectionPoints] = useState([]);
    const [calculationResults, setCalculationResults] = useState([]);
    const [isCalculated, setIsCalculated] = useState(false);

    /* ---------- 點位切換 ---------- */

    const setDraggablePoint = (index) => {
        setPoints(prev => prev.map((pt, i) => ({ ...pt, isDraggable: i === index })));
        setCurrentPointIndex(index);
    };

    /* ---------- 拖曳事件 ---------- */

    const handleMouseDown = (e, pointIndex) => {
        e.preventDefault();
        // 點擊任意點位時切換為可拖曳
        if (points[pointIndex] && !points[pointIndex].isDraggable) {
            setDraggablePoint(pointIndex);
        }
        setIsDragging(true);

        const clientX = e.touches ? e.touches[0].clientX : e.clientX;
        const clientY = e.touches ? e.touches[0].clientY : e.clientY;
        const container = containerRef.current;
        const rect = container.getBoundingClientRect();

        setDragStart({
            x: clientX - rect.left - points[pointIndex].x,
            y: clientY - rect.top - points[pointIndex].y
        });
    };

    const handleMouseMove = (e) => {
        if (!isDragging) return;
        e.preventDefault();

        const clientX = e.touches ? e.touches[0].clientX : e.clientX;
        const clientY = e.touches ? e.touches[0].clientY : e.clientY;
        const container = containerRef.current;
        if (!container) return;
        const rect = container.getBoundingClientRect();

        let newX = clientX - rect.left - dragStart.x;
        let newY = clientY - rect.top - dragStart.y;
        newX = Math.max(0, Math.min(container.offsetWidth - 10, newX));
        newY = Math.max(0, Math.min(container.offsetHeight - 10, newY));

        setPoints(prev => {
            const previousPoint = prev[currentPointIndex];
            return constraintFn(prev, currentPointIndex, newX, newY, previousPoint);
        });
    };

    const handleMouseUp = () => {
        setIsDragging(false);
    };

    // 全域拖曳事件綁定 / 解綁
    useEffect(() => {
        if (!isDragging) return;

        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseup', handleMouseUp);
        document.addEventListener('touchmove', handleMouseMove, { passive: false });
        document.addEventListener('touchend', handleMouseUp);

        return () => {
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
            document.removeEventListener('touchmove', handleMouseMove);
            document.removeEventListener('touchend', handleMouseUp);
        };
    }, [isDragging, dragStart, currentPointIndex]);

    /* ---------- 點位導航 ---------- */

    const handlePrevPoint = () => {
        if (currentPointIndex > 0) setDraggablePoint(currentPointIndex - 1);
    };

    const handleNextPoint = () => {
        if (currentPointIndex < points.length - 1) setDraggablePoint(currentPointIndex + 1);
    };

    /* ---------- 重設 ---------- */

    /** 完整重設點位及所有計算結果 */
    const resetPoints = (newPoints) => {
        setPoints(newPoints);
        setCurrentPointIndex(0);
        setLines([]);
        setIntersectionPoints([]);
        setCalculationResults([]);
        setIsCalculated(false);
    };

    return {
        points,
        currentPointIndex,
        resetPoints,
        setDraggablePoint,
        handleMouseDown,
        handlePrevPoint,
        handleNextPoint,
        lines, setLines,
        intersectionPoints, setIntersectionPoints,
        calculationResults, setCalculationResults,
        isCalculated, setIsCalculated
    };
}
