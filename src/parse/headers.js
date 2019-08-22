'use strict'

const HEADER_MATCH_REGEX = /\[(.*?)\]/g

export const matchHeaders = (text) => {
    let headers = (text.match(HEADER_MATCH_REGEX) || [])
    //sanitize string from []
    return headers.map(h => {
        return h.replace(/[\[\]]/g,'')
    })
}