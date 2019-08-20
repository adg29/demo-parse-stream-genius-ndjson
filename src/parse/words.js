const BLOCK_DELIMITER_REGEX = /[\n]{2,}/g

export const countSections = (separatedText) => {
    return (separatedText.match(BLOCK_DELIMITER_REGEX) || []).length
}