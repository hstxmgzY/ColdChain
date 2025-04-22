FROM golang:1.22-alpine
RUN mkdir /coldchain
WORKDIR /coldchain
COPY . .
ENV GOPROXY=https://goproxy.cn,direct
EXPOSE 9998
RUN go mod tidy
WORKDIR /coldchain/monitor
CMD ["go", "run", "."]