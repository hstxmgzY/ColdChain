package controllers

import (
	"coldchain/monitor/dao"
	"net/http"

	"github.com/gin-gonic/gin"
)

func (m *Monitor) MonitorAlarm(ctx *gin.Context) {
	deviceID := ctx.Param("deviceID")
	if deviceID == "" {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "deviceID is required"})
		return
	}

	alarms, err := dao.GetAlarmList(m.ch, deviceID)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": "获取报警记录失败"})
		return
	}

	ctx.JSON(http.StatusOK, alarms)
}
