
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
        public readonly displayName: string = ""
        ) {
        if (!ACTION_TYPES.includes(type)) {
            throw new Error("Unknown IrcAction type: " + type);
        }
    }

    public static fromMatrixAction(matrixAction: MatrixAction): IrcAction|null {
        console.log(`sender: ${matrixAction.sender}`)
        let displayName = ""
        if (matrixAction.sender_displayName) {
            displayName = `[${matrixAction.sender_displayName}] `
        } else if (matrixAction.sender != "") {
            let username = matrixAction.sender.split(":")[0].substr(1)
            displayName = `[${username}] `
        }
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
                    return new IrcAction(matrixAction.type, `${displayName}${ircText}`, matrixAction.ts, displayName)
                }
                return new IrcAction(matrixAction.type, `${displayName}${matrixAction.text}`, matrixAction.ts, displayName);
            case "image":
                return new IrcAction(
                    "emote", `${displayName} uploaded an image: ` + matrixAction.text, matrixAction.ts, displayName
                );
            case "video":
                return new IrcAction(
                    "emote", `${displayName} uploaded a video: ` + matrixAction.text, matrixAction.ts, displayName
                );
            case "audio":
                return new IrcAction(
                    "emote", `${displayName} uploaded an audio file: ` + matrixAction.text, matrixAction.ts, displayName
                );
            case "file":
                return new IrcAction("emote", `${displayName} posted a file: ` + matrixAction.text, matrixAction.ts, displayName);
            case "topic":
                if (matrixAction.text === null) {
                    break;
                }
                return new IrcAction(matrixAction.type, `${displayName} ${matrixAction.text}`, matrixAction.ts, displayName);
            default:
                log.error("IrcAction.fromMatrixAction: Unknown action: %s", matrixAction.type);
        }
        return null;
    }
}
