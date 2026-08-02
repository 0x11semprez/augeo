// package config to create config
package config

import (
	"log"
	"os"

	"github.com/joho/godotenv"
)

func (c *Config) NewConfig() {
	err := godotenv.Load("../../.env")
	if err != nil {
		log.Fatal("error loading .env file")
	}

	port := os.Getenv("PORT")

	c.Addr = port
}
