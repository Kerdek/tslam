/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
import { registerLanguage } from '../_.contribution';
registerLanguage({
    id: 'python',
    extensions: ['.py', '.rpy', '.pyw', '.cpy', '.gyp', '.gypi'],
    aliases: ['Python', 'py'],
    firstLine: '^#!/.*\\bpython[0-9.-]*\\b',
    loader: () => {
        if (AMD) {
            return new Promise((resolve, reject) => {
                require(['vs/basic-languages/python/python'], resolve, reject);
            });
        }
        else {
            return import('./python');
        }
    }
});
//# sourceMappingURL=python.contribution.js.map