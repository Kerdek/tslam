/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
import { registerLanguage } from '../_.contribution';
registerLanguage({
    id: 'redis',
    extensions: ['.redis'],
    aliases: ['redis'],
    loader: () => {
        if (AMD) {
            return new Promise((resolve, reject) => {
                require(['vs/basic-languages/redis/redis'], resolve, reject);
            });
        }
        else {
            return import('./redis');
        }
    }
});
//# sourceMappingURL=redis.contribution.js.map