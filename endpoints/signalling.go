package endpoints

import (
	"gin-testing/rooms"

	"github.com/gin-gonic/gin"
)

// "github.com/gorilla/websocket"
var AllRooms rooms.RoomMap

// Create a room and return room id
func CreateNewCall(c *gin.Context) {
	c.String(201, "New call established");
}

// Join client to particular room id
func JoinCall(c *gin.Context) {
	c.String(200, "Joined call");
}