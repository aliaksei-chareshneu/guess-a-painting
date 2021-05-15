import React, { useState, useEffect } from 'react'
import { getRandomInt } from '../general-functions'
import { Container, Row, Col, Button, Toast } from 'react-bootstrap'
import MusicPlayer from './MusicPlayer'
// import dict from '../../node_modules/japanese-json/kana.json'

const MainBox = () => {
    const [artSearchResults, setSearchResults] = useState(null)
    const [artEntry, setArtEntry] = useState(null)
    const [backgroundImageUrl, setBackgroundImageUrl] = useState(null)

    // Toasts
    const [showFailure, setShowFailure] = useState(false)
    const [showSuccess, setShowSuccess] = useState(false)
    const [showHint, setShowHint] = useState(false)

    const answerIsCorrect = () => {
        const userAnswer = document.getElementById('input-answer').value.toLowerCase()
        const correctAnswer = artEntry.data.style_title.toLowerCase()
        const decision = userAnswer === correctAnswer
        document.getElementById('input-answer').value = ""
        return decision
    }

    const reactOnUserAnswer = () => {
        if (answerIsCorrect()) {
            // display toast with congratulations
            displayCorrectAnswer()
            setShowSuccess(true)
        } else {
            // display toast with 'Try again'
            setShowFailure(true)
        }
    }

    const displayCorrectAnswer = () => {
        // document.getElementById("hint").innerHTML = `${artEntry.data.style_title}<br>${artEntry.data.title}${artEntry.data.artist_display}`
        document.getElementById("hint-style").innerHTML = `${artEntry.data.style_title}`
    }

    const displayQuestion = () => {
        document.getElementById("hint-style").innerHTML = `Какой это стиль живописи?`
    }

    const blurButtons = () => {
        [...document.querySelectorAll('button')].forEach(b => b.blur())
    }

    const fadeInAnimation = () => {
        return new Promise((resolve) => {
            const overlay = document.getElementById("overlay");
            const onAnimationEndCallback = () => {
                overlay.removeEventListener('animationend', onAnimationEndCallback);
                resolve("Animation ended, callback function removed");
            }

            overlay.addEventListener('animationend', onAnimationEndCallback)
            overlay.classList.remove("fadeout")
            overlay.classList.add("fadein")
        })
    }

    const loadSearchResults = (fullSearchQuery) => {
        return new Promise((resolve) => {
            console.log("Search is being performed ...")
            fetch(`https://api.artic.edu/api/v1/artworks/search?query[term][is_public_domain]=true&${fullSearchQuery}`)
                // fetch("https://api.artic.edu/api/v1/artworks/search?q=cat&query[term][is_public_domain]=true&limit=100&fields=id,title,image_id,style_title")
                .then(r => r.json())
                .then(data => {
                    console.log(data)
                    resolve(data)
                })
        })
    }

    const loadArtEntry = (id) => {
        return new Promise((resolve) => {
            console.log("Art entry is being fetched ...")
            fetch(`https://api.artic.edu/api/v1/artworks/${id}`)
                .then(r => r.json())
                .then(data => {
                    console.log(data)
                    resolve(data)
                })
        })
    }

    const loadNewBackgroundImage = (entry) => {
        const baseURL = entry.config.iiif_url + `/`
        const id = entry.data.image_id
        const imageSettings = `/full/843,/0/default.jpg`
        const completeURL = baseURL + id + imageSettings

        return new Promise((resolve) => {
            console.log("Image is being fetched...")
            fetch(completeURL)
                .then(r => {
                    // setBackgroundImageUrl(r.url)
                    console.log(r.url)
                    resolve(r.url)
                })
        })
    }

    const loadingWrapper = async () => {
        setShowHint(false)
        setShowSuccess(false)

        const selectedEntry = artSearchResults.data[getRandomInt(1, artSearchResults.data.length)]
        const values = await Promise.all([fadeInAnimation(), loadArtEntry(selectedEntry.id)])
        console.log(values[1])

        const image = await loadNewBackgroundImage(values[1])
        console.log(image)

        displayQuestion()
        blurButtons()

        console.log(values[1].data.style_title)
        setArtEntry(values[1])
        setBackgroundImageUrl(image)

        document.getElementById("overlay").classList.remove("fadein")
        document.getElementById("overlay").classList.add("fadeout")
    }

    useEffect(() => {
        async function fetchMyAPI() {
            const fullSearchQuery = `limit=100&fields=id,date_start,style_title`
            const rawSearchResults = await loadSearchResults(fullSearchQuery)
            console.log(rawSearchResults)
            const searchResults = {
                "preference": rawSearchResults.preference,
                "pagination": rawSearchResults.pagination,
                "data": rawSearchResults.data.filter(item => item.date_start >=1000 && item.style_title !== null),
                "info": rawSearchResults.info,
                "license_links": rawSearchResults.license_links,
                "version": rawSearchResults.version,
            }
            setSearchResults(searchResults)
            console.log(artSearchResults)
            console.log(searchResults)
            const selectedEntry = searchResults.data[getRandomInt(1, searchResults.data.length)]
            const newEntry = await loadArtEntry(selectedEntry.id)
            console.log(newEntry)
            console.log(newEntry.data.style_title)
            setArtEntry(newEntry)

            const image = await loadNewBackgroundImage(newEntry)
            console.log(image)
            setBackgroundImageUrl(image)

            document.getElementById("overlay").classList.remove("fadein")
            document.getElementById("overlay").classList.add("fadeout")
        }
        fetchMyAPI()

        const overlay = document.getElementById("overlay")
        overlay.onanimationstart = (e) => {
            console.log(`Start of ${e.animationName} animation`)
            // return new Promise(resolve => resolve(`Start of ${e.animationName} animation`))
        }

        overlay.onanimationend = (e) => {
            // return new Promise(resolve => resolve(`End of ${e.animationName} animation`))
            console.log(`End of ${e.animationName} animation`)
        }
    }, [])

    return (
        <div id="flex-wrapper">
            <header className="bg-dark text-center">
                <Container fluid className="d-flex h-100 text-center" style={{ maxWidth: "700px" }}>
                    {/* <Row>
                        <Col>
                            <h4 id="hint-title"></h4>
                        </Col>
                    </Row> */}
                    
                            <h3 id="hint-style" className="m-auto">Какой это стиль живописи?</h3>
                    
                    {/* <Row>
                        <Col>
                            <h4 id="hint-artist"></h4>
                        </Col>
                    </Row> */}
                </Container>

            {/* <h4 lang="ja-jp" className="p-1">{artEntry ? artEntry.data.title : "..."}</h4>
            <h4 id="hint" style={{ opacity: "0" }} className="p-1 mb-5">{artEntry ? artEntry.data.style_title : "..."}</h4>
                Какой это стиль живописи? */}
        </header>
            <main id="box" className="text-center center-all text-white" style={{ backgroundImage: `url(${backgroundImageUrl})` }}>
                <Toast bsPrefix="toast toast-semi-transparent" onClose={() => setShowFailure(false)} show={showFailure} delay={5000} autohide>
                    <Toast.Body>Эээ... не совсем.<br/>Может, попробуйте еще раз?</Toast.Body>
                </Toast>
                <Toast bsPrefix="toast toast-semi-transparent" onClose={() => setShowSuccess(false)} show={showSuccess}>
                    <Toast.Body>
                        <Row>
                            <Col>
                                <h5>Поздравляем! Это правильный ответ!</h5>
                            </Col>
                        </Row>
                        <Row>
                            <Col>
                                <h4 id="hint-artist">{artEntry ? artEntry.data.title : "..."}</h4>
                            </Col>
                        </Row>

                        <Row>
                            <Col>
                                <h4 id="hint-title">{artEntry ? artEntry.data.artist_display : "..."}</h4>
                            </Col>
                        </Row>    
                    </Toast.Body>
                </Toast>

                <Toast bsPrefix="toast toast-semi-transparent" onClose={() => setShowHint(false)} show={showHint}>
                    <Toast.Body>
                        <Row>
                            <Col>
                                <h5>Вот правильный ответ:</h5>
                            </Col>
                        </Row>
                        <Row>
                            <Col>
                                <h4 id="hint-artist">{artEntry ? artEntry.data.title : "..."}</h4>
                            </Col>
                        </Row>

                        <Row>
                            <Col>
                                <h4 id="hint-title">{artEntry ? artEntry.data.artist_display : "..."}</h4>
                            </Col>
                        </Row>    
                    </Toast.Body>
                </Toast>

                <div id="overlay" className="text-center center-all japan-spirit display-4">
                    <h3 className=''>
                        Угадай<br />Стиль<br />Живописи
                    </h3>
                    {/* <p>japan<br />spirit</p>
                    <svg className="rising-sun" width="200" height="200" xmlns="http://www.w3.org/2000/svg">
                        <circle cx="100" cy="100" r="100" fill="darkred" />
                    </svg> */}
                </div>
                <button className="kc_fab_main_btn" onClick={() => {
                    setShowHint(true);
                }}>?</button>
            </main>
            <footer className="bg-dark">
                <Container fluid style={{ maxWidth: "700px" }}>
                    <Row>
                        <Col>
                            <input type="text" id="input-answer" placeholder="Введите ответ ..." />
                        </Col>
                    </Row>
                    <Row>
                        <Col>
                            <button className="btn btn btn-secondary btn-block mb-2" onClick={reactOnUserAnswer}>
                                Ответить
                            </button>
                        </Col>
                        <Col>
                            <button className="btn btn btn-secondary btn-block mb-2" onClick={() => {
                                    loadingWrapper()
                                    // loadNewHieroglyphEntry()
                                    // loadNewBackgroundImage()
                                }}>
                                Дальше
                            </button>
                        </Col>
                    </Row>
                </Container>
            </footer>
        </div>
    )
}

export default MainBox