CREATE TABLE IF NOT EXISTS module_monitor (
    id String,
    name String,
    type String,
    engine String,
    create_time DateTime,
    update_time DateTime
) ENGINE = MergeTree()