const BLOCK_DELIMITER_REGEX = /[\n]{2,}/g

export const countSections = (separatedText) => {
    return (separatedText.match(BLOCK_DELIMITER_REGEX) || []).length
}

export const attributeSections = (data) => {
    let attribution = (data.primary_artist || null)
    return attribution
}