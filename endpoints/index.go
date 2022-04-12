package endpoints

import (
	"github.com/gin-gonic/gin"
)

func GetIndex(c *gin.Context) {

	c.HTML(200, "../client/build/index.html", nil)

}