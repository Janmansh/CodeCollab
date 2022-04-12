package endpoints

import (
	"gin-testing/rooms"
	"log"
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/gorilla/websocket"
)

var AllRooms rooms.RoomMap

// Create a room and return room id
func CreateNewCall(c *gin.Context) {
	roomId := AllRooms.CreateRoom()

	type resp struct {
		RoomId string `json:"roomId"`
	}

	log.Println(AllRooms.Map)

	c.JSON(200, resp{RoomId: roomId})

	// c.String(201, "New call established");
}

var upgrader = websocket.Upgrader{}

type broadcastMsg struct {
	Message map[string]interface{}
	RoomId string
	Client *websocket.Conn
}

var broadcast = make(chan broadcastMsg)

func broadcaster() {
	for {
		msg := <-broadcast

		l := len(AllRooms.Map[msg.RoomId])
		for i := 0; i < l; i++ {
			client := AllRooms.Map[msg.RoomId][i]

			if client.Conn != msg.Client {
				err := client.Conn.WriteJSON(msg.Message)

				if err != nil {
					log.Println("Client conn err: ", err)
					client.Conn.Close()
					AllRooms.DeletePosFromRoom(msg.RoomId, i)
					i--
					l = len(AllRooms.Map[msg.RoomId])
				}
			}
		}
	}
}

// TODO Make a broadcaster for each room
// THere is only one broadcaster for entire server 
//which will affect performance if there are large number of peers
func InitBroadcaster() {
	go broadcaster()
}

// Join client to particular room id
func JoinCall(c *gin.Context) {
	roomId := c.Query("roomId")

	if roomId == "" {
		log.Println("roomId missing")
		return
	}

	upgrader.CheckOrigin = func(r *http.Request) bool { return true }
	ws, err := upgrader.Upgrade(c.Writer, c.Request, nil)
	if err != nil {
		log.Fatal("Web socket upgrade error: ", err)
	}

	log.Println("Adding into roomId: ", roomId)
	AllRooms.InsertIntoRoom(roomId, false, ws)

	var idMsg broadcastMsg
	idMsg.Message = make(map[string]interface{})
	idMsg.Message["id"] = AllRooms.GetUserId(roomId)

	ws.WriteJSON(&idMsg.Message)

	for {
		var msg broadcastMsg

		err := ws.ReadJSON(&msg.Message)
		if err != nil {
			log.Println(err)
			AllRooms.DeleteConnFromRoom(roomId, ws)
			if len(AllRooms.Map[roomId]) == 0 {
				AllRooms.DeleteRoom(roomId)
			}
			return
		}

		msg.Client = ws
		msg.RoomId = roomId

		broadcast <- msg
	}
	// c.String(200, "Joined call");
}