import {Entity, PrimaryGeneratedColumn, Column, ManyToOne} from 'typeorm';
import {User} from "./User";
import {Folder} from "./Folder";
import {Exclude, Expose} from "class-transformer";

@Entity()
export class File {

    @PrimaryGeneratedColumn()
    @Expose()
    'id': number

    @Column({
        unique: true
    })
    @Expose()
    'slug': string;

    @Column({
        unique: true
    })
    @Expose()
    'fileUrl': string;

    @Column()
    @Expose()
    'originalFileName': string;

    @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    @Expose()
    'dateUploaded': Date;

    @ManyToOne(() => User)
    @Exclude()
    'user': User;

    @Column()
    @Expose()
    'fileType': string;

    @ManyToOne(() => Folder, {
        nullable: true
    })
    @Exclude()
    'folder': Folder;

    @Column({ default: false })
    @Expose()
    'isUnsafe': boolean;

    @Column({ default: 0 })
    @Exclude()
    'unsafeCount': number;

}
