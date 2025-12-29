import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Chart from 'chart.js/auto';
import styles from './ReportSpineRevenueLineChart.module.css';
import { getProductPillowOptions, getRevenueLineChartData } from '../../api/manager/reportSpine';

const REPORT_TABS = [
	{ key: 'revenue', label: '營收折線圖', path: '/manager/report/revenue-line-chart' },
	{ key: 'sales', label: '銷量折線圖', path: '/manager/report/sales-line-chart' }
];

const TIME_RANGE_OPTIONS = [
	{ value: 'day', label: '近 100 天 (日)' },
	{ value: 'week', label: '近 20 週 (週)' },
	{ value: 'month', label: '近 18 個月 (月)' },
	{ value: 'quarter', label: '近 10 季 (季)' },
];

const TIME_RANGE_META = {
	day: { description: '逐日檢視近 100 天營收波動' },
	week: { description: '以週為單位觀察 20 週走勢' },
	month: { description: '掌握 18 個月長期趨勢' },
	quarter: { description: '聚焦 10 季營收表現' }
};

const DEFAULT_CHART_STATE = { labels: [], data: [], summary: {} };

const ReportSpineRevenueLineChart = () => {
	const navigate = useNavigate();
	const activeTab = 'revenue';
	const [timeRange, setTimeRange] = useState('day');
	const [productPillowId, setProductPillowId] = useState('all');
	const [productOptions, setProductOptions] = useState([{ id: 'all', name: '全部商品' }]);
	const [chartPayload, setChartPayload] = useState(DEFAULT_CHART_STATE);
	const [loadingChart, setLoadingChart] = useState(false);
	const [optionsError, setOptionsError] = useState('');
	const [errorMessage, setErrorMessage] = useState('');
	const [lastUpdated, setLastUpdated] = useState(null);

	const chartCanvasRef = useRef(null);
	const chartInstanceRef = useRef(null);

	const fetchOptions = useCallback(async () => {
		setOptionsError('');
		try {
			const options = await getProductPillowOptions();
			setProductOptions([{ id: 'all', name: '全部商品' }, ...(options || [])]);
		} catch (error) {
			console.error('[ReportSpineRevenueLineChart] fetchOptions error:', error);
			setOptionsError('無法取得商品選項，已套用全部商品。');
		}
	}, []);

	const fetchChartData = useCallback(async () => {
		setLoadingChart(true);
		setErrorMessage('');
		try {
			const userId = localStorage.getItem('userId') || '';
			const payload = await getRevenueLineChartData(timeRange, productPillowId, userId);
			setChartPayload({
				labels: payload?.labels || [],
				data: payload?.data || [],
				summary: payload?.summary || {}
			});
			setLastUpdated(new Date());
		} catch (error) {
			console.error('[ReportSpineRevenueLineChart] fetchChartData error:', error);
			const message = error?.response?.data?.message || '取得營收資料失敗，請稍後再試。';
			setErrorMessage(message);
			setChartPayload(DEFAULT_CHART_STATE);
		} finally {
			setLoadingChart(false);
		}
	}, [timeRange, productPillowId]);

	useEffect(() => {
		fetchOptions();
	}, [fetchOptions]);

	useEffect(() => {
		fetchChartData();
	}, [fetchChartData]);

	useEffect(() => {
		if (!chartCanvasRef.current) {
			return () => undefined;
		}

		if (!chartPayload.labels.length) {
			if (chartInstanceRef.current) {
				chartInstanceRef.current.destroy();
				chartInstanceRef.current = null;
			}
			return () => undefined;
		}

		const context = chartCanvasRef.current.getContext('2d');
		if (!context) {
			return () => undefined;
		}

		if (chartInstanceRef.current) {
			chartInstanceRef.current.destroy();
		}

		chartInstanceRef.current = new Chart(context, {
			type: 'line',
			data: {
				labels: chartPayload.labels,
				datasets: [
					{
						label: '營收 (TWD)',
						data: chartPayload.data,
						borderColor: '#6366f1',
						backgroundColor: 'rgba(99, 102, 241, 0.25)',
						tension: 0.35,
						borderWidth: 3,
						fill: true,
						pointRadius: 3,
						pointHoverRadius: 6,
						pointBackgroundColor: '#fff'
					}
				]
			},
			options: {
				responsive: true,
				maintainAspectRatio: false,
				interaction: { intersect: false, mode: 'index' },
				plugins: {
					legend: { display: false },
					tooltip: {
						callbacks: {
							label: context => {
								const value = context?.parsed?.y ?? context?.parsed ?? 0;
								return `營收：${formatCurrency(value)}`;
							}
						}
					}
				},
				scales: {
					x: {
						ticks: { maxRotation: 45, minRotation: 45, color: '#475569' },
						grid: { display: false }
					},
					y: {
						beginAtZero: true,
						ticks: {
							callback: value => formatCurrency(value),
							color: '#475569'
						},
						grid: { color: 'rgba(99, 102, 241, 0.1)' }
					}
				}
			}
		});

		return () => {
			if (chartInstanceRef.current) {
				chartInstanceRef.current.destroy();
				chartInstanceRef.current = null;
			}
		};
	}, [chartPayload]);

	const summary = chartPayload.summary || {};
	const selectedProductName = productOptions.find(option => option.id === productPillowId)?.name || '全部商品';
	const timeRangeDescription = TIME_RANGE_META[timeRange]?.description || '';
	const rangeLabel = summary.startDate ? `${formatDate(summary.startDate)} ~ ${formatDate(summary.endDate)}` : '尚無資料';

	const renderChartBody = () => {
		if (loadingChart) {
			return <div className={styles.state}>資料載入中...</div>;
		}

		if (errorMessage) {
			return <div className={styles.errorState}>{errorMessage}</div>;
		}

		if (!chartPayload.labels.length) {
			return <div className={styles.emptyState}>目前沒有符合條件的營收資料</div>;
		}

		return (
			<div className={styles.chartWrapper}>
				<canvas ref={chartCanvasRef} />
			</div>
		);
	};

	return (
		<section className={styles.page}>
			<div className={styles.panel}>
				<div className={styles.tabBar}>
					{REPORT_TABS.map(tab => (
						<button
							key={tab.key}
							type="button"
							className={`${styles.tabButton} ${tab.key === activeTab ? styles.tabButtonActive : ''}`}
							onClick={() => tab.key !== activeTab && navigate(tab.path)}
						>
							{tab.label}
						</button>
					))}
				</div>
				<div className={styles.headerRow}>
					<div className={styles.titleGroup}>
						<span className={styles.subtitle}>Revenue Intelligence</span>
						<h2 className={styles.title}>營收折線圖</h2>
						<span className={styles.summaryHint}>{timeRangeDescription}</span>
					</div>
					<div className={styles.filterGroup}>
						<select
							className={styles.select}
							value={timeRange}
							onChange={event => setTimeRange(event.target.value)}
						>
							{TIME_RANGE_OPTIONS.map(option => (
								<option key={option.value} value={option.value}>
									{option.label}
								</option>
							))}
						</select>
						<select
							className={styles.select}
							value={productPillowId}
							onChange={event => setProductPillowId(event.target.value)}
						>
							{productOptions.map(option => (
								<option key={option.id} value={option.id}>
									{option.name || '未命名商品'}
								</option>
							))}
						</select>
					</div>
				</div>
			</div>

			{optionsError && (
				<div className={styles.summaryHint}>{optionsError}</div>
			)}

			<div className={styles.summaryRow}>
				<div className={styles.summaryCard}>
					<span className={styles.summaryLabel}>累積營收</span>
					<span className={styles.summaryValue}>{formatCurrency(summary.totalRevenue)}</span>
					<span className={styles.summaryHint}>{rangeLabel}</span>
				</div>
				<div className={styles.summaryCard}>
					<span className={styles.summaryLabel}>資料切片</span>
					<span className={styles.summaryValue}>{chartPayload.data.length}</span>
					<span className={styles.summaryHint}>依 {timeRange.toUpperCase()} 週期</span>
				</div>
				<div className={styles.summaryCard}>
					<span className={styles.summaryLabel}>商品篩選</span>
					<span className={styles.summaryValue}>{selectedProductName}</span>
					<span className={styles.summaryHint}>目前顯示商品</span>
				</div>
			</div>

			<div className={styles.chartSection}>
				{renderChartBody()}
				{lastUpdated && (
					<div className={styles.lastUpdate}>最後更新：{formatDateTime(lastUpdated)}</div>
				)}
			</div>
		</section>
	);
};

export default ReportSpineRevenueLineChart;

function formatCurrency(value) {
	const numberValue = Number(value) || 0;
	return numberValue.toLocaleString('zh-TW', {
		style: 'currency',
		currency: 'TWD',
		maximumFractionDigits: 0
	});
}

function formatDate(value) {
	if (!value) return '';
	const date = new Date(value);
	if (Number.isNaN(date.getTime())) {
		return '';
	}
	const year = date.getFullYear();
	const month = `${date.getMonth() + 1}`.padStart(2, '0');
	const day = `${date.getDate()}`.padStart(2, '0');
	return `${year}/${month}/${day}`;
}

function formatDateTime(value) {
	if (!value) return '';
	const date = new Date(value);
	if (Number.isNaN(date.getTime())) {
		return '';
	}
	return `${formatDate(date)} ${`${date.getHours()}`.padStart(2, '0')}:${`${date.getMinutes()}`.padStart(2, '0')}`;
}
