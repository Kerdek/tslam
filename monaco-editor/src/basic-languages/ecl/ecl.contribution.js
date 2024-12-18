/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
import { registerLanguage } from '../_.contribution';
registerLanguage({
    id: 'ecl',
    extensions: ['.ecl'],
    aliases: ['ECL', 'Ecl', 'ecl'],
    loader: () => {
        if (AMD) {
            return new Promise((resolve, reject) => {
                require(['vs/basic-languages/ecl/ecl'], resolve, reject);
            });
        }
        else {
            return import('./ecl');
        }
    }
});
//# sourceMappingURL=ecl.contribution.js.map