/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
import { registerLanguage } from '../_.contribution';
registerLanguage({
    id: 'vb',
    extensions: ['.vb'],
    aliases: ['Visual Basic', 'vb'],
    loader: () => {
        if (AMD) {
            return new Promise((resolve, reject) => {
                require(['vs/basic-languages/vb/vb'], resolve, reject);
            });
        }
        else {
            return import('./vb');
        }
    }
});
//# sourceMappingURL=vb.contribution.js.map