/*
Copyright 2019 Huan LI
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

/**
 * This has been borrowed from https://github.com/huan/matrix-appservice-wechaty/blob/master/src/typings/matrix-appservice-bridge.d.ts
 * under the Apache2 licence.
 */
declare module 'matrix-appservice-bridge' {
    interface RoomMemberDict {
        [id: string]: {
            display_name: string,
            avatar_url: string,
        }
    }
    interface RemoteRoomDict {
        [id: string]: RemoteRoom[]
    }
    interface EntryDict {
        [id: string]: Array<Entry> 
    }

    export interface Entry {
        id: string  // The unique ID for this entry.
        matrix_id: string  // "room_id",
        remote_id: string  // "remote_room_id",
        matrix: null|MatrixRoom // <nullable> The matrix room, if applicable.
        remote: null|RemoteRoom // <nullable> The remote room, if applicable.
        data: null|any // <nullable> Information about this mapping, which may be an empty.
    }

    export class MatrixRoom {
        protected roomId: string

        constructor (roomId: string, data?: object)
        deserialize(data: object): void
        get(key: string): unknown
        getId(): string
        serialize(): object
        set(key: string, val: any): void
    }

    export class MatrixUser {
        public readonly localpart: string
        public readonly host: string

        private userId: string

        constructor (userId: string, data?: object, escape?: boolean)
        escapeUserId(): void
        get(key: string): unknown
        getDisplayName(): null|string
        getId(): string
        serialize(): object
        set(key: string, val: any): void
        setDisplayName(name: string): void
    }

    export class RemoteRoom {
        constructor (identifier: string, data?: object)
        get(key: string): unknown
        getId(): string
        serialize(): object
        set(key: string, val: object|string|number): void
    }

    export class RemoteUser {
        constructor (id: string, data?: object)
        get(key: string): unknown
        getId(): string
        serialize(): object
        set(key: string, val: object|string|number): void
    }

    export class BridgeStore {
        db: Nedb
        delete (query: any): Promise<void>
        insert (query: any): Promise<void>
        select (query: any, transformFn?: (item: Entry) => Entry): Promise<any>
    }

    export class RoomBridgeStore extends BridgeStore {
        batchGetLinkedRemoteRooms (matrixIds: Array<string>): Promise<RemoteRoomDict>
        getEntriesByLinkData (data: object): Promise<Array<Entry>>
        getEntriesByMatrixId (matrixId: string): Promise<Array<Entry>>
        getEntriesByMatrixIds (ids: Array<string>): Promise<EntryDict>
        getEntriesByMatrixRoomData (data: object): Promise<Array<Entry>>
        getEntriesByRemoteId (remoteId: string): Promise<Array<Entry>>
        getEntriesByRemoteRoomData (data: object): Promise<Array<Entry>>
        getEntryById  (id: string): Promise<null|Entry>
        getLinkedMatrixRooms (remoteId: string): Promise<Array<MatrixRoom>>
        getLinkedRemoteRooms (matrixId: string): Promise<Array<RemoteRoom>>
        getMatrixRoom  (roomId: string): Promise<null|MatrixRoom>
        removeEntriesByLinkData (data: object): Promise<void>
        removeEntriesByMatrixRoomData (data: object): Promise<void>
        removeEntriesByMatrixRoomId (matrixId: string): Promise<void>
        removeEntriesByRemoteRoomData (data: object): Promise<void>
        removeEntriesByRemoteRoomId (remoteId: string): Promise<void>
        setMatrixRoom  (matrixRoom: MatrixRoom): Promise<void>
        upsertEntry  (entry: Entry): Promise<void>
        linkRooms  (
            matrixRoom: MatrixRoom,
            remoteRoom: RemoteRoom,
            data?: object,
            linkId?: string,
        ): Promise<void>
    }

    export class UserBridgeStore extends BridgeStore {
        getByMatrixData (dataQuery: object): Promise<Array<MatrixUser>>
        getByMatrixLocalpart (localpart: string): Promise<null|MatrixUser>
        getByRemoteData (dataQuery: object): Promise<Array<RemoteUser>>
        getMatrixLinks (remoteId: string): Promise<Array<String>>
        getMatrixUser (userId: string): Promise<null|MatrixUser>
        getMatrixUsersFromRemoteId (remoteId: string): Promise<Array<MatrixUser>>
        getRemoteLinks (matrixId: string): Promise<Array<String>>
        getRemoteUser (id: string): Promise<null|RemoteUser>
        getRemoteUsersFromMatrixId (userId: string): Promise<Array<RemoteUser>>
        linkUsers  (matrixUser: MatrixUser, remoteUser: RemoteUser): Promise<void>
        setMatrixUser (matrixUser: MatrixUser): Promise<void>
        setRemoteUser (remoteUser: RemoteUser): Promise<void>
        unlinkUserIds (matrixUserId: string, remoteUserId: string): Promise<number>
        unlinkUsers (matrixUser: MatrixUser, remoteUser: RemoteUser): Promise<number>
    }
}