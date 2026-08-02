package server

import (
	"net/http"

	"api/internal/config"
)

func (s *Server) CreateServer(cfg *config.Config, mux http.Handler) {
	s.Server = &http.Server{
		Addr:    cfg.Addr,
		Handler: mux,
	}
}

// memory {
// struct Server {
//    addr: string
// }
// }
//
// create a struct Server that Point to because a lot thing that we could modify
// then a pointer to this struct but why ?
