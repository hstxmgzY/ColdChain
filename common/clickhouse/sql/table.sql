-- ClickHouse table creation script for monitoring and alarm system

CREATE DATABASE IF NOT EXISTS coldchain;

CREATE TABLE IF NOT EXISTS  coldchain.module_monitor (
    time_stamp DateTime64(3),
    device_id String,
    temperature Float32,
    battery_level Float32,
    longitude Float32,
    latitude Float32,
    is_online Enum8('在线' = 1, '离线' = 2),
) ENGINE = MergeTree()
PARTITION BY toYYYYMMDD(time_stamp)
ORDER BY device_id;

CREATE TABLE IF NOT EXISTS coldchain.vehicle_location (
    time_stamp DateTime64(3),
    vehicle_id String,
    longitude Float32,
    latitude Float32,
    speed Float32,
) ENGINE = MergeTree()
PARTITION BY toYYYYMMDD(time_stamp)
ORDER BY vehicle_id;

CREATE TABLE IF NOT EXISTS coldchain.alarm_record (
    time_stamp DateTime64(3),
    device_id String,
    alarm_level Enum8('LOW' = 1, 'MEDIUM' = 2, 'HIGH' = 3),
    alarm_description String,
    alarm_status Enum8('已读' = 1, '暂不处理' = 2, '未读' = 3),
    remark String
) ENGINE = MergeTree()
PARTITION BY toYYYYMMDD(time_stamp)
ORDER BY device_id;
