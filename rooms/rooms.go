package rooms

import (
	"math/rand"
	"sync"
	"time"

	"github.com/gorilla/websocket"
)

type Participant struct {
	Host bool
	Conn *websocket.Conn
}

type RoomMap struct {
	Mutex sync.RWMutex
	Map map[string][]Participant
}

// Init room map
func (r *RoomMap) Init() {
	r.Map = make(map[string][]Participant)
}

// Get participants in room id
func (r *RoomMap) Get(roomId string) []Participant {
	r.Mutex.Lock()
	defer r.Mutex.Unlock()

	return r.Map[roomId]
}

// Create new room and return its ID
func (r *RoomMap) CreateRoom() string {
	r.Mutex.Lock()
	defer r.Mutex.Unlock()

	var roomId string

	for {
		roomId = randomRoomId()
		if(r.Map[roomId] == nil) {
			break
		}
	}

	r.Map[roomId] = []Participant{}

	return roomId
}

// Generate random room id
func randomRoomId() string {
	rand.Seed(time.Now().UnixMilli())
	idSymbols := []rune("abcdefghijklmnopqrstuvwxyz1234567890")
	b := make([]rune, 8)

	for i := range b {
		b[i] = idSymbols[rand.Intn(len(idSymbols))]
	}

	return string(b)
}

// Insert participant into room
func (r *RoomMap) InsertIntoRoom(roomId string, host bool, conn *websocket.Conn) {
	r.Mutex.Lock()
	defer r.Mutex.Unlock()

	p := Participant{host, conn}

	r.Map[roomId] = append(r.Map[roomId], p)
} 


// Delete roomid
func (r *RoomMap) DeleteRoom(roomId string) {
	r.Mutex.Lock()
	defer r.Mutex.Unlock()

	delete(r.Map, roomId)
}