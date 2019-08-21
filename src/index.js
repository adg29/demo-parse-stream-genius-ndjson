'use strict'


import { processJSON } from './stream'
import path from 'path'

(async () => {

    let filename = '../data/songs.json'
    let filepath = path.join(__dirname, filename)

    const artists = []
    const lyric_sections = []
    const lyric_words = []

    let msg = 'Processing json...'
    let { jsonAnalysis } = await processJSON(filepath)

    let attributions = jsonAnalysis.artistAttributions

    msg = `Artist attribution counts: ${JSON.stringify(attributions, null, 5)}`
    console.log(msg)

    let attributionsRanked = Object.keys(attributions)
    .sort((a, b) => attributions[b] - attributions[a])
    .map(a => ({artist: a, attributions: attributions[a]}))
    msg = `Ranked artist by attributions count: ${JSON.stringify(attributionsRanked.slice(0, 5), null, 5)}`
    console.log(msg)

    msg = `Processed ${jsonAnalysis.songs} objects via ${filename} stream`
    console.log(msg)

})().catch(err => {
    console.error(err);
})

