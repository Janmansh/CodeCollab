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
	Output     string `json:"output" binding:"required"`
	StatusCode int    `json:"statusCode" binding:"required"`
	Memory     string `json:"memory" binding:"required"`
	CpuTime    string `json:"cpuTime" binding:"required"`
	Err        string `json:"error" binding:"required"`
}

type Request struct {
	Code     string `json:"code" binding:"required"`
	Language string `json:"language" binding:"required"`
	Input    string `json:"userInput"`
}

func RunProgram(c *gin.Context) {

	language_map := map[string]string{
		"C++":    "cpp17",
		"Python": "python3",
		"Java":   "java",
		"C":      "c",
	}
	var req Request
	err := c.BindJSON(&req)

	if err != nil {
		panic(err)
	}
	req.Code = strconv.QuoteToASCII(req.Code)
	req.Input = strconv.QuoteToASCII(req.Input)
	ans := requestAPI(req.Code, language_map[req.Language], req.Input)

	c.JSON(200, gin.H{
		"output": ans,
	})
}

func requestAPI(code string, language string, input string) string {
	var jsonRaw = `{"clientId": "e67139a8317554984daafaa1fce69d93", "clientSecret": "4a231fff8bf76c4f40e427ca7551cf5c96d67ab61d835307f478c78b7ff70ec4", "script": ` + code + `, "language": "` + language + `", "stdin": ` + input + `}`
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
	var res Response

	err = json.Unmarshal(body, &res)

	if err != nil {
		panic(err)
	}

	if res.StatusCode != 200 {
		panic(res.Err)
	}

	return res.Output
}
