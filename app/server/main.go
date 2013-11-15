package main;

import (
	"log"
	"net/http"
	"io/ioutil"
)

func slurpHandler(w http.ResponseWriter, r *http.Request) {
	url_to_scrape := r.URL.Query()["url_to_scrape"][0]
	log.Print("query raw", url_to_scrape)

	urlToParseResponse, err := http.Get(url_to_scrape);
	if err != nil {
		log.Print("err in slurp call: ", err, " url: ", url_to_scrape)
	}
	rawResponse, err := ioutil.ReadAll(urlToParseResponse.Body)
	if err != nil {
		log.Print("err in slurp call: ", err, " url: ", url_to_scrape)
	}

	w.Write(rawResponse)

}

// To Implement:  Slurp Handler or another handler should use h5 to 
//                grab all href attributes from <a> tags in the DOM slurped
//                (pass it as a string[] in a struct, marshalled to JSON)

func main() {
	http.HandleFunc("/slurp", slurpHandler);
	http.Handle("/", http.FileServer(http.Dir("..")))
	http.Handle("/css/", http.FileServer(http.Dir("..")))
	http.Handle("/img/", http.FileServer(http.Dir("..")))
	http.Handle("/lib/", http.FileServer(http.Dir("..")))
	http.Handle("/partials/", http.FileServer(http.Dir("..")))
	http.Handle("/js/", http.FileServer(http.Dir("..")))
	err := http.ListenAndServe(":8000", nil)
	if err != nil {
		log.Fatal("ListenAndServe: ", err)
	}
}
