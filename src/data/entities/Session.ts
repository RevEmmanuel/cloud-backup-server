import {Entity, PrimaryGeneratedColumn, Column, ManyToOne} from 'typeorm';
import {User} from "./User";

@Entity()
export class Session {

    @PrimaryGeneratedColumn()
    'id': number

    @ManyToOne(() => User, {
        nullable: true
    })
    'user': User;

    @Column()
    'jwtToken': string;

}
