package main

import "coldchain/router"

func main() {
	r := router.Router()
	r.Run(":9999")
}
