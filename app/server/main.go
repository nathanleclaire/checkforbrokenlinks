package main

import (
	"encoding/json"
	"github.com/PuerkitoBio/goquery"
	"log"
	"net/http"
	"regexp"
)

type ParsedResponse struct {
	Success bool     `json:"success"`
	Links   []string `json:"links"`
}

func slurpHandler(w http.ResponseWriter, r *http.Request) {
	url_to_scrape := r.URL.Query().Get("url_to_scrape")
	log.Print("query raw", url_to_scrape)

	var doc *goquery.Document
	var e error

	links := []string{}

	if doc, e = goquery.NewDocument(url_to_scrape); e != nil {
		log.Print("error querying for document: ", url_to_scrape, "err : ", e)
	}

	crossDomainRegex, err := regexp.Compile(`^http`)
	if err != nil {
		log.Printf("issue compiling regular expression to validate cross domain URLs")
	}

	doc.Find("a").Each(func(i int, s *goquery.Selection) {
		href, exists := s.Attr("href")
		if exists != true {
			log.Print("href does not exist for: ", s)
		} else {
			if crossDomainRegex.Match([]byte(href)) {
				links = append(links, href)
			}
		}
	})

	parsedResponse := &ParsedResponse{true, links}
	parsedResponseJSON, err := json.Marshal(parsedResponse)

	if err != nil {
		parsedResponse := &ParsedResponse{false, nil}
		parsedResponseJSON, err := json.Marshal(parsedResponse)
		if err != nil {
			log.Print("something went really weird in attempt to marshal a fail json ", err, parsedResponseJSON)
		}
	}

	w.Write(parsedResponseJSON)

}

// To Implement:  Slurp Handler or another handler should use h5 to 
//                grab all href attributes from <a> tags in the DOM slurped
//                (pass it as a string[] in a struct, marshalled to JSON)

func main() {
	http.HandleFunc("/slurp", slurpHandler)
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
