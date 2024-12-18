/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
import { registerLanguage } from '../_.contribution';
registerLanguage({
    id: 'msdax',
    extensions: ['.dax', '.msdax'],
    aliases: ['DAX', 'MSDAX'],
    loader: () => {
        if (AMD) {
            return new Promise((resolve, reject) => {
                require(['vs/basic-languages/msdax/msdax'], resolve, reject);
            });
        }
        else {
            return import('./msdax');
        }
    }
});
//# sourceMappingURL=msdax.contribution.js.map