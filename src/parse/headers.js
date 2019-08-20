const HEADER_MATCH_REGEX = /\[(.*?)\]/g

export const matchHeaders = (text) => {
    return (text.match(HEADER_MATCH_REGEX) || [])
}