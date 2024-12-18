/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
import { registerLanguage } from '../_.contribution';
registerLanguage({
    id: 'pgsql',
    extensions: [],
    aliases: ['PostgreSQL', 'postgres', 'pg', 'postgre'],
    loader: () => {
        if (AMD) {
            return new Promise((resolve, reject) => {
                require(['vs/basic-languages/pgsql/pgsql'], resolve, reject);
            });
        }
        else {
            return import('./pgsql');
        }
    }
});
//# sourceMappingURL=pgsql.contribution.js.map