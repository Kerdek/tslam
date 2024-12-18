/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
import { registerLanguage } from '../_.contribution';
registerLanguage({
    id: 'redshift',
    extensions: [],
    aliases: ['Redshift', 'redshift'],
    loader: () => {
        if (AMD) {
            return new Promise((resolve, reject) => {
                require(['vs/basic-languages/redshift/redshift'], resolve, reject);
            });
        }
        else {
            return import('./redshift');
        }
    }
});
//# sourceMappingURL=redshift.contribution.js.map