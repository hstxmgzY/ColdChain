import * as echarts from 'echarts'
import { useEffect, useRef } from 'react'


const MilesChart = () => {
    const chartRef = useRef(null);
    useEffect(() => {
        if (chartRef.current) {
            const myChart = echarts.init(chartRef.current)
            myChart.setOption({
                title: {
                    text: '本周每日车辆行驶里程（千米）'
                },
                tooltip: {
                    trigger: 'axis',
                    axisPointer: {
                        type: 'shadow'
                    }
                },
                grid: {
                    left: '3%',
                    right: '4%',
                    bottom: '3%',
                    containLabel: true
                },
                toolbox: {
                    feature: {
                        saveAsImage: {}
                    }
                },
                xAxis: {
                    type: 'category',
                    boundaryGap: false,
                    data: ['星期一', '星期二', '星期三', '星期四', '星期五', '星期六', '星期日']
                },
                yAxis: {
                    type: 'value'
                },
                series: [
                    {
                        name: 'Email',
                        type: 'line',
                        stack: 'Total',
                        data: [120, 132, 101, 134, 90, 230, 210]
                    },
                    {
                        name: 'Union Ads',
                        type: 'line',
                        stack: 'Total',
                        data: [220, 182, 191, 234, 290, 330, 310]
                    },
                    {
                        name: 'Video Ads',
                        type: 'line',
                        stack: 'Total',
                        data: [150, 232, 201, 154, 190, 330, 410]
                    },
                    {
                        name: 'Direct',
                        type: 'line',
                        stack: 'Total',
                        data: [320, 332, 301, 334, 390, 330, 320]
                    },
                    {
                        name: 'Search Engine',
                        type: 'line',
                        stack: 'Total',
                        data: [820, 932, 901, 934, 1290, 1330, 1320]
                    }
                ]
            });
            // 手动解决自适应栅格宽度
            myChart.on('finished', function () {
                myChart.resize();
            });
        }
    }, [])
    return (
        <div ref={chartRef} style={{ height: '310px', width: '100%' }}>

        </div>
    )
}

export default MilesChart