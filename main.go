package main

import (
	"gin-testing/endpoints"

	"github.com/gin-gonic/gin"
)

func main() {
	r := gin.Default()

	r.LoadHTMLGlob("templates/*")
	r.Static("/assets", "./assets")

	r.GET("/", func(c *gin.Context) {
		c.Redirect(301, "/index")
	})
	r.GET("/index", endpoints.GetIndex)
	r.POST("/run", endpoints.RunProgram)

	r.Run("localhost:8080") // listen and serve on 0.0.0.0:8080 (for windows "localhost:8080")
}