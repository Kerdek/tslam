/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
import { registerLanguage } from '../_.contribution';
registerLanguage({
    id: 'bat',
    extensions: ['.bat', '.cmd'],
    aliases: ['Batch', 'bat'],
    loader: () => {
        if (AMD) {
            return new Promise((resolve, reject) => {
                require(['vs/basic-languages/bat/bat'], resolve, reject);
            });
        }
        else {
            return import('./bat');
        }
    }
});
//# sourceMappingURL=bat.contribution.js.map