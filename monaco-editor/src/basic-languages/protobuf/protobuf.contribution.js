/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
import { registerLanguage } from '../_.contribution';
registerLanguage({
    id: 'proto',
    extensions: ['.proto'],
    aliases: ['protobuf', 'Protocol Buffers'],
    loader: () => {
        if (AMD) {
            return new Promise((resolve, reject) => {
                require(['vs/basic-languages/protobuf/protobuf'], resolve, reject);
            });
        }
        else {
            return import('./protobuf');
        }
    }
});
//# sourceMappingURL=protobuf.contribution.js.map