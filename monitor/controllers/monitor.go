package controllers

import (
	"net/http"

	"github.com/ClickHouse/clickhouse-go/v2/lib/driver"
	"github.com/gorilla/websocket"
)

type Monitor struct {
	ch       driver.Conn
	upgrader websocket.Upgrader
}

func NewMonitor(ch driver.Conn) *Monitor {
	return &Monitor{
		ch: ch,
		upgrader: websocket.Upgrader{
			ReadBufferSize:  1024,
			WriteBufferSize: 1024,
			// 允许所有的跨域请求
			CheckOrigin: func(r *http.Request) bool {
				return true
			},
		},
	}
}

func (m *Monitor) upgrade(w http.ResponseWriter, r *http.Request, responseHeader http.Header) (*websocket.Conn, error) {
	return m.upgrader.Upgrade(w, r, responseHeader)
}



