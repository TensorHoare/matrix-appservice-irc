
/*
Copyright 2019 The Matrix.org Foundation C.I.C.

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/

import * as ircFormatting from "../irc/formatting";
import { MatrixAction } from "./MatrixAction";
import logging from "../logging";
const log = logging("MatrixAction");

const ACTION_TYPES = ["message", "emote", "topic", "notice"];
type IrcActionType = "message"|"emote"|"topic"|"notice";

export class IrcAction {
    constructor (
        public readonly type: IrcActionType,
        public text: string,
        public readonly ts: number = 0,
        public readonly sender: string|null = null,
        public displayName: string|null = null
        ) {
        if (!ACTION_TYPES.includes(type)) {
            throw new Error("Unknown IrcAction type: " + type);
        }
    }

    public getDisplayName(): string|null {
        if (this.displayName !== null) {
            return this.displayName
        } else {
            return this.sender?.split(":")[0].substr(1) || null
        }
    }

    public static fromMatrixAction(matrixAction: MatrixAction): IrcAction|null {
        switch (matrixAction.type) {
            case "message":
            case "emote":
            case "notice":
                if (matrixAction.text === null) {
                    break;
                }
                if (matrixAction.htmlText) {
                    const ircText = ircFormatting.htmlToIrc(matrixAction.htmlText)
                        ?? ircFormatting.markdownCodeToIrc(matrixAction.text)
                        ?? matrixAction.text; // fallback if needed.
                    if (ircText === null) {
                        throw Error("ircText is null");
                    }
                    // irc formatted text is the main text part
                    return new IrcAction(matrixAction.type, ircText, matrixAction.ts, matrixAction.sender)
                }
                return new IrcAction(matrixAction.type, matrixAction.text, matrixAction.ts, matrixAction.sender);
            case "image":
                return new IrcAction(
                    "emote", "uploaded an image: " + matrixAction.text, matrixAction.ts, matrixAction.sender
                );
            case "video":
                return new IrcAction(
                    "emote", "uploaded a video: " + matrixAction.text, matrixAction.ts, matrixAction.sender
                );
            case "audio":
                return new IrcAction(
                    "emote", "uploaded an audio file: " + matrixAction.text, matrixAction.ts, matrixAction.sender
                );
            case "file":
                return new IrcAction("emote", "posted a file: " + matrixAction.text, matrixAction.ts, matrixAction.sender);
            case "topic":
                if (matrixAction.text === null) {
                    break;
                }
                return new IrcAction(matrixAction.type, matrixAction.text, matrixAction.ts, matrixAction.sender);
            default:
                log.error("IrcAction.fromMatrixAction: Unknown action: %s", matrixAction.type);
        }
        return null;
    }
}
