/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
import { registerLanguage } from '../_.contribution';
registerLanguage({
    id: 'perl',
    extensions: ['.pl', '.pm'],
    aliases: ['Perl', 'pl'],
    loader: () => {
        if (AMD) {
            return new Promise((resolve, reject) => {
                require(['vs/basic-languages/perl/perl'], resolve, reject);
            });
        }
        else {
            return import('./perl');
        }
    }
});
//# sourceMappingURL=perl.contribution.js.map