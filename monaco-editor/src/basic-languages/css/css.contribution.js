/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
import { registerLanguage } from '../_.contribution';
registerLanguage({
    id: 'css',
    extensions: ['.css'],
    aliases: ['CSS', 'css'],
    mimetypes: ['text/css'],
    loader: () => {
        if (AMD) {
            return new Promise((resolve, reject) => {
                require(['vs/basic-languages/css/css'], resolve, reject);
            });
        }
        else {
            return import('./css');
        }
    }
});
//# sourceMappingURL=css.contribution.js.map