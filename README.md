# ColdChain

a cold chain web app 毕业设计，

# Component

-   web: 前端界面

-   server：用户、订单、路径规划等事务服务

-   monitor：实时数据监控服务

-   analyzer：实时数据分析服务，检测异常数据并报警

-   generator：数据生成模块

# Real Time

```
[设备] → Kafka → Flink
                   ↘ 聚合后写 ClickHouse（状态、轨迹、报警）
                            ↘ 前端页面打开后通过 API 查询 ClickHouse
```
