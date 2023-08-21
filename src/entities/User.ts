import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity("users")
export class User {
    @PrimaryGeneratedColumn()
    'id': number

    @Column({
        unique: true
    })
    'email': string;

    @Column()
    'password': string;

    @Column()
    'fullName': string;

    @Column()
    'isVerified': boolean;

}
