package config

import (
	"fmt"
	"testing"

	"api/internal/config"
)

func TestNewConfig(t *testing.T) {
	var cfg config.Config
	g, err := cfg.NewConfig()
	if err != nil {
		t.Errorf("cannot charge the .env")
	}

	fmt.Printf("the port is: %q", g.Addr)

	port := g.Addr
	if port != ":8080" {
		t.Errorf("port is not the one choose")
	}
}
