FROM golang:1.22-alpine
RUN mkdir /coldchain
WORKDIR /coldchain
COPY . .
ENV GOPROXY=https://goproxy.cn,direct
RUN go mod tidy
WORKDIR /coldchain/analyzer
CMD ["go", "run", "."]