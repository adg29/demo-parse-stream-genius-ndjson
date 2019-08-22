'use strict'

const HEADER_BLOCK_CAPTURE_REGEX = /\[(.*?)\](.*)[\n]{2,}/g
const BLOCK_DELIMITER_REGEX = /[\n]{2,}/g

export const matchSections = (separatedText) => {
    return (separatedText.split('\n\n') || [])
}

export const countSections = (separatedText) => {
    let sections = matchSections(separatedText)
    return sections.length
}

export const attributeSections = (data) => {
    let attribution = (data.primary_artist || null)
    return attribution
}
