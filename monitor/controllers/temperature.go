package controllers

import (
	"coldchain/monitor/services"
	"net/http"

	"github.com/gin-gonic/gin"
)

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

	if err := services.MonitorTemperature(conn, deviceID); err != nil {
		conn.WriteJSON(gin.H{"error": err.Error()})
		return
	}
}
