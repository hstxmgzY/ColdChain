CREATE TABLE module_monitor (
    time_stamp DateTime64(3),
    device_id String,
    temperature Decimal(5,1),
    battery_level Decimal(5,2),
    longitude Decimal(9,6),
    latitude Decimal(9,6),
) ENGINE = MergeTree()
PARTITION BY toYYYYMMDD(time_stamp)
ORDER BY device_id;

CREATE TABLE vehicle_location (
    time_stamp DateTime64(3),
    vehicle_id String,
    longitude Decimal(9,6),
    latitude Decimal(9,6),
) ENGINE = MergeTree()
PARTITION BY toYYYYMMDD(time_stamp)
ORDER BY vehicle_id;

CREATE TABLE alarm_record (
    event_time DateTime64(3),
    device_id String,
    alarm_level Enum8('LOW' = 1, 'MEDIUM' = 2, 'HIGH' = 3),
    alarm_description String,
    alarm_status Enum8('已读' = 1, '暂不处理' = 2, '未读' = 3),
    remark String
) ENGINE = MergeTree()
PARTITION BY toYYYYMMDD(event_time)
ORDER BY device_id;
