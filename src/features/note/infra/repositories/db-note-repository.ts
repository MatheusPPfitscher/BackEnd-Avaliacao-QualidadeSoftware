import { Repository } from "typeorm";
import { DatabaseConnection } from "../../../../core/infra/database/connections/connection";
import { Note } from "../../../../core/infra/database/entities/Note";
import { User } from "../../../../core/infra/database/entities/User";
import { IUser } from "../../../user/domain/model/user";
import { NoteNotFoundError } from "../../domain/errors/note-not-found-error";
import { INote } from "../../domain/model/note";
import { INoteRepository } from "../../domain/model/note-repository";

export class NoteRepository implements INoteRepository {
    private repository: Repository<Note>;

    constructor () {
        this.repository = DatabaseConnection.getConnection().manager.getRepository(Note);
    }

    async createNote(user: User, noteData: INote) {
        const noteEntity = this.repository.create(noteData);
        noteEntity.user = user;
        await this.repository.save(noteEntity);
        const result: INote = {
            id: noteEntity.id,
            title: noteEntity.title,
            details: noteEntity.details,
            created_at: noteEntity.created_at
        };
        return result;
    }

    async editNote(noteData: INote): Promise<INote> {
        let editedNote = await this.repository.preload(noteData);
        if (editedNote) {
            await this.repository.save(editedNote);
        } else throw new NoteNotFoundError();
        const result: INote = {
            id: editedNote.id,
            title: editedNote.title,
            details: editedNote.details,
            created_at: editedNote.created_at
        };
        return result;
    }

    async removeNote(noteid: string) {
        const result = await this.repository.delete(noteid);
        return { affected: result.affected };
    }
}