import * as echarts from 'echarts'
import { useEffect, useRef } from 'react'


const OrderChart = () => {
    const chartRef = useRef(null);
    useEffect(() => {
        if (chartRef.current) {
            const myChart = echarts.init(chartRef.current)
            myChart.setOption({
                title: {
                    text: '本周每日订单数量'
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
                xAxis: [
                    {
                        type: 'category',
                        data: ['周一', '周二', '周三', '周四', '周五', '周六', '周日'],
                        axisTick: {
                            alignWithLabel: true
                        }
                    }
                ],
                yAxis: [
                    {
                        type: 'value'
                    }
                ],
                series: [
                    {
                        name: '订单数量',
                        type: 'bar',
                        barWidth: '60%',
                        data: [10, 52, 200, 334, 390, 330, 220],
                    }
                ]
            });
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

export default OrderChart