package endpoints

import (
	"bytes"
	"encoding/json"
	"io/ioutil"
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
)

type Response struct {
	Output string `json:"output" binding:"required"`
	StatusCode int `json:"statusCode" binding:"required"`
	Memory string `json:"memory" binding:"required"`
	CpuTime string `json:"cpuTime" binding:"required"`
	Err string `json:"error" binding:"required"`
}

type Request struct {
	Code string `json:"code" binding:"required"`
}

func RunProgram(c *gin.Context) {
	var req Request
	err := c.BindJSON(&req)

	if err != nil {
		panic(err)
	}

	req.Code = strconv.QuoteToASCII(req.Code)

	ans := requestAPI(req.Code)

	c.JSON(200, gin.H{
		"output": ans,
	})
}

func requestAPI(code string) string {
	var jsonRaw = `{"clientId": "ENV_clientid", "clientSecret": "ENV_clientsecret", "script": ` + code + `, "language": "python3", "versionIndex": 0}`
	var jsonStr = []byte(jsonRaw)

	url := "https://api.jdoodle.com/v1/execute"

    req, _ := http.NewRequest("POST", url, bytes.NewBuffer(jsonStr))
    req.Header.Set("Content-Type", "application/json")

    client := &http.Client{}
    resp, err := client.Do(req)
    if err != nil {
        panic(err)
    }
    defer resp.Body.Close()

	body, _ := ioutil.ReadAll(resp.Body)
	var res Response;

	err = json.Unmarshal(body, &res)

	if err != nil {
		panic(err)
	}

	if res.StatusCode != 200 {
		panic(res.Err)
	}

	return res.Output
}