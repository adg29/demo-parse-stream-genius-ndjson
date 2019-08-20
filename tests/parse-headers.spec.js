'use strict'

import { scenarios as HEADERS } from './data/headers'
import { matchHeaders } from '../src/parse/headers'

describe('Headers Parser', () => {
    it('matchHeaders returns 3 header sections for a text with 3 headers', () => {
        let headers = matchHeaders(HEADERS.MULTI[0])
        expect(headers.length).toEqual(3)
    })
    it('matchHeaders returns 4 header sections for a text with 4 headers', () => {
        let headers = matchHeaders(HEADERS.MULTI[1])
        expect(headers.length).toEqual(4)
    })
})