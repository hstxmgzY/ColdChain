package controllers

import (
	"coldchain/common/logger"
	"coldchain/monitor/dao"
	"net/http"

	"github.com/gin-gonic/gin"
)

// 列出每个设备的最新温度数据
func (m *Monitor) ListTemperature(ctx *gin.Context) {
	temperatures, err := dao.GetDevicesLatestTemperature(m.ch)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": "获取温度记录失败"})
		logger.Errorf("获取温度记录失败: %v", err)
		return
	}

	ctx.JSON(http.StatusOK, temperatures)
}

// 获取设备的报警记录
func (m *Monitor) MonitorTemperature(ctx *gin.Context) {
	deviceID := ctx.Param("deviceID")
	if deviceID == "" {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "deviceID is required"})
		return
	}
	conn, err := m.upgrade(ctx.Writer, ctx.Request, nil)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to upgrade connection"})
		return
	}
	defer conn.Close()

	if err := m.ms.MonitorTemperature(conn, deviceID); err != nil {
		conn.WriteJSON(gin.H{"error": err.Error()})
		return
	}
}
