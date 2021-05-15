import React, { useState, useEffect } from 'react'
import { getRandomInt } from '../general-functions'
import { Container, Row, Col, Button } from 'react-bootstrap'
import MusicPlayer from './MusicPlayer'
// import dict from '../../node_modules/japanese-json/kana.json'

const MainBox = () => {
    const [artSearchResults, setSearchResults] = useState(null)
    const [artEntry, setArtEntry] = useState(null)
    const [backgroundImageUrl, setBackgroundImageUrl] = useState(null)

    const showHint = () => {
        document.getElementById("hint").style.opacity = "1"
    }

    const hideHint = () => {
        document.getElementById("hint").style.opacity = "0"
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
        const selectedEntry = artSearchResults.data[getRandomInt(1, artSearchResults.data.length)]
        const values = await Promise.all([fadeInAnimation(), loadArtEntry(selectedEntry.id)])
        console.log(values[1])

        const image = await loadNewBackgroundImage(values[1])
        console.log(image)

        hideHint()
        blurButtons()
        
        setArtEntry(values[1])
        setBackgroundImageUrl(image)

        document.getElementById("overlay").classList.remove("fadein")
        document.getElementById("overlay").classList.add("fadeout")
    }

    useEffect(() => {
        async function fetchMyAPI() {
            const fullSearchQuery = `limit=100&fields=id,title,image_id,style_title`
            const searchResults = await loadSearchResults(fullSearchQuery)
            console.log(searchResults)
            setSearchResults(searchResults)
            console.log(artSearchResults)
            const selectedEntry = searchResults.data[getRandomInt(1, searchResults.data.length)]
            const newEntry = await loadArtEntry(selectedEntry.id)
            console.log(newEntry)
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
        <main id="box" className="text-center center-all text-white" style={{backgroundImage: `url(${backgroundImageUrl})`}}>
            <div id="overlay" className="text-center center-all japan-spirit display-4">
                <p>japan<br />spirit</p>
                <svg className="rising-sun" width="200" height="200" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="100" cy="100" r="100" fill="darkred" />
                </svg>
            </div>
            <Container fluid style={{ maxWidth: "700px" }}>

                <article className="card">
                    <div className="card-body">
                        <Row>
                            <Col>
                                <h1 lang="ja-jp" className="p-1 display-1">{artEntry ? artEntry.data.title : "..."}</h1>
                                <h2 id="hint" style={{ opacity: "0" }} className="p-1 mb-5">{artEntry ? artEntry.data.style_title : "..."}</h2>
                            </Col>
                        </Row>
                        <Row>
                            <Col sm={4}>
                                <button className="btn btn-lg btn-secondary btn-block mb-2" onClick={showHint}>Show hint</button>
                            </Col>
                            <Col sm={4}>
                                <button className="btn btn-lg btn-secondary btn-block mb-2" onClick={() => {
                                    loadingWrapper()
                                    // loadNewHieroglyphEntry()
                                    // loadNewBackgroundImage()
                                }}>New hieroglyph</button>
                            </Col>
                            <Col sm={4}>
                                {/* <MusicPlayer url={`${process.env.PUBLIC_URL}/calm.mp3`}/> */}
                                <MusicPlayer url="https://upload.wikimedia.org/wikipedia/commons/transcoded/a/a3/Kimi_ga_Yo_instrumental.ogg/Kimi_ga_Yo_instrumental.ogg.mp3" />
                            </Col>
                        </Row>
                    </div>
                </article>

            </Container>

        </main>
    )
}

export default MainBox