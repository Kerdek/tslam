/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
import { registerLanguage } from '../_.contribution';
registerLanguage({
    id: 'csp',
    extensions: [],
    aliases: ['CSP', 'csp'],
    loader: () => {
        if (AMD) {
            return new Promise((resolve, reject) => {
                require(['vs/basic-languages/csp/csp'], resolve, reject);
            });
        }
        else {
            return import('./csp');
        }
    }
});
//# sourceMappingURL=csp.contribution.js.map