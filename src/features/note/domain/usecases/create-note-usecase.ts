import { IUseCase } from "../../../../core/domain/contracts/usecase";
import { ICacheRepository } from "../../../../core/domain/model/cache-repository";
import { IUser } from "../../../user/domain/model/user";
import { IUserRepository } from "../../../user/domain/model/user-repository";
import { UserNotFoundError } from "../errors/user-not-found-error";
import { INote } from "../model/note";
import { INoteRepository } from "../model/note-repository";

export interface ICreateNoteParams {
    userid: number,
    title: string,
    details: string;
}

export class CreateNoteUseCase implements IUseCase {
    constructor (private userRepository: IUserRepository,
        private noteRepository: INoteRepository,
        private cacheRepository: ICacheRepository) {
    }

    async run(data: ICreateNoteParams) {
        const user: IUser | undefined = await this.userRepository.retrieveUserById(data.userid);
        if (user !== undefined) {
            const noteData: INote = {
                title: data.title,
                details: data.details
            };
            const noteEntity = await this.noteRepository.createNote(user, noteData);
            await this.cacheRepository.save(`note:${noteEntity.id}`, noteEntity);
            this.cacheRepository.setRefreshing(true);
            return noteEntity;
        } else throw new UserNotFoundError();
    }
}