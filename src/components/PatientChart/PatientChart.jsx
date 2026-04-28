// src/components/PatientChart/PatientChart.jsx

import { useEffect, useRef } from 'react';
import { useSidebarStore } from '@/stores/useSidebarStore.jsx';

import ReactEChartsCore from 'echarts-for-react/lib/core';
import * as echarts from 'echarts/core';
import { LineChart } from 'echarts/charts';
import { GridComponent, TooltipComponent, LegendComponent } from 'echarts/components';
import { CanvasRenderer } from 'echarts/renderers';

/**
 * Cấu hình Tree-shaking cho ECharts.
 * Chỉ đăng ký các module cần thiết để giảm thiểu dung lượng tệp JavaScript cuối cùng (Bundle size).
 */
echarts.use([LineChart, GridComponent, TooltipComponent, LegendComponent, CanvasRenderer]);

/**
 * Component PatientChart
 * Hiển thị biểu đồ đường (Line Chart) thống kê số lượng bệnh nhân theo thời gian.
 * Có cơ chế tự động điều chỉnh kích thước (resize) mượt mà khi thanh Sidebar đóng hoặc mở.
 */
export default function PatientChart() {
    /**
     * Đối tượng cấu hình (option) cho ECharts.
     * Định nghĩa màu sắc, tooltip, dữ liệu trục X (ngày) và các chuỗi dữ liệu (series).
     */
    const option = {
        color: ['#0d7b6d', '#a5b4fc'],
        areaStyle: {
            opacity: 0.2,
        },
        tooltip: {
            trigger: 'axis',
            backgroundColor: '#fff',
            borderColor: '#eee',
            textStyle: {
                color: '#333',
            },
        },
        legend: {
            data: ['Bệnh nhân tiểu đường', 'Bệnh nhân Offline'],
            top: '0%',
        },
        grid: {
            top: '3%',
            left: '3%',
            right: '3%',
            bottom: '3%',
            containLabel: true,
        },
        xAxis: {
            type: 'category',
            boundaryGap: false,
            data: [
                '01',
                '02',
                '03',
                '04',
                '05',
                '06',
                '07',
                '08',
                '09',
                '10',
                '11',
                '12',
                '13',
                '14',
                '15',
                '16',
                '17',
                '18',
                '19',
                '20',
                '21',
                '22',
                '23',
                '24',
                '25',
                '26',
                '27',
                '28',
                '29',
                '30',
            ],
        },
        yAxis: {
            type: 'value',
            splitLine: {
                show: false, // Ẩn đường kẻ ngang trong biểu đồ
            },
        },
        series: [
            {
                name: 'Bệnh nhân tiểu đường',
                type: 'line',
                smooth: true, // Làm mượt đường kẻ
                data: [
                    120,
                    132,
                    101,
                    134,
                    90,
                    230,
                    210,
                    180,
                    200,
                    220,
                    210,
                    190,
                    170,
                    160,
                    150,
                    180,
                    200,
                    210,
                    220,
                    230,
                    240,
                    250,
                    260,
                    240,
                    230,
                    220,
                    210,
                    200,
                    190,
                    180,
                ],
            },
            {
                name: 'Bệnh nhân Offline',
                type: 'line',
                smooth: true,
                data: [
                    30,
                    20,
                    25,
                    22,
                    18,
                    40,
                    35,
                    30,
                    28,
                    26,
                    25,
                    24,
                    23,
                    22,
                    21,
                    20,
                    25,
                    27,
                    29,
                    30,
                    32,
                    34,
                    33,
                    31,
                    29,
                    28,
                    27,
                    26,
                    25,
                    24,
                ],
            },
        ],
    };

    const chartRef = useRef(null);
    const openSidebar = useSidebarStore((s) => s?.openSidebar);

    /**
     * Effect xử lý việc thay đổi kích thước biểu đồ (Resize logic).
     * Khi Sidebar thay đổi trạng thái, kích thước vùng chứa biểu đồ sẽ biến đổi dần (CSS Transition).
     * Do đó, ta cần sử dụng requestAnimationFrame để gọi hàm chart.resize() liên tục
     * trong một khoảng thời gian (duration) nhằm đảm bảo biểu đồ luôn khít với khung hình.
     */
    useEffect(() => {
        // Trì hoãn 50ms để đảm bảo DOM đã render trạng thái mới
        const timeout = setTimeout(() => {
            const chart = chartRef.current?.getEchartsInstance();
            if (!chart) return;

            let rafId;
            const startTime = performance.now();
            const duration = 550; // Khớp với thời gian transition của Sidebar CSS

            /**
             * Vòng lặp resize dựa trên hiệu năng của trình duyệt.
             */
            const resizeLoop = () => {
                chart.resize();
                if (performance.now() - startTime < duration) {
                    rafId = requestAnimationFrame(resizeLoop);
                }
            };

            rafId = requestAnimationFrame(resizeLoop);
        }, 50);

        // Cleanup: Hủy timeout khi component bị unmount hoặc dependency thay đổi
        return () => clearTimeout(timeout);
    }, [openSidebar]);

    return (
        // Chỉ hiển thị biểu đồ trên màn hình từ sm (Small) trở lên
        <div className="bg-white p-5 rounded-2xl shadow mb-6 hidden sm:block">
            <p className="text-gray-400 text-sm mb-3">Thống kê bệnh nhân trong 1 tháng</p>
            <ReactEChartsCore
                echarts={echarts}
                ref={chartRef}
                option={option}
                style={{ height: 250, width: '100%' }}
                opts={{ renderer: 'canvas', width: 'auto' }}
            />
        </div>
    );
}
