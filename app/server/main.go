package main

import (
	"bytes"
	"encoding/json"
	"fmt"
	"github.com/PuerkitoBio/goquery"
	"io/ioutil"
	"log"
	"net/http"
	"net/smtp"
	"regexp"
	"strconv"
	"strings"
	"text/template"
)

type ParsedResponse struct {
	Success bool     `json:"success"`
	Links   []string `json:"links"`
}

type EmailUser struct {
	Username    string
	Password    string
	EmailServer string
	Port        int
}

type SmtpTemplateData struct {
	From    string
	To      string
	Subject string
	Body    string
}

type SendEmailData struct {
	YourEmail string
	YourName  string
	Feedback  string
}

var emailUser EmailUser
var auth smtp.Auth

func sendMail(from string, to string, subject string, body string) error {
	const emailTemplate = `From: {{.From}}
To: {{.To}} 
Subject: {{.Subject}}

{{.Body}}

Sincerely,

{{.From}}
`
	var err error
	var doc bytes.Buffer
	context := &SmtpTemplateData{from, to, subject, body}
	log.Print(context)
	t := template.New("emailTemplate")
	t, err = t.Parse(emailTemplate)
	if err != nil {
		log.Print("error trying to parse mail template ", err)
	}
	err = t.Execute(&doc, context)
	if err != nil {
		log.Print("error trying to execute mail template ", err)
	}
	log.Print(doc.String())
	err = smtp.SendMail(emailUser.EmailServer+":"+strconv.Itoa(emailUser.Port),
		auth,
		emailUser.Username,
		[]string{"nathanleclaire@gmail.com"},
		doc.Bytes())
	if err != nil {
		log.Print("ERROR: attempting to send a mail ", err)
	}

	return nil
}

func connectToSmtpServer(emailUser *EmailUser) {
	smtpConf, err := ioutil.ReadFile("../conf/smtp.json")
	if err != nil {
		log.Print("error reading smtp config file ", err)
	}
	err = json.Unmarshal(smtpConf, emailUser)
	if err != nil {
		log.Print("error unmarshalling config ", err)
	}
	auth = smtp.PlainAuth("", emailUser.Username, emailUser.Password, emailUser.EmailServer)
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
	urlToScrape := strings.ToLower(r.URL.Query().Get("urlToScrape"))

	var doc *goquery.Document
	var e error
	var parsedResponseJSON []byte

	links := []string{}

	if doc, e = goquery.NewDocument(urlToScrape); e != nil {
		log.Print("error querying for document: ", urlToScrape, "err : ", e)
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
	urlToCheck := r.URL.Query().Get("urlToCheck")
	externalServerResponse, err := http.Get(urlToCheck)
	if err != nil {
		log.Print("error getting in checkHandler ", urlToCheck)
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
	var jsonResponse []byte
	var err error
	response := map[string]interface{}{
		"success": true,
	}
	log.Print(r.Body)
	dec := json.NewDecoder(r.Body)
	contactData := SendEmailData{}
	err = dec.Decode(&contactData)
	if err != nil {
		log.Print(err)
		response["success"] = false
	}
	go sendMail(contactData.YourName+fmt.Sprintf(" <%s>", contactData.YourEmail),
		"Nathan LeClaire <nathan.leclaire@gmail.com>",
		"CFBL Feedback from "+contactData.YourName,
		contactData.Feedback)
	jsonResponse, err = json.Marshal(response)
	if err != nil {
		log.Print("marshalling r ", err)
	}
	w.Write(jsonResponse)
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
