/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
import { registerLanguage } from '../_.contribution';
registerLanguage({
    id: 'pascaligo',
    extensions: ['.ligo'],
    aliases: ['Pascaligo', 'ligo'],
    loader: () => {
        if (AMD) {
            return new Promise((resolve, reject) => {
                require(['vs/basic-languages/pascaligo/pascaligo'], resolve, reject);
            });
        }
        else {
            return import('./pascaligo');
        }
    }
});
//# sourceMappingURL=pascaligo.contribution.js.map