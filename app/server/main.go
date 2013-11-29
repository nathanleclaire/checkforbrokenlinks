package main

import (
	"encoding/json"
	"github.com/PuerkitoBio/goquery"
	"log"
	"net/http"
	"regexp"
	"net/smtp"
	"io/ioutil"
	"strconv"
)

type ParsedResponse struct {
	Success bool     `json:"success"`
	Links   []string `json:"links"`
}

type EmailUser struct {
	Username	string
	Password	string
	EmailServer	string
	Port		int
}

var emailUser EmailUser

func connectToSmtpServer(emailUser *EmailUser) {
	smtpConf, err := ioutil.ReadFile("../conf/smtp.json")
	if err != nil {
		log.Print("error reading smtp config file ", err)
	}
	err = json.Unmarshal(smtpConf, emailUser)
	if err != nil {
		log.Print("error unmarshalling config ", err)
	}
	auth := smtp.PlainAuth("", emailUser.Username, emailUser.Password, emailUser.EmailServer)
	log.Print("first arg for SendMail is ", emailUser.EmailServer + ":" + strconv.Itoa(emailUser.Port))
	log.Print(emailUser)
	msg := `From: Check For Broken Links
To: Nathan LeClaire
Subject: This Is A Test

	Please do not panic, it is only a test.
	`
	err = smtp.SendMail(emailUser.EmailServer + ":" + strconv.Itoa(emailUser.Port),
						 auth,
						 emailUser.Username,
						 []string{"nathanleclaire@gmail.com"},
					     []byte(msg))
	if err != nil {
		log.Print("ERROR: attempting to send a mail ", err)
	}
}

func getFailedSlurpResponse() []byte {
	failResponse := &ParsedResponse{false, nil}
	failResponseJSON, err := json.Marshal(failResponse)
	if err != nil {
		log.Print("something went really weird in attempt to marshal a fail json ", err)
		failResponseJSON, _ = json.Marshal(nil)
	}
	return failResponseJSON
}

func slurpHandler(w http.ResponseWriter, r *http.Request) {
	url_to_scrape := r.URL.Query().Get("url_to_scrape")

	var doc *goquery.Document
	var e error
	var parsedResponseJSON []byte

	links := []string{}

	if doc, e = goquery.NewDocument(url_to_scrape); e != nil {
		log.Print("error querying for document: ", url_to_scrape, "err : ", e)
		parsedResponseJSON = getFailedSlurpResponse()
	} else {
		crossDomainRegex, err := regexp.Compile(`^http`)
		if err != nil {
			log.Printf("issue compiling regular expression to validate cross domain URLs")
		}

		doc.Find("a").Each(func(i int, s *goquery.Selection) {
			href, exists := s.Attr("href")
			if exists != true {
				log.Print("href does not exist for: ", s)
			} else {
				// TODO:  Implement handling of same domain links
				if crossDomainRegex.Match([]byte(href)) {
					links = append(links, href)
				}
			}
		})

		parsedResponse := &ParsedResponse{true, links}
		parsedResponseJSON, err = json.Marshal(parsedResponse)

		if err != nil {
			parsedResponseJSON = getFailedSlurpResponse()
		}

	}

	w.Write(parsedResponseJSON)

}

func checkHandler(w http.ResponseWriter, r *http.Request) {
	url_to_check := r.URL.Query().Get("url_to_check")
	externalServerResponse, err := http.Get(url_to_check)
	if err != nil {
		log.Print("error getting in checkHandler ", url_to_check)
	}

	response := map[string]interface{}{
		"status":     externalServerResponse.Status,
		"statusCode": externalServerResponse.StatusCode,
	}

	responseJSON, err := json.Marshal(response)
	if err != nil {
		log.Print("error Marshalling check response json: ", err)
	}
	w.Write(responseJSON)
}

func emailHandler(w http.ResponseWriter, r *http.Request) {
	// decode Gmail settings from encrypted config file
	// connect to Gmail STMP server
}

func main() {
	connectToSmtpServer(&emailUser)
	http.HandleFunc("/slurp", slurpHandler)
	http.HandleFunc("/check", checkHandler)
	http.HandleFunc("/email", emailHandler)
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
