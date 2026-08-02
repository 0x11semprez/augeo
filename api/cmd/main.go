package main

import (
	"log"
	"net/http"

	"api/internal/config"
	"api/internal/server"
)

func main() {
	cfg := config.Config{}
	srv := server.Server{}
	mux := http.NewServeMux()
	cfg.NewConfig()

	srv.CreateServer(&cfg, mux)
	err := srv.Server.ListenAndServe()
	if err != nil {
		log.Fatal(err)
	}
}
