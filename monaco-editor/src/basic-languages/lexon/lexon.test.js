/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
import { testTokenization } from '../test/testRunner';
testTokenization('lexon', [
    // Tests
    [
        {
            line: 'LEX Paid Escrow',
            tokens: [
                { startIndex: 0, type: 'keyword.lexon' },
                { startIndex: 3, type: 'white.lexon' },
                { startIndex: 4, type: 'identifier.lexon' },
                { startIndex: 8, type: 'white.lexon' },
                { startIndex: 9, type: 'identifier.lexon' }
            ]
        }
    ],
    [
        {
            line: 'LEXON: 0.2.20',
            tokens: [
                { startIndex: 0, type: 'keyword.lexon' },
                { startIndex: 5, type: 'delimiter.lexon' },
                { startIndex: 6, type: 'white.lexon' },
                { startIndex: 7, type: 'number.semver.lexon' }
            ]
        }
    ],
    [
        {
            line: 'COMMENT: 3.f - an escrow that is controlled by a third party for a fee.',
            tokens: [{ startIndex: 0, type: 'comment.lexon' }]
        }
    ],
    [
        {
            line: '"Payer" is a person.',
            tokens: [
                { startIndex: 0, type: 'identifier.quote.lexon' },
                { startIndex: 1, type: 'identifier.lexon' },
                { startIndex: 6, type: 'identifier.quote.lexon' },
                { startIndex: 7, type: 'white.lexon' },
                { startIndex: 8, type: 'operator.lexon' },
                { startIndex: 10, type: 'white.lexon' },
                { startIndex: 11, type: 'identifier.lexon' },
                { startIndex: 12, type: 'white.lexon' },
                { startIndex: 13, type: 'keyword.type.lexon' },
                { startIndex: 19, type: 'delimiter.lexon' }
            ]
        }
    ],
    [
        {
            line: '"Fee" is an amount.',
            tokens: [
                { startIndex: 0, type: 'identifier.quote.lexon' },
                { startIndex: 1, type: 'identifier.lexon' },
                { startIndex: 4, type: 'identifier.quote.lexon' },
                { startIndex: 5, type: 'white.lexon' },
                { startIndex: 6, type: 'operator.lexon' },
                { startIndex: 8, type: 'white.lexon' },
                { startIndex: 9, type: 'identifier.lexon' },
                { startIndex: 11, type: 'white.lexon' },
                { startIndex: 12, type: 'keyword.type.lexon' },
                { startIndex: 18, type: 'delimiter.lexon' }
            ]
        }
    ],
    [
        {
            line: 'The Payer pays an Amount into escrow,',
            tokens: [
                { startIndex: 0, type: 'identifier.lexon' },
                { startIndex: 3, type: 'white.lexon' },
                { startIndex: 4, type: 'identifier.lexon' },
                { startIndex: 9, type: 'white.lexon' },
                { startIndex: 10, type: 'keyword.lexon' },
                { startIndex: 14, type: 'white.lexon' },
                { startIndex: 15, type: 'identifier.lexon' },
                { startIndex: 17, type: 'white.lexon' },
                { startIndex: 18, type: 'keyword.type.lexon' },
                { startIndex: 24, type: 'white.lexon' },
                { startIndex: 25, type: 'keyword.lexon' },
                { startIndex: 29, type: 'white.lexon' },
                { startIndex: 30, type: 'identifier.lexon' },
                { startIndex: 36, type: 'delimiter.lexon' } // ,
            ]
        }
    ],
    [
        {
            line: 'appoints the Payee,',
            tokens: [
                { startIndex: 0, type: 'keyword.lexon' },
                { startIndex: 8, type: 'white.lexon' },
                { startIndex: 9, type: 'identifier.lexon' },
                { startIndex: 12, type: 'white.lexon' },
                { startIndex: 13, type: 'identifier.lexon' },
                { startIndex: 18, type: 'delimiter.lexon' } // ,
            ]
        }
    ],
    [
        {
            line: 'and also fixes the Fee.',
            tokens: [
                { startIndex: 0, type: 'operator.lexon' },
                { startIndex: 3, type: 'white.lexon' },
                { startIndex: 4, type: 'identifier.lexon' },
                { startIndex: 8, type: 'white.lexon' },
                { startIndex: 9, type: 'identifier.lexon' },
                { startIndex: 14, type: 'white.lexon' },
                { startIndex: 15, type: 'identifier.lexon' },
                { startIndex: 18, type: 'white.lexon' },
                { startIndex: 19, type: 'identifier.lexon' },
                { startIndex: 22, type: 'delimiter.lexon' } // .
            ]
        }
    ],
    [
        {
            line: 'CLAUSE: Pay Out.',
            tokens: [
                { startIndex: 0, type: 'keyword.lexon' },
                { startIndex: 6, type: 'delimiter.lexon' },
                { startIndex: 7, type: 'white.lexon' },
                { startIndex: 8, type: 'identifier.lexon' },
                { startIndex: 15, type: 'delimiter.lexon' } // .
            ]
        }
    ]
]);
//# sourceMappingURL=lexon.test.js.map