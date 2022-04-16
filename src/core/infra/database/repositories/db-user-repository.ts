import { Repository } from "typeorm";
import { DatabaseConnection } from "../connections/connection";
import { User } from "../entities/User";
import { IUser } from "../../../../features/user/domain/model/user";
import { IUserRepository } from "../../../../features/user/domain/model/user-repository";

export class UserRepository implements IUserRepository {
    private repository: Repository<User>;

    constructor () {
        this.repository = DatabaseConnection.getConnection().manager.getRepository(User);
    }

    async retrieveUserByEmail(email: string): Promise<IUser | undefined> {
        const result = await this.repository.findOne({ where: { email } });
        return result;
    }

    async retrieveUserById(userid: number): Promise<IUser | undefined> {
        const result = await this.repository.findOne(
            {
                where: { userid },
                relations: ["notes"]
            });
        return result;
    }

    async createUser(userFormulary: IUser): Promise<IUser> {
        const userEntity = this.repository.create(userFormulary);
        await this.repository.save(userEntity);
        return {
            displayName: userEntity.displayName,
            userid: userEntity.userid,
            email: userEntity.email
        };
    }
}