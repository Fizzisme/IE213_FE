import ReactECharts from 'echarts-for-react';
import { useEffect, useRef } from 'react';
import { useLayoutStore } from '@/stores/useLayoutStore.jsx';

export default function PatientChart() {
    const option = {
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
                show: false,
            },
        },
        series: [
            {
                name: 'Bệnh nhân tiểu đường',
                type: 'line',
                smooth: true,
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
    const openSidebar = useLayoutStore((s) => s?.openSidebar);
    console.log(openSidebar);

    // // ✅ Lần đầu mount — đợi chart init xong rồi resize
    // useEffect(() => {
    //     const timeout = setTimeout(() => {
    //         const chart = chartRef.current?.getEchartsInstance();
    //         chart?.resize();
    //     }, 100); // đợi ECharts render xong
    //     return () => clearTimeout(timeout);
    // }, []); // ← chỉ chạy 1 lần khi mount

    useEffect(() => {
        const chart = chartRef.current?.getEchartsInstance();
        const container = chart?.getDom();
        console.log(chart);
        console.log('Size chưa rezie', container.clientWidth);
        if (!chart || !container) return;

        let rafId;
        const startTime = performance.now();
        const duration = 550;

        const resizeLoop = () => {
            chart.resize();
            // console.log('Dang resize ở giây' + `${performance.now()}`);
            if (performance.now() - startTime < duration) {
                rafId = requestAnimationFrame(resizeLoop);
            }
            console.log('Size đã rezie', container.clientWidth);
        };

        rafId = requestAnimationFrame(resizeLoop);

        return () => cancelAnimationFrame(rafId);
    }, [openSidebar]);

    return (
        <>
            <div className="bg-white p-5 rounded-2xl shadow mb-6 hidden sm:block">
                <p className="text-gray-400 text-sm mb-3">Thống kê bệnh nhân trong 1 tháng</p>

                <ReactECharts ref={chartRef} option={option} style={{ height: 250 }} />
            </div>
        </>
    );
}
