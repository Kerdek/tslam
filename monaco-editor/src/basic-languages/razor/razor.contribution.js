/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
import { registerLanguage } from '../_.contribution';
registerLanguage({
    id: 'razor',
    extensions: ['.cshtml'],
    aliases: ['Razor', 'razor'],
    mimetypes: ['text/x-cshtml'],
    loader: () => {
        if (AMD) {
            return new Promise((resolve, reject) => {
                require(['vs/basic-languages/razor/razor'], resolve, reject);
            });
        }
        else {
            return import('./razor');
        }
    }
});
//# sourceMappingURL=razor.contribution.js.map