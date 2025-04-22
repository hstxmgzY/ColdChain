FROM golang:1.22.0-alpine
RUN mkdir /coldchain
WORKDIR /coldchain
COPY . .
ENV GOPROXY=https://goproxy.cn,direct
# RUN go mod tidy
RUN go mod tidy
WORKDIR /coldchain/generator
CMD ["go", "run", "."]