import { IUseCase } from "../../../../core/domain/contracts/usecase";
import { ICacheRepository } from "../../../../core/domain/model/cache-repository";
import { IUserRepository } from "../../../user/domain/model/user-repository";
import { UserNotFoundError } from "../errors/user-not-found-error";
import { INote } from "../model/note";

export interface IViewNoteParams {
    userid: number;
    noteid?: string;
}
export class ViewNoteUseCase implements IUseCase {
    constructor (private userRepository: IUserRepository,
        private cacheRepository: ICacheRepository) {

    }

    async run(data: IViewNoteParams) {
        if (data.noteid) {
            let noteCached = await this.cacheRepository.retrieve(`note:${data.noteid}`);
            if (noteCached) {
                return {notes: [noteCached]};
            }
        }
        const allCachedNotesFromUser = await this.cacheRepository.retrieve(`user:${data.userid}:notes`);
        if (allCachedNotesFromUser) {
            if (!this.cacheRepository.needRefreshing()) {
                return {notes: allCachedNotesFromUser};
            }
        }
        const user = await this.userRepository.retrieveUserById(data.userid);
        if (user !== undefined) {
            let resultingNotes: INote[] = [];
            if (data.noteid) {
                let retrievedNote = user.notes!.find(note => note.id === data.noteid);
                if (retrievedNote) {
                    resultingNotes.push(retrievedNote);
                }
            } else {
                resultingNotes = user.notes!;
                if (resultingNotes.length > 1) {
                    resultingNotes.sort((a, b) => a.created_at!.getTime() - b.created_at!.getTime());
                }
            }
            await this.cacheRepository.save(`user:${data.userid}:notes`, resultingNotes);
            this.cacheRepository.setRefreshing(false);
            return {notes: resultingNotes};
        } else throw new UserNotFoundError();
    }
}