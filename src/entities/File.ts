import {Entity, PrimaryGeneratedColumn, Column, ManyToOne} from 'typeorm';
import {User} from "./User";
import {Folder} from "./Folder";

@Entity()
export class File {

    @PrimaryGeneratedColumn()
    'id': number

    @Column({
        unique: true
    })
    'slug': string;

    @Column({
        unique: true
    })
    'fileUrl': string;

    @Column()
    'originalFileName': string;

    @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    'dateUploaded': Date;

    @ManyToOne(() => User)
    'user': User;

    @Column()
    'fileType': string;

    @ManyToOne(() => Folder)
    'folder': Folder;

    @Column({ default: false })
    'isUnsafe': boolean;

}
