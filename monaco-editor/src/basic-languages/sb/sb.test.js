/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
import { testTokenization } from '../test/testRunner';
testTokenization('sb', [
    // Comments
    [
        {
            line: "'",
            tokens: [{ startIndex: 0, type: 'comment.sb' }]
        }
    ],
    [
        {
            line: "    ' a comment",
            tokens: [
                { startIndex: 0, type: '' },
                { startIndex: 4, type: 'comment.sb' }
            ]
        }
    ],
    [
        {
            line: "' a comment",
            tokens: [{ startIndex: 0, type: 'comment.sb' }]
        }
    ],
    [
        {
            line: "'sticky comment",
            tokens: [{ startIndex: 0, type: 'comment.sb' }]
        }
    ],
    [
        {
            line: "1 ' 2< ' comment",
            tokens: [
                { startIndex: 0, type: 'number.sb' },
                { startIndex: 1, type: '' },
                { startIndex: 2, type: 'comment.sb' }
            ]
        }
    ],
    [
        {
            line: "x=1 ' my comment '' is a nice one",
            tokens: [
                { startIndex: 0, type: 'variable.name.sb' },
                { startIndex: 1, type: 'operator.sb' },
                { startIndex: 2, type: 'number.sb' },
                { startIndex: 3, type: '' },
                { startIndex: 4, type: 'comment.sb' }
            ]
        }
    ],
    // Numbers
    [
        {
            line: '0',
            tokens: [{ startIndex: 0, type: 'number.sb' }]
        }
    ],
    [
        {
            line: '0.0',
            tokens: [{ startIndex: 0, type: 'number.float.sb' }]
        }
    ],
    [
        {
            line: '23.5',
            tokens: [{ startIndex: 0, type: 'number.float.sb' }]
        }
    ],
    [
        {
            line: '1 -0',
            tokens: [
                { startIndex: 0, type: 'number.sb' },
                { startIndex: 1, type: '' },
                { startIndex: 2, type: 'operator.sb' },
                { startIndex: 3, type: 'number.sb' }
            ]
        }
    ],
    [
        {
            line: '100+10',
            tokens: [
                { startIndex: 0, type: 'number.sb' },
                { startIndex: 3, type: 'operator.sb' },
                { startIndex: 4, type: 'number.sb' }
            ]
        }
    ],
    [
        {
            line: '0 + 0',
            tokens: [
                { startIndex: 0, type: 'number.sb' },
                { startIndex: 1, type: '' },
                { startIndex: 2, type: 'operator.sb' },
                { startIndex: 3, type: '' },
                { startIndex: 4, type: 'number.sb' }
            ]
        }
    ],
    // Keywords
    [
        {
            line: 'For i = 0 To 10 Step 2',
            tokens: [
                { startIndex: 0, type: 'keyword.for.sb' },
                { startIndex: 3, type: '' },
                { startIndex: 4, type: 'variable.name.sb' },
                { startIndex: 5, type: '' },
                { startIndex: 6, type: 'operator.sb' },
                { startIndex: 7, type: '' },
                { startIndex: 8, type: 'number.sb' },
                { startIndex: 9, type: '' },
                { startIndex: 10, type: 'keyword.to.sb' },
                { startIndex: 12, type: '' },
                { startIndex: 13, type: 'number.sb' },
                { startIndex: 15, type: '' },
                { startIndex: 16, type: 'keyword.step.sb' },
                { startIndex: 20, type: '' },
                { startIndex: 21, type: 'number.sb' } // 2
            ]
        }
    ],
    [
        {
            line: 'if x <> 23.7 thEn',
            tokens: [
                { startIndex: 0, type: 'keyword.if.sb' },
                { startIndex: 2, type: '' },
                { startIndex: 3, type: 'variable.name.sb' },
                { startIndex: 4, type: '' },
                { startIndex: 5, type: 'operator.sb' },
                { startIndex: 7, type: '' },
                { startIndex: 8, type: 'number.float.sb' },
                { startIndex: 12, type: '' },
                { startIndex: 13, type: 'keyword.then.sb' } // thEn
            ]
        }
    ],
    [
        {
            line: 'ElseIf b[i] And col Then',
            tokens: [
                { startIndex: 0, type: 'keyword.elseif.sb' },
                { startIndex: 6, type: '' },
                { startIndex: 7, type: 'variable.name.sb' },
                { startIndex: 8, type: 'delimiter.array.sb' },
                { startIndex: 9, type: 'variable.name.sb' },
                { startIndex: 10, type: 'delimiter.array.sb' },
                { startIndex: 11, type: '' },
                { startIndex: 12, type: 'operator.sb' },
                { startIndex: 15, type: '' },
                { startIndex: 16, type: 'variable.name.sb' },
                { startIndex: 19, type: '' },
                { startIndex: 20, type: 'keyword.then.sb' } // Then
            ]
        }
    ],
    [
        {
            line: 'GoTo location',
            tokens: [
                { startIndex: 0, type: 'keyword.goto.sb' },
                { startIndex: 4, type: '' },
                { startIndex: 5, type: 'variable.name.sb' } // location
            ]
        }
    ],
    // Strings
    [
        {
            line: 's = "string"',
            tokens: [
                { startIndex: 0, type: 'variable.name.sb' },
                { startIndex: 1, type: '' },
                { startIndex: 2, type: 'operator.sb' },
                { startIndex: 3, type: '' },
                { startIndex: 4, type: 'string.sb' } // "string"
            ]
        }
    ],
    [
        {
            line: '"use strict";',
            tokens: [
                { startIndex: 0, type: 'string.sb' },
                { startIndex: 12, type: '' } // ;
            ]
        }
    ],
    // Tags
    [
        {
            line: 'sub ToString',
            tokens: [
                { startIndex: 0, type: 'keyword.sub.sb' },
                { startIndex: 3, type: '' },
                { startIndex: 4, type: 'variable.name.sb' } // ToString
            ]
        }
    ],
    [
        {
            line: 'While For If Sub EndWhile EndFor EndIf endsub',
            tokens: [
                { startIndex: 0, type: 'keyword.while.sb' },
                { startIndex: 5, type: '' },
                { startIndex: 6, type: 'keyword.for.sb' },
                { startIndex: 9, type: '' },
                { startIndex: 10, type: 'keyword.if.sb' },
                { startIndex: 12, type: '' },
                { startIndex: 13, type: 'keyword.sub.sb' },
                { startIndex: 16, type: '' },
                { startIndex: 17, type: 'keyword.endwhile.sb' },
                { startIndex: 25, type: '' },
                { startIndex: 26, type: 'keyword.endfor.sb' },
                { startIndex: 32, type: '' },
                { startIndex: 33, type: 'keyword.endif.sb' },
                { startIndex: 38, type: '' },
                { startIndex: 39, type: 'keyword.endsub.sb' } //endsub
            ]
        }
    ],
    [
        {
            line: 'While while WHILE WHile whiLe',
            tokens: [
                { startIndex: 0, type: 'keyword.while.sb' },
                { startIndex: 5, type: '' },
                { startIndex: 6, type: 'keyword.while.sb' },
                { startIndex: 11, type: '' },
                { startIndex: 12, type: 'keyword.while.sb' },
                { startIndex: 17, type: '' },
                { startIndex: 18, type: 'keyword.while.sb' },
                { startIndex: 23, type: '' },
                { startIndex: 24, type: 'keyword.while.sb' } // whiLe
            ]
        }
    ],
    // types and members
    [
        {
            line: 'Else TextWindow.Write("text")',
            tokens: [
                { startIndex: 0, type: 'keyword.else.sb' },
                { startIndex: 4, type: '' },
                { startIndex: 5, type: 'type.sb' },
                { startIndex: 15, type: 'delimiter.sb' },
                { startIndex: 16, type: 'type.member.sb' },
                { startIndex: 21, type: 'delimiter.parenthesis.sb' },
                { startIndex: 22, type: 'string.sb' },
                { startIndex: 28, type: 'delimiter.parenthesis.sb' } // )
            ]
        }
    ],
    [
        {
            line: 'class.method (x, y)',
            tokens: [
                { startIndex: 0, type: 'type.sb' },
                { startIndex: 5, type: 'delimiter.sb' },
                { startIndex: 6, type: 'type.member.sb' },
                { startIndex: 12, type: '' },
                { startIndex: 13, type: 'delimiter.parenthesis.sb' },
                { startIndex: 14, type: 'variable.name.sb' },
                { startIndex: 15, type: 'delimiter.sb' },
                { startIndex: 16, type: '' },
                { startIndex: 17, type: 'variable.name.sb' },
                { startIndex: 18, type: 'delimiter.parenthesis.sb' } // )
            ]
        }
    ],
    [
        {
            line: 'const = Math.PI',
            tokens: [
                { startIndex: 0, type: 'variable.name.sb' },
                { startIndex: 5, type: '' },
                { startIndex: 6, type: 'operator.sb' },
                { startIndex: 7, type: '' },
                { startIndex: 8, type: 'type.sb' },
                { startIndex: 12, type: 'delimiter.sb' },
                { startIndex: 13, type: 'type.member.sb' } // PI
            ]
        }
    ]
]);
//# sourceMappingURL=sb.test.js.map