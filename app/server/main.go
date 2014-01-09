package main

import (
	"bytes"
	"encoding/json"
	"fmt"
	"github.com/PuerkitoBio/goquery"
	"github.com/dpapathanasiou/go-recaptcha"
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

type Configuration struct {
	Smtp                EmailUser
	RecaptchaPrivateKey string
}

type ReCaptcha struct {
	Response  string
	Challenge string
}

type SendEmailData struct {
	YourEmail string
	YourName  string
	Feedback  string
	Captcha   ReCaptcha
}

var conf Configuration

func sendMail(emailUser EmailUser, auth smtp.Auth, from string, to string, subject string, body string) error {
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
	t := template.New("emailTemplate")
	if t, err = t.Parse(emailTemplate); err != nil {
		log.Print("error trying to parse mail template ", err)
	}
	if err = t.Execute(&doc, context); err != nil {
		log.Print("error trying to execute mail template ", err)
	}
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

func readConfigurationFile(filepath string) Configuration {
	var conf Configuration
	rawConfigurationJson, err := ioutil.ReadFile(filepath)
	if err != nil {
		log.Print("error reading smtp config file ", err)
	}
	err = json.Unmarshal(rawConfigurationJson, &conf)
	if err != nil {
		log.Print("error unmarshalling config ", err)
	}
	return conf
}

func connectToSmtpServer(emailUser EmailUser) smtp.Auth {
	auth := smtp.PlainAuth("", emailUser.Username, emailUser.Password, emailUser.EmailServer)
	return auth
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

	if doc, e = goquery.NewDocument(urlToScrape); e == nil {
		if crossDomainRegex, err := regexp.Compile(`^http`); err != nil {
			log.Printf("issue compiling regular expression to validate cross domain URLs")
		}
		doc.Find("a").Each(func(i int, s *goquery.Selection) {
			if href, exists := s.Attr("href"); exists == true {
				if crossDomainRegex.Match([]byte(href)) {
					links = append(links, href)
				} else {
					if href != "" {
						links = append(links, urlToScrape+href)
					} else {
						// TODO: set error on blank link in client side code,
						// also change over to including content of link text
						// to show in table
						links = append(links, "")
					}
				}
			} else {
				log.Print("href does not exist for: ", s)
			}
		})
		parsedResponse := &ParsedResponse{true, links}
		if parsedResponseJSON, err = json.Marshal(parsedResponse); err != nil {
			parsedResponseJSON = getFailedSlurpResponse()
		}
	} else {
		log.Print("error querying for document: ", urlToScrape, "err : ", e)
		parsedResponseJSON = getFailedSlurpResponse()
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

func emailHandlerClosure(auth smtp.Auth, recaptchaPrivateKey string, emailUser EmailUser) http.HandlerFunc {
	// Use a closure so we can pass auth to the handler
	return (func(w http.ResponseWriter, r *http.Request) {

		var jsonResponse []byte
		var err error
		response := map[string]interface{}{
			"success": true,
		}
		dec := json.NewDecoder(r.Body)
		contactData := SendEmailData{}
		err = dec.Decode(&contactData)
		if err != nil {
			log.Print(err)
			response["success"] = false
		}

		// call the recaptcha server
		recaptcha.Init(recaptchaPrivateKey)
		captchaIsValid := recaptcha.Confirm(r.RemoteAddr, contactData.Captcha.Challenge, contactData.Captcha.Response)

		if captchaIsValid {
			go sendMail(emailUser,
				auth,
				contactData.YourName+fmt.Sprintf(" <%s>", contactData.YourEmail),
				"Nathan LeClaire <nathan.leclaire@gmail.com>",
				"CFBL Feedback from "+contactData.YourName,
				contactData.Feedback)
		} else {
			response["success"] = false
		}
		jsonResponse, err = json.Marshal(response)
		if err != nil {
			log.Print("marshalling r ", err)
		}
		w.Write(jsonResponse)
	})
}

func main() {
	conf = readConfigurationFile("../conf/conf.json")
	auth := connectToSmtpServer(conf.Smtp)
	http.HandleFunc("/slurp", slurpHandler)
	http.HandleFunc("/check", checkHandler)
	http.HandleFunc("/email", emailHandlerClosure(auth, conf.RecaptchaPrivateKey, conf.Smtp))
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
