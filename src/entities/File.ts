import {Entity, PrimaryGeneratedColumn, Column, ManyToOne} from 'typeorm';
import {User} from "./User";

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
    'user': User

    @Column()
    'fileType': string;

}
