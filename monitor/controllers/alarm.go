package controllers

import (
	"coldchain/common/logger"
	"coldchain/monitor/dao"
	"net/http"

	"github.com/gin-gonic/gin"
)

func (m *Monitor) GetAlarmByID(ctx *gin.Context) {
	deviceID := ctx.Param("deviceID")
	if deviceID == "" {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "deviceID is required"})
		return
	}

	alarms, err := dao.GetAlarmByID(m.ch, deviceID)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": "获取报警记录失败"})
		logger.Errorf("获取报警记录失败: %v", err)
		return
	}

	ctx.JSON(http.StatusOK, alarms)
}

func (m *Monitor) ListAlarm(ctx *gin.Context) {
	alarms, err := dao.ListAlarm(m.ch)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": "获取报警记录失败"})
		return
	}
	ctx.JSON(http.StatusOK, alarms)
}
