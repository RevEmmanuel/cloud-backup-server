import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { User } from './User';
import {Exclude, Expose} from "class-transformer";

@Entity()
export class Folder {

    @PrimaryGeneratedColumn()
    @Expose()
    'id': number;

    @Column()
    @Expose()
    'name': string;

    @Column()
    @Expose()
    'slug': string;

    @ManyToOne(() => User)
    @Exclude()
    'user': User;

    @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    @Expose()
    'dateUploaded': Date;

    @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    @Expose()
    'lastEditedOn': Date;

}
