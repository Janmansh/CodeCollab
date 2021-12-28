const CodeBox = document.getElementById("code");
const OutputBox = document.getElementById("output");

function Run() {
  console.log("Clicked");
  axios
    .post("/run", {
      code: CodeBox.value,
    })
    .then(function (response) {
      OutputBox.value = response.data.output;
    })
    .catch(function (error) {
      console.log(error);
    });
}
