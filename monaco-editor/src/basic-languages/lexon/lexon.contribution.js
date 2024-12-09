/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
import { registerLanguage } from '../_.contribution';
registerLanguage({
    id: 'lexon',
    extensions: ['.lex'],
    aliases: ['Lexon'],
    loader: () => {
        if (AMD) {
            return new Promise((resolve, reject) => {
                require(['vs/basic-languages/lexon/lexon'], resolve, reject);
            });
        }
        else {
            return import('./lexon');
        }
    }
});
//# sourceMappingURL=lexon.contribution.js.map