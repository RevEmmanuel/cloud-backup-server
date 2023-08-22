import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany } from 'typeorm';
import { User } from './User';
import { File } from './File';

@Entity()
export class Folder {

    @PrimaryGeneratedColumn()
    'id': number;

    @Column()
    'name': string;

    @Column()
    'slug': string;

    @ManyToOne(() => User)
    'user': User;

    @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    'dateUploaded': Date;

    @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    'lastEditedOn': Date;

}
