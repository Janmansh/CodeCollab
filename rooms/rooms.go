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
	IdMap map[string]int
}

// Init room map
func (r *RoomMap) Init() {
	r.Map = make(map[string][]Participant)
	r.IdMap = make(map[string]int)
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
	r.IdMap[roomId] = 0

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
	r.IdMap[roomId]++
} 

func (r *RoomMap) DeletePosFromRoom(roomId string, i int) {
	r.Mutex.Lock()
	defer r.Mutex.Unlock()

	x := r.Map[roomId]
	x[i] = x[len(x) - 1]
	r.Map[roomId] = x[:len(x) - 1]
}

func (r *RoomMap) DeleteConnFromRoom(roomId string, con *websocket.Conn) {
	r.Mutex.Lock()
	defer r.Mutex.Unlock()

	for i := 0; i < len(r.Map[roomId]); i++ {
		if r.Map[roomId][i].Conn == con {
			x := r.Map[roomId]
			x[i] = x[len(x) - 1]
			r.Map[roomId] = x[:len(x) - 1]
			break
		}
	}
}

// Delete roomid
func (r *RoomMap) DeleteRoom(roomId string) {
	r.Mutex.Lock()
	defer r.Mutex.Unlock()

	delete(r.Map, roomId)
}

func (r *RoomMap) GetUserId(roomId string) int {
	r.Mutex.Lock()
	defer r.Mutex.Unlock()

	return r.IdMap[roomId]
}