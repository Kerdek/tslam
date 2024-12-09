/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
import { registerLanguage } from '../_.contribution';
registerLanguage({
    id: 'mips',
    extensions: ['.s'],
    aliases: ['MIPS', 'MIPS-V'],
    mimetypes: ['text/x-mips', 'text/mips', 'text/plaintext'],
    loader: () => {
        if (AMD) {
            return new Promise((resolve, reject) => {
                require(['vs/basic-languages/mips/mips'], resolve, reject);
            });
        }
        else {
            return import('./mips');
        }
    }
});
//# sourceMappingURL=mips.contribution.js.map