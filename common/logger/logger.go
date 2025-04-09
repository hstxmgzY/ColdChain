package logger

import (
	"fmt"
	"io"
	"net/http"
	"os"
	"path"
	"runtime/debug"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/sirupsen/logrus"
)

const (
	dateFormat = "2006-01-02"
	timeFormat = "15:04:05"
)

func init() {
	logrus.SetFormatter(&logrus.TextFormatter{
		DisableColors: false,
	})
	logrus.SetReportCaller(false)
	logrus.SetLevel(logrus.InfoLevel)
}

func Write(msg string, filename string) {
	setOutPutFile(logrus.InfoLevel, filename)
	logrus.Info(msg)
}

func Debug(fields logrus.Fields, args ...interface{}) {
	setOutPutFile(logrus.DebugLevel, "debug")
	logrus.WithFields(fields).Debug(args...)
}

func Info(fields logrus.Fields, args ...interface{}) {
	setOutPutFile(logrus.InfoLevel, "info")
	logrus.WithFields(fields).Info(args...)
}

func Warn(fields logrus.Fields, args ...interface{}) {
	setOutPutFile(logrus.WarnLevel, "warn")
	logrus.WithFields(fields).Warn(args...)
}

func Fatal(fields logrus.Fields, args ...interface{}) {
	setOutPutFile(logrus.FatalLevel, "fatal")
	logrus.WithFields(fields).Fatal(args...)
}

func Error(fields logrus.Fields, args ...interface{}) {
	setOutPutFile(logrus.ErrorLevel, "error")
	logrus.WithFields(fields).Error(args...)
}

func Panic(fields logrus.Fields, args ...interface{}) {
	setOutPutFile(logrus.PanicLevel, "panic")
	logrus.WithFields(fields).Panic(args...)
}

func Trace(fields logrus.Fields, args ...interface{}) {
	setOutPutFile(logrus.TraceLevel, "trace")
	logrus.WithFields(fields).Trace(args...)
}

func Infof(format string, args ...interface{}) {
	logrus.Infof(format, args...)
}

func Debugf(format string, args ...interface{}) {
	logrus.Infof(format, args...)
}

func Warnf(format string, args ...interface{}) {
	logrus.Warnf(format, args...)
}

func Errorf(format string, args ...interface{}) {
	logrus.Errorf(format, args...)
}

func Fatalf(format string, args ...interface{}) {
	logrus.Fatalf(format, args...)
}

func Panicf(format string, args ...interface{}) {
	logrus.Panicf(format, args...)
}

func setLogDir() {
	if _, err := os.Stat("./runtime/log"); os.IsNotExist(err) {
		err = os.MkdirAll("./runtime/log", 0777)
		if err != nil {
			panic(fmt.Errorf("create log dir '%s' error: %s", "./runtime/log", err))
		}
	}
}

func setOutPutFile(level logrus.Level, logName string) {
	setLogDir()

	timeStr := time.Now().Format(dateFormat)
	fileName := path.Join("./runtime/log", logName+"_"+timeStr+".log")

	var err error
	file, err := os.OpenFile(fileName, os.O_APPEND|os.O_WRONLY|os.O_CREATE, 0644)
	if err != nil {
		fmt.Println("open file error", err)
		return
	}
	logrus.SetOutput(file)
}

func SetOutput(output io.Writer) {
	logrus.SetOutput(output)
}

func LoggerToFile() gin.LoggerConfig {
	setLogDir()

	timeStr := time.Now().Format(dateFormat)
	fileName := path.Join("./runtime/log", "success_"+timeStr+".log")

	os.Stderr, _ = os.OpenFile(fileName, os.O_APPEND|os.O_WRONLY|os.O_CREATE, 0644)

	return gin.LoggerConfig{
		Formatter: func(params gin.LogFormatterParams) string {
			return fmt.Sprintf("[%s - %s] \"%s %s %d\" %s. %s\n",
				params.TimeStamp.Format(timeFormat),
				params.ClientIP,
				params.Method,
				params.Path,
				params.StatusCode,
				params.Latency,
				params.ErrorMessage,
			)
		},
		Output: io.MultiWriter(os.Stdout, os.Stderr),
	}
}

func Recover(ctx *gin.Context) {
	defer func() {
		err := recover()
		if err == nil {
			return
		}
		setLogDir()
		time_str := time.Now().Format(dateFormat)
		f, err_file := os.OpenFile("./runtime/log/runtime_fatal_"+time_str+".log", os.O_APPEND|os.O_WRONLY|os.O_CREATE, 0777)
		if err_file != nil {
			panic(fmt.Errorf("create log dir %s, error : %s", "runtime_fatal_"+time_str+".log", err))
		}
		defer f.Close()

		time_str = time.Now().Format(timeFormat)
		f.WriteString(fmt.Sprintf("panic error time: %s\n", time_str))
		f.WriteString(fmt.Sprintf("%s\n", err))
		f.WriteString(fmt.Sprintf("stack trace from panic: %s\n", debug.Stack()))
		ctx.JSON(http.StatusOK, gin.H{
			"code":    500,
			"message": fmt.Sprintf("%v", err),
		})
		ctx.Abort()
	}()
	ctx.Next()
}
