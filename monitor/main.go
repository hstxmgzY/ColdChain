package monitor

func main() {
	monitor := NewMonitor()
	monitor.ApiServer.Run(MONITOR_IP + ":" + MONITOR_PORT)
}
