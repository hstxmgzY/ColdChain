import React from 'react';
import { Table } from 'antd';
import type { TableColumnsType, TableProps } from 'antd';

interface DataType {
    key: React.Key;
    vehicle: string;
    available: number;
    totalEquip: number;
    totalMiles: number;
}

const columns: TableColumnsType<DataType> = [
    {
        title: '车牌号码',
        dataIndex: 'vehicle',
        align: 'center',
        width: '26%',
    },
    {
        title: (
            <>
                可用箱 <br /> 数量
            </>
        ),
        dataIndex: 'available',
        align: 'center',
        sorter: (a, b) => a.available - b.available,
        width: '25%',
    },
    {
        title: (
            <>
                冷链箱 <br /> 总数量
            </>
        ),
        dataIndex: 'totalEquip',
        align: 'center',
        sorter: (a, b) => a.totalEquip - b.totalEquip,
        width: '25%',
    },
    {
        title: '今日里程/km',
        dataIndex: 'totalMiles',
        align: 'center',
        sorter: (a, b) => a.totalEquip - b.totalEquip,
        width: '25%',
    },
];

const data: DataType[] = [
    {
        key: '1',
        vehicle: '浙BC1BSB',
        available: 32,
        totalEquip: 64,
        totalMiles: 13
    },
    {
        key: '2',
        vehicle: '浙BC2BSB',
        available: 10,
        totalEquip: 24,
        totalMiles: 64
    },
    {
        key: '3',
        vehicle: '浙BC3BSB',
        available: 67,
        totalEquip: 83,
        totalMiles: 99
    },
    {
        key: '4',
        vehicle: '浙BC4BSB',
        available: 23,
        totalEquip: 54,
        totalMiles: 273
    },
    {
        key: '5',
        vehicle: '浙BC5BSB',
        available: 22,
        totalEquip: 34,
        totalMiles: 134
    },
    {
        key: '6',
        vehicle: '浙BC6BSB',
        available: 2,
        totalEquip: 38,
        totalMiles: 138
    },
];

const onChange: TableProps<DataType>['onChange'] = (sorter, extra) => {
    console.log('params', sorter, extra);
};

const VehicleTable: React.FC = () => (
    <Table<DataType> columns={columns} dataSource={data} onChange={onChange} pagination={false} size={'small'} />
);

export default VehicleTable;