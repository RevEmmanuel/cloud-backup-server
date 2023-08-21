import {Entity, PrimaryGeneratedColumn, Column, ManyToOne} from 'typeorm';

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

    @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    'dateUploaded': Date;


    @ManyToOne(() => User, (user) => user.photos)
    user: User

}
