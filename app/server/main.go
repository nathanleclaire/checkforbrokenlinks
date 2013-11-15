package main;

import (
	"log"
	"net/http"
	"io/ioutil"
)

func slurpHandler(w http.ResponseWriter, r *http.Request) {
	url_to_parse := r.URL.Query()["url_to_parse"][0]
	urlToParseResponse, err := http.Get(url_to_parse);
	if err != nil {
		log.Print("err in slurp call: ", err, " url: ", url_to_parse)
	}
	rawResponse, err := ioutil.ReadAll(urlToParseResponse.Body)
	if err != nil {
		log.Print("err in slurp call: ", err, " url: ", url_to_parse)
	}

	w.Write(rawResponse)

}

func main() {
	http.HandleFunc("/slurp", slurpHandler);
	err := http.ListenAndServe(":5000", nil)
	if err != nil {
		log.Fatal("ListenAndServe: ", err)
	}
}
