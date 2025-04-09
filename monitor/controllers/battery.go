package controllers

import (
	"net/http"

	"github.com/gin-gonic/gin"
)

func (m *Monitor) MonitorBattery(ctx *gin.Context) {
	deviceID := ctx.Param("deviceID")
	if deviceID == "" {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "Device ID is required"})
		return
	}

}
